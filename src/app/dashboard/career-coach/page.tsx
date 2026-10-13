"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Compass, Target, TrendingUp } from "lucide-react";
import Link from "next/link";
import Button from "@/components/Button";

export default function CareerCoachPage() {
  const [interviewCount, setInterviewCount] = useState(0);
  const [averageScore, setAverageScore] = useState(0);

  useEffect(() => {
    fetch("/api/interviews")
      .then((response) => response.json())
      .then((data) => {
        const records = data.interviews || [];
        const scored = records.filter((item: { score: number | null }) => item.score !== null);
        setInterviewCount(records.length);
        setAverageScore(scored.length ? Math.round(scored.reduce((total: number, item: { score: number }) => total + item.score, 0) / scored.length) : 0);
      })
      .catch(() => undefined);
  }, []);

  const suggestions = averageScore >= 80
    ? ["Practice explaining trade-offs more concisely.", "Add measurable impact to behavioral answers.", "Try a harder system-design interview next."]
    : ["Use the STAR structure for behavioral answers.", "Think aloud and state your assumptions clearly.", "Practice one technical interview every week."];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)] gradient-text">Career Coach</h1>
        <p className="text-text-secondary mt-1">Practical guidance based on your interview activity.</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5"><Compass className="text-accent-blue mb-3" /><p className="text-sm text-text-secondary">Sessions completed</p><p className="text-3xl font-bold mt-1">{interviewCount}</p></div>
        <div className="glass rounded-2xl p-5"><Target className="text-accent-purple mb-3" /><p className="text-sm text-text-secondary">Average score</p><p className="text-3xl font-bold mt-1">{averageScore}%</p></div>
        <div className="glass rounded-2xl p-5"><TrendingUp className="text-success mb-3" /><p className="text-sm text-text-secondary">Next focus</p><p className="text-lg font-semibold mt-2">{averageScore >= 80 ? "Polish" : "Build fundamentals"}</p></div>
      </div>
      <div className="glass rounded-2xl p-6">
        <h2 className="text-xl font-semibold font-[family-name:var(--font-outfit)]">Your coaching plan</h2>
        <div className="mt-5 space-y-4">{suggestions.map((suggestion) => <div key={suggestion} className="flex items-start gap-3"><CheckCircle2 size={19} className="text-success mt-0.5" /><p className="text-text-secondary">{suggestion}</p></div>)}</div>
        <Link href="/interview/setup" className="inline-block mt-6"><Button>Practice now <ArrowRight size={16} /></Button></Link>
      </div>
    </div>
  );
}
