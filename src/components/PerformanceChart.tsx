"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-strong rounded-xl px-4 py-3 shadow-xl">
        <p className="text-sm font-semibold text-text-primary mb-1">{label}</p>
        <p className="text-sm text-accent-blue">
          Score: <span className="font-bold">{payload[0].value}%</span>
        </p>
        {payload[1] && (
          <p className="text-sm text-accent-purple">
            Sessions: <span className="font-bold">{payload[1].value}</span>
          </p>
        )}
      </div>
    );
  }
  return null;
}

export default function PerformanceChart({ data }: { data: Array<{ date: string; score: number; sessions: number }> }) {
  return (
    <div className="glass rounded-2xl p-6 card-glow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold font-[family-name:var(--font-outfit)]">
            Performance Trend
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Your interview scores this week
          </p>
        </div>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent-blue" />
            <span className="text-text-secondary">Score</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent-purple" />
            <span className="text-text-secondary">Sessions</span>
          </div>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="sessionsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.08)" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="url(#scoreGradient)"
              dot={{ fill: "#3b82f6", strokeWidth: 0, r: 4 }}
              activeDot={{ fill: "#3b82f6", strokeWidth: 2, stroke: "#fff", r: 6 }}
            />
            <Area
              type="monotone"
              dataKey="sessions"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#sessionsGradient)"
              dot={{ fill: "#8b5cf6", strokeWidth: 0, r: 3 }}
              activeDot={{ fill: "#8b5cf6", strokeWidth: 2, stroke: "#fff", r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
