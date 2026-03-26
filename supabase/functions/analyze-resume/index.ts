import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an Elite AI Talent Intelligence Engine. Perform deep multi-dimensional analysis.

INPUT: Resume text and Job description.

Analyze across these dimensions and return STRICT JSON (no markdown, no code fences):

{
  "candidate_profile": {
    "name": "",
    "level": "Fresher|Mid|Senior",
    "domains": [],
    "specialization": ""
  },
  "skills": {
    "explicit": [],
    "implicit": [{"skill":"","evidence":""}],
    "categorized": {
      "programming": [],
      "frameworks": [],
      "tools": [],
      "databases": [],
      "cloud": [],
      "other": []
    },
    "proficiency": {}
  },
  "platform_mastery": [{"platform":"","level":"Basic|Working|Production-level","evidence":""}],
  "soft_skills": [{"skill":"","confidence":0,"evidence":""}],
  "leadership_analysis": {"type":"Individual Contributor|Team Player|Team Lead|Manager Potential","evidence":""},
  "experience_score": {"depth":"Low|Medium|High","breadth":"Low|Medium|High","impact":"Low|Medium|High","consistency":"Low|Medium|High"},
  "job_analysis": {"must_have":[],"nice_to_have":[],"seniority":""},
  "matching": {"strong":[],"weak":[],"missing":[],"transferable":[]},
  "scores": {"ats":0,"practical_fit":0,"learning_curve":0},
  "gaps": [{"skill":"","severity":"Critical|Moderate|Minor","learnable":"Quick|Medium|Long"}],
  "resume_brand": {"strength":"Weak|Average|Strong","clarity":"","improvements":[]},
  "optimized_sections": {"skills_section":"","experience_bullets":[]},
  "interview_questions": {"technical":[],"behavioral":[],"scenario":[]},
  "final_decision": {"probability":0,"recommendation":"Reject|Consider|Strong Hire","reason":""}
}

RULES:
- Infer implicit skills from project descriptions, tools used, responsibilities
- Classify proficiency using duration, complexity, ownership signals
- Be critical like a real hiring manager
- All scores 0-100
- Return ONLY valid JSON, no extra text`;

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { resume_text, job_description } = await req.json();
    if (!resume_text || !job_description) {
      return new Response(
        JSON.stringify({ error: "resume_text and job_description required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userPrompt = `RESUME TEXT:\n${resume_text}\n\nJOB DESCRIPTION:\n${job_description}`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
        }),
      }
    );

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response (handle possible markdown fences)
    let parsed;
    try {
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", content.slice(0, 500));
      return new Response(
        JSON.stringify({ error: "Failed to parse AI analysis. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-resume error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
