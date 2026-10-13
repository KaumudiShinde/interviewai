"use client";

import { useEffect, useState } from "react";
import RecentInterviews, { type Interview } from "@/components/RecentInterviews";

export default function ReportsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);

  useEffect(() => {
    fetch("/api/interviews")
      .then((response) => response.json())
      .then((data) => setInterviews((data.interviews || []).map((item: { id: string; topic: string; interview_type: string; created_at: string; score: number | null; status: Interview["status"]; duration_seconds: number }) => ({
        id: item.id,
        topic: item.topic,
        type: item.interview_type,
        date: item.created_at,
        score: item.score || 0,
        status: item.status,
        duration: `${Math.round(item.duration_seconds / 60)} min`,
      }))))
      .catch(() => setInterviews([]));
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)] gradient-text">Interview Reports</h1>
        <p className="text-text-secondary mt-1">Review your real interview sessions and feedback.</p>
      </div>
      <RecentInterviews interviews={interviews} />
    </div>
  );
}
