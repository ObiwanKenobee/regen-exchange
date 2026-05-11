import { useState } from "react";
import { Brain, Camera, Satellite, Wifi, CheckCircle, AlertTriangle, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface VerificationTask {
  id: string;
  type: 'satellite' | 'iot' | 'drone' | 'community';
  asset: string;
  status: 'processing' | 'verified' | 'rejected' | 'pending';
  confidence: number;
  timestamp: string;
  inputs: string[];
}

export function AIOracleVerificationEngine() {
  const [tasks] = useState<VerificationTask[]>([
    {
      id: 'VER-001',
      type: 'satellite',
      asset: 'AMZ-CO₂ Nairobi Reforestation',
      status: 'verified',
      confidence: 94,
      timestamp: '2 hours ago',
      inputs: ['Sentinel-2 imagery', 'NDVI analysis', 'Historical baseline']
    },
    {
      id: 'VER-002',
      type: 'iot',
      asset: 'H₂O-SEC River Monitoring',
      status: 'processing',
      confidence: 78,
      timestamp: '15 min ago',
      inputs: ['Water quality sensors', 'Flow meters', 'Weather data']
    },
    {
      id: 'VER-003',
      type: 'community',
      asset: 'BIO-IDX Urban Biodiversity',
      status: 'pending',
      confidence: 0,
      timestamp: '5 min ago',
      inputs: ['Community reports', 'Photo verification', 'GPS coordinates']
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4 text-primary" />;
      case 'processing': return <Clock className="h-4 w-4 text-secondary animate-spin" />;
      case 'rejected': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'satellite': return <Satellite className="h-4 w-4" />;
      case 'iot': return <Wifi className="h-4 w-4" />;
      case 'drone': return <Camera className="h-4 w-4" />;
      case 'community': return <Zap className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Oracle Verification Engine
          </CardTitle>
          <CardDescription>
            Multi-modal ecological validation using satellite imagery, IoT sensors, drone footage, and community reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Engine Status */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-primary">94.2%</div>
              <div className="text-xs text-muted-foreground">Average Confidence</div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-secondary">1,247</div>
              <div className="text-xs text-muted-foreground">Verifications Today</div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-accent">23</div>
              <div className="text-xs text-muted-foreground">Active Sensors</div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-destructive">0.3%</div>
              <div className="text-xs text-muted-foreground">False Positive Rate</div>
            </div>
          </div>

          {/* Verification Pipeline */}
          <div>
            <h4 className="font-medium mb-4">Active Verification Pipeline</h4>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(task.type)}
                      <div>
                        <div className="font-medium">{task.asset}</div>
                        <div className="text-xs text-muted-foreground">{task.id} • {task.timestamp}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        task.status === 'verified' ? 'default' :
                        task.status === 'processing' ? 'secondary' :
                        task.status === 'rejected' ? 'destructive' : 'outline'
                      }>
                        {getStatusIcon(task.status)}
                        <span className="ml-1 capitalize">{task.status}</span>
                      </Badge>
                    </div>
                  </div>

                  {task.status === 'processing' && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Confidence Building</span>
                        <span>{task.confidence}%</span>
                      </div>
                      <Progress value={task.confidence} />
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {task.inputs.map((input) => (
                      <Badge key={input} variant="outline" className="text-xs">
                        {input}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fraud Detection Metrics */}
          <div>
            <h4 className="font-medium mb-4">Fraud Detection & Anomaly Monitoring</h4>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Pattern Recognition</span>
                </div>
                <div className="text-2xl font-bold text-primary">99.7%</div>
                <div className="text-xs text-muted-foreground">Accuracy rate</div>
              </div>
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Anomaly Detection</span>
                </div>
                <div className="text-2xl font-bold text-yellow-500">12</div>
                <div className="text-xs text-muted-foreground">Flagged today</div>
              </div>
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-secondary" />
                  <span className="text-sm font-medium">Consensus Scoring</span>
                </div>
                <div className="text-2xl font-bold text-secondary">87%</div>
                <div className="text-xs text-muted-foreground">Average score</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Camera className="h-4 w-4 mr-2" />
              Upload Evidence
            </Button>
            <Button variant="outline" size="sm">
              <Satellite className="h-4 w-4 mr-2" />
              View Satellite Data
            </Button>
            <Button size="sm">
              <Brain className="h-4 w-4 mr-2" />
              Run Verification
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}