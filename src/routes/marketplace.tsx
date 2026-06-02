import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  Coins,
  Leaf,
  LineChart,
  PieChart,
  Sparkles,
  TreePine,
  Droplets,
  Sun,
  Recycle,
  Landmark,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Zap,
} from "lucide-react";
import { Line, LineChart as RechartsLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AssetDetailDrawer } from "@/components/rve/asset-detail-drawer";
import {
  DashboardShell,
  DashSectionHeader,
  MetricTile,
  TagRow,
} from "@/components/rve/dashboard-shell";
import { MpesaB2cPanel } from "@/components/rve/mpesa/mpesa-b2c-panel";
import { MpesaStkPanel } from "@/components/rve/mpesa/mpesa-stk-panel";
import { OrderTicket } from "@/components/rve/order-ticket";
import { ASSETS, ECOSYSTEMS, type Asset } from "@/components/rve/types";
import { getAssets } from "@/lib/rve/rve.functions";
import { getOrderBook } from "@/lib/rve/identity.functions";
import { RoadmapSection } from "@/components/rve/roadmap-section";
import { MARKETPLACE_ROADMAP } from "@/lib/rve/marketplace-roadmap";
import { useWallet, shortAddr } from "@/lib/wallet-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "RIU Marketplace | RVE" },
      {
        name: "description",
        content:
          "Transparent trading for regenerative assets — order books, liquidity, verification history, and impact yield analytics.",
      },
    ],
  }),
  component: MarketplacePage,
});

const ASSET_TYPES = [
  { name: "Carbon RIUs", icon: Leaf, tags: ["Removal", "IFM", "DAC bridge"] },
  { name: "Water Restoration RIUs", icon: Droplets, tags: ["Watershed", "Aquifer"] },
  { name: "Biodiversity Credits", icon: TreePine, tags: ["Species", "Corridor"] },
  { name: "Cultural Preservation Credits", icon: Landmark, tags: ["Heritage", "Steward DAO"] },
  { name: "Urban Cooling Credits", icon: Sun, tags: ["UHI", "Canopy"] },
  { name: "Waste Circularity Credits", icon: Recycle, tags: ["MRF", "Diversion"] },
];

// Helper function to get icon based on asset type
function getAssetIcon(type: string) {
  switch (type) {
    case "carbon":
      return Leaf;
    case "water":
      return Droplets;
    case "biodiversity":
      return TreePine;
    case "cultural":
      return Landmark;
    case "urban":
      return Sun;
    case "waste":
      return Recycle;
    default:
      return Leaf;
  }
}

function MarketplacePage() {
  const { wallet, connect, disconnect, pendingCount, orders } = useWallet();
  const [drawerAsset, setDrawerAsset] = useState<Asset | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orderAsset, setOrderAsset] = useState<Asset | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderSide, setOrderSide] = useState<"buy" | "sell">("buy");
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [marketEcosystem, setMarketEcosystem] = useState<(typeof ECOSYSTEMS)[number]>("All");
  const [searchTerm, setSearchTerm] = useState("");

  const [mpesaTradeAsset, setMpesaTradeAsset] = useState<Asset | null>(null);
  const [mpesaTradeSide, setMpesaTradeSide] = useState<"buy" | "sell">("buy");
  const [mpesaTradeOpen, setMpesaTradeOpen] = useState(false);

  const totalOrders = orders.length;
  const shortAddress = wallet?.address ? shortAddr(wallet.address) : null;
  const goToOrders = () => {
    if (typeof window === "undefined") return;
    window.history.pushState({}, "", "/orders");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const openOrder = (a: Asset, side: "buy" | "sell" = "buy") => {
    setOrderAsset(a);
    setOrderSide(side);
    setOrderOpen(true);
  };

  const openMpesaTrade = (a: Asset, side: "buy" | "sell") => {
    setMpesaTradeAsset(a);
    setMpesaTradeSide(side);
    setMpesaTradeOpen(true);
  };

  // Fetch assets from server function
  const { data: apiAssets } = useQuery({
    queryKey: ["assets"],
    queryFn: () => getAssets(),
  });

  // Convert API assets to component format
  const assets: Asset[] = (apiAssets?.map((apiAsset: any) => ({
    id: apiAsset.id ?? apiAsset.symbol,
    sym: apiAsset.symbol,
    name: apiAsset.name,
    price: apiAsset.currentPrice,
    change: Math.random() * 10 - 5,
    icon: getAssetIcon(apiAsset.type),
    ecosystem: apiAsset.ecosystem || apiAsset.type || "Forest",
    region: apiAsset.region || "Global",
    vol: apiAsset.volume24h ? `${Math.round(apiAsset.volume24h)}M` : "—",
    liquidity: apiAsset.marketCap ? Math.round(apiAsset.marketCap / 1_000_000) : 0,
    verification: apiAsset.verificationScore ?? 85,
    hectares: apiAsset.hectares ?? 0,
    story: apiAsset.description || "Verified nature-backed asset with destination-based impact monitoring.",
  })) as unknown as Asset[]) || ASSETS;

  const filteredAssets = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    return assets.filter((asset) => {
      const matchesEcosystem = marketEcosystem === "All" || asset.ecosystem === marketEcosystem;
      const matchesSearch =
        !normalized ||
        asset.sym.toLowerCase().includes(normalized) ||
        asset.name.toLowerCase().includes(normalized) ||
        asset.region.toLowerCase().includes(normalized);
      return matchesEcosystem && matchesSearch;
    });
  }, [assets, marketEcosystem, searchTerm]);

  useEffect(() => {
    if (!filteredAssets.length) return;
    if (selectedAssetId === null || !filteredAssets.some((asset) => asset.id === selectedAssetId || asset.sym === selectedAssetId)) {
      const first = filteredAssets[0];
      setSelectedAssetId(first.id ?? first.sym);
    }
  }, [filteredAssets, selectedAssetId]);

  const selectedAsset = useMemo(
    () => filteredAssets.find((asset) => asset.id === selectedAssetId || asset.sym === selectedAssetId) ?? filteredAssets[0] ?? assets[0],
    [filteredAssets, selectedAssetId, assets],
  );

  const assetIdForOrderBook = selectedAsset?.id ?? selectedAsset?.sym ?? "";
  const { data: orderBook } = useQuery({
    queryKey: ["orderBook", assetIdForOrderBook],
    queryFn: () => getOrderBook({ data: { assetId: assetIdForOrderBook, depth: 10 } }),
    enabled: Boolean(assetIdForOrderBook),
  });

  const orderBookBids = orderBook?.bids ?? [
    { price: 1.045, quantity: 12500, orders: 3 },
    { price: 1.042, quantity: 8200, orders: 5 },
    { price: 1.04, quantity: 15600, orders: 2 },
    { price: 1.038, quantity: 9300, orders: 1 },
    { price: 1.035, quantity: 18700, orders: 2 },
  ];

  const orderBookAsks = orderBook?.asks ?? [
    { price: 1.048, quantity: 11200, orders: 2 },
    { price: 1.05, quantity: 15800, orders: 4 },
    { price: 1.052, quantity: 9200, orders: 2 },
    { price: 1.055, quantity: 13400, orders: 1 },
    { price: 1.058, quantity: 7800, orders: 2 },
  ];

  const currentSpread = orderBook ? orderBook.spread : 0.003;

  // Sample price history data
  const priceData = [
    { time: "09:00", price: 1.02 },
    { time: "10:00", price: 1.05 },
    { time: "11:00", price: 1.03 },
    { time: "12:00", price: 1.08 },
    { time: "13:00", price: 1.06 },
    { time: "14:00", price: 1.09 },
    { time: "15:00", price: 1.12 },
    { time: "16:00", price: 1.08 },
    { time: "17:00", price: 1.15 },
    { time: "18:00", price: 1.042 },
  ];

  return (
    <DashboardShell
      eyebrow="Economic heart"
      title="RIU Marketplace Dashboard"
      description="Order books, live pricing, ecological categories, liquidity pools, and advanced impact analytics — the exchange layer for verified Earth value."
      actions={
        <div className="flex flex-wrap gap-2">
          <Link
            to="/orders"
            className="rounded-md border border-border bg-background/60 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-muted/50"
          >
            Order history
          </Link>
          <Link
            to="/"
            className="rounded-md border border-border bg-background/60 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-muted/50"
          >
            Classic exchange view
          </Link>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile label="RIU / USD" value="$1.042" sub="Index mid" trend="+0.38%" icon={Coins} />
        <MetricTile
          label="Pool TVL"
          value="$612M"
          sub="Biodiversity + carbon pools"
          trend="+2.1%"
          icon={PieChart}
        />
        <MetricTile
          label="Impact yield (blended)"
          value="6.8%"
          sub="Restoration-backed vaults"
          trend="+40 bps"
          icon={LineChart}
        />
        <MetricTile
          label="AI fair value band"
          value="±1.8%"
          sub="12h prediction horizon"
          trend="stable"
          icon={Sparkles}
        />
      </div>

      {/* Price Chart Section */}
      <div className="mt-6 panel p-6">
        <DashSectionHeader
          eyebrow="Live pricing"
          title="RIU Index Price Chart"
          desc="Real-time composite price across all ecological asset classes"
        />
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={priceData}>
              <XAxis dataKey="time" />
              <YAxis domain={['dataMin - 0.02', 'dataMax + 0.02']} />
              <Tooltip formatter={(value) => [`$${value}`, 'Price']} />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#22c55e" }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trading Engine Section */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Button
                  variant="default"
                  size="sm"
                  className="text-slate-300"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Trading Engine
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-300"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Market Depth
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-300"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Recent Trades
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Order Book */}
                <div>
                  <h3 className="text-lg font-medium text-slate-200 mb-4">Order Book — {selectedAsset?.sym ?? "Asset"}</h3>
                  <div className="space-y-2">
                    {/* Bids */}
                    <div className="space-y-1">
                      <div className="text-xs text-slate-400 mb-2">Bids (Buy Orders)</div>
                      {orderBookBids.map((bid: any, i: number) => (
                        <button
                          key={`bid-${i}`}
                          type="button"
                          onClick={() => selectedAsset && openOrder(selectedAsset, "sell")}
                          className="w-full rounded border border-emerald-500/20 bg-emerald-500/10 p-2 text-left text-sm transition hover:bg-emerald-500/15"
                        >
                          <div className="flex justify-between">
                            <span className="text-emerald-400 font-mono">${bid.price.toFixed(3)}</span>
                            <span className="text-slate-300">{bid.quantity.toLocaleString()} RIU</span>
                          </div>
                          <div className="mt-1 text-xs text-slate-400">{bid.orders} bids • ${ (bid.price * bid.quantity).toFixed(1) }</div>
                        </button>
                      ))}
                    </div>

                    {/* Spread */}
                    <div className="text-center py-2 text-xs text-slate-400">
                      Spread: ${currentSpread.toFixed(3)} ({orderBook ? `${((currentSpread / (orderBook.lastPrice || 1)) * 100).toFixed(2)}%` : `0.29%`})
                    </div>

                    {/* Asks */}
                    <div className="space-y-1">
                      <div className="text-xs text-slate-400 mb-2">Asks (Sell Orders)</div>
                      {orderBookAsks.map((ask: any, i: number) => (
                        <button
                          key={`ask-${i}`}
                          type="button"
                          onClick={() => selectedAsset && openOrder(selectedAsset, "buy")}
                          className="w-full rounded border border-red-500/20 bg-red-500/10 p-2 text-left text-sm transition hover:bg-red-500/15"
                        >
                          <div className="flex justify-between">
                            <span className="text-red-400 font-mono">${ask.price.toFixed(3)}</span>
                            <span className="text-slate-300">{ask.quantity.toLocaleString()} RIU</span>
                          </div>
                          <div className="mt-1 text-xs text-slate-400">{ask.orders} asks • ${ (ask.price * ask.quantity).toFixed(1) }</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Market Depth Chart */}
                <div>
                  <h3 className="text-lg font-medium text-slate-200 mb-4">Market Depth</h3>
                  <div className="h-64 bg-slate-700/30 rounded-lg p-4 flex items-end justify-center">
                    <div className="flex items-end gap-1 h-full">
                      {/* Bids visualization */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-xs text-emerald-400 mb-1">Bids</div>
                        {[
                          { height: 80, volume: 12500 },
                          { height: 60, volume: 8200 },
                          { height: 90, volume: 15600 },
                          { height: 70, volume: 9300 },
                          { height: 95, volume: 18700 },
                        ].map((bid, i) => (
                          <div
                            key={i}
                            className="w-6 bg-emerald-500/60 rounded-t"
                            style={{ height: `${bid.height}%` }}
                            title={`$${1.045 - i * 0.003} - ${bid.volume} RIU`}
                          />
                        ))}
                      </div>

                      {/* Mid price */}
                      <div className="flex flex-col items-center justify-center px-4">
                        <div className="text-xs text-slate-400">Mid</div>
                        <div className="text-sm font-mono text-slate-200">$1.046</div>
                      </div>

                      {/* Asks visualization */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-xs text-red-400 mb-1">Asks</div>
                        {[
                          { height: 75, volume: 11200 },
                          { height: 85, volume: 15800 },
                          { height: 65, volume: 9200 },
                          { height: 80, volume: 13400 },
                          { height: 55, volume: 7800 },
                        ].map((ask, i) => (
                          <div
                            key={i}
                            className="w-6 bg-red-500/60 rounded-t"
                            style={{ height: `${ask.height}%` }}
                            title={`$${1.048 + i * 0.003} - ${ask.volume} RIU`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-emerald-400 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Trades
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { time: "14:32:15", price: 1.047, volume: 2500, side: "buy", symbol: "AMZ-CO₂" },
                { time: "14:31:42", price: 1.046, volume: 1800, side: "sell", symbol: "H₂O-SEC" },
                { time: "14:31:18", price: 1.048, volume: 4200, side: "buy", symbol: "AMZ-CO₂" },
                { time: "14:30:55", price: 1.045, volume: 3100, side: "sell", symbol: "BIO-MAR" },
                { time: "14:30:33", price: 1.049, volume: 1500, side: "buy", symbol: "AMZ-CO₂" },
                { time: "14:29:47", price: 1.044, volume: 2800, side: "sell", symbol: "H₂O-SEC" },
                { time: "14:29:12", price: 1.047, volume: 3900, side: "buy", symbol: "BIO-MAR" },
                { time: "14:28:38", price: 1.046, volume: 2100, side: "sell", symbol: "AMZ-CO₂" },
              ].map((trade, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 border border-slate-600">
                  <div className="flex items-center gap-2">
                    {trade.side === 'buy' ? (
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                    <div>
                      <div className="text-xs text-slate-400">{trade.time}</div>
                      <div className="text-xs text-slate-500">{trade.symbol}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono text-slate-200">${trade.price.toFixed(3)}</div>
                    <div className="text-xs text-slate-400">{trade.volume.toLocaleString()} RIU</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-12">
        <div className="panel lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <BookOpen className="h-4 w-4 text-primary" />
              Live order book — top of book
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {ECOSYSTEMS.map((ecosystem) => (
                <button
                  key={ecosystem}
                  onClick={() => setMarketEcosystem(ecosystem)}
                  type="button"
                  className={`rounded px-2 py-1 text-xs transition ${ecosystem === marketEcosystem ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {ecosystem}
                </button>
              ))}
            </div>
          </div>
          <div className="border-b border-border/60 px-5 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search asset symbol, name, or region"
                className="min-w-[220px] flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
              <div className="text-xs text-muted-foreground">{filteredAssets.length} assets</div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 text-left font-normal">Asset</th>
                  <th className="px-3 py-3 text-right font-normal">Price</th>
                  <th className="px-3 py-3 text-right font-normal">24h</th>
                  <th className="px-3 py-3 text-right font-normal">Liquidity</th>
                  <th className="px-5 py-3 text-right font-normal" />
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((a) => {
                  const up = a.change >= 0;
                  const I = a.icon;
                  const isSelected = a.id === selectedAsset?.id || a.sym === selectedAsset?.sym;
                  return (
                    <tr
                      key={a.sym}
                      onClick={() => {
                        setSelectedAssetId(a.id ?? a.sym);
                        setDrawerAsset(a);
                        setDrawerOpen(true);
                      }}
                      className={`cursor-pointer border-b border-border/40 transition hover:bg-muted/20 ${isSelected ? "bg-primary/5" : ""}`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-muted/30">
                            <I className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-mono text-xs text-muted-foreground">{a.sym}</div>
                            <div className="font-medium">{a.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-right font-mono">${a.price.toFixed(2)}</td>
                      <td
                        className={`px-3 py-4 text-right font-mono ${up ? "text-primary" : "text-destructive"}`}
                      >
                        <span className="inline-flex items-center gap-1">
                          {up ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          {up ? "+" : ""}
                          {a.change.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-3 py-4 text-right font-mono">${a.liquidity}M</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAssetId(a.id ?? a.sym);
                              openOrder(a, "buy");
                            }}
                            className="rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20"
                          >
                            Buy
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAssetId(a.id ?? a.sym);
                              openOrder(a, "sell");
                            }}
                            className="rounded-md border border-destructive/40 bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/20"
                          >
                            Sell
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <div className="panel p-5">
            <DashSectionHeader
              eyebrow="Selected asset"
              title={selectedAsset?.name ?? "Market overview"}
              desc={`Live pricing, verification score and order book depth for ${selectedAsset?.sym ?? "the selected asset"}.`}
            />
            <div className="grid gap-3 text-sm">
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/20 p-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Price</div>
                  <div className="font-mono text-lg">${selectedAsset?.price.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Verification</div>
                  <div className="font-mono text-lg">{selectedAsset?.verification}%</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/20 p-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Region</div>
                  <div>{selectedAsset?.region}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Liquidity</div>
                  <div>${selectedAsset?.liquidity}M</div>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
                {selectedAsset?.story}
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Market depth (top 5 bids / asks)</span>
                  <span className="font-mono text-secondary">{orderBook?.volume24h ?? "—"} vol</span>
                </div>
              </div>
            </div>
          </div>
          <div className="panel p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Wallet summary</div>
                <p className="text-xs text-muted-foreground">Connected trading account and order activity.</p>
              </div>
              {wallet ? (
                <button
                  type="button"
                  onClick={disconnect}
                  className="rounded-md border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-muted/50"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => connect("Sanctum")}
                  className="rounded-md border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/15"
                >
                  Connect wallet
                </button>
              )}
            </div>
            <div className="mt-4 grid gap-3 text-sm">
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Wallet address</div>
                <div className="mt-2 font-mono">{wallet ? shortAddress : "No wallet connected"}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Balance</div>
                  <div className="mt-2 font-mono">{wallet ? `${wallet.balanceRGN.toFixed(2)} RGN` : "—"}</div>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">USD value</div>
                  <div className="mt-2 font-mono">{wallet ? `$${wallet.balanceUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—"}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Open orders</div>
                  <div className="mt-2 font-mono">{pendingCount}</div>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Order history</div>
                  <div className="mt-2 font-mono">{totalOrders}</div>
                </div>
              </div>
              {!wallet && (
                <div className="rounded-lg border border-dashed border-border bg-muted/10 p-4 text-xs text-muted-foreground">
                  Connect a wallet to place orders and see settlement tracking in your order history.
                </div>
              )}
            </div>
          </div>
          <div className="panel p-5">
            <div className="text-sm font-medium">Advanced</div>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li>• AI pricing predictions & ecological risk scoring</li>
              <li>• Dynamic impact yield curves</li>
              <li>• Impact staking & regenerative bonds</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <DashSectionHeader
          eyebrow="Fiat rail"
          title="M-Pesa ↔ RIUs (on / off ramp)"
          desc="Mass-market path: no crypto wallet required. STK Push credits treasury on pay-in; B2C pays out after RIU conversion and compliance. Production ties each leg to idempotent treasury jobs + callbacks."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <MpesaStkPanel
            title="Buy RIUs with M-Pesa"
            description="STK Push to your Paybill / till — treasury credits abstract RIU balance when Daraja callback confirms success."
            defaultAmount={1000}
            purpose="buy_riu"
            accountReference="RVE-BUY"
          />
          <MpesaB2cPanel
            title="Sell RIUs → M-Pesa"
            description="Off-ramp: after RIU burn / FX quote, treasury initiates B2C to the steward handset (requires full B2C credentials)."
            defaultOccasion="RIU off-ramp"
            purpose="sell_riu_offramp"
          />
        </div>
      </div>

      <div className="mt-10">
        <DashSectionHeader
          eyebrow="Ecological asset categories"
          title="Trade by Earth system"
          desc="Each category ships with verification history, ESG hooks, and pool routing."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ASSET_TYPES.map(({ name, icon: I, tags }) => (
            <div key={name} className="panel p-5 transition hover:border-primary/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-aurora text-background">
                  <I className="h-5 w-5" />
                </div>
                <div className="font-medium">{name}</div>
              </div>
              <TagRow tags={tags} />
            </div>
          ))}
        </div>
      </div>

      <AssetDetailDrawer
        asset={drawerAsset}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onTrade={(a, side) => {
          setDrawerOpen(false);
          setTimeout(() => openOrder(a, side), 200);
        }}
        onMpesaTrade={(a, side) => {
          setDrawerOpen(false);
          setTimeout(() => openMpesaTrade(a, side), 200);
        }}
      />
      <OrderTicket
        asset={orderAsset}
        open={orderOpen}
        onOpenChange={setOrderOpen}
        initialSide={orderSide}
        onViewOrders={goToOrders}
      />
      <Sheet open={mpesaTradeOpen} onOpenChange={setMpesaTradeOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto border-t border-border bg-card">
          <SheetHeader>
            <SheetTitle>
              {mpesaTradeSide === "buy" ? "Buy with M-Pesa" : "Sell with M-Pesa"}
            </SheetTitle>
          </SheetHeader>
          {mpesaTradeAsset && mpesaTradeSide === "buy" && (
            <MpesaStkPanel
              title={`Buy ${mpesaTradeAsset.sym} with M-Pesa`}
              description={`Use a secure STK Push to fund a marketplace purchase for ${mpesaTradeAsset.name}.`}
              defaultAmount={1000}
              purpose="buy_riu"
              accountReference={`RVE-${mpesaTradeAsset.sym}-BUY`}
            />
          )}
          {mpesaTradeAsset && mpesaTradeSide === "sell" && (
            <MpesaB2cPanel
              title={`Sell ${mpesaTradeAsset.sym} to M-Pesa`}
              description={`Initiate an off-ramp payout after ${mpesaTradeAsset.name} sale settlement.`}
              defaultOccasion={`${mpesaTradeAsset.sym} off-ramp`}
              purpose="sell_riu_offramp"
            />
          )}
        </SheetContent>
      </Sheet>
      {/* Implementation Roadmap */}
      <div className="mt-14">
        <RoadmapSection
          title="Marketplace Implementation Roadmap"
          description="Building the comprehensive trading platform for RIUs, impact investments, and ecological derivatives."
          items={MARKETPLACE_ROADMAP}
        />
      </div>
    </DashboardShell>
  );
}
