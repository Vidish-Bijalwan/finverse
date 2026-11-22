-- ═══════════════════════════════════════════════════════════════════
-- 0006 — RAG vector store (M4: pgvector + `rag` Edge Function)
-- ═══════════════════════════════════════════════════════════════════
-- Run this in the Supabase SQL editor (same project as 0001–0005).
-- Idempotent: every statement uses IF NOT EXISTS / guards.
--
-- NOTE (migration queue): 0003, 0004 and 0005 are still unapplied on
-- the live database; this file joins the same manual queue. The `rag`
-- Edge Function and the `searchKnowledge` chat tool work without it
-- (they degrade to "knowledge search is not set up yet") but return
-- no chunks until 0006 lands.
--
-- pgvector ships with Supabase Postgres — no extension install step
-- beyond the CREATE EXTENSION below, which is idempotent.
--
-- Design (ported from the old repo's Phase 2, Prisma migration
-- 20261119130000_add_rag_documents, adapted to this schema):
-- - One row per chunk. A document is chunked (~500 chars, 50-char
--   overlap) and each chunk is embedded separately with
--   baai/bge-base-en-v1.5 (768 dimensions — the vector(768) column
--   and the client constant must always agree).
-- - `owner_id` NULL means a SHARED document (seed guides): visible
--   to every user through the `match_documents` RPC. A set owner_id
--   means a user document, visible only to that user.
-- - Direct PostgREST access is owner-only (the "owner all" policy:
--   NULL-owner rows are invisible there, since NULL never equals
--   auth.uid()). Retrieval goes through the SECURITY DEFINER
--   `match_documents` RPC, which enforces the shared-or-owned rule
--   in SQL. RLS stays the backstop for writes, not the read path.
-- - `source_id` + `chunk_index` identify one chunk of one document
--   (e.g. a seed slug, a news URL hash). Re-indexing a document
--   deletes its old rows first, so the unique index below only
--   guards against concurrent double-indexing.

-- ── EXTENSION: pgvector ──────────────────────────────────────────────
create extension if not exists vector;

-- ── TABLE: rag_documents ─────────────────────────────────────────────
-- source_type: 'guide' (financial-literacy seed docs), 'news',
-- 'profile' (company profile), 'transaction' (user history, future).
-- symbol: Yahoo symbol for news/profile rows (e.g. RELIANCE.NS).
-- published_at/url: set for news rows; null for guides.
-- metadata: free-form (e.g. {"publisher": "Reuters"}).
create table if not exists public.rag_documents (
  id                 uuid primary key default gen_random_uuid(),
  owner_id           uuid references auth.users(id) on delete cascade,
  source_type        text not null
                     check (source_type in ('guide','news','profile','transaction')),
  source_id          text not null,
  chunk_index        integer not null default 0 check (chunk_index >= 0),
  symbol             text,
  title              text,
  content            text not null,
  embedding          vector(768) not null,
  published_at       timestamptz,
  url                text,
  metadata           jsonb,
  created_at         timestamptz default now()
);
alter table public.rag_documents enable row level security;
drop policy if exists "owner all" on public.rag_documents;
create policy "owner all" on public.rag_documents
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
-- One chunk per (owner, source, chunk index). NULL owner_ids are
-- distinct in a unique index, so shared seeds rely on the index
-- function's delete-before-insert for idempotency (see the header).
create unique index if not exists rag_documents_owner_source_chunk_idx
  on public.rag_documents (owner_id, source_type, source_id, chunk_index);
create index if not exists rag_documents_owner_created_idx
  on public.rag_documents (owner_id, created_at desc);
create index if not exists rag_documents_symbol_idx
  on public.rag_documents (symbol);
create index if not exists rag_documents_source_type_idx
  on public.rag_documents (source_type);
-- Approximate nearest-neighbour index for cosine similarity search.
-- (With a tiny table Postgres will seq-scan instead — the index only
-- pays off as the store grows; keeping it matches the old migration.)
create index if not exists rag_documents_embedding_idx
  on public.rag_documents using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- ── FUNCTION: match_documents ────────────────────────────────────────
-- Cosine-similarity search over the caller's documents plus the shared
-- seed guides. SECURITY DEFINER: the function enforces the
-- shared-or-owned rule itself, because RLS hides NULL-owner rows from
-- direct PostgREST reads. It takes the caller id as a parameter —
-- the Edge Function derives it from the gateway-verified JWT, so a
-- caller can only ever ask for their own documents (plus shared ones).
--
-- Similarity floor 0.35 is the old Phase 2 default: below it, chunks
-- are noise, and the caller must say "no relevant context" instead of
-- answering from memory. match_count is capped at 20.
--
-- NOTE on names: the parameters are named exactly as the Edge
-- Function passes them (owner_id, query_embedding, match_count).
-- Every column reference below is qualified with the table alias
-- (r.), so no parameter name can collide with a column name.
create or replace function public.match_documents(
  owner_id uuid,
  query_embedding vector,
  match_count integer,
  p_symbol text default null
)
returns table (
  id uuid,
  source_type text,
  title text,
  content text,
  symbol text,
  published_at timestamptz,
  url text,
  similarity double precision
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select s.id, s.source_type, s.title, s.content, s.symbol,
         s.published_at, s.url, s.similarity
  from (
    select r.id as id,
           r.source_type as source_type,
           r.title as title,
           r.content as content,
           r.symbol as symbol,
           r.published_at as published_at,
           r.url as url,
           1 - (r.embedding <=> query_embedding) as similarity
    from public.rag_documents r
    where (r.owner_id is null or r.owner_id = match_documents.owner_id)
      and (p_symbol is null or r.symbol = p_symbol)
      and (1 - (r.embedding <=> query_embedding)) >= 0.35
  ) s
  order by s.similarity desc
  limit least(greatest(match_count, 1), 20);
end;
$$;
