"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Sparkles,
  ArrowRight,
  MessageSquare,
  Brain,
  BarChart3,
  Zap,
  Shield,
  Users,
} from "lucide-react";
import Button from "@/components/Button";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Questions",
    description:
      "Adaptive questions that adjust to your skill level in real-time",
    color: "text-accent-blue",
    bg: "bg-accent-blue/10",
  },
  {
    icon: MessageSquare,
    title: "Natural Conversations",
    description:
      "Realistic interview experience with follow-up questions and feedback",
    color: "text-accent-purple",
    bg: "bg-accent-purple/10",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description:
      "Detailed reports with scoring, trends, and improvement suggestions",
    color: "text-accent-cyan",
    bg: "bg-accent-cyan/10",
  },
  {
    icon: Zap,
    title: "Multiple Personalities",
    description:
      "Practice with different interviewer styles: friendly, strict, Google-style",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    icon: Shield,
    title: "Real Company Formats",
    description:
      "Interview formats modeled after top tech companies like Google, Meta, Amazon",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: Users,
    title: "Peer Benchmarking",
    description:
      "Compare your performance against other candidates anonymously",
    color: "text-error",
    bg: "bg-error/10",
  },
];

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center mesh-gradient">
        <div className="animate-pulse">
          <Sparkles size={48} className="text-accent-purple" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-gradient grid-pattern relative overflow-hidden">
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-96 h-96 rounded-full bg-accent-blue/5 blur-3xl animate-float" />
      <div
        className="absolute bottom-20 right-10 w-[500px] h-[500px] rounded-full bg-accent-purple/5 blur-3xl animate-float"
        style={{ animationDelay: "3s" }}
      />
      <div
        className="absolute top-1/3 right-1/3 w-64 h-64 rounded-full bg-accent-cyan/3 blur-3xl animate-float"
        style={{ animationDelay: "1.5s" }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
            <Sparkles size={22} className="text-white" />
          </div>
          <span className="text-xl font-bold font-[family-name:var(--font-outfit)] gradient-text">
            InterView AI
          </span>
        </div>
        <Link href="/login">
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-8 pt-20 pb-32 text-center">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-text-secondary mb-8">
            <Zap size={14} className="text-accent-purple" />
            AI-Powered Interview Preparation
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-[family-name:var(--font-outfit)] leading-tight mb-6">
            Master Your{" "}
            <span className="gradient-text">Technical Interviews</span>{" "}
            with AI
          </h1>

          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Practice with AI interviewers that adapt to your skill level.
            Get instant feedback, performance analytics, and a personalized
            learning roadmap to land your dream job.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="px-10">
                Get Started Free
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-20 animate-slide-up">
          <div>
            <p className="text-3xl font-bold gradient-text font-[family-name:var(--font-outfit)]">
              10K+
            </p>
            <p className="text-sm text-text-muted mt-1">Users</p>
          </div>
          <div>
            <p className="text-3xl font-bold gradient-text font-[family-name:var(--font-outfit)]">
              50K+
            </p>
            <p className="text-sm text-text-muted mt-1">Interviews</p>
          </div>
          <div>
            <p className="text-3xl font-bold gradient-text font-[family-name:var(--font-outfit)]">
              92%
            </p>
            <p className="text-sm text-text-muted mt-1">Success Rate</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 pb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-outfit)] mb-4">
            Everything You Need to{" "}
            <span className="gradient-text">Ace Your Interview</span>
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Comprehensive tools and AI-driven insights to help you prepare
            for any technical interview.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="glass rounded-2xl p-6 card-glow animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`p-3 rounded-xl ${feature.bg} w-fit mb-4`}>
                <feature.icon size={24} className={feature.color} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 pb-20">
        <div className="glass-strong rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-blue/5 to-accent-purple/5" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold font-[family-name:var(--font-outfit)] mb-4">
              Ready to Start Practicing?
            </h2>
            <p className="text-text-secondary mb-8 max-w-lg mx-auto">
              Join thousands of developers who improved their interview
              skills with InterView AI.
            </p>
            <Link href="/login">
              <Button size="lg" className="px-10">
                Start Your First Interview
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border-default py-8 px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-accent-purple" />
            <span className="text-sm text-text-muted">
              © 2026 InterView AI. All rights reserved.
            </span>
          </div>
          <div className="flex gap-6 text-sm text-text-muted">
            <span className="hover:text-text-primary transition-colors cursor-pointer">
              Privacy
            </span>
            <span className="hover:text-text-primary transition-colors cursor-pointer">
              Terms
            </span>
            <span className="hover:text-text-primary transition-colors cursor-pointer">
              Contact
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
