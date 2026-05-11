import { useState, useEffect } from "react";
import {
  X,
  ChevronDown,
  ChevronUp,
  MapPin,
  Activity,
  Leaf,
  Droplets,
  Wind,
  Zap,
  Users,
  TrendingUp,
  Satellite,
  Radio,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NewsletterBannerProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export function NewsletterBanner({ isVisible = true, onClose }: NewsletterBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  // Sample intelligence data - in real app this would come from API
  const intelligenceBrief = {
    airQuality: "+12%",
    riusVerified: "43K",
    riverRestoration: "expanded",
    floodRisk: "reduced",
    stewardsOnboarded: "1,200",
  };

  const featuredMetrics = [
    { label: "RIUs Minted", value: "2.84B", trend: "+4.2%", icon: Leaf },
    { label: "Carbon Restored", value: "12.4 Mt", trend: "+11%", icon: Wind },
    { label: "Rivers Recovered", value: "87.3", trend: "−1.2%", trendUp: false, icon: Droplets },
    { label: "Active Stewards", value: "18.4K", trend: "+312", icon: Users },
  ];

  const handleSubscribe = async () => {
    if (!email) return;

    // In a real app, this would call your newsletter API
    setIsSubscribed(true);
    setTimeout(() => {
      setIsSubscribed(false);
      setEmail("");
      // Could show a success message here
    }, 2000);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Floating Banner */}
      <div
        className={`
          relative overflow-hidden transition-all duration-500 ease-out
          ${isMinimized ? 'h-16' : isExpanded ? 'h-screen' : 'h-32'}
          bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950
          border-b border-emerald-500/20 shadow-2xl
        `}
      >
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,255,79,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDEyNCwyNTUsNzksMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30 animate-grid-scan" />
        </div>

        {/* Satellite overlay effect */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDIwOSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSIxMCAxMCIvPjwvc3ZnPg==')] opacity-20 animate-satellite-orbit" />

        {/* Data flow lines */}
        <div className="absolute top-4 left-4 right-4 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-data-flow" />
        <div className="absolute bottom-4 left-4 right-4 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent animate-data-flow" style={{ animationDelay: '4s' }} />

        {/* Content */}
        <div className="relative z-10 h-full">
          {/* Header Bar */}
          <div className="flex items-center justify-between p-4 border-b border-emerald-500/10">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30 animate-pulse-glow">
                <Satellite className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-emerald-400 tracking-wider">ATLAS</h1>
                <p className="text-xs text-slate-400">Signals From the Regenerative Frontier</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 text-xs">
                <Radio className="h-3 w-3 mr-1" />
                LIVE
              </Badge>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-slate-400 hover:text-white hover:bg-slate-800/50"
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-slate-400 hover:text-white hover:bg-slate-800/50"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-slate-400 hover:text-white hover:bg-slate-800/50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Collapsed State */}
          {!isMinimized && !isExpanded && (
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-slate-300">
                    <span className="text-emerald-400 font-medium">THIS WEEK IN NAIROBI</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>Air quality <span className="text-emerald-400">+{intelligenceBrief.airQuality}</span></span>
                    <span>{intelligenceBrief.riusVerified} RIUs verified</span>
                    <span>River restoration {intelligenceBrief.riverRestoration}</span>
                    <span>Flood risk {intelligenceBrief.floodRisk}</span>
                    <span>{intelligenceBrief.stewardsOnboarded} stewards onboarded</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Subscribe
                  </Button>
                  <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                    Read Latest
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Minimized State */}
          {isMinimized && (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-3 text-slate-400">
                <Satellite className="h-4 w-4 animate-pulse" />
                <span className="text-sm">Atlas Newsletter Paused</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsMinimized(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Expanded State */}
          {isExpanded && !isMinimized && (
            <div className="flex-1 overflow-y-auto">
              {/* Hero Section */}
              <div className="relative h-64 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMzAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxMjQsMjU1LDc5LDAuMykiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==')] opacity-30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-4xl font-bold text-emerald-400 mb-2">ATLAS</h2>
                    <p className="text-xl text-slate-300 mb-4">The Intelligence Layer of Living Cities</p>
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                      <MapPin className="h-4 w-4" />
                      <span>Nairobi Intelligence Brief • Week 19, 2026</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Intelligence Brief */}
              <div className="p-6 border-b border-slate-800">
                <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  THIS WEEK IN NAIROBI
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(intelligenceBrief).map(([key, value]) => (
                    <div key={key} className="text-center p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                      <div className="text-2xl font-bold text-emerald-400">{value}</div>
                      <div className="text-xs text-slate-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Featured Metrics */}
              <div className="p-6 border-b border-slate-800">
                <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Regenerative Metrics Dashboard
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {featuredMetrics.map((metric) => {
                    const Icon = metric.icon;
                    return (
                      <div key={metric.label} className="p-4 rounded-lg bg-slate-800/30 border border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                          <Icon className="h-5 w-5 text-emerald-400" />
                          <span className={`text-xs ${metric.trendUp === false ? 'text-red-400' : 'text-emerald-400'}`}>
                            {metric.trend}
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-white">{metric.value}</div>
                        <div className="text-xs text-slate-400">{metric.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Featured Story */}
              <div className="p-6 border-b border-slate-800">
                <h3 className="text-lg font-semibold text-amber-400 mb-4">Featured Story</h3>
                <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
                  <h4 className="text-xl font-bold text-white mb-2">
                    How Kibera Became a Circular Economy Lab
                  </h4>
                  <p className="text-slate-300 mb-4">
                    In Nairobi's largest informal settlement, community-led waste collection and recycling
                    initiatives have created 450 green jobs and diverted 2.3 tons of waste daily from landfills.
                    The program now generates $180K monthly in circular economy revenue.
                  </p>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span>📍 Kibera, Nairobi</span>
                    <span>👥 1,200 participants</span>
                    <span>💚 45K RIUs earned</span>
                  </div>
                </div>
              </div>

              {/* AI Forecasts */}
              <div className="p-6 border-b border-slate-800">
                <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  AI Ecological Forecasts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-red-400">High Flood Risk</span>
                    </div>
                    <p className="text-sm text-slate-300">Eastlands district: 78% probability next 48 hours</p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-emerald-400">Vegetation Recovery</span>
                    </div>
                    <p className="text-sm text-slate-300">Karura Forest: +12% canopy density this quarter</p>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="p-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Join the Regenerative Intelligence Network
                  </h3>
                  <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                    Get weekly intelligence briefs, restoration opportunities, and be part of building
                    Nairobi's regenerative future.
                  </p>

                  {!isSubscribed ? (
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                      />
                      <Button
                        onClick={handleSubscribe}
                        disabled={!email}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                      >
                        Subscribe to Atlas
                      </Button>
                    </div>
                  ) : (
                    <div className="mb-4 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-md">
                      <p className="text-emerald-400 font-medium">Welcome to the Atlas Network! 📡</p>
                      <p className="text-sm text-slate-300">Check your email for confirmation.</p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8">
                      Become a Steward
                    </Button>
                    <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8">
                      View Live Dashboard
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}