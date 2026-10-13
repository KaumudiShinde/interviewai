"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Code,
  Network,
  MessageSquare,
  Clock,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Gauge,
  Video,
  Mic,
  VideoOff,
  MicOff,
  Briefcase,
  ShieldCheck,
  Zap,
  Building2,
  Check,
} from "lucide-react";
import Button from "@/components/Button";
import {
  INTERVIEWER_PERSONAS,
  TARGET_COMPANIES,
  CompanyPreset,
} from "@/lib/interview-prompts";

const targetRoles = [
  { id: "fullstack", name: "Full Stack Engineer", level: "Senior / L5" },
  { id: "backend", name: "Backend & Systems", level: "Senior / Staff" },
  { id: "frontend", name: "Frontend & Web UI", level: "Senior / Staff" },
  { id: "aiml", name: "AI / ML Systems Engineer", level: "Senior / Staff" },
  { id: "devops", name: "Cloud & DevOps Architect", level: "Senior" },
  { id: "manager", name: "Engineering Manager", level: "Lead / Director" },
];

const interviewTypes = [
  {
    id: "technical",
    name: "Technical & Coding",
    description: "Algorithms, live coding editor, complexity analysis & problem solving",
    icon: Code,
    badge: "Live Code Editor",
    gradient: "from-blue-500/20 via-indigo-500/20 to-purple-500/20",
    borderGlow: "group-hover:border-blue-500/50",
  },
  {
    id: "system-design",
    name: "System Design",
    description: "Distributed architectures, microservices, scaling, caching & whiteboard",
    icon: Network,
    badge: "Interactive Whiteboard",
    gradient: "from-cyan-500/20 via-teal-500/20 to-emerald-500/20",
    borderGlow: "group-hover:border-cyan-500/50",
  },
  {
    id: "behavioral",
    name: "Behavioral & Leadership",
    description: "STAR method scenarios, team conflict, ownership, and engineering impact",
    icon: MessageSquare,
    badge: "Deep Probing",
    gradient: "from-purple-500/20 via-pink-500/20 to-rose-500/20",
    borderGlow: "group-hover:border-purple-500/50",
  },
];

const difficulties = [
  { id: "easy", name: "Junior / Entry", description: "Core concepts & syntax fundamentals" },
  { id: "medium", name: "Senior / Mid", description: "Production edge cases & trade-offs" },
  { id: "hard", name: "FAANG / Staff+", description: "Extreme scale & deep concurrency" },
];

const durations = [
  { id: "15", name: "15 min", desc: "Quick Sprint" },
  { id: "30", name: "30 min", desc: "Standard Round" },
  { id: "45", name: "45 min", desc: "Deep Dive" },
  { id: "60", name: "60 min", desc: "Full Onsite" },
];

export default function InterviewSetupPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState("fullstack");
  const [selectedCompany, setSelectedCompany] = useState<string>("google");
  const [type, setType] = useState("technical");
  const [selectedPersona, setSelectedPersona] = useState("alex");
  const [difficulty, setDifficulty] = useState("hard");
  const [duration, setDuration] = useState("30");
  const [enableVoice, setEnableVoice] = useState(true);
  const [enableEditor, setEnableEditor] = useState(true);

  // AV Test State
  const [isCamPreviewOn, setIsCamPreviewOn] = useState(true);
  const [isMicPreviewOn, setIsMicPreviewOn] = useState(true);
  const [micLevel, setMicLevel] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Start local camera & audio meter preview
  useEffect(() => {
    let mounted = true;

    async function initMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Setup audio level meter
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateMeter = () => {
            if (!mounted) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setMicLevel(Math.min(100, Math.round((avg / 128) * 100)));
            animationFrameRef.current = requestAnimationFrame(updateMeter);
          };
          updateMeter();
        }
      } catch {
        if (mounted) {
          setIsCamPreviewOn(false);
          setIsMicPreviewOn(false);
        }
      }
    }

    void initMedia();

    return () => {
      mounted = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) void audioContextRef.current.close();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function togglePreviewTrack(kind: "audio" | "video") {
    if (!streamRef.current) return;
    const track = streamRef.current.getTracks().find((t) => t.kind === kind);
    if (track) {
      track.enabled = !track.enabled;
      if (kind === "video") setIsCamPreviewOn(track.enabled);
      else setIsMicPreviewOn(track.enabled);
    }
  }

  function handleStart() {
    const roleObj = targetRoles.find((r) => r.id === selectedRole);
    const params = new URLSearchParams({
      type,
      personality: selectedPersona,
      difficulty,
      duration,
      role: roleObj ? roleObj.name : "Software Engineer",
      company: selectedCompany,
      voice: enableVoice ? "1" : "0",
      editor: enableEditor ? "1" : "0",
    });
    router.push(`/interview?${params.toString()}`);
  }

  const personasList = Object.values(INTERVIEWER_PERSONAS);
  const activeCompanyObj = TARGET_COMPANIES.find((c) => c.id === selectedCompany) || TARGET_COMPANIES[0];

  return (
    <div className="min-h-screen mesh-gradient grid-pattern pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <button className="p-2.5 rounded-xl glass hover:bg-surface-hover transition-all cursor-pointer">
                <ArrowLeft size={20} className="text-text-secondary" />
              </button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-accent-blue/15 text-accent-blue border border-accent-blue/30">
                  Target Company Interview Room
                </span>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  MANG / Real Recruiter Calibration
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-outfit)] mt-1">
                <span className="gradient-text">Configure Your Target Interview</span>
              </h1>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs text-text-secondary">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Real Bar-Raiser Rubric</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass">
              <Zap size={14} className="text-accent-cyan" />
              <span>Zero Latency Voice</span>
            </div>
          </div>
        </div>

        {/* Main Grid: Settings & Live AV Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* Left Column: Configuration Sections */}
          <div className="space-y-8">
            {/* 1. Target Company Level (MANG & Startups) */}
            <section className="animate-slide-up">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                  <Building2 size={18} className="text-accent-cyan" />
                  Target Company Benchmark (MANG / Startups)
                </h2>
                <span className="text-xs text-text-muted">Real company interview styles & grading rubric</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TARGET_COMPANIES.map((comp) => {
                  const isSelected = selectedCompany === comp.id;
                  return (
                    <button
                      key={comp.id}
                      onClick={() => {
                        setSelectedCompany(comp.id);
                        if (comp.id === "yc-startup") setSelectedPersona("mang");
                        else if (comp.id === "amazon") setSelectedPersona("elena");
                        else if (comp.id === "meta") setSelectedPersona("alex");
                        else if (comp.id === "openai" || comp.id === "netflix") setSelectedPersona("sarah");
                        else setSelectedPersona("alex");
                      }}
                      className={`relative glass rounded-xl p-3.5 text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "border-accent-cyan bg-accent-cyan/15 shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-accent-cyan"
                          : "hover:border-border-hover hover:bg-white/5"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`w-3 h-3 rounded-full bg-gradient-to-tr ${comp.logoBg}`} />
                          <span className="text-[9px] uppercase tracking-wider font-bold text-text-muted">
                            {comp.tier.split("/")[0]}
                          </span>
                        </div>
                        <p className="font-bold text-sm text-text-primary">{comp.name}</p>
                        <p className="text-[11px] text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                          {comp.styleDescription}
                        </p>
                      </div>

                      {isSelected && (
                        <div className="mt-2.5 pt-2 border-t border-accent-cyan/30 flex items-center gap-1 text-[11px] text-accent-cyan font-semibold">
                          <Check size={12} />
                          <span>Active Bar</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Active company highlight banner */}
              <div className="mt-3 p-3.5 rounded-xl bg-surface-hover/70 border border-white/10 text-xs text-text-secondary flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-text-primary mr-1">
                    {activeCompanyObj.name} Interview Focus:
                  </span>
                  <span>{activeCompanyObj.interviewStyle}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 shrink-0">
                  {activeCompanyObj.focusAreas.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] text-white/90 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* 2. Target Role */}
            <section className="animate-slide-up stagger-1">
              <h2 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Briefcase size={18} className="text-accent-blue" />
                Target Engineering Role
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {targetRoles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`glass rounded-xl p-3.5 text-left transition-all cursor-pointer ${
                      selectedRole === role.id
                        ? "border-accent-blue bg-accent-blue/10 shadow-[0_0_20px_rgba(59,130,246,0.2)] ring-1 ring-accent-blue"
                        : "hover:border-border-hover hover:bg-white/5"
                    }`}
                  >
                    <p className="font-semibold text-sm text-text-primary">{role.name}</p>
                    <p className="text-[11px] text-text-muted mt-0.5">{role.level}</p>
                  </button>
                ))}
              </div>
            </section>

            {/* 3. Select AI Interviewer Persona */}
            <section className="animate-slide-up stagger-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                  <Sparkles size={18} className="text-accent-purple" />
                  Select Your Recruiter / Bar-Raiser Persona
                </h2>
                <span className="text-xs text-text-muted">Photorealistic virtual interviewer avatar</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {personasList.map((persona) => {
                  const isSelected = selectedPersona === persona.id;
                  return (
                    <button
                      key={persona.id}
                      onClick={() => setSelectedPersona(persona.id)}
                      className={`relative glass rounded-2xl p-4 text-left transition-all cursor-pointer overflow-hidden ${
                        isSelected
                          ? "border-accent-purple bg-accent-purple/10 shadow-[0_0_25px_rgba(139,92,246,0.25)] ring-1 ring-accent-purple"
                          : "hover:border-border-hover hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-white/20 shadow-md">
                          <Image
                            src={persona.avatar}
                            alt={persona.name}
                            fill
                            className="object-cover"
                          />
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#111128]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-sm text-text-primary truncate">
                              {persona.name}
                            </h3>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r ${persona.badgeColor} text-white`}
                            >
                              {persona.voiceGender === "male" ? "Male Voice" : "Female Voice"}
                            </span>
                          </div>
                          <p className="text-xs text-accent-cyan font-medium mt-0.5">{persona.role}</p>
                          <p className="text-[11px] text-text-muted mt-0.5">{persona.company}</p>
                        </div>
                      </div>
                      <p className="text-xs text-text-secondary mt-3 leading-relaxed border-t border-white/5 pt-2.5 line-clamp-2">
                        {persona.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 4. Interview Type */}
            <section className="animate-slide-up stagger-3">
              <h2 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Code size={18} className="text-accent-cyan" />
                Interview Format & Round
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {interviewTypes.map((t) => {
                  const isSelected = type === t.id;
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setType(t.id)}
                      className={`glass rounded-2xl p-4 text-left transition-all cursor-pointer group flex flex-col justify-between ${
                        isSelected
                          ? "border-accent-cyan bg-accent-cyan/10 shadow-[0_0_25px_rgba(6,182,212,0.2)] ring-1 ring-accent-cyan"
                          : "hover:border-border-hover hover:bg-white/5"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={`p-2.5 rounded-xl bg-white/5 ${
                              isSelected ? "text-accent-cyan" : "text-text-muted group-hover:text-white"
                            }`}
                          >
                            <Icon size={22} />
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                            {t.badge}
                          </span>
                        </div>
                        <p className="font-bold text-sm text-text-primary">{t.name}</p>
                        <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                          {t.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 5. Difficulty & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-slide-up stagger-4">
              {/* Difficulty */}
              <div>
                <h2 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <Gauge size={18} className="text-amber-400" />
                  Rigor & Difficulty
                </h2>
                <div className="grid grid-cols-3 gap-2.5">
                  {difficulties.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDifficulty(d.id)}
                      className={`glass rounded-xl p-3 text-center transition-all cursor-pointer ${
                        difficulty === d.id
                          ? "border-amber-400/80 bg-amber-400/10 shadow-[0_0_15px_rgba(251,191,36,0.2)] ring-1 ring-amber-400/50"
                          : "hover:border-border-hover hover:bg-white/5"
                      }`}
                    >
                      <p className="font-semibold text-xs text-text-primary">{d.name}</p>
                      <p className="text-[10px] text-text-muted mt-0.5 line-clamp-1">{d.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <h2 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <Clock size={18} className="text-emerald-400" />
                  Session Length
                </h2>
                <div className="grid grid-cols-4 gap-2">
                  {durations.map((dur) => (
                    <button
                      key={dur.id}
                      onClick={() => setDuration(dur.id)}
                      className={`glass rounded-xl p-2.5 text-center transition-all cursor-pointer ${
                        duration === dur.id
                          ? "border-emerald-400 bg-emerald-400/10 shadow-[0_0_15px_rgba(52,211,153,0.2)] ring-1 ring-emerald-400"
                          : "hover:border-border-hover hover:bg-white/5"
                      }`}
                    >
                      <p className="font-bold text-xs text-text-primary">{dur.name}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">{dur.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live WebRTC Audio/Video Testing */}
          <div className="space-y-6">
            <div className="glass rounded-2xl p-5 sticky top-6 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                  <Video size={16} className="text-accent-blue" />
                  Camera & Audio Check
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Ready
                </span>
              </div>

              {/* Video Preview Box */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black/60 border border-white/10 shadow-inner flex items-center justify-center">
                {isCamPreviewOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover -scale-x-100"
                  />
                ) : (
                  <div className="text-center p-4">
                    <VideoOff size={32} className="mx-auto text-rose-400 mb-2" />
                    <p className="text-xs text-text-muted">Camera is muted</p>
                  </div>
                )}

                {/* Status Overlay */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] text-white">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Calibrated: {activeCompanyObj.name}</span>
                </div>
              </div>

              {/* Hardware Toggles */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => togglePreviewTrack("audio")}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isMicPreviewOn
                      ? "bg-white/10 hover:bg-white/20 text-white"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  }`}
                >
                  {isMicPreviewOn ? <Mic size={15} /> : <MicOff size={15} />}
                  <span>{isMicPreviewOn ? "Mic Active" : "Mic Muted"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => togglePreviewTrack("video")}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isCamPreviewOn
                      ? "bg-white/10 hover:bg-white/20 text-white"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  }`}
                >
                  {isCamPreviewOn ? <Video size={15} /> : <VideoOff size={15} />}
                  <span>{isCamPreviewOn ? "Cam Active" : "Cam Off"}</span>
                </button>
              </div>

              {/* Live Audio Level VU Meter */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-xs text-text-secondary mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Mic size={13} className="text-emerald-400" />
                    Microphone Input Level
                  </span>
                  <span className="font-mono text-[11px] text-emerald-400">
                    {isMicPreviewOn ? `${micLevel}%` : "Muted"}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-indigo-500 transition-all duration-75"
                    style={{ width: isMicPreviewOn ? `${Math.max(6, micLevel)}%` : "0%" }}
                  />
                </div>
                <p className="text-[11px] text-text-muted mt-1.5">
                  Speak aloud to verify your microphone responds properly.
                </p>
              </div>

              {/* Preferences checklist */}
              <div className="mt-5 space-y-2.5 pt-4 border-t border-white/10">
                <label className="flex items-center justify-between cursor-pointer text-xs text-text-secondary hover:text-white">
                  <span>Hands-Free Auto Voice Detection</span>
                  <input
                    type="checkbox"
                    checked={enableVoice}
                    onChange={(e) => setEnableVoice(e.target.checked)}
                    className="w-4 h-4 rounded accent-accent-purple cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer text-xs text-text-secondary hover:text-white">
                  <span>Enable Live Code & Whiteboard</span>
                  <input
                    type="checkbox"
                    checked={enableEditor}
                    onChange={(e) => setEnableEditor(e.target.checked)}
                    className="w-4 h-4 rounded accent-accent-cyan cursor-pointer"
                  />
                </label>
              </div>

              {/* Start Interview CTA */}
              <div className="mt-6">
                <Button
                  size="lg"
                  onClick={handleStart}
                  className="w-full py-4 font-bold text-base shadow-[0_0_30px_rgba(59,130,246,0.35)] flex items-center justify-center gap-2"
                >
                  <span>Enter {activeCompanyObj.name} Round</span>
                  <ArrowRight size={18} />
                </Button>
                <p className="text-[11px] text-center text-text-muted mt-2">
                  🔒 Encrypted room · Camera & audio stream stay on your device
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
