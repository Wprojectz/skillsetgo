import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Target, TrendingUp, AlertTriangle, CheckCircle2, Zap, ArrowRight } from "lucide-react";
import type { AIAnalysisResult } from "@/lib/aiAnalysisTypes";

const SkillGap = () => {
  const { user } = useAuth();
  const [data, setData] = useState<AIAnalysisResult | null>(null);
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
          setData(rows[0].results as unknown as AIAnalysisResult);
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

  if (!data?.matching) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-16 text-center">
          <Target className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="font-heading text-xl font-bold text-foreground">No Skill Data Yet</h3>
          <p className="mt-2 font-body text-sm text-muted-foreground max-w-md mx-auto">
            Run your first resume analysis to see your skill gap breakdown.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const { matching, scores, gaps, skills } = data;
  const totalSkills = matching.strong.length + matching.missing.length;
  const matchRate = totalSkills > 0 ? Math.round((matching.strong.length / totalSkills) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: "Strong Match", value: matching.strong.length, icon: CheckCircle2, color: "aqua" },
            { label: "Weak Match", value: matching.weak.length, icon: TrendingUp, color: "primary" },
            { label: "Missing", value: matching.missing.length, icon: AlertTriangle, color: "muted-red" },
            { label: "Transferable", value: matching.transferable.length, icon: Zap, color: "accent" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`rounded-2xl border border-${color}/20 bg-card p-5 relative overflow-hidden`}>
              <div className={`absolute inset-0 bg-gradient-to-br from-${color}/10 to-transparent opacity-50`} />
              <div className="relative flex items-center gap-3">
                <div className={`rounded-xl bg-${color}/15 p-2.5`}>
                  <Icon className={`h-6 w-6 text-${color}`} />
                </div>
                <div>
                  <p className="font-body text-xs text-muted-foreground">{label}</p>
                  <p className="font-heading text-3xl font-bold text-foreground">{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scores */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "ATS Score", value: scores.ats },
            { label: "Practical Fit", value: scores.practical_fit },
            { label: "Match Rate", value: matchRate },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-5">
              <p className="font-body text-xs text-muted-foreground mb-2">{label}</p>
              <div className="flex items-center gap-3">
                <p className="font-heading text-3xl font-bold text-foreground">{value}%</p>
                <div className="flex-1 h-2.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-aqua transition-all duration-700"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Strong Matches */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-heading text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-aqua" /> Strong Matches
          </h3>
          <div className="flex flex-wrap gap-2">
            {matching.strong.map((skill) => (
              <span key={skill} className="rounded-full bg-aqua/15 px-3 py-1.5 font-body text-xs font-medium text-aqua border border-aqua/20">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-heading text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-muted-red" /> Missing Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {matching.missing.map((skill) => (
              <span key={skill} className="rounded-full bg-muted-red/15 px-3 py-1.5 font-body text-xs font-medium text-muted-red border border-muted-red/20">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Gap Intelligence */}
        {gaps && gaps.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-heading text-base font-semibold text-foreground mb-4">Gap Intelligence</h3>
            <div className="space-y-3">
              {gaps.map((gap) => (
                <div key={gap.skill} className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <p className="font-heading text-sm font-semibold text-foreground capitalize">{gap.skill}</p>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">Learnable: {gap.learnable}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 font-body text-xs font-medium ${
                    gap.severity === "High" ? "bg-muted-red/15 text-muted-red" :
                    gap.severity === "Medium" ? "bg-primary/15 text-primary" :
                    "bg-aqua/15 text-aqua"
                  }`}>
                    {gap.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Proficiency Breakdown */}
        {skills?.proficiency && Object.keys(skills.proficiency).length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-heading text-base font-semibold text-foreground mb-4">Skill Proficiency</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(skills.proficiency).map(([skill, level]) => (
                <div key={skill} className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5">
                  <span className="font-body text-sm text-foreground capitalize">{skill}</span>
                  <span className={`rounded-full px-2.5 py-0.5 font-body text-[10px] font-medium ${
                    level === "Expert" ? "bg-aqua/15 text-aqua" :
                    level === "Advanced" ? "bg-primary/15 text-primary" :
                    level === "Intermediate" ? "bg-accent/15 text-accent" :
                    "bg-muted/50 text-muted-foreground"
                  }`}>
                    {level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SkillGap;
