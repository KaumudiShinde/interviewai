"use client";

import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Target,
  Flame,
  Zap,
  ArrowRight,
  TrendingUp,
  Calendar,
  Award,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import PerformanceChart from "@/components/PerformanceChart";
import RecentInterviews from "@/components/RecentInterviews";
import type { Interview } from "@/components/RecentInterviews";
import Button from "@/components/Button";

interface InterviewResponse {
  id: string;
  topic: string;
  interview_type: string;
  created_at: string;
  score: number | null;
  status: Interview["status"];
  duration_seconds: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);

  useEffect(() => {
    fetch("/api/interviews")
      .then((response) => response.ok ? response.json() : { interviews: [] })
      .then((data) => {
        const records = (data.interviews || []).map((interview: InterviewResponse) => ({
          id: interview.id,
          topic: interview.topic,
          type: interview.interview_type,
          date: interview.created_at,
          score: interview.score || 0,
          status: interview.status,
          duration: `${Math.round(interview.duration_seconds / 60)} min`,
        }));

        setInterviews(records);
      })
      .catch(() => setInterviews([]));
  }, []);

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  const scoredInterviews = interviews.filter((interview) => interview.score !== null);
  const averageScore = scoredInterviews.length
    ? Math.round(scoredInterviews.reduce((total, interview) => total + (interview.score || 0), 0) / scoredInterviews.length)
    : 0;
  const chartData = interviews.slice(0, 7).reverse().map((interview) => ({
    date: new Date(interview.date).toLocaleDateString(undefined, { weekday: "short" }),
    score: interview.score || 0,
    sessions: 1,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-outfit)]">
            Welcome back,{" "}
            <span className="gradient-text">{firstName}</span> 👋
          </h1>
          <p className="text-text-secondary mt-1">
            Ready to crush your next interview? Let&apos;s practice!
          </p>
        </div>
        <Link href="/interview/setup">
          <Button size="lg">
            <Zap size={18} />
            Start New Interview
            <ArrowRight size={16} />
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={MessageSquare}
          label="Total Interviews"
          value={interviews.length}
          color="blue"
          delay={100}
        />
        <StatCard
          icon={Target}
          label="Average Score"
          value={averageScore}
          suffix="%"
          color="purple"
          delay={200}
        />
        <StatCard
          icon={Flame}
          label="Day Streak"
          value={0}
          suffix=" days"
          color="cyan"
          delay={300}
        />
        <StatCard
          icon={Zap}
          label="AI Sessions"
          value={interviews.length}
          color="green"
          delay={400}
        />
      </div>

      {/* Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerformanceChart data={chartData} />
        </div>

        {/* Quick Actions */}
        <div className="glass rounded-2xl p-6 card-glow">
          <h3 className="text-lg font-semibold font-[family-name:var(--font-outfit)] mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link href="/interview/setup">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-hover hover:bg-accent-blue/10 transition-all cursor-pointer group">
                <div className="p-2.5 rounded-xl bg-accent-blue/10">
                  <MessageSquare
                    size={20}
                    className="text-accent-blue"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium group-hover:text-accent-blue transition-colors">
                    New Mock Interview
                  </p>
                  <p className="text-xs text-text-muted">
                    Start a practice session
                  </p>
                </div>
                <ArrowRight
                  size={16}
                  className="text-text-muted group-hover:text-accent-blue transition-colors"
                />
              </div>
            </Link>

            <Link href="/dashboard/reports" className="flex items-center gap-4 p-4 rounded-xl bg-surface-hover hover:bg-accent-purple/10 transition-all cursor-pointer group">
              <div className="p-2.5 rounded-xl bg-accent-purple/10">
                <TrendingUp size={20} className="text-accent-purple" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium group-hover:text-accent-purple transition-colors">
                  View Performance
                </p>
                <p className="text-xs text-text-muted">
                  Detailed analytics
                </p>
              </div>
              <ArrowRight
                size={16}
                className="text-text-muted group-hover:text-accent-purple transition-colors"
              />
            </Link>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-hover hover:bg-accent-cyan/10 transition-all cursor-pointer group">
              <div className="p-2.5 rounded-xl bg-accent-cyan/10">
                <Calendar size={20} className="text-accent-cyan" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium group-hover:text-accent-cyan transition-colors">
                  Schedule Interview
                </p>
                <p className="text-xs text-text-muted">
                  Plan your practice
                </p>
              </div>
              <ArrowRight
                size={16}
                className="text-text-muted group-hover:text-accent-cyan transition-colors"
              />
            </div>

            <Link href="/dashboard/career-coach" className="flex items-center gap-4 p-4 rounded-xl bg-surface-hover hover:bg-success/10 transition-all cursor-pointer group">
              <div className="p-2.5 rounded-xl bg-success/10">
                <Award size={20} className="text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium group-hover:text-success transition-colors">
                  Career Coach
                </p>
                <p className="text-xs text-text-muted">
                  AI career guidance
                </p>
              </div>
              <ArrowRight
                size={16}
                className="text-text-muted group-hover:text-success transition-colors"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Interviews */}
      <RecentInterviews interviews={interviews} />
    </div>
  );
}
