import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { formatINR, formatINRShort } from "@/lib/finance/format";
import {
  MCAP_BANDS,
  SECTORS,
  STOCKS,
  mcapBandOf,
  type McapBand,
  type StockInfo,
} from "@/lib/market/data";
import { getLTP } from "@/lib/market/history";
import { getQuote } from "@/lib/market/quote";
import {
  EmptyState,
  MarketRow,
  SearchDropdown,
  type SearchResultGroup,
  pressable,
} from "@/components/fv";
import { PageShell } from "@/components/markets/PageShell";
import { useWatchlist } from "@/components/markets/useWatchlist";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/screener")({
  head: () => ({
    meta: [{ title: "Stock Screener — FinVerse AI" }],
  }),
  component: ScreenerPage,
});

type SortKey = "pricePaise" | "pe" | "marketCapCr" | "divYield" | "oneYReturnPct";
type SortDir = "asc" | "desc";

const SORT_COLUMNS: Array<{ key: SortKey; label: string }> = [
  { key: "pricePaise", label: "Price" },
  { key: "pe", label: "P/E" },
  { key: "marketCapCr", label: "MCap" },
  { key: "divYield", label: "Div yield" },
  { key: "oneYReturnPct", label: "1Y return" },
];

const MAX_PE = 100;

function ScreenerPage() {
  const navigate = useNavigate();
  const { isWatched, toggle } = useWatchlist();

  const [query, setQuery] = useState("");
  const [sectors, setSectors] = useState<string[]>([]);
  const [maxPE, setMaxPE] = useState<number>(MAX_PE);
  const [minYield, setMinYield] = useState<string>("0");
  const [band, setBand] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("marketCapCr");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function toggleSector(sector: string) {
    setSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector],
    );
  }

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  /** Symbol search suggestions for the SearchDropdown (top 8 matches). */
  const searchGroups: SearchResultGroup[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const matches = STOCKS.filter(
      (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q),
    ).slice(0, 8);
    return [
      {
        label: "Stocks",
        items: matches.map((s) => {
          // Single quote source: displayed price and % share one basis.
          const q = getQuote(s.symbol);
          const changePct = q?.changePct ?? 0;
          const up = changePct >= 0;
          return {
            id: s.symbol,
            title: s.symbol,
            subtitle: `${s.name} · ${s.sector}`,
            right: `${formatINR(q?.pricePaise ?? getLTP(s.symbol))} ${up ? "+" : "−"}${Math.abs(changePct).toFixed(2)}%`,
            rightTone: (up ? "gain" : "loss") as "gain" | "loss",
          };
        }),
      },
    ];
  }, [query]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = STOCKS.filter((s) => {
      if (q && !s.symbol.toLowerCase().includes(q) && !s.name.toLowerCase().includes(q))
        return false;
      if (sectors.length > 0 && !sectors.includes(s.sector)) return false;
      if (s.pe > maxPE) return false;
      if (s.divYield < Number(minYield)) return false;
      if (band !== "all" && mcapBandOf(s.marketCapCr) !== (band as McapBand)) return false;
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => (a[sortKey] - b[sortKey]) * dir);
  }, [query, sectors, maxPE, minYield, band, sortKey, sortDir]);

  /** Simulated LTP + day-change per result, computed once per filter change. */
  const live = useMemo(() => {
    const map = new Map<string, { pricePaise: number; changePct: number }>();
    for (const s of results) {
      // Single quote source: displayed price and % share one basis.
      const q = getQuote(s.symbol);
      map.set(s.symbol, {
        pricePaise: q?.pricePaise ?? getLTP(s.symbol),
        changePct: q?.changePct ?? 0,
      });
    }
    return map;
  }, [results]);

  function openStock(symbol: string) {
    navigate({ to: "/stocks/$symbol", params: { symbol } });
  }

  function resetFilters() {
    setSectors([]);
    setMaxPE(MAX_PE);
    setMinYield("0");
    setBand("all");
    setQuery("");
  }

  const filterCount =
    sectors.length +
    (maxPE < MAX_PE ? 1 : 0) +
    (minYield !== "0" ? 1 : 0) +
    (band !== "all" ? 1 : 0);

  return (
    <PageShell
      title="Stock Screener"
      subtitle="Filter 40 Indian stocks by sector, valuation, dividend yield and market-cap. Click any row for a full analysis. Star stocks to build your watchlist."
      active="Screener"
    >
      {/* Filter bar */}
      <section className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div className="grid gap-2">
            <Label htmlFor="screener-search">Search</Label>
            <SearchDropdown
              groups={searchGroups}
              value={query}
              onChange={setQuery}
              placeholder="Symbol or company name…"
              onSelect={(item) => openStock(item.id)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="screener-pe">
              Max P/E{" "}
              <span className="ml-1 font-bold text-primary">
                {maxPE === MAX_PE ? "Any" : `≤ ${maxPE}`}
              </span>
            </Label>
            <Slider
              id="screener-pe"
              min={5}
              max={MAX_PE}
              step={1}
              value={[maxPE]}
              onValueChange={([v]) => setMaxPE(v ?? MAX_PE)}
              className="mt-2.5"
              aria-label="Maximum P/E ratio"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="screener-yield">Min dividend yield</Label>
            <Select value={minYield} onValueChange={setMinYield}>
              <SelectTrigger id="screener-yield">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any</SelectItem>
                <SelectItem value="1">≥ 1%</SelectItem>
                <SelectItem value="2">≥ 2%</SelectItem>
                <SelectItem value="3">≥ 3%</SelectItem>
                <SelectItem value="5">≥ 5%</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="screener-mcap">Market-cap band</Label>
            <Select value={band} onValueChange={setBand}>
              <SelectTrigger id="screener-mcap">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All caps</SelectItem>
                {(Object.keys(MCAP_BANDS) as McapBand[]).map((b) => (
                  <SelectItem key={b} value={b}>
                    {MCAP_BANDS[b].label} ({MCAP_BANDS[b].hint})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <div className="mb-2.5 flex items-center justify-between">
            <Label>Sectors</Label>
            {sectors.length > 0 && (
              <button
                onClick={() => setSectors([])}
                className={`text-xs font-semibold text-primary hover:underline ${pressable}`}
              >
                Clear ({sectors.length})
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {SECTORS.map((sector) => {
              const active = sectors.includes(sector);
              return (
                <button
                  key={sector}
                  onClick={() => toggleSector(sector)}
                  aria-pressed={active}
                  className={`${cn(
                    "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/60 hover:text-primary",
                  )} ${pressable}`}
                >
                  {sector}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Results header */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            <span className="font-bold text-foreground">{results.length}</span> of {STOCKS.length}{" "}
            stocks
            {filterCount > 0 && ` · ${filterCount} filter${filterCount > 1 ? "s" : ""} active`}
          </p>
          <p className="text-xs text-muted-foreground">
            Demo dataset · simulated prices — not live
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="screener-sort" className="sr-only">
            Sort results by
          </Label>
          <Select value={sortKey} onValueChange={(v: SortKey) => toggleSort(v)}>
            <SelectTrigger id="screener-sort" className="h-9 w-36 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_COLUMNS.map(({ key, label }) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className={`size-9 ${pressable}`}
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            aria-label={sortDir === "desc" ? "Sort ascending" : "Sort descending"}
          >
            {sortDir === "desc" ? <ArrowDown className="size-4" /> : <ArrowUp className="size-4" />}
          </Button>
          {filterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className={pressable}>
              Reset filters
            </Button>
          )}
        </div>
      </div>

      {results.length === 0 ? (
        <EmptyState
          title="No stocks match"
          body="Try widening the P/E range, lowering the dividend-yield bar, or clearing a sector chip."
          actionLabel="Reset filters"
          onAction={resetFilters}
        />
      ) : (
        <ul className="grid gap-2">
          {results.map((s: StockInfo) => {
            const watched = isWatched(s.symbol);
            const m = live.get(s.symbol);
            return (
              <li key={s.symbol}>
                <MarketRow
                  symbol={s.symbol}
                  name={`${s.name} · ${s.sector} · P/E ${s.pe.toFixed(1)} · MCap ${formatINRShort(s.marketCapCr * 1_00_00_00_000)}`}
                  pricePaise={m?.pricePaise ?? s.pricePaise}
                  changePct={m?.changePct ?? 0}
                  starred={watched}
                  onToggleStar={() => toggle(s.symbol)}
                  onClick={() => openStock(s.symbol)}
                  className="border border-border/60 bg-card shadow-card"
                />
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        Prices shown are simulated from the FinVerse demo dataset — not live market data. For
        learning, not trading.
      </p>
    </PageShell>
  );
}
