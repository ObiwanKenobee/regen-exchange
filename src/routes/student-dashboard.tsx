import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Award,
  BookOpen,
  Brain,
  Camera,
  CheckCircle,
  Coins,
  Compass,
  Cpu,
  Droplets,
  Eye,
  Flame,
  Globe,
  GraduationCap,
  Heart,
  Leaf,
  Lightbulb,
  MapPin,
  MessageSquare,
  Menu,
  Microscope,
  Mountain,
  Navigation,
  Play,
  Radio,
  Rocket,
  Satellite,
  Search,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Wind,
  Zap,
  Activity,
  BarChart3,
  Calendar,
  Clock,
  Star,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MpesaStkPanel } from "@/components/rve/mpesa/mpesa-stk-panel";
import { MpesaB2cPanel } from "@/components/rve/mpesa/mpesa-b2c-panel";

export const Route = createFileRoute("/student-dashboard")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — RVE Academy / Atlas Learning Network" },
      {
        name: "description",
        content:
          "Turn students into regenerative operators. Mission interface, research command center, climate-tech RPG, and launchpad into real-world ecological impact.",
      },
    ],
  }),
  component: StudentDashboard,
});

// Mock student data - in real app this would come from API
const studentData = {
  name: "Amina",
  level: 12,
  xp: 2847,
  xpToNext: 3200,
  rius: 1247,
  reputation: {
    steward: 85,
    oracle: 72,
    research: 91,
    civic: 78,
    builder: 64,
  },
  title: "River Sentinel",
  avatar: "/api/placeholder/150/150",
  completedMissions: 47,
  activeMissions: 3,
  certifications: 8,
  specialization: "Environmental Intelligence",
};

const learningTracks = [
  {
    id: "environmental",
    name: "Environmental Intelligence",
    icon: Leaf,
    color: "emerald",
    progress: 78,
    skills: ["Climate Science", "Biodiversity Systems", "Urban Ecology", "Hydrology"],
    missions: 12,
    xp: 1240,
  },
  {
    id: "ai",
    name: "AI & Data Systems",
    icon: Brain,
    color: "cyan",
    progress: 65,
    skills: ["Computer Vision", "GIS Analytics", "AI Oracles", "Edge AI"],
    missions: 8,
    xp: 890,
  },
  {
    id: "finance",
    name: "Regenerative Finance",
    icon: Coins,
    color: "amber",
    progress: 42,
    skills: ["RIUs", "Carbon Systems", "DAO Governance", "Ecological Economics"],
    missions: 5,
    xp: 520,
  },
  {
    id: "embedded",
    name: "Embedded Systems & IoT",
    icon: Cpu,
    color: "purple",
    progress: 31,
    skills: [
      "Sensor Deployment",
      "LoRaWAN Systems",
      "Environmental Monitoring",
      "Drone Operations",
    ],
    missions: 3,
    xp: 280,
  },
  {
    id: "civic",
    name: "Civic Governance",
    icon: Shield,
    color: "rose",
    progress: 56,
    skills: ["Community Coordination", "Policy Simulation", "Public Systems Thinking"],
    missions: 7,
    xp: 720,
  },
];

const activeMissions = [
  {
    id: 1,
    title: "Map Illegal Dumping Zones",
    description:
      "Use satellite imagery and community reports to identify and map illegal waste dumping sites in Eastlands.",
    type: "Ecology XP",
    xp: 150,
    rius: 25,
    deadline: "2026-05-20",
    progress: 60,
    location: "Eastlands, Nairobi",
    icon: MapPin,
  },
  {
    id: 2,
    title: "Train Biodiversity Detection AI",
    description:
      "Label images of Nairobi's native plant species to improve AI recognition for restoration projects.",
    type: "Intelligence XP",
    xp: 200,
    rius: 35,
    deadline: "2026-05-25",
    progress: 30,
    location: "Karura Forest",
    icon: Brain,
  },
  {
    id: 3,
    title: "Participate in Nairobi River Cleanup",
    description:
      "Join the weekly river restoration mission along Nairobi River. Physical participation required.",
    type: "Restoration XP",
    xp: 300,
    rius: 50,
    deadline: "2026-05-18",
    progress: 0,
    location: "Nairobi River",
    icon: Droplets,
  },
];

const nairobiPulse = [
  { metric: "Air Quality", value: "Good", trend: "+12%", color: "emerald" },
  { metric: "Flood Risk", value: "Low", trend: "-8%", color: "blue" },
  { metric: "Active Zones", value: "23", trend: "+5", color: "cyan" },
  { metric: "RIUs Minted", value: "1.2K", trend: "+15%", color: "amber" },
];

const recentAchievements = [
  {
    title: "River Guardian",
    description: "Completed 10 river cleanup missions",
    icon: Droplets,
    date: "2026-05-10",
  },
  { title: "AI Apprentice", description: "Trained 500 AI labels", icon: Brain, date: "2026-05-08" },
  {
    title: "Community Builder",
    description: "Organized 3 community surveys",
    icon: Users,
    date: "2026-05-05",
  },
];

function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMission, setSelectedMission] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(124,255,79,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(0,209,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ibmV1cmFsIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0zMCAzMGwzMCAzMEwzMCA2MEwzIDMwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMTI0LDI1NSw3OSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjbmV1cmFsKSIvPjwvc3ZnPg==')] opacity-30 animate-neural-network" />
      </div>

      {/* Floating Mission Indicators */}
      <div className="fixed top-20 right-6 space-y-3 pointer-events-none">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/80 border border-emerald-500/30 animate-mission-glow">
          <Activity className="h-4 w-4 text-emerald-400" />
          <span className="text-xs text-emerald-400">3 Active Missions</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/80 border border-cyan-500/30">
          <TrendingUp className="h-4 w-4 text-cyan-400" />
          <span className="text-xs text-cyan-400">+247 XP Today</span>
        </div>
      </div>
      {/* Header */}
      <header className="border-b border-emerald-500/20 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-30">
        <div className="mx-auto flex h-14 md:h-16 max-w-[1600px] items-center gap-4 md:gap-8 px-4 md:px-6">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 p-0.5">
              <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center">
                <GraduationCap className="h-4 w-4 md:h-5 md:w-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-emerald-400 tracking-wider">
                RVE Academy
              </h1>
              <p className="text-xs text-slate-400 hidden md:block">Atlas Learning Network</p>
            </div>
          </div>

          <nav className="ml-auto flex items-center gap-3 md:gap-6">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-emerald-400 hidden md:flex"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Learning Hub
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-emerald-400 hidden md:flex"
            >
              <Users className="h-4 w-4 mr-2" />
              Community
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-emerald-400 hidden md:flex"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Leaderboard
            </Button>
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-emerald-400 md:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] p-4 md:p-6">
        <div className="grid gap-4 md:gap-6 lg:grid-cols-4">
          {/* Left Sidebar - Student Profile */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="text-center pb-4">
                <div className="relative mx-auto mb-4">
                  <Avatar className="h-16 w-16 md:h-20 md:w-20 mx-auto animate-ecological-pulse">
                    <AvatarImage src={studentData.avatar} />
                    <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-lg md:text-xl">
                      {studentData.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-5 w-5 md:h-6 md:w-6 rounded-full bg-amber-500 flex items-center justify-center animate-pulse">
                    <span className="text-xs font-bold text-black">{studentData.level}</span>
                  </div>
                  {/* Reputation Aura */}
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-reputation-wave" />
                </div>
                <CardTitle className="text-emerald-400 text-lg">{studentData.name}</CardTitle>
                <CardDescription className="text-amber-400 font-medium">
                  {studentData.title}
                </CardDescription>
                <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 mt-2">
                  {studentData.specialization}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-3 md:space-y-4">
                {/* XP Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300">XP Progress</span>
                    <span className="text-emerald-400">
                      {studentData.xp}/{studentData.xpToNext}
                    </span>
                  </div>
                  <Progress value={(studentData.xp / studentData.xpToNext) * 100} className="h-2" />
                </div>

                {/* RIU Balance */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-amber-400" />
                    <span className="text-sm text-slate-300">RIUs Earned</span>
                  </div>
                  <span className="font-bold text-amber-400">
                    {studentData.rius.toLocaleString()}
                  </span>
                </div>

                {/* Reputation Scores */}
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Reputation</h4>
                  <div className="space-y-2">
                    {Object.entries(studentData.reputation).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 capitalize">{key}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={value} className="w-12 md:w-16 h-1" />
                          <span className="text-xs text-slate-300 w-6 md:w-8">{value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-700">
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-400">
                      {studentData.completedMissions}
                    </div>
                    <div className="text-xs text-slate-400">Missions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-cyan-400">
                      {studentData.certifications}
                    </div>
                    <div className="text-xs text-slate-400">Certs</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-slate-800/50">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-emerald-500/20 text-xs md:text-sm"
                >
                  <Compass className="h-4 w-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger
                  value="missions"
                  className="data-[state=active]:bg-emerald-500/20 text-xs md:text-sm"
                >
                  <Target className="h-4 w-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Missions</span>
                </TabsTrigger>
                <TabsTrigger
                  value="learning"
                  className="data-[state=active]:bg-emerald-500/20 text-xs md:text-sm"
                >
                  <BookOpen className="h-4 w-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Learning</span>
                </TabsTrigger>
                <TabsTrigger
                  value="community"
                  className="data-[state=active]:bg-emerald-500/20 text-xs md:text-sm"
                >
                  <Users className="h-4 w-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Community</span>
                </TabsTrigger>
                <TabsTrigger
                  value="rewards"
                  className="data-[state=active]:bg-emerald-500/20 text-xs md:text-sm"
                >
                  <Coins className="h-4 w-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Rewards</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Nairobi Pulse */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-emerald-400">
                      <Activity className="h-5 w-5" />
                      Nairobi Ecological Pulse
                    </CardTitle>
                    <CardDescription>Live intelligence from the regenerative city</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {nairobiPulse.map((item) => (
                        <div
                          key={item.metric}
                          className="text-center p-3 rounded-lg bg-slate-900/50"
                        >
                          <div className="text-lg font-bold text-white">{item.value}</div>
                          <div className="text-xs text-slate-400">{item.metric}</div>
                          <div
                            className={`text-xs ${
                              item.color === "emerald"
                                ? "text-emerald-400"
                                : item.color === "blue"
                                  ? "text-blue-400"
                                  : item.color === "cyan"
                                    ? "text-cyan-400"
                                    : "text-amber-400"
                            }`}
                          >
                            {item.trend}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Active Missions */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-cyan-400">
                      <Target className="h-5 w-5" />
                      Active Missions ({studentData.activeMissions})
                    </CardTitle>
                    <CardDescription>Your current ecological operations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activeMissions.map((mission) => (
                        <div
                          key={mission.id}
                          className="p-4 rounded-lg bg-slate-900/30 border border-slate-700"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-slate-800">
                                <mission.icon className="h-5 w-5 text-emerald-400" />
                              </div>
                              <div>
                                <h4 className="font-medium text-white">{mission.title}</h4>
                                <p className="text-sm text-slate-400 mb-2">{mission.description}</p>
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {mission.location}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Due {mission.deadline}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-emerald-400">
                                {mission.xp} XP
                              </div>
                              <div className="text-sm text-amber-400">{mission.rius} RIUs</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Progress value={mission.progress} className="flex-1 h-2" />
                            <span className="text-xs text-slate-400">{mission.progress}%</span>
                            <Badge variant="outline" className="border-slate-600 text-slate-300">
                              {mission.type}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Achievements */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-400">
                      <Trophy className="h-5 w-5" />
                      Recent Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentAchievements.map((achievement, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/30"
                        >
                          <div className="p-2 rounded-lg bg-amber-500/20">
                            <achievement.icon className="h-4 w-4 text-amber-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{achievement.title}</h4>
                            <p className="text-sm text-slate-400">{achievement.description}</p>
                          </div>
                          <span className="text-xs text-slate-500">{achievement.date}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="missions" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-emerald-400">Available Missions</CardTitle>
                      <CardDescription>Choose your next ecological operation</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          "Environmental Survey",
                          "AI Training Task",
                          "Community Outreach",
                          "Sensor Deployment",
                        ].map((mission) => (
                          <div
                            key={mission}
                            className="p-3 rounded-lg bg-slate-900/30 border border-slate-700 hover:border-emerald-500/50 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-white">{mission}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-emerald-500/30 text-emerald-400"
                              >
                                Accept
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-cyan-400">Mission History</CardTitle>
                      <CardDescription>Your completed operations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          "Nairobi River Cleanup",
                          "Biodiversity Survey",
                          "AI Model Training",
                          "Community Workshop",
                        ].map((mission) => (
                          <div
                            key={mission}
                            className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/30"
                          >
                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                            <span className="text-slate-300">{mission}</span>
                            <Badge
                              variant="outline"
                              className="border-emerald-500/30 text-emerald-400 ml-auto"
                            >
                              Completed
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="learning" className="space-y-6">
                {/* Skill Tree Visualization */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-emerald-400">
                      <Sparkles className="h-5 w-5" />
                      Ecological Skill Tree
                    </CardTitle>
                    <CardDescription>Your path to becoming a regenerative operator</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      {/* Skill Tree Nodes */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                          {
                            name: "Climate Science",
                            level: 3,
                            connections: [1, 2],
                            color: "emerald",
                          },
                          { name: "AI Vision", level: 2, connections: [0, 2], color: "cyan" },
                          {
                            name: "Urban Ecology",
                            level: 4,
                            connections: [0, 1, 3],
                            color: "amber",
                          },
                          { name: "Regen Finance", level: 1, connections: [2], color: "purple" },
                        ].map((skill, index) => {
                          const colorClasses = {
                            emerald: {
                              bg: "bg-emerald-500/10",
                              border: "border-emerald-500/30",
                              bgCircle: "bg-emerald-500/20",
                              text: "text-emerald-400",
                              bgLine: "bg-emerald-500/50",
                            },
                            cyan: {
                              bg: "bg-cyan-500/10",
                              border: "border-cyan-500/30",
                              bgCircle: "bg-cyan-500/20",
                              text: "text-cyan-400",
                              bgLine: "bg-cyan-500/50",
                            },
                            amber: {
                              bg: "bg-amber-500/10",
                              border: "border-amber-500/30",
                              bgCircle: "bg-amber-500/20",
                              text: "text-amber-400",
                              bgLine: "bg-amber-500/50",
                            },
                            purple: {
                              bg: "bg-purple-500/10",
                              border: "border-purple-500/30",
                              bgCircle: "bg-purple-500/20",
                              text: "text-purple-400",
                              bgLine: "bg-purple-500/50",
                            },
                          };

                          const classes = colorClasses[skill.color as keyof typeof colorClasses] || colorClasses.emerald;

                          return (
                            <div key={skill.name} className="relative">
                              <div
                                className={`p-4 rounded-lg ${classes.bg} ${classes.border} text-center animate-skill-tree-grow`}
                              >
                                <div
                                  className={`w-12 h-12 mx-auto mb-2 rounded-full ${classes.bgCircle} flex items-center justify-center`}
                                >
                                  <span className={`${classes.text} font-bold`}>
                                    {skill.level}
                                  </span>
                                </div>
                                <h4 className="font-medium text-white text-sm">{skill.name}</h4>
                                <div className="text-xs text-slate-400 mt-1">
                                  Level {skill.level}/5
                                </div>
                              </div>
                              {/* Connection Lines */}
                              {skill.connections.map((connectionIndex) => (
                                <div
                                  key={connectionIndex}
                                  className={`absolute top-6 w-px h-6 ${classes.bgLine} transform rotate-90 origin-left`}
                                  style={{
                                    left: connectionIndex > index ? "100%" : "0%",
                                    transform:
                                      connectionIndex > index ? "rotate(0deg)" : "rotate(180deg)",
                                  }}
                                />
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Learning Tracks */}
                <div className="grid gap-6">
                  {learningTracks.map((track) => {
                    const Icon = track.icon;
                    const colorClasses = {
                      emerald: {
                        bgIcon: "bg-emerald-500/20",
                        textIcon: "text-emerald-400",
                        textTitle: "text-emerald-400",
                        bgButton: "bg-emerald-600 hover:bg-emerald-700",
                      },
                      cyan: {
                        bgIcon: "bg-cyan-500/20",
                        textIcon: "text-cyan-400",
                        textTitle: "text-cyan-400",
                        bgButton: "bg-cyan-600 hover:bg-cyan-700",
                      },
                      amber: {
                        bgIcon: "bg-amber-500/20",
                        textIcon: "text-amber-400",
                        textTitle: "text-amber-400",
                        bgButton: "bg-amber-600 hover:bg-amber-700",
                      },
                      purple: {
                        bgIcon: "bg-purple-500/20",
                        textIcon: "text-purple-400",
                        textTitle: "text-purple-400",
                        bgButton: "bg-purple-600 hover:bg-purple-700",
                      },
                    };

                    const classes = colorClasses[track.color as keyof typeof colorClasses] || colorClasses.emerald;

                    return (
                      <Card
                        key={track.id}
                        className="bg-slate-800/50 border-slate-700 hover:border-emerald-500/30 transition-colors"
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg ${classes.bgIcon} animate-pulse`}
                              >
                                <Icon className={`h-5 w-5 ${classes.textIcon}`} />
                              </div>
                              <div>
                                <CardTitle className={classes.textTitle}>
                                  {track.name}
                                </CardTitle>
                                <CardDescription>
                                  {track.skills.length} skills • {track.missions} missions completed
                                </CardDescription>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-white">{track.xp} XP</div>
                              <div className="text-sm text-slate-400">
                                {track.progress}% complete
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Progress value={track.progress} className="mb-4" />
                          <div className="flex flex-wrap gap-2">
                            {track.skills.map((skill) => (
                              <Badge
                                key={skill}
                                variant="outline"
                                className="border-slate-600 text-slate-300 hover:border-emerald-500/50"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                          <div className="mt-4 flex gap-2">
                            <Button
                              size="sm"
                              className={classes.bgButton}
                            >
                              Continue Learning
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-600 text-slate-300"
                            >
                              View Missions
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="research" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="bg-slate-800/50 border-slate-700 cursor-pointer hover:border-emerald-500/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-emerald-400">
                        <Satellite className="h-5 w-5" />
                        Satellite Imagery Explorer
                      </CardTitle>
                      <CardDescription>Analyze Nairobi's ecological changes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                        Launch Explorer
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700 cursor-pointer hover:border-cyan-500/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-cyan-400">
                        <Brain className="h-5 w-5" />
                        AI Model Playground
                      </CardTitle>
                      <CardDescription>Experiment with ecological AI models</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                        Open Playground
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700 cursor-pointer hover:border-amber-500/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-amber-400">
                        <BarChart3 className="h-5 w-5" />
                        Climate Simulation Tools
                      </CardTitle>
                      <CardDescription>Run urban climate scenarios</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full bg-amber-600 hover:bg-amber-700">
                        Start Simulation
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-purple-400">Research Opportunities</CardTitle>
                    <CardDescription>
                      Contribute to cutting-edge ecological research
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        "Urban Heat Island Analysis",
                        "Biodiversity Corridor Mapping",
                        "Flood Risk Prediction Models",
                        "Carbon Sequestration Studies",
                      ].map((research) => (
                        <div
                          key={research}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-900/30"
                        >
                          <span className="text-white">{research}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-purple-500/30 text-purple-400"
                          >
                            Join Research
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="community" className="space-y-6">
                {/* AI Mentor */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-cyan-400">
                      <Brain className="h-5 w-5" />
                      AI Mentor - Atlas
                    </CardTitle>
                    <CardDescription>Your personal ecological intelligence guide</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-slate-900/50 border border-cyan-500/30">
                        <p className="text-cyan-400 font-medium mb-2">
                          Personalized Recommendation
                        </p>
                        <p className="text-slate-300 text-sm">
                          Based on your biodiversity work in Karura Forest, I recommend exploring
                          geospatial AI modeling. This would complement your field experience
                          perfectly.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button
                          variant="outline"
                          className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                        >
                          <Lightbulb className="h-4 w-4 mr-2" />
                          Career Paths
                        </Button>
                        <Button
                          variant="outline"
                          className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                        >
                          <Target className="h-4 w-4 mr-2" />
                          Mission Suggestions
                        </Button>
                        <Button
                          variant="outline"
                          className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                        >
                          <GraduationCap className="h-4 w-4 mr-2" />
                          Skill Roadmap
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Community Teams */}
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-emerald-400">Active Teams</CardTitle>
                      <CardDescription>Join ecological restoration squads</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          {
                            name: "Nairobi River Guardians",
                            members: 24,
                            mission: "Weekly cleanup operations",
                          },
                          {
                            name: "Karura Biodiversity Scouts",
                            members: 18,
                            mission: "Forest monitoring & research",
                          },
                          {
                            name: "Urban Climate Warriors",
                            members: 31,
                            mission: "Heat island mapping",
                          },
                          {
                            name: "AI Ecology Collective",
                            members: 15,
                            mission: "Machine learning for conservation",
                          },
                        ].map((team) => (
                          <div
                            key={team.name}
                            className="p-3 rounded-lg bg-slate-900/30 border border-slate-700"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-white">{team.name}</h4>
                              <Badge
                                variant="outline"
                                className="border-emerald-500/30 text-emerald-400"
                              >
                                {team.members} members
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-400 mb-3">{team.mission}</p>
                            <Button
                              size="sm"
                              className="w-full bg-emerald-600 hover:bg-emerald-700"
                            >
                              Join Team
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-amber-400">Innovation Challenges</CardTitle>
                      <CardDescription>Climate-tech hackathons & competitions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          {
                            name: "Flood Prediction Hackathon",
                            prize: "50,000 KES",
                            deadline: "2026-05-30",
                          },
                          {
                            name: "Urban Greening Challenge",
                            prize: "Innovation Grant",
                            deadline: "2026-06-15",
                          },
                          {
                            name: "AI Conservation Prize",
                            prize: "25,000 KES",
                            deadline: "2026-05-25",
                          },
                        ].map((challenge) => (
                          <div
                            key={challenge.name}
                            className="p-3 rounded-lg bg-slate-900/30 border border-slate-700"
                          >
                            <h4 className="font-medium text-white mb-1">{challenge.name}</h4>
                            <div className="flex items-center justify-between text-sm text-slate-400 mb-3">
                              <span>🏆 {challenge.prize}</span>
                              <span>📅 {challenge.deadline}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                            >
                              Enter Challenge
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Leaderboard */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-400">
                      <Trophy className="h-5 w-5" />
                      Global Leaderboard
                    </CardTitle>
                    <CardDescription>Top regenerative operators this month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        {
                          rank: 1,
                          name: "Kofi Environmental",
                          title: "Climate Cartographer",
                          xp: 15420,
                        },
                        { rank: 2, name: "Zara Nairobi", title: "Biodiversity Scout", xp: 14890 },
                        { rank: 3, name: "Jomo Tech", title: "AI Engineer", xp: 14250 },
                        { rank: 4, name: "Amina Rivers", title: "River Sentinel", xp: 13980 },
                        { rank: 5, name: "David Urban", title: "Regenerative Operator", xp: 13650 },
                      ].map((leader) => (
                        <div
                          key={leader.rank}
                          className="flex items-center gap-4 p-3 rounded-lg bg-slate-900/30"
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              leader.rank === 1
                                ? "bg-amber-500 text-black"
                                : leader.rank === 2
                                  ? "bg-slate-400 text-black"
                                  : leader.rank === 3
                                    ? "bg-amber-600 text-white"
                                    : "bg-slate-600 text-white"
                            }`}
                          >
                            {leader.rank}
                          </div>
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-emerald-500/20 text-emerald-400">
                              {leader.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{leader.name}</h4>
                            <p className="text-sm text-slate-400">{leader.title}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-emerald-400">
                              {leader.xp.toLocaleString()}
                            </div>
                            <div className="text-xs text-slate-400">XP</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rewards" className="space-y-6">
                {/* RIU Balance & Rewards */}
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-amber-400">
                        <Coins className="h-5 w-5" />
                        Your RIU Balance
                      </CardTitle>
                      <CardDescription>Earned through missions and learning</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-6">
                        <div className="text-4xl font-bold text-amber-400 mb-2">
                          {studentData.rius.toLocaleString()}
                        </div>
                        <div className="text-slate-400">Regenerative Impact Units</div>
                        <div className="text-sm text-emerald-400 mt-2">
                          ≈ ${(studentData.rius * 1.042).toFixed(2)} USD
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="text-center p-3 rounded-lg bg-slate-900/50">
                          <div className="text-lg font-bold text-emerald-400">+247</div>
                          <div className="text-xs text-slate-400">Today</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-slate-900/50">
                          <div className="text-lg font-bold text-cyan-400">1,420</div>
                          <div className="text-xs text-slate-400">This Month</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-green-400">Reward Options</CardTitle>
                      <CardDescription>Cash out or buy more RIUs</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-emerald-400 font-medium">Cash Out RIUs</span>
                          <Badge className="bg-emerald-500/20 text-emerald-400">Available</Badge>
                        </div>
                        <p className="text-sm text-slate-300 mb-3">
                          Convert earned RIUs to M-Pesa for real-world impact projects
                        </p>
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                          Cash Out
                        </Button>
                      </div>

                      <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-cyan-400 font-medium">Buy RIUs</span>
                          <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
                            Premium
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-300 mb-3">
                          Purchase additional RIUs to accelerate your learning journey
                        </p>
                        <Button
                          variant="outline"
                          className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                        >
                          Buy RIUs
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* M-Pesa Integration */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <MpesaStkPanel
                    title="Buy RIUs with M-Pesa"
                    description="Accelerate your learning journey — STK Push to instantly credit RIUs to your academy balance."
                    defaultAmount={500}
                    purpose="student_buy_rius"
                    accountReference="RVE-STUDENT"
                  />

                  <MpesaB2cPanel
                    title="Cash Out RIUs → M-Pesa"
                    description="Convert your earned RIUs to cash for real-world ecological projects and personal development."
                    defaultOccasion="RIU cashout - Student Rewards"
                    purpose="student_cashout"
                  />
                </div>

                {/* Reward History */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-purple-400">Reward History</CardTitle>
                    <CardDescription>Your RIU earnings and transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        {
                          type: "mission",
                          description: "Nairobi River Cleanup Mission",
                          amount: 150,
                          date: "2024-01-15",
                          status: "credited",
                        },
                        {
                          type: "learning",
                          description: "Environmental Intelligence Module",
                          amount: 75,
                          date: "2024-01-14",
                          status: "credited",
                        },
                        {
                          type: "community",
                          description: "Team Collaboration Bonus",
                          amount: 50,
                          date: "2024-01-13",
                          status: "credited",
                        },
                        {
                          type: "achievement",
                          description: "First Certification Complete",
                          amount: 200,
                          date: "2024-01-12",
                          status: "credited",
                        },
                        {
                          type: "cashout",
                          description: "M-Pesa Withdrawal",
                          amount: -500,
                          date: "2024-01-10",
                          status: "processed",
                        },
                      ].map((transaction, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-4 rounded-lg bg-slate-900/30 border border-slate-700"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                transaction.type === "cashout"
                                  ? "bg-red-500/20"
                                  : transaction.type === "mission"
                                    ? "bg-emerald-500/20"
                                    : transaction.type === "learning"
                                      ? "bg-cyan-500/20"
                                      : transaction.type === "community"
                                        ? "bg-purple-500/20"
                                        : "bg-amber-500/20"
                              }`}
                            >
                              {transaction.type === "cashout" ? (
                                <ArrowDownRight className="h-4 w-4 text-red-400" />
                              ) : transaction.type === "mission" ? (
                                <Target className="h-4 w-4 text-emerald-400" />
                              ) : transaction.type === "learning" ? (
                                <BookOpen className="h-4 w-4 text-cyan-400" />
                              ) : transaction.type === "community" ? (
                                <Users className="h-4 w-4 text-purple-400" />
                              ) : (
                                <Trophy className="h-4 w-4 text-amber-400" />
                              )}
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-white">
                                {transaction.description}
                              </h4>
                              <p className="text-xs text-slate-400">{transaction.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-sm font-mono ${
                                transaction.amount > 0 ? "text-emerald-400" : "text-red-400"
                              }`}
                            >
                              {transaction.amount > 0 ? "+" : ""}
                              {transaction.amount} RIU
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                transaction.status === "credited"
                                  ? "border-emerald-500/30 text-emerald-400"
                                  : "border-slate-500/30 text-slate-400"
                              }`}
                            >
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
