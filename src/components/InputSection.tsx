import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import { Sparkles } from "lucide-react";

interface InputSectionProps {
  resumeText: string;
  jobText: string;
  onResumeChange: (text: string) => void;
  onJobChange: (text: string) => void;
  onAnalyze: () => void;
}

const InputSection = ({
  resumeText,
  jobText,
  onResumeChange,
  onJobChange,
  onAnalyze,
}: InputSectionProps) => {
  const canAnalyze = resumeText.trim().length > 0 && jobText.trim().length > 0;

  return (
    <div className="space-y-8">
      {/* Intro */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 px-4 py-1.5 mb-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-body text-xs font-medium text-foreground">AI-Powered Analysis</span>
        </div>
        <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Analyze Your <span className="text-gradient-yellow">Career Fit</span>
        </h2>
        <p className="mt-3 font-body text-muted-foreground">
          Upload or paste your resume and a job description. Get instant skill analysis, gap detection, and a learning pathway.
        </p>
      </div>

      {/* Input Blocks */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Resume Input */}
        <div className="space-y-3">
          <label className="font-heading text-sm font-medium text-foreground flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-aqua" />
            Your Resume
          </label>
          <FileUpload onTextExtracted={onResumeChange} currentText={resumeText} />
          <textarea
            value={resumeText}
            onChange={(e) => onResumeChange(e.target.value)}
            placeholder="Or paste your resume text here..."
            className="h-48 w-full resize-none rounded-xl border border-border bg-card p-4 font-body text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
          />
        </div>

        {/* Job Description Input */}
        <div className="space-y-3">
          <label className="font-heading text-sm font-medium text-foreground flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-primary" />
            Job Description
          </label>
          <div className="rounded-xl border-2 border-dashed border-border p-6 text-center opacity-40 cursor-not-allowed">
            <p className="font-body text-xs text-muted-foreground">Paste job description below</p>
          </div>
          <textarea
            value={jobText}
            onChange={(e) => onJobChange(e.target.value)}
            placeholder="Paste the job description here..."
            className="h-48 w-full resize-none rounded-xl border border-border bg-card p-4 font-body text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      {/* Analyze Button */}
      <div className="flex justify-center">
        <Button
          variant="signal"
          size="lg"
          onClick={onAnalyze}
          disabled={!canAnalyze}
          className="px-12 py-6 text-lg group"
        >
          <Sparkles className="h-5 w-5 mr-2 group-hover:animate-pulse" />
          Analyze Now
        </Button>
      </div>
    </div>
  );
};

export default InputSection;
