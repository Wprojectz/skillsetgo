import type { AIAnalysisResult } from "@/lib/aiAnalysisTypes";
import { Shield, Brain, Target, TrendingUp, Users, Award, BookOpen, MessageSquare, FileText, Zap, BarChart3, Lightbulb } from "lucide-react";

interface AIResultsSectionProps {
  results: AIAnalysisResult;
}

const ScoreRing = ({ score, label, color }: { score: number; label: string; color: string }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="100" height="100" className="-rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
        <circle cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-1000" />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: 100, height: 100 }}>
        <span className="font-heading text-2xl font-bold text-foreground">{score}</span>
      </div>
      <span className="font-body text-xs text-muted-foreground">{label}</span>
    </div>
  );
};

const Badge = ({ text, variant = "default" }: { text: string; variant?: "green" | "red" | "yellow" | "blue" | "default" }) => {
  const styles = {
    green: "bg-aqua/15 text-aqua border-aqua/30",
    red: "bg-muted-red/15 text-muted-red border-muted-red/30",
    yellow: "bg-primary/15 text-primary border-primary/30",
    blue: "bg-accent/15 text-accent border-accent/30",
    default: "bg-secondary text-secondary-foreground border-border",
  };
  return (
    <span className={`inline-block rounded-md border px-2.5 py-1 font-body text-xs font-medium ${styles[variant]}`}>
      {text}
    </span>
  );
};

const SectionCard = ({ icon: Icon, title, subtitle, children, accent }: {
  icon: any; title: string; subtitle?: string; children: React.ReactNode; accent?: string;
}) => (
  <div className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-lg">
    <div className="flex items-center gap-3 mb-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent || "bg-primary/10"}`}>
        <Icon className={`h-5 w-5 ${accent ? "text-card" : "text-primary"}`} />
      </div>
      <div>
        <h3 className="font-heading text-lg font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="font-body text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

const AIResultsSection = ({ results }: AIResultsSectionProps) => {
  const r = results;

  return (
    <div className="space-y-6">
      {/* Hero: Final Decision */}
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="font-body text-sm uppercase tracking-widest text-muted-foreground">Hiring Recommendation</p>
        <p className={`mt-2 font-heading text-5xl font-bold ${
          r.final_decision.recommendation === "Strong Hire" ? "text-aqua" :
          r.final_decision.recommendation === "Consider" ? "text-primary" : "text-muted-red"
        }`}>
          {r.final_decision.recommendation}
        </p>
        <p className="mt-1 font-heading text-2xl font-bold text-foreground">{r.final_decision.probability}% Match</p>
        <p className="mt-3 mx-auto max-w-lg font-body text-sm text-muted-foreground">{r.final_decision.reason}</p>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center relative">
          <ScoreRing score={r.scores.ats} label="ATS Score" color="hsl(var(--aqua))" />
        </div>
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center relative">
          <ScoreRing score={r.scores.practical_fit} label="Practical Fit" color="hsl(var(--primary))" />
        </div>
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center relative">
          <ScoreRing score={r.scores.learning_curve} label="Learning Curve" color="hsl(var(--accent))" />
        </div>
      </div>

      {/* Candidate Profile */}
      <SectionCard icon={Users} title="Candidate Profile" subtitle={r.candidate_profile.name || "Candidate"} accent="bg-accent">
        <div className="flex flex-wrap gap-2">
          <Badge text={r.candidate_profile.level} variant="blue" />
          <Badge text={r.candidate_profile.specialization || "General"} variant="yellow" />
          {r.candidate_profile.domains.map(d => <Badge key={d} text={d} variant="default" />)}
        </div>
      </SectionCard>

      {/* Skill Matching */}
      <SectionCard icon={Target} title="Skill Matching" subtitle="How your skills align with the role">
        <div className="space-y-4">
          {r.matching.strong.length > 0 && (
            <div>
              <p className="font-heading text-xs font-medium uppercase tracking-wider text-aqua mb-2">Strong Matches</p>
              <div className="flex flex-wrap gap-2">{r.matching.strong.map(s => <Badge key={s} text={s} variant="green" />)}</div>
            </div>
          )}
          {r.matching.weak.length > 0 && (
            <div>
              <p className="font-heading text-xs font-medium uppercase tracking-wider text-primary mb-2">Weak Matches</p>
              <div className="flex flex-wrap gap-2">{r.matching.weak.map(s => <Badge key={s} text={s} variant="yellow" />)}</div>
            </div>
          )}
          {r.matching.missing.length > 0 && (
            <div>
              <p className="font-heading text-xs font-medium uppercase tracking-wider text-muted-red mb-2">Missing Skills</p>
              <div className="flex flex-wrap gap-2">{r.matching.missing.map(s => <Badge key={s} text={s} variant="red" />)}</div>
            </div>
          )}
          {r.matching.transferable.length > 0 && (
            <div>
              <p className="font-heading text-xs font-medium uppercase tracking-wider text-accent mb-2">Transferable Skills</p>
              <div className="flex flex-wrap gap-2">{r.matching.transferable.map(s => <Badge key={s} text={s} variant="blue" />)}</div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Explicit + Implicit Skills */}
      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard icon={Zap} title="Explicit Skills" subtitle={`${r.skills.explicit.length} detected`}>
          <div className="flex flex-wrap gap-2">
            {r.skills.explicit.map(s => <Badge key={s} text={s} variant="green" />)}
          </div>
        </SectionCard>
        <SectionCard icon={Brain} title="Implicit Skills" subtitle="Inferred from context">
          <div className="space-y-2">
            {r.skills.implicit.slice(0, 8).map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <div>
                  <span className="font-body text-sm font-medium text-foreground">{s.skill}</span>
                  <span className="font-body text-xs text-muted-foreground ml-2">— {s.evidence}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Proficiency Map */}
      <SectionCard icon={BarChart3} title="Skill Proficiency" subtitle="Estimated mastery levels">
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(r.skills.proficiency).slice(0, 12).map(([skill, level]) => {
            const pct = level === "Expert" ? 95 : level === "Advanced" ? 75 : level === "Intermediate" ? 50 : 25;
            const color = level === "Expert" ? "bg-aqua" : level === "Advanced" ? "bg-accent" : level === "Intermediate" ? "bg-primary" : "bg-muted-foreground";
            return (
              <div key={skill}>
                <div className="flex justify-between mb-1">
                  <span className="font-body text-xs text-foreground capitalize">{skill}</span>
                  <span className="font-body text-[10px] text-muted-foreground">{level}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-secondary">
                  <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Soft Skills */}
      <SectionCard icon={Users} title="Soft Skills & Behavioral Traits" subtitle="Inferred from resume evidence">
        <div className="grid gap-3 sm:grid-cols-2">
          {r.soft_skills.map((s, i) => (
            <div key={i} className="rounded-lg border border-border bg-secondary/30 p-3">
              <div className="flex justify-between mb-1">
                <span className="font-body text-sm font-medium text-foreground">{s.skill}</span>
                <span className={`font-heading text-sm font-bold ${s.confidence >= 70 ? "text-aqua" : s.confidence >= 40 ? "text-primary" : "text-muted-foreground"}`}>{s.confidence}%</span>
              </div>
              <p className="font-body text-xs text-muted-foreground">{s.evidence}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Leadership + Experience */}
      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard icon={Award} title="Leadership Analysis">
          <Badge text={r.leadership_analysis.type} variant="blue" />
          <p className="mt-2 font-body text-sm text-muted-foreground">{r.leadership_analysis.evidence}</p>
        </SectionCard>
        <SectionCard icon={TrendingUp} title="Experience Quality">
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(r.experience_score).map(([key, val]) => (
              <div key={key} className="text-center rounded-lg bg-secondary/30 p-3">
                <p className="font-body text-xs text-muted-foreground capitalize">{key}</p>
                <p className={`font-heading text-lg font-bold ${val === "High" ? "text-aqua" : val === "Medium" ? "text-primary" : "text-muted-foreground"}`}>{val}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Gap Intelligence */}
      {r.gaps.length > 0 && (
        <SectionCard icon={Shield} title="Gap Intelligence" subtitle="What's missing and how learnable">
          <div className="space-y-2">
            {r.gaps.map((g, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 px-4 py-2.5">
                <span className="font-body text-sm text-foreground">{g.skill}</span>
                <div className="flex gap-2">
                  <Badge text={g.severity} variant={g.severity === "Critical" ? "red" : g.severity === "Moderate" ? "yellow" : "default"} />
                  <Badge text={g.learnable} variant={g.learnable === "Quick" ? "green" : g.learnable === "Medium" ? "yellow" : "red"} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Resume Brand */}
      <SectionCard icon={FileText} title="Resume Brand Analysis" subtitle={`Strength: ${r.resume_brand.strength}`}>
        <p className="font-body text-sm text-muted-foreground mb-3">{r.resume_brand.clarity}</p>
        <ul className="space-y-2">
          {r.resume_brand.improvements.map((imp, i) => (
            <li key={i} className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
              <span className="font-body text-sm text-foreground">{imp}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* Interview Questions */}
      <SectionCard icon={MessageSquare} title="Interview Intelligence" subtitle="Predicted interview questions">
        <div className="space-y-4">
          {r.interview_questions.technical.length > 0 && (
            <div>
              <p className="font-heading text-xs font-medium uppercase tracking-wider text-aqua mb-2">Technical</p>
              <ol className="space-y-1.5">{r.interview_questions.technical.map((q, i) => (
                <li key={i} className="flex gap-2 font-body text-sm text-foreground">
                  <span className="shrink-0 text-muted-foreground">{i + 1}.</span>{q}
                </li>
              ))}</ol>
            </div>
          )}
          {r.interview_questions.behavioral.length > 0 && (
            <div>
              <p className="font-heading text-xs font-medium uppercase tracking-wider text-primary mb-2">Behavioral</p>
              <ol className="space-y-1.5">{r.interview_questions.behavioral.map((q, i) => (
                <li key={i} className="flex gap-2 font-body text-sm text-foreground">
                  <span className="shrink-0 text-muted-foreground">{i + 1}.</span>{q}
                </li>
              ))}</ol>
            </div>
          )}
          {r.interview_questions.scenario.length > 0 && (
            <div>
              <p className="font-heading text-xs font-medium uppercase tracking-wider text-accent mb-2">Scenario-based</p>
              <ol className="space-y-1.5">{r.interview_questions.scenario.map((q, i) => (
                <li key={i} className="flex gap-2 font-body text-sm text-foreground">
                  <span className="shrink-0 text-muted-foreground">{i + 1}.</span>{q}
                </li>
              ))}</ol>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Optimized Resume Sections */}
      <SectionCard icon={BookOpen} title="Optimized Resume Suggestions">
        {r.optimized_sections.skills_section && (
          <div className="mb-4">
            <p className="font-heading text-xs font-medium uppercase tracking-wider text-primary mb-2">Optimized Skills Section</p>
            <p className="font-body text-sm text-foreground bg-secondary/30 rounded-lg p-3">{r.optimized_sections.skills_section}</p>
          </div>
        )}
        {r.optimized_sections.experience_bullets.length > 0 && (
          <div>
            <p className="font-heading text-xs font-medium uppercase tracking-wider text-aqua mb-2">Impact-Driven Bullets</p>
            <ul className="space-y-1.5">
              {r.optimized_sections.experience_bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aqua" />
                  <span className="font-body text-sm text-foreground">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default AIResultsSection;
