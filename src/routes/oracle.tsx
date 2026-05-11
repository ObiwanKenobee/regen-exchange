import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Camera,
  Cpu,
  Fingerprint,
  Radar,
  Satellite,
  ShieldAlert,
  Timer,
  Users,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Eye,
  Zap,
} from "lucide-react";
import { VerificationFeed } from "@/components/rve/verification-feed";
import {
  DashboardShell,
  DashSectionHeader,
  MetricTile,
} from "@/components/rve/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getOracleConsensus, submitOracleVerification } from "@/lib/rve/identity.functions";

export const Route = createFileRoute("/oracle")({
  head: () => ({
    meta: [
      { title: "AI Oracle Verification | RVE" },
      {
        name: "description",
        content:
          "Trust engine — satellite before/after, sensor fusion, fraud signals, oracle consensus, and immutable audit trails.",
      },
    ],
  }),
  component: OraclePage,
});

function OraclePage() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock verification data
  const recentVerifications = [
    {
      id: "ver-001",
      asset: "Carbon Credit - Nairobi Forest",
      type: "satellite",
      status: "verified",
      confidence: 0.96,
      oracles: 5,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: "ver-002",
      asset: "Water Conservation - Rift Valley",
      type: "sensor",
      status: "verified",
      confidence: 0.89,
      oracles: 4,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      id: "ver-003",
      asset: "Biodiversity - Maasai Mara",
      type: "community",
      status: "pending",
      confidence: 0.0,
      oracles: 3,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
  ];

  const oracleHealth = [
    { name: "Satellite Network", status: "healthy", uptime: 99.8, lastCheck: "2 min ago" },
    { name: "IoT Sensors", status: "healthy", uptime: 97.2, lastCheck: "5 min ago" },
    { name: "Community Validators", status: "warning", uptime: 94.1, lastCheck: "12 min ago" },
    { name: "AI Fraud Detection", status: "healthy", uptime: 99.9, lastCheck: "1 min ago" },
    { name: "Temporal Analysis", status: "healthy", uptime: 98.5, lastCheck: "3 min ago" },
  ];

  return (
    <DashboardShell
      eyebrow="Transparency moat"
      title="AI Oracle Verification Dashboard"
      description="Explain why impact is valid — multi-oracle consensus, IoT feeds, fraud signals, oracle consensus, and immutable audit trails."
    >
      {/* Oracle Health Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile label="Consensus confidence" value="98.7%" sub="Weighted attestation" trend="+0.1%" icon={Radar} />
        <MetricTile label="Fraud risk score" value="0.12" sub="Lower is safer" trend="−0.02" icon={ShieldAlert} />
        <MetricTile label="Active sensor streams" value="14.2k" sub="IoT + public stations" trend="+312" icon={Activity} />
        <MetricTile label="Audit bundles sealed" value="386" sub="Last 7 days" trend="+24" icon={Fingerprint} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        {/* Oracle Health Status */}
        <div className="lg:col-span-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-emerald-400 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Oracle Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {oracleHealth.map((oracle) => (
                <div key={oracle.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 border border-slate-600">
                  <div>
                    <div className="text-sm font-medium text-slate-200">{oracle.name}</div>
                    <div className="text-xs text-slate-400">{oracle.lastCheck}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${
                      oracle.status === 'healthy' ? 'bg-emerald-400' :
                      oracle.status === 'warning' ? 'bg-amber-400' : 'bg-red-400'
                    }`} />
                    <span className="text-xs text-slate-300">{oracle.uptime}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Button
                  variant={activeTab === "overview" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("overview")}
                  className="text-slate-300"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Overview
                </Button>
                <Button
                  variant={activeTab === "verification" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("verification")}
                  className="text-slate-300"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verifications
                </Button>
                <Button
                  variant={activeTab === "consensus" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("consensus")}
                  className="text-slate-300"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Consensus
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {activeTab === "overview" && (
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Remote Sensing */}
                  <div className="panel">
                    <DashSectionHeader
                      eyebrow="Remote sensing"
                      title="Satellite imagery comparison"
                      desc="Before / after restoration scans with cloud masking and biome-specific indices."
                    />
                    <div className="grid grid-cols-2 gap-3 px-5 pb-5">
                      <div className="aspect-[4/5] overflow-hidden rounded-md border border-border/60 bg-muted/30">
                        <div className="flex h-full flex-col items-center justify-center p-3 text-center text-[10px] text-muted-foreground">
                          <Satellite className="mb-2 h-6 w-6 text-muted-foreground" />
                          BEFORE
                          <br />
                          Sentinel-2 • T0
                        </div>
                      </div>
                      <div className="aspect-[4/5] overflow-hidden rounded-md border border-primary/40 bg-primary/5">
                        <div className="flex h-full flex-col items-center justify-center p-3 text-center text-[10px] text-primary">
                          <Satellite className="mb-2 h-6 w-6" />
                          AFTER
                          <br />
                          Sentinel-2 • T+180d
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ground Truth */}
                  <div className="panel">
                    <DashSectionHeader
                      eyebrow="Ground truth"
                      title="Sensor & community fusion"
                      desc="Drone lines, water chemistry, acoustic biodiversity, and validator quorum — anomaly routing to human review."
                    />
                    <div className="grid gap-3 px-5 pb-5 sm:grid-cols-3">
                      {[
                        { icon: Cpu, t: "Edge IoT", s: "pH, turbidity, soil VWC" },
                        { icon: Camera, t: "Drone mesh", s: "Structure-from-motion canopy" },
                        { icon: Users, t: "Community attestors", s: "Quadratic reputation weight" },
                      ].map(({ icon: I, t, s }) => (
                        <div key={t} className="rounded-lg border border-border/60 bg-background/50 p-4">
                          <I className="h-5 w-5 text-secondary" />
                          <div className="mt-2 text-sm font-medium">{t}</div>
                          <div className="text-xs text-muted-foreground">{s}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "verification" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-slate-200 mb-4">Recent Verifications</h3>
                    <div className="space-y-3">
                      {recentVerifications.map((verification) => (
                        <div key={verification.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              verification.type === 'satellite' ? 'bg-blue-500/20' :
                              verification.type === 'sensor' ? 'bg-emerald-500/20' :
                              'bg-amber-500/20'
                            }`}>
                              {verification.type === 'satellite' && <Satellite className="h-4 w-4 text-blue-400" />}
                              {verification.type === 'sensor' && <Cpu className="h-4 w-4 text-emerald-400" />}
                              {verification.type === 'community' && <Users className="h-4 w-4 text-amber-400" />}
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-slate-200">{verification.asset}</h4>
                              <p className="text-xs text-slate-400">
                                {verification.oracles} oracles • {verification.timestamp.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {verification.status === 'verified' ? (
                              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-amber-500/30 text-amber-400">
                                <Timer className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                            <div className="text-right">
                              <div className="text-sm font-medium text-slate-200">
                                {verification.confidence > 0 ? `${(verification.confidence * 100).toFixed(1)}%` : '—'}
                              </div>
                              <div className="text-xs text-slate-400">Confidence</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "consensus" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-slate-200 mb-4">Oracle Consensus Engine</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card className="bg-slate-700/50 border-slate-600">
                        <CardHeader>
                          <CardTitle className="text-emerald-400 text-base">Consensus Requirements</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-300">Minimum oracles</span>
                            <span className="text-slate-200">3/5</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-300">Consensus threshold</span>
                            <span className="text-slate-200">80%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-300">Fraud detection</span>
                            <span className="text-slate-200">Active</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-700/50 border-slate-600">
                        <CardHeader>
                          <CardTitle className="text-emerald-400 text-base">Active Oracles</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-300">Satellite Network</span>
                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-300">IoT Sensors</span>
                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-300">Community Validators</span>
                            <AlertTriangle className="h-4 w-4 text-amber-400" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-300">AI Analysis</span>
                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-slate-200 mb-4">Consensus Performance</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                        <div className="text-2xl font-bold text-emerald-400">98.7%</div>
                        <div className="text-sm text-slate-400">Average Consensus</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                        <div className="text-2xl font-bold text-cyan-400">2.3s</div>
                        <div className="text-sm text-slate-400">Avg Response Time</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                        <div className="text-2xl font-bold text-amber-400">99.2%</div>
                        <div className="text-sm text-slate-400">Uptime</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Verification Feed */}
      <div className="mt-6">
        <VerificationFeed />
      </div>
    </DashboardShell>
  );
}
