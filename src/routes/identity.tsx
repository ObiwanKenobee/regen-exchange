import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  Badge,
  Camera,
  CheckCircle,
  Edit,
  MapPin,
  Shield,
  Star,
  TrendingUp,
  User,
  Users,
  Zap,
} from "lucide-react";
import {
  DashboardShell,
  DashSectionHeader,
  MetricTile,
} from "@/components/rve/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge as UIBadge } from "@/components/ui/badge";
import { getUserProfile, updateRIDScore } from "@/lib/rve/identity.functions";
import { RoadmapSection } from "@/components/rve/roadmap-section";
import { IDENTITY_ROADMAP } from "@/lib/rve/identity-roadmap";

export const Route = createFileRoute("/identity")({
  head: () => ({
    meta: [
      { title: "Identity & RID Score | RVE" },
      {
        name: "description",
        content:
          "Your regenerative identity — RID scoring, reputation systems, verification status, and ecological impact credentials.",
      },
    ],
  }),
  component: IdentityPage,
});

function IdentityPage() {
  const [activeTab, setActiveTab] = useState("profile");

  // Mock user ID - in production, this would come from auth context
  const userId = "user-123";

  const { data: profile, isLoading } = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => getUserProfile({ data: { userId } }),
  });

  if (isLoading || !profile) {
    return (
      <DashboardShell
        eyebrow="Identity layer"
        title="Regenerative Identity Dashboard"
        description="Loading your profile and RID score..."
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      eyebrow="Identity layer"
      title="Regenerative Identity Dashboard"
      description="Your RID score, reputation systems, verification status, and ecological impact credentials — the foundation of trust in regenerative economies."
    >
      {/* RID Score Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          label="RID Score"
          value={profile.ridScore.toString()}
          sub="Regenerative Identity"
          trend="+12"
          icon={Shield}
        />
        <MetricTile
          label="Verification Status"
          value={profile.isVerified ? "Verified" : "Pending"}
          sub={profile.isVerified ? "Identity confirmed" : "Verification needed"}
          trend={profile.isVerified ? "verified" : "pending"}
          icon={CheckCircle}
        />
        <MetricTile
          label="Reputation Rank"
          value="Gold"
          sub="Top 15% of stewards"
          trend="↗"
          icon={Star}
        />
        <MetricTile
          label="Active Missions"
          value="3"
          sub="2 ecological, 1 research"
          trend="active"
          icon={Zap}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        {/* Profile Card */}
        <div className="lg:col-span-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="text-center pb-4">
              <div className="relative mx-auto mb-4">
                <Avatar className="h-24 w-24 mx-auto animate-ecological-pulse">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-2xl">
                    {profile.name[0]}
                  </AvatarFallback>
                </Avatar>
                {profile.isVerified && (
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <CardTitle className="text-emerald-400 text-xl">{profile.name}</CardTitle>
              <div className="text-amber-400 font-medium">RID: {profile.ridScore}</div>
              <div className="flex items-center justify-center gap-1 mt-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-400">{profile.location}</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {profile.bio && (
                <p className="text-sm text-slate-300 text-center">{profile.bio}</p>
              )}

              {/* Reputation Breakdown */}
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-3">Reputation Domains</h4>
                <div className="space-y-2">
                  {Object.entries(profile.reputation).map(([domain, score]) => (
                    <div key={domain} className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 capitalize">{domain}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={score} className="w-16 h-1" />
                        <span className="text-xs text-emerald-400 w-6">{score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Badges */}
              {profile.badges.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Achievements</h4>
                  <div className="flex flex-wrap gap-1">
                    {profile.badges.map((badge) => (
                      <UIBadge key={badge} variant="outline" className="border-amber-500/30 text-amber-400 text-xs">
                        <Award className="h-3 w-3 mr-1" />
                        {badge}
                      </UIBadge>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {profile.skills.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {profile.skills.map((skill) => (
                      <UIBadge key={skill} variant="outline" className="border-cyan-500/30 text-cyan-400 text-xs">
                        {skill}
                      </UIBadge>
                    ))}
                  </div>
                </div>
              )}

              <Button className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Button
                  variant={activeTab === "profile" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("profile")}
                  className="text-slate-300"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile Details
                </Button>
                <Button
                  variant={activeTab === "verification" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("verification")}
                  className="text-slate-300"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Verification
                </Button>
                <Button
                  variant={activeTab === "reputation" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("reputation")}
                  className="text-slate-300"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Reputation
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-slate-200 mb-4">Contact Information</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm text-slate-400">Email</label>
                        <p className="text-slate-200">{profile.email}</p>
                      </div>
                      {profile.phone && (
                        <div>
                          <label className="text-sm text-slate-400">Phone</label>
                          <p className="text-slate-200">{profile.phone}</p>
                        </div>
                      )}
                      {profile.location && (
                        <div className="md:col-span-2">
                          <label className="text-sm text-slate-400">Location</label>
                          <p className="text-slate-200">{profile.location}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {profile.certifications.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-slate-200 mb-4">Certifications</h3>
                      <div className="grid gap-3 md:grid-cols-2">
                        {profile.certifications.map((cert) => (
                          <div key={cert} className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 border border-slate-600">
                            <CheckCircle className="h-5 w-5 text-emerald-400" />
                            <span className="text-sm text-slate-200">{cert}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "verification" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle className="h-6 w-6 text-emerald-400" />
                    <div>
                      <h3 className="text-lg font-medium text-emerald-400">Identity Verified</h3>
                      <p className="text-sm text-slate-300">Your identity has been verified through multiple channels</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-slate-200 mb-4">Verification Methods</h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 border border-slate-600">
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                        <span className="text-sm text-slate-200">Phone Verification</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 border border-slate-600">
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                        <span className="text-sm text-slate-200">Email Verification</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 border border-slate-600">
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                        <span className="text-sm text-slate-200">Document Verification</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 border border-slate-600">
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                        <span className="text-sm text-slate-200">Community Attestation</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "reputation" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-slate-200 mb-4">Reputation Breakdown</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {Object.entries(profile.reputation).map(([domain, score]) => (
                        <div key={domain} className="p-4 rounded-lg bg-slate-700/50 border border-slate-600">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-200 capitalize">{domain}</span>
                            <span className="text-lg font-bold text-emerald-400">{score}</span>
                          </div>
                          <Progress value={score} className="h-2 mb-2" />
                          <p className="text-xs text-slate-400">
                            {score >= 80 ? "Expert" : score >= 60 ? "Advanced" : score >= 40 ? "Intermediate" : "Beginner"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-slate-200 mb-4">Recent Reputation Changes</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 border border-slate-600">
                        <TrendingUp className="h-5 w-5 text-emerald-400" />
                        <div>
                          <p className="text-sm text-slate-200">Completed river cleanup mission</p>
                          <p className="text-xs text-slate-400">+15 Steward reputation • 2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 border border-slate-600">
                        <TrendingUp className="h-5 w-5 text-emerald-400" />
                        <div>
                          <p className="text-sm text-slate-200">Verified biodiversity data</p>
                          <p className="text-xs text-slate-400">+8 Research reputation • 1 day ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Implementation Roadmap */}
      <div className="mt-14">
        <RoadmapSection
          title="Identity & RID Scoring Implementation Roadmap"
          description="Building the comprehensive identity management system with RID scoring, reputation tracking, and trust networks."
          items={IDENTITY_ROADMAP}
        />
      </div>
    </DashboardShell>
  );
}