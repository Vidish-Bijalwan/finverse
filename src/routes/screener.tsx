import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Search, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatINR, formatINRShort } from "@/lib/finance/format";
import {
  MCAP_BANDS,
  SECTORS,
  STOCKS,
  mcapBandOf,
  type McapBand,
  type StockInfo,
} from "@/lib/market/data";
import { EmptyState } from "@/components/markets/shared";
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

  function openStock(symbol: string) {
    navigate({ to: "/stocks/$symbol", params: { symbol } });
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
      <section className="mb-6 rounded-lg border border-border bg-card p-5 shadow-card">
        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div className="grid gap-2">
            <Label htmlFor="screener-search">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="screener-search"
                placeholder="Symbol or company name…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
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
              onValueChange={([v]) => setMaxPE(v)}
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
                className="text-xs font-semibold text-primary hover:underline"
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
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/60 hover:text-primary",
                  )}
                >
                  {sector}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Results */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          <span className="font-bold text-foreground">{results.length}</span> of {STOCKS.length}{" "}
          stocks
          {filterCount > 0 && ` · ${filterCount} filter${filterCount > 1 ? "s" : ""} active`}
        </p>
        {filterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSectors([]);
              setMaxPE(MAX_PE);
              setMinYield("0");
              setBand("all");
              setQuery("");
            }}
          >
            Reset filters
          </Button>
        )}
      </div>

      {results.length === 0 ? (
        <EmptyState
          title="No stocks match"
          body="Try widening the P/E range, lowering the dividend-yield bar, or clearing a sector chip."
          actionLabel="Reset filters"
          onAction={() => {
            setSectors([]);
            setMaxPE(MAX_PE);
            setMinYield("0");
            setBand("all");
            setQuery("");
          }}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12" />
                <TableHead>Stock</TableHead>
                <TableHead>Sector</TableHead>
                {SORT_COLUMNS.map(({ key, label }) => (
                  <TableHead key={key} className="text-right">
                    <button
                      onClick={() => toggleSort(key)}
                      className={cn(
                        "inline-flex items-center gap-1 font-semibold transition-colors hover:text-primary",
                        sortKey === key && "text-primary",
                      )}
                      aria-label={`Sort by ${label} ${sortKey === key && sortDir === "desc" ? "ascending" : "descending"}`}
                    >
                      {label}
                      {sortKey === key ? (
                        sortDir === "desc" ? (
                          <ArrowDown className="size-3.5" />
                        ) : (
                          <ArrowUp className="size-3.5" />
                        )
                      ) : (
                        <ArrowUpDown className="size-3.5 opacity-40" />
                      )}
                    </button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((s: StockInfo) => {
                const watched = isWatched(s.symbol);
                return (
                  <TableRow
                    key={s.symbol}
                    className="cursor-pointer"
                    onClick={() => openStock(s.symbol)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={
                          watched
                            ? `Remove ${s.symbol} from watchlist`
                            : `Add ${s.symbol} to watchlist`
                        }
                        aria-pressed={watched}
                        onClick={() => toggle(s.symbol)}
                      >
                        <Star
                          className={cn(
                            "size-4",
                            watched ? "fill-amber-400 text-amber-400" : "text-muted-foreground",
                          )}
                        />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-primary">{s.symbol}</span>
                      <div className="max-w-44 truncate text-xs text-muted-foreground">
                        {s.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="whitespace-nowrap">
                        {s.sector}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {formatINR(s.pricePaise)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{s.pe.toFixed(1)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatINRShort(s.marketCapCr * 1_00_00_00_000)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {s.divYield.toFixed(2)}%
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-semibold tabular-nums",
                        s.oneYReturnPct >= 0 ? "text-success" : "text-destructive",
                      )}
                    >
                      {s.oneYReturnPct >= 0 ? "+" : "−"}
                      {Math.abs(s.oneYReturnPct).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </PageShell>
  );
}
