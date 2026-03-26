import { useState, useCallback } from "react";
import type { AIAnalysisResult } from "@/lib/aiAnalysisTypes";
import InputSection from "@/components/InputSection";
import AnalysisAnimation from "@/components/AnalysisAnimation";
import AIResultsSection from "@/components/AIResultsSection";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Analyze = () => {
  const [stage, setStage] = useState<"input" | "analyzing" | "results">("input");
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");
  const [results, setResults] = useState<AIAnalysisResult | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAnalyze = useCallback(async () => {
    if (!resumeText.trim() || !jobText.trim()) return;
    setStage("analyzing");

    try {
      const { data, error } = await supabase.functions.invoke("analyze-resume", {
        body: { resume_text: resumeText, job_description: jobText },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const aiResults = data as AIAnalysisResult;
      setResults(aiResults);
      setStage("results");

      // Save to history if logged in
      if (user) {
        await supabase.from("analysis_history").insert({
          user_id: user.id,
          resume_text: resumeText,
          job_text: jobText,
          match_percentage: aiResults.scores?.ats || 0,
          ats_score: aiResults.scores?.practical_fit || 0,
          results: aiResults as any,
        });
      }
    } catch (e: any) {
      console.error("Analysis failed:", e);
      toast({
        title: "Analysis failed",
        description: e.message || "Please try again.",
        variant: "destructive",
      });
      setStage("input");
    }
  }, [resumeText, jobText, user, toast]);

  const handleStartOver = useCallback(() => {
    setStage("input");
    setResumeText("");
    setJobText("");
    setResults(null);
  }, []);

  const content = (
    <div className="mx-auto max-w-[800px]">
      {stage === "results" && (
        <div className="mb-6 flex justify-end">
          <button onClick={handleStartOver} className="font-body text-sm text-muted-foreground hover:text-primary transition-colors">
            Start Over
          </button>
        </div>
      )}
      {stage === "input" && (
        <InputSection
          resumeText={resumeText}
          jobText={jobText}
          onResumeChange={setResumeText}
          onJobChange={setJobText}
          onAnalyze={handleAnalyze}
        />
      )}
      {stage === "analyzing" && <AnalysisAnimation resumeText={resumeText} jobText={jobText} />}
      {stage === "results" && results && <AIResultsSection results={results} />}
    </div>
  );

  if (user) {
    return <DashboardLayout>{content}</DashboardLayout>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 px-6 py-4">
        <div className="mx-auto flex max-w-[800px] items-center justify-between">
          <h1 className="font-heading text-lg font-bold tracking-tight text-foreground">Skill Set Go</h1>
          {stage === "results" && (
            <button onClick={handleStartOver} className="font-body text-sm text-muted-foreground hover:text-primary transition-colors">
              Start Over
            </button>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-[800px] px-6 py-12">{content}</main>
    </div>
  );
};

export default Analyze;
