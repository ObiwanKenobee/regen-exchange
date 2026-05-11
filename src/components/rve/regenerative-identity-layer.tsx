import { useState } from "react";
import { Badge, Shield, Users, CheckCircle, AlertCircle, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface IdentityProfile {
  did: string;
  reputation: number;
  trustScore: number;
  verifications: number;
  badges: string[];
  communityTrust: number;
  fraudRisk: 'low' | 'medium' | 'high';
}

export function RegenerativeIdentityLayer() {
  const [profile] = useState<IdentityProfile>({
    did: "did:rve:0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    reputation: 87,
    trustScore: 92,
    verifications: 156,
    badges: ["Verified Steward", "Carbon Validator", "Community Leader"],
    communityTrust: 94,
    fraudRisk: 'low'
  });

  const trustIndicators = [
    { label: "DID Verification", status: "verified", icon: CheckCircle },
    { label: "Biometric Auth", status: "pending", icon: AlertCircle },
    { label: "Community Consensus", status: "verified", icon: Users },
    { label: "Fraud Detection", status: "passed", icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Regenerative Identity (RID)
          </CardTitle>
          <CardDescription>
            Decentralized identity with ecological reputation scoring and anti-fraud validation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* DID Display */}
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Decentralized Identifier
            </div>
            <div className="mt-1 font-mono text-sm break-all">{profile.did}</div>
          </div>

          {/* Reputation Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{profile.reputation}</div>
              <div className="text-xs text-muted-foreground">Reputation Score</div>
              <Progress value={profile.reputation} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{profile.trustScore}%</div>
              <div className="text-xs text-muted-foreground">Trust Score</div>
              <Progress value={profile.trustScore} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{profile.verifications}</div>
              <div className="text-xs text-muted-foreground">Verifications</div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div>
            <h4 className="font-medium mb-3">Trust Indicators</h4>
            <div className="grid gap-3 md:grid-cols-2">
              {trustIndicators.map((indicator) => (
                <div key={indicator.label} className="flex items-center gap-3 p-3 rounded-lg border">
                  <indicator.icon className={`h-4 w-4 ${
                    indicator.status === 'verified' ? 'text-primary' :
                    indicator.status === 'passed' ? 'text-secondary' : 'text-muted-foreground'
                  }`} />
                  <div>
                    <div className="text-sm font-medium">{indicator.label}</div>
                    <div className="text-xs text-muted-foreground capitalize">{indicator.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div>
            <h4 className="font-medium mb-3">Achievement Badges</h4>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((badge) => (
                <Badge key={badge} variant="secondary" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {badge}
                </Badge>
              ))}
            </div>
          </div>

          {/* Community Trust Graph */}
          <div>
            <h4 className="font-medium mb-3">Community Trust Network</h4>
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Community Consensus</span>
                <span className="text-sm font-mono">{profile.communityTrust}%</span>
              </div>
              <Progress value={profile.communityTrust} className="mb-2" />
              <div className="text-xs text-muted-foreground">
                Trusted by {Math.floor(profile.communityTrust * 2.4)} community members
              </div>
            </div>
          </div>

          {/* Fraud Risk Assessment */}
          <div>
            <h4 className="font-medium mb-3">Fraud Risk Assessment</h4>
            <div className={`rounded-lg border p-4 ${
              profile.fraudRisk === 'low' ? 'border-primary/20 bg-primary/5' :
              profile.fraudRisk === 'medium' ? 'border-yellow-500/20 bg-yellow-500/5' :
              'border-destructive/20 bg-destructive/5'
            }`}>
              <div className="flex items-center gap-2">
                <Shield className={`h-4 w-4 ${
                  profile.fraudRisk === 'low' ? 'text-primary' :
                  profile.fraudRisk === 'medium' ? 'text-yellow-500' : 'text-destructive'
                }`} />
                <span className="text-sm font-medium capitalize">{profile.fraudRisk} Risk</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {profile.fraudRisk === 'low'
                  ? 'Identity verified through multiple channels with strong community consensus'
                  : profile.fraudRisk === 'medium'
                  ? 'Some verification gaps detected, additional validation recommended'
                  : 'High risk indicators present, immediate verification required'
                }
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Key className="h-4 w-4 mr-2" />
              Manage Credentials
            </Button>
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              View Trust Graph
            </Button>
            <Button size="sm">
              <Shield className="h-4 w-4 mr-2" />
              Verify Identity
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}