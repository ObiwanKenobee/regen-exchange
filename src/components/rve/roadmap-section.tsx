import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, AlertCircle, Target } from "lucide-react";

export type RoadmapPhase = {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "planned" | "blocked";
  progress?: number;
  startDate?: string;
  endDate?: string;
  dependencies?: string[];
  deliverables?: string[];
  risks?: string[];
};

export type RoadmapItem = {
  id: string;
  title: string;
  description: string;
  phases: RoadmapPhase[];
  priority: "critical" | "high" | "medium" | "low";
  owner?: string;
  estimatedCompletion?: string;
};

interface RoadmapSectionProps {
  title: string;
  description: string;
  items: RoadmapItem[];
  showTimeline?: boolean;
}

export function RoadmapSection({
  title,
  description,
  items,
  showTimeline = true,
}: RoadmapSectionProps) {
  const getStatusIcon = (status: RoadmapPhase["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-primary" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-accent animate-pulse" />;
      case "planned":
        return <Target className="h-4 w-4 text-muted-foreground" />;
      case "blocked":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusColor = (status: RoadmapPhase["status"]) => {
    switch (status) {
      case "completed":
        return "border-primary/40 bg-primary/10 text-primary";
      case "in-progress":
        return "border-accent/40 bg-accent/10 text-accent";
      case "planned":
        return "border-muted/40 bg-muted/10 text-muted-foreground";
      case "blocked":
        return "border-destructive/40 bg-destructive/10 text-destructive";
    }
  };

  const getPriorityColor = (priority: RoadmapItem["priority"]) => {
    switch (priority) {
      case "critical":
        return "border-destructive/40 bg-destructive/10 text-destructive";
      case "high":
        return "border-orange-500/40 bg-orange-500/10 text-orange-600";
      case "medium":
        return "border-yellow-500/40 bg-yellow-500/10 text-yellow-600";
      case "low":
        return "border-muted/40 bg-muted/10 text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="panel p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">{item.title}</h4>
                  <Badge
                    variant="outline"
                    className={`text-xs ${getPriorityColor(item.priority)}`}
                  >
                    {item.priority}
                  </Badge>
                  {item.owner && (
                    <Badge variant="secondary" className="text-xs">
                      {item.owner}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                {item.estimatedCompletion && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Est. completion: {item.estimatedCompletion}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {item.phases.map((phase, index) => (
                <div key={phase.id} className="flex items-start gap-3">
                  <div className="flex items-center gap-2 mt-0.5">
                    {getStatusIcon(phase.status)}
                    {showTimeline && (
                      <div className="w-px h-6 bg-border -mb-3" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{phase.title}</span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getStatusColor(phase.status)}`}
                      >
                        {phase.status.replace("-", " ")}
                      </Badge>
                      {phase.progress !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          {phase.progress}%
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {phase.description}
                    </p>
                    {phase.progress !== undefined && (
                      <Progress value={phase.progress} className="h-1 mb-2" />
                    )}
                    {phase.deliverables && phase.deliverables.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        <strong>Deliverables:</strong> {phase.deliverables.join(", ")}
                      </div>
                    )}
                    {phase.dependencies && phase.dependencies.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        <strong>Dependencies:</strong> {phase.dependencies.join(", ")}
                      </div>
                    )}
                    {phase.risks && phase.risks.length > 0 && (
                      <div className="text-xs text-orange-600">
                        <strong>Risks:</strong> {phase.risks.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}