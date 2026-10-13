"use client";

import { Clock, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export interface Interview {
  id: string;
  topic: string;
  type: string;
  date: string;
  score: number;
  status: "completed" | "in-progress" | "scheduled";
  duration: string;
}

function getScoreColor(score: number): string {
  if (score >= 85) return "text-success";
  if (score >= 70) return "text-warning";
  return "text-error";
}

function getStatusBadge(status: Interview["status"]) {
  const styles = {
    completed: "badge-success",
    "in-progress": "badge-info",
    scheduled: "badge-warning",
  };

  const labels = {
    completed: "Completed",
    "in-progress": "In Progress",
    scheduled: "Scheduled",
  };

  return (
    <span className={`${styles[status]} text-xs px-2.5 py-1 rounded-full font-medium`}>
      {labels[status]}
    </span>
  );
}

export default function RecentInterviews({ interviews }: { interviews: Interview[] }) {
  return (
    <div className="glass rounded-2xl p-6 card-glow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold font-[family-name:var(--font-outfit)]">
            Recent Interviews
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Your latest practice sessions
          </p>
        </div>
        <Link href="/dashboard/reports" className="text-sm text-accent-blue hover:text-accent-purple transition-colors flex items-center gap-1 cursor-pointer">
          View all <ArrowUpRight size={14} />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-default">
              <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider pb-3 px-2">
                Topic
              </th>
              <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider pb-3 px-2">
                Type
              </th>
              <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider pb-3 px-2">
                Date
              </th>
              <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider pb-3 px-2">
                Duration
              </th>
              <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider pb-3 px-2">
                Score
              </th>
              <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider pb-3 px-2">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {interviews.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-text-secondary">
                  No interviews yet. Start your first practice session to see it here.
                </td>
              </tr>
            ) : interviews.slice(0, 5).map((interview) => (
              <tr
                key={interview.id}
                className="border-b border-border-default/50 hover:bg-surface-hover transition-colors cursor-pointer group"
              >
                <td className="py-4 px-2">
                  <span className="text-sm font-medium text-text-primary group-hover:text-accent-blue transition-colors">
                    {interview.topic}
                  </span>
                </td>
                <td className="py-4 px-2">
                  <span className="text-sm text-text-secondary">
                    {interview.type}
                  </span>
                </td>
                <td className="py-4 px-2">
                  <span className="text-sm text-text-secondary">
                    {new Date(interview.date).toLocaleDateString()}
                  </span>
                </td>
                <td className="py-4 px-2">
                  <span className="text-sm text-text-secondary flex items-center gap-1">
                    <Clock size={14} className="text-text-muted" />
                    {interview.duration}
                  </span>
                </td>
                <td className="py-4 px-2">
                  {interview.score > 0 ? (
                    <span
                      className={`text-sm font-bold ${getScoreColor(
                        interview.score
                      )}`}
                    >
                      {interview.score}%
                    </span>
                  ) : (
                    <span className="text-sm text-text-muted">—</span>
                  )}
                </td>
                <td className="py-4 px-2">
                  {getStatusBadge(interview.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
