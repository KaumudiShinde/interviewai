"use client";

import { useEffect, useRef, useState } from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  trend?: { value: number; isPositive: boolean };
  color: "blue" | "purple" | "cyan" | "green";
  delay?: number;
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  suffix = "",
  prefix = "",
  trend,
  color,
  delay = 0,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const colorMap = {
    blue: {
      bg: "rgba(59, 130, 246, 0.1)",
      border: "rgba(59, 130, 246, 0.2)",
      icon: "#3b82f6",
      glow: "0 0 20px rgba(59, 130, 246, 0.15)",
    },
    purple: {
      bg: "rgba(139, 92, 246, 0.1)",
      border: "rgba(139, 92, 246, 0.2)",
      icon: "#8b5cf6",
      glow: "0 0 20px rgba(139, 92, 246, 0.15)",
    },
    cyan: {
      bg: "rgba(6, 182, 212, 0.1)",
      border: "rgba(6, 182, 212, 0.2)",
      icon: "#06b6d4",
      glow: "0 0 20px rgba(6, 182, 212, 0.15)",
    },
    green: {
      bg: "rgba(16, 185, 129, 0.1)",
      border: "rgba(16, 185, 129, 0.2)",
      icon: "#10b981",
      glow: "0 0 20px rgba(16, 185, 129, 0.15)",
    },
  };

  const colors = colorMap[color];

  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 1200;
    const steps = 40;
    const stepValue = value / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [isVisible, value]);

  return (
    <div
      ref={ref}
      className={`
        glass rounded-2xl p-6 card-glow
        transition-all duration-500
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="p-3 rounded-xl"
          style={{
            backgroundColor: colors.bg,
            boxShadow: colors.glow,
          }}
        >
          <Icon size={22} style={{ color: colors.icon }} />
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              trend.isPositive
                ? "badge-success"
                : "badge-error"
            }`}
          >
            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <p className="text-text-secondary text-sm font-medium mb-1">{label}</p>
      <p className="text-3xl font-bold font-[family-name:var(--font-outfit)] tracking-tight">
        {prefix}
        {displayValue}
        {suffix}
      </p>
    </div>
  );
}
