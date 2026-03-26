import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Target, Trash2, GitCompareArrows, Clock, FileSearch, ArrowRight, ChevronDown, ChevronUp, X,
} from "lucide-react";
import type { AIAnalysisResult } from "@/lib/aiAnalysisTypes";

interface HistoryRow {
  id: string;
  match_percentage: number;
  ats_score: number;
  results: AIAnalysisResult;
  resume_text: string;
  job_text: string;
  created_at: string;
}

const History = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("analysis_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setHistory(data as unknown as HistoryRow[]);
        setLoading(false);
      });
  }, [user]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("analysis_history").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      setHistory((h) => h.filter((r) => r.id !== id));
      setCompareIds((c) => c.filter((cid) => cid !== id));
      toast({ title: "Analysis deleted" });
    }
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : prev.length < 2 ? [...prev, id] : prev
    );
  };

  const compareItems = history.filter((h) => compareIds.includes(h.id));

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Analysis History</h1>
            <p className="font-body text-sm text-muted-foreground mt-1">
              {history.length} {history.length === 1 ? "analysis" : "analyses"} saved
            </p>
          </div>
          {compareIds.length === 2 && (
            <Button variant="signal" onClick={() => setShowCompare(true)} className="gap-2">
              <GitCompareArrows className="h-4 w-4" /> Compare Selected
            </Button>
          )}
        </div>

        {/* Compare Modal */}
        {showCompare && compareItems.length === 2 && (
          <CompareView items={compareItems} onClose={() => setShowCompare(false)} />
        )}

        {/* Empty State */}
        {history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-16 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <FileSearch className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-heading text-xl font-bold text-foreground">No analyses yet</h3>
            <p className="mt-2 font-body text-sm text-muted-foreground max-w-sm mx-auto">
              Run your first resume analysis to start building your history.
            </p>
            <button
              onClick={() => navigate("/analyze")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 px-8 py-3 font-heading text-sm font-bold text-primary-foreground hover:shadow-lg hover:shadow-primary/25 transition-all"
            >
              Start Analysis <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="font-body text-xs text-muted-foreground">
              Select up to 2 analyses to compare them side by side.
            </p>
            {history.map((h) => {
              const isExpanded = expandedId === h.id;
              const isSelected = compareIds.includes(h.id);
              const r = h.results;
              return (
                <div
                  key={h.id}
                  className={`rounded-2xl border bg-card transition-all ${
                    isSelected ? "border-primary/50 shadow-lg shadow-primary/10" : "border-border hover:border-border/80"
                  }`}
                >
                  {/* Row */}
                  <div className="flex items-center gap-3 px-5 py-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleCompare(h.id)}
                      className={`h-5 w-5 shrink-0 rounded border-2 transition-colors flex items-center justify-center ${
                        isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/40 hover:border-primary"
                      }`}
                      aria-label="Select for comparison"
                    >
                      {isSelected && <span className="text-xs font-bold">✓</span>}
                    </button>

                    {/* Date */}
                    <div className="flex items-center gap-2 min-w-[140px]">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-body text-sm text-foreground">
                        {new Date(h.created_at).toLocaleDateString(undefined, {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Decision */}
                    <span className="hidden sm:block font-body text-xs text-muted-foreground truncate max-w-[200px]">
                      {r?.final_decision?.recommendation || "—"}
                    </span>

                    {/* Scores */}
                    <div className="ml-auto flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 font-heading text-xs font-bold text-accent">
                        <Target className="h-3 w-3" /> {h.match_percentage}%
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 font-heading text-xs font-bold text-primary">
                        ATS {h.ats_score}
                      </span>

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : h.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        aria-label="Toggle details"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(h.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label="Delete analysis"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && r && (
                    <div className="border-t border-border px-5 py-4 space-y-4">
                      <div className="grid gap-4 sm:grid-cols-3">
                        <ScoreCard label="ATS Score" value={r.scores?.ats} max={100} color="text-primary" />
                        <ScoreCard label="Practical Fit" value={r.scores?.practical_fit} max={100} color="text-accent" />
                        <ScoreCard label="Learning Curve" value={r.scores?.learning_curve} max={100} color="text-muted-red" />
                      </div>

                      {r.matching && (
                        <div className="grid gap-4 sm:grid-cols-2">
                          <SkillList title="Strong Matches" items={r.matching.strong} color="text-accent" />
                          <SkillList title="Missing Skills" items={r.matching.missing} color="text-destructive" />
                        </div>
                      )}

                      {r.final_decision && (
                        <div className="rounded-xl bg-secondary/30 border border-border/50 p-4">
                          <p className="font-heading text-sm font-bold text-foreground mb-1">
                            {r.final_decision.recommendation} — {r.final_decision.probability}% hire probability
                          </p>
                          <p className="font-body text-xs text-muted-foreground">{r.final_decision.reason}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

/* --- Sub-components --- */

function ScoreCard({ label, value, max, color }: { label: string; value?: number; max: number; color: string }) {
  const v = value ?? 0;
  return (
    <div className="rounded-xl bg-secondary/30 border border-border/50 p-4 text-center">
      <p className="font-body text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`font-heading text-2xl font-bold ${color}`}>{v}<span className="text-sm text-muted-foreground">/{max}</span></p>
      <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full bg-current ${color}`} style={{ width: `${(v / max) * 100}%` }} />
      </div>
    </div>
  );
}

function SkillList({ title, items, color }: { title: string; items?: string[]; color: string }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className={`font-heading text-sm font-semibold ${color} mb-2`}>{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((s) => (
          <span key={s} className="rounded-full bg-secondary/50 border border-border/50 px-2.5 py-1 font-body text-xs text-foreground">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

function CompareView({ items, onClose }: { items: HistoryRow[]; onClose: () => void }) {
  const [a, b] = items;
  return (
    <div className="rounded-2xl border border-primary/30 bg-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
          <GitCompareArrows className="h-5 w-5 text-primary" /> Side-by-Side Comparison
        </h3>
        <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Headers */}
        <div className="text-center font-body text-sm text-muted-foreground">
          {new Date(a.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
        </div>
        <div className="text-center font-body text-sm text-muted-foreground">
          {new Date(b.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
        </div>

        {/* Scores comparison */}
        {(["ats", "practical_fit", "learning_curve"] as const).map((key) => {
          const labels: Record<string, string> = { ats: "ATS Score", practical_fit: "Practical Fit", learning_curve: "Learning Curve" };
          const va = a.results?.scores?.[key] ?? 0;
          const vb = b.results?.scores?.[key] ?? 0;
          const diff = vb - va;
          return (
            <div key={key} className="col-span-2 grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-xl bg-secondary/20 border border-border/50 px-4 py-3">
              <div className="text-center">
                <p className="font-heading text-xl font-bold text-foreground">{va}</p>
              </div>
              <div className="text-center">
                <p className="font-body text-xs text-muted-foreground">{labels[key]}</p>
                <p className={`font-heading text-sm font-bold ${diff > 0 ? "text-accent" : diff < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                  {diff > 0 ? `+${diff}` : diff === 0 ? "=" : diff}
                </p>
              </div>
              <div className="text-center">
                <p className="font-heading text-xl font-bold text-foreground">{vb}</p>
              </div>
            </div>
          );
        })}

        {/* Skills diff */}
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <div>
            <p className="font-heading text-sm font-semibold text-accent mb-2">Strong Matches</p>
            <div className="flex flex-wrap gap-1">
              {a.results?.matching?.strong?.map((s) => (
                <span key={s} className={`rounded-full px-2 py-0.5 font-body text-xs ${
                  b.results?.matching?.strong?.includes(s) ? "bg-accent/15 text-accent" : "bg-secondary/50 text-muted-foreground"
                }`}>{s}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="font-heading text-sm font-semibold text-accent mb-2">Strong Matches</p>
            <div className="flex flex-wrap gap-1">
              {b.results?.matching?.strong?.map((s) => (
                <span key={s} className={`rounded-full px-2 py-0.5 font-body text-xs ${
                  a.results?.matching?.strong?.includes(s) ? "bg-accent/15 text-accent" : "bg-primary/15 text-primary"
                }`}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default History;
