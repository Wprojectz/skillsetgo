import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { FileSearch, Target, TrendingUp, BookOpen, ArrowRight, Sparkles } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface HistoryRow {
  id: string;
  match_percentage: number;
  ats_score: number;
  results: any;
  created_at: string;
}

const statConfigs = [
  { icon: FileSearch, label: "Analyses Done", gradient: "from-primary/20 to-signal-yellow/10", iconColor: "text-primary", borderColor: "border-primary/20" },
  { icon: Target, label: "Avg Match", gradient: "from-aqua/20 to-accent/10", iconColor: "text-aqua", borderColor: "border-aqua/20" },
  { icon: TrendingUp, label: "Avg ATS Score", gradient: "from-signal-yellow/20 to-primary/10", iconColor: "text-signal-yellow", borderColor: "border-signal-yellow/20" },
  { icon: BookOpen, label: "Skills Tracked", gradient: "from-muted-red/20 to-destructive/10", iconColor: "text-muted-red", borderColor: "border-muted-red/20" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryRow[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("analysis_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data) setHistory(data);
      });
  }, [user]);

  const latest = history[0];
  const avgMatch = history.length
    ? Math.round(history.reduce((s, h) => s + h.match_percentage, 0) / history.length)
    : 0;
  const avgAts = history.length
    ? Math.round(history.reduce((s, h) => s + h.ats_score, 0) / history.length)
    : 0;

  const statValues = [
    history.length,
    `${avgMatch}%`,
    `${avgAts}/100`,
    latest?.results?.resumeSkills?.skills?.length || 0,
  ];

  const pieData = latest
    ? [
        { name: "Matched", value: latest.match_percentage },
        { name: "Gap", value: 100 - latest.match_percentage },
      ]
    : [];

  const barData = history.slice(0, 5).reverse().map((h, i) => ({
    name: `Analysis ${i + 1}`,
    match: h.match_percentage,
    ats: h.ats_score,
  }));

  const COLORS = ["hsl(160, 94%, 42%)", "hsl(215, 25%, 30%)"];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-muted-red/10 border border-primary/20 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-xl font-bold text-foreground">
              Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}!
            </h2>
          </div>
          <p className="font-body text-sm text-muted-foreground">
            {history.length > 0
              ? `You've completed ${history.length} ${history.length === 1 ? "analysis" : "analyses"}. Keep going!`
              : "Start by analyzing your resume against a job description."}
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statConfigs.map((s, i) => (
            <div
              key={s.label}
              className={`relative overflow-hidden rounded-2xl border ${s.borderColor} bg-card p-5 transition-all hover:shadow-lg hover:-translate-y-0.5`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-50`} />
              <div className="relative flex items-center gap-3">
                <div className="rounded-xl bg-secondary/80 p-2.5">
                  <s.icon className={`h-6 w-6 ${s.iconColor}`} />
                </div>
                <div>
                  <p className="font-body text-xs text-muted-foreground">{s.label}</p>
                  <p className="font-heading text-2xl font-bold text-foreground">{statValues[i]}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        {history.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-heading text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <Target className="h-4 w-4 text-aqua" /> Latest Match Score
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" strokeWidth={0}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <p className="text-center font-heading text-4xl font-bold text-aqua">{latest?.match_percentage}%</p>
              <p className="text-center font-body text-xs text-muted-foreground mt-1">skill match rate</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-heading text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Analysis History
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" stroke="hsl(215, 15%, 55%)" fontSize={11} />
                  <YAxis stroke="hsl(215, 15%, 55%)" fontSize={11} />
                  <Tooltip
                    contentStyle={{ background: "hsl(215, 35%, 17%)", border: "1px solid hsl(215, 25%, 25%)", borderRadius: "12px" }}
                    labelStyle={{ color: "hsl(210, 20%, 90%)" }}
                  />
                  <Legend />
                  <Bar dataKey="match" fill="hsl(160, 94%, 42%)" radius={[6, 6, 0, 0]} name="Match %" />
                  <Bar dataKey="ats" fill="hsl(42, 100%, 70%)" radius={[6, 6, 0, 0]} name="ATS Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-16 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <FileSearch className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-heading text-xl font-bold text-foreground">No analyses yet</h3>
            <p className="mt-2 font-body text-sm text-muted-foreground max-w-sm mx-auto">
              Upload your resume and a job description to get your first skill analysis with match scores and learning paths.
            </p>
            <button
              onClick={() => navigate("/analyze")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 px-8 py-3 font-heading text-sm font-bold text-primary-foreground hover:shadow-lg hover:shadow-primary/25 transition-all"
            >
              Start Analysis <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Recent History */}
        {history.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-heading text-base font-semibold text-foreground mb-4">Recent Analyses</h3>
            <div className="space-y-2">
              {history.slice(0, 5).map((h) => (
                <div key={h.id} className="flex items-center justify-between rounded-xl bg-secondary/30 border border-border/50 px-5 py-3.5 hover:bg-secondary/50 transition-colors">
                  <p className="font-body text-sm text-foreground">
                    {new Date(h.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-aqua/15 px-3 py-1 font-heading text-xs font-bold text-aqua">
                      <Target className="h-3 w-3" /> {h.match_percentage}%
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 font-heading text-xs font-bold text-primary">
                      ATS {h.ats_score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
