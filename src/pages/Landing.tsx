import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { FileSearch, Target, BookOpen, BarChart3, Sun, Moon, Sparkles, ArrowRight, Zap, Shield } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const features = [
  { icon: FileSearch, title: "Resume Analysis", desc: "Extract skills from your resume using NLP-powered parsing.", gradient: "from-primary/20 to-signal-yellow/10", iconColor: "text-primary" },
  { icon: Target, title: "Skill Gap Detection", desc: "Compare your skills against job requirements instantly.", gradient: "from-aqua/20 to-accent/10", iconColor: "text-aqua" },
  { icon: BookOpen, title: "Learning Path Generator", desc: "Get a personalized roadmap to fill your skill gaps.", gradient: "from-muted-red/20 to-destructive/10", iconColor: "text-muted-red" },
  { icon: BarChart3, title: "Resume Match Score", desc: "See how well your resume matches any job description.", gradient: "from-accent/20 to-aqua/10", iconColor: "text-accent" },
];

const stats = [
  { icon: Zap, value: "100+", label: "Skills Tracked", color: "text-primary" },
  { icon: Shield, value: "ATS", label: "Score Analysis", color: "text-aqua" },
  { icon: Sparkles, value: "AI", label: "Powered Engine", color: "text-muted-red" },
];

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-muted-red/8 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative flex items-center justify-between px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-xl font-bold text-foreground">Skill Set Go</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="rounded-lg p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-secondary">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          {user ? (
            <Button onClick={() => navigate("/dashboard")} variant="signal">Dashboard</Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={() => navigate("/auth")} variant="outline">Login</Button>
              <Button onClick={() => navigate("/auth?mode=signup")} variant="signal">Sign Up</Button>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-5xl px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-8">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-body text-xs font-medium text-primary">AI-Powered Career Analysis</span>
        </div>

        <h2 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl leading-tight">
          Analyze Resumes.
          <br />
          <span className="bg-gradient-to-r from-primary via-accent to-aqua bg-clip-text text-transparent">
            Detect Skill Gaps.
          </span>
          <br />
          Build Your Roadmap.
        </h2>

        <p className="mx-auto mt-6 max-w-2xl font-body text-lg text-muted-foreground leading-relaxed">
          Upload your resume and any job description. Our AI engine extracts skills, finds gaps, calculates ATS scores, and builds a personalized learning pathway.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button
            variant="signal"
            size="lg"
            className="px-10 py-6 text-lg group"
            onClick={() => navigate(user ? "/dashboard" : "/auth?mode=signup")}
          >
            Get Started <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="px-10 py-6 text-lg border-primary/30 hover:bg-primary/10"
            onClick={() => navigate("/analyze")}
          >
            Try Demo
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="mt-16 flex justify-center gap-8 sm:gap-16">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <s.icon className={`h-6 w-6 mx-auto mb-2 ${s.color}`} />
              <p className="font-heading text-2xl font-bold text-foreground">{s.value}</p>
              <p className="font-body text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Cards */}
      <section className="relative mx-auto max-w-5xl px-6 pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`group relative rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 transition-all duration-500 hover:border-transparent hover:shadow-2xl hover:-translate-y-1`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative">
                <div className="mb-4 inline-flex rounded-xl bg-secondary p-3">
                  <f.icon className={`h-6 w-6 ${f.iconColor} transition-transform group-hover:scale-110`} />
                </div>
                <h3 className="font-heading text-base font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 font-body text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border py-8 text-center">
        <p className="font-body text-sm text-muted-foreground">
          Built with ❤️ for career growth · Skill Set Go © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};

export default Landing;
