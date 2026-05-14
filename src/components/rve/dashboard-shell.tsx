import { Link, useRouterState } from "@tanstack/react-router";
import { Globe2, Menu, PanelLeftClose, PanelLeft } from "lucide-react";
import { useState, type ComponentType, type ReactNode } from "react";
import { ConnectWalletButton } from "@/components/rve/connect-wallet";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const DASHBOARD_HUB_LINKS = [
  { to: "/platform-architecture", label: "Architecture" },
  { to: "/residential-homes", label: "Residential Homes" },
  { to: "/command-center", label: "Command Center" },
  { to: "/marketplace", label: "RIU Marketplace" },
  { to: "/nairobi-twin", label: "Nairobi Twin" },
  { to: "/community", label: "Community" },
  { to: "/oracle", label: "AI Oracle" },
  { to: "/institutional-esg", label: "Institutional ESG" },
  { to: "/eco-intelligence", label: "Eco Intelligence" },
  { to: "/governance", label: "Governance" },
  { to: "/impact-explorer", label: "Impact Explorer" },
  { to: "/refi", label: "ReFi" },
] as const;

const ticker = [
  "M-PESA RAIL • STK + B2C (Daraja)",
  "RIU INDEX +3.1%",
  "NAIROBI HEAT −0.4°C proj.",
  "CARBON SEQ +12.4 Mt",
  "ORACLE CONF 98.7%",
  "TREASURY $284M liq.",
  "RESTORATION ZONES 1,842 active",
];

export function DashboardShell({
  eyebrow,
  title,
  description,
  children,
  actions,
  showSidebarNav = true,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  showSidebarNav?: boolean;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = useRouterState({
    select: (s: { location: { pathname: string } }) => s.location.pathname,
  });

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <nav
      className={cn(
        "flex gap-0.5",
        mobile ? "flex-col" : "flex-col text-sm",
      )}
    >
      <Link
        to="/"
        className={cn(
          "rounded-md px-3 py-2 transition-colors",
          pathname === "/"
            ? "bg-primary/15 text-primary"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        )}
      >
        Exchange Home
      </Link>
      {DASHBOARD_HUB_LINKS.map(({ to, label }) => (
        <Link
          key={to}
          to={to}
          className={cn(
            "rounded-md px-3 py-2 transition-colors",
            pathname === to
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1800px] items-center gap-3 px-4 sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open dashboard menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] border-border/60 bg-background/95">
              <SheetHeader>
                <SheetTitle className="text-left text-sm font-normal text-muted-foreground">
                  RVE dashboards
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <NavLinks mobile />
              </div>
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex shrink-0 items-center gap-2">
            <div className="relative h-7 w-7 rounded-md bg-gradient-aurora glow-emerald">
              <Globe2 className="absolute inset-0 m-auto h-4 w-4 text-background" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-wide">ATLAS SANCTUM</div>
              <div className="hidden text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:block">
                RVE Core
              </div>
            </div>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:flex">
            {DASHBOARD_HUB_LINKS.slice(0, 6).map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "shrink-0 rounded-md px-2.5 py-1.5 text-xs transition-colors",
                  pathname === to
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                {label}
              </Link>
            ))}
            <span className="px-1 text-muted-foreground">…</span>
            <Link
              to="/refi"
              className={cn(
                "shrink-0 rounded-md px-2.5 py-1.5 text-xs transition-colors",
                pathname === "/refi"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              ReFi
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs xl:flex">
              <span className="h-2 w-2 rounded-full bg-primary ticker-pulse" />
              <span className="text-muted-foreground">Live</span>
              <span className="font-mono text-foreground">Earth Intelligence Mesh</span>
            </div>
            <ConnectWalletButton />
          </div>
        </div>
        <div className="overflow-hidden border-t border-border/60 bg-background/50">
          <div className="flex animate-ticker whitespace-nowrap py-1.5 text-xs font-mono">
            {[...ticker, ...ticker].map((t, i) => (
              <span key={i} className="mx-6 flex items-center gap-1.5">
                <span className="text-primary">●</span>
                <span className="text-foreground">{t}</span>
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1800px] gap-0">
        {showSidebarNav && (
          <aside
            className={cn(
              "sticky top-[7.25rem] hidden h-[calc(100vh-7.25rem)] shrink-0 border-r border-border/60 bg-background/40 backdrop-blur-sm transition-[width] md:flex md:flex-col",
              sidebarOpen ? "w-56 px-3 py-6" : "w-12 items-center py-6",
            )}
          >
            <div
              className={cn(
                "mb-4 flex items-center px-1",
                sidebarOpen ? "justify-between" : "justify-center",
              )}
            >
              {sidebarOpen && (
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Ecosystem
                </span>
              )}
              <button
                type="button"
                onClick={() => setSidebarOpen((open: boolean) => !open)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="h-4 w-4" />
                ) : (
                  <PanelLeft className="h-4 w-4" />
                )}
              </button>
            </div>
            {sidebarOpen && <NavLinks />}
          </aside>
        )}

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:py-10">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              {eyebrow && (
                <div className="text-xs uppercase tracking-[0.25em] text-primary">{eyebrow}</div>
              )}
              <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                {title}
              </h1>
              {description && (
                <p className="mt-3 text-muted-foreground md:text-lg">{description}</p>
              )}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

export function DashSectionHeader({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="mb-6 max-w-3xl">
      <div className="text-xs uppercase tracking-[0.25em] text-secondary">{eyebrow}</div>
      <h2 className="mt-2 text-xl font-semibold md:text-2xl">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

export function MetricTile({
  label,
  value,
  sub,
  trend,
  trendUp = true,
  icon: Icon,
  className,
}: {
  label: string;
  value: string;
  sub?: string;
  trend?: string;
  trendUp?: boolean;
  icon?: ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <div className={cn("panel p-5 transition hover:bg-muted/10", className)}>
      <div className="flex items-start justify-between gap-2">
        {Icon && <Icon className="h-5 w-5 shrink-0 text-primary" />}
        {trend && (
          <span
            className={cn(
              "font-mono text-xs",
              trendUp ? "text-primary" : "text-destructive",
            )}
          >
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4 font-mono text-2xl font-semibold tracking-tight md:text-3xl">
        {value}
      </div>
      <div className="mt-1 text-sm font-medium">{label}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

export function TagRow({ tags }: { tags: string[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <span
          key={t}
          className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground"
        >
          {t}
        </span>
      ))}
    </div>
  );
}
