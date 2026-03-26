import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { BookOpen, GraduationCap, Zap, Rocket, Target, Brain, AlertTriangle } from "lucide-react";
import type { AIAnalysisResult } from "@/lib/aiAnalysisTypes";

const difficultyConfig = {
  Beginner: { color: "text-aqua", bg: "bg-aqua/15", border: "border-aqua/20", icon: Zap },
  Intermediate: { color: "text-primary", bg: "bg-primary/15", border: "border-primary/20", icon: GraduationCap },
  Advanced: { color: "text-muted-red", bg: "bg-muted-red/15", border: "border-muted-red/20", icon: Rocket },
};

interface LearningStep {
  step: number;
  skill: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
}

const LearningPath = () => {
  const { user } = useAuth();
  const [data, setData] = useState<AIAnalysisResult | null>(null);
  const [steps, setSteps] = useState<LearningStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("analysis_history")
      .select("results")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data: rows }) => {
        if (rows && rows.length > 0) {
          const r = rows[0].results as unknown as AIAnalysisResult;
          setData(r);

          // Build learning steps from gaps + missing skills
          const builtSteps: LearningStep[] = [];
          if (r.gaps && r.gaps.length > 0) {
            r.gaps.forEach((gap, i) => {
              builtSteps.push({
                step: i + 1,
                skill: gap.skill,
                difficulty: gap.severity === "High" ? "Advanced" : gap.severity === "Medium" ? "Intermediate" : "Beginner",
                description: `${gap.learnable}. Severity: ${gap.severity}`,
              });
            });
          } else if (r.matching?.missing?.length > 0) {
            r.matching.missing.forEach((skill, i) => {
              builtSteps.push({
                step: i + 1,
                skill,
                difficulty: "Intermediate",
                description: `This skill was identified as missing from your resume for the target role.`,
              });
            });
          }
          setSteps(builtSteps);
        }
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (steps.length === 0) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-dashed border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5 p-16 text-center">
          <BookOpen className="h-12 w-12 text-accent mx-auto mb-4" />
          <h3 className="font-heading text-xl font-bold text-foreground">No Learning Path Yet</h3>
          <p className="mt-2 font-body text-sm text-muted-foreground max-w-md mx-auto">
            Analyze your resume against a job description to generate a personalized learning roadmap.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const grouped = {
    Beginner: steps.filter((s) => s.difficulty === "Beginner"),
    Intermediate: steps.filter((s) => s.difficulty === "Intermediate"),
    Advanced: steps.filter((s) => s.difficulty === "Advanced"),
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-accent/10 via-primary/10 to-aqua/10 border border-accent/20 p-6">
          <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-accent" /> Your Learning Roadmap
          </h2>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            {steps.length} skills to learn, organized by difficulty level.
          </p>
        </div>

        {/* Scores context */}
        {data?.scores && (
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Learning Curve", value: data.scores.learning_curve, icon: Brain },
              { label: "ATS Score", value: data.scores.ats, icon: Target },
              { label: "Practical Fit", value: data.scores.practical_fit, icon: Rocket },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                <div className="rounded-xl bg-primary/15 p-2">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-body text-xs text-muted-foreground">{label}</p>
                  <p className="font-heading text-2xl font-bold text-foreground">{value}%</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Difficulty Sections */}
        {(["Beginner", "Intermediate", "Advanced"] as const).map((level) => {
          const items = grouped[level];
          if (items.length === 0) return null;
          const config = difficultyConfig[level];
          const Icon = config.icon;

          return (
            <div key={level}>
              <h3 className={`font-heading text-sm font-bold uppercase tracking-wider ${config.color} mb-4 flex items-center gap-2`}>
                <Icon className="h-4 w-4" /> {level} ({items.length})
              </h3>
              <div className="space-y-3">
                {items.map((step) => (
                  <div
                    key={step.step}
                    className={`rounded-xl border ${config.border} bg-card p-5 transition-all hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden`}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.bg}`} />
                    <div className="flex items-start gap-4 pl-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.bg} font-heading text-sm font-bold ${config.color}`}>
                        {step.step}
                      </div>
                      <div>
                        <h4 className="font-heading text-sm font-semibold text-foreground capitalize">{step.skill}</h4>
                        <p className="mt-1 font-body text-xs text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default LearningPath;
