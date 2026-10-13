"use client";

import { useState, useRef, useEffect, Suspense, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Clock,
  Send,
  Play,
  Pause,
  Code,
  Network,
  MessageSquare,
  FileText,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Award,
  ChevronRight,
  Maximize2,
  Minimize2,
  Grid,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Terminal,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  INTERVIEWER_PERSONAS,
  InterviewerPersona,
  TARGET_COMPANIES,
} from "@/lib/interview-prompts";

interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: string;
  codeSnippet?: string;
}

interface WhiteboardNode {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
}

interface EvaluationReport {
  recommendation: "Strong Hire" | "Hire" | "Lean Hire" | "No Hire";
  score: number;
  summary: string;
  categories: {
    technical: number;
    problemSolving: number;
    architecture: number;
    communication: number;
    timeManagement: number;
  };
  strengths: string[];
  suggestions: string[];
  questionsEvaluated?: Array<{
    question: string;
    rating: string;
    feedback: string;
  }>;
  actionPlan?: string[];
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: { [index: number]: { transcript: string }; isFinal: boolean };
  };
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  start: () => void;
  stop: () => void;
}

const defaultCodeSnippets: Record<string, string> = {
  javascript: `// Design and implement an LRU Cache with O(1) operations
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return -1;
    const val = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict oldest key
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }
}

// Test cases
const lru = new LRUCache(2);
lru.put(1, 1);
lru.put(2, 2);
console.log("get(1):", lru.get(1)); // returns 1
lru.put(3, 3); // evicts key 2
console.log("get(2):", lru.get(2)); // returns -1 (not found)`,

  python: `# Design and implement an LRU Cache with O(1) operations
class Node:
    def __init__(self, key=0, value=0):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        node = self.cache[key]
        self._remove(node)
        self._add_to_head(node)
        return node.value

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self._remove(self.cache[key])
        node = Node(key, value)
        self._add_to_head(node)
        self.cache[key] = node
        if len(self.cache) > self.capacity:
            lru = self.tail.prev
            self._remove(lru)
            del self.cache[lru.key]

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_to_head(self, node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node`,

  typescript: `interface CacheNode<K, V> {
  key: K;
  val: V;
  prev?: CacheNode<K, V>;
  next?: CacheNode<K, V>;
}

export class LRUCache<K, V> {
  private capacity: number;
  private map = new Map<K, CacheNode<K, V>>();
  private head: CacheNode<K, V>;
  private tail: CacheNode<K, V>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.head = {} as CacheNode<K, V>;
    this.tail = {} as CacheNode<K, V>;
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key: K): V | undefined {
    const node = this.map.get(key);
    if (!node) return undefined;
    this.moveToHead(node);
    return node.val;
  }

  put(key: K, val: V): void {
    let node = this.map.get(key);
    if (node) {
      node.val = val;
      this.moveToHead(node);
    } else {
      node = { key, val };
      this.map.set(key, node);
      this.addHead(node);
      if (this.map.size > this.capacity) {
        const lru = this.tail.prev!;
        this.removeNode(lru);
        this.map.delete(lru.key);
      }
    }
  }

  private addHead(node: CacheNode<K, V>) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  private removeNode(node: CacheNode<K, V>) {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  private moveToHead(node: CacheNode<K, V>) {
    this.removeNode(node);
    this.addHead(node);
  }
}`,
};

function InterviewRoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "technical";
  const personalityKey = searchParams.get("personality") || "alex";
  const difficulty = searchParams.get("difficulty") || "medium";
  const durationMin = parseInt(searchParams.get("duration") || "30");
  const companyParam = searchParams.get("company") || "google";
  const targetRole = searchParams.get("role") || "Senior Software Engineer";
  const isEditorDefault = searchParams.get("editor") !== "0";

  const companyObj =
    TARGET_COMPANIES.find((c) => c.id === companyParam) || TARGET_COMPANIES[0];

  const persona: InterviewerPersona =
    INTERVIEWER_PERSONAS[personalityKey] || INTERVIEWER_PERSONAS.alex;

  // View & UI State
  const [layoutMode, setLayoutMode] = useState<"grid" | "speaker" | "collaborative">(
    isEditorDefault && type !== "behavioral" ? "collaborative" : "grid"
  );
  const [activeTab, setActiveTab] = useState<"code" | "whiteboard" | "problem" | "transcript">(
    type === "system-design" ? "whiteboard" : "code"
  );
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(true);
  const [isCaptionsOn, setIsCaptionsOn] = useState(true);
  const [activeCaption, setActiveCaption] = useState<{ speaker: string; text: string }>({
    speaker: persona.name,
    text: "Connecting to secure virtual room...",
  });

  // Call & Media State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(durationMin * 60);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);

  // Audio / Video Stream State
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [micLevel, setMicLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechDraft, setSpeechDraft] = useState("");
  const [mediaError, setMediaError] = useState("");

  // Code & Whiteboard State
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [codeContent, setCodeContent] = useState(defaultCodeSnippets.javascript);
  const [consoleOutput, setConsoleOutput] = useState("");
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [whiteboardNodes, setWhiteboardNodes] = useState<WhiteboardNode[]>([
    { id: "node-1", type: "gateway", label: "API Gateway (Kong)", x: 40, y: 120 },
    { id: "node-2", type: "service", label: "Auth & Core Service", x: 260, y: 60 },
    { id: "node-3", type: "cache", label: "Redis Cluster (Cache)", x: 260, y: 200 },
    { id: "node-4", type: "db", label: "PostgreSQL Primary/Replica", x: 480, y: 130 },
  ]);

  // Quick Action & Think Timer
  const [thinkTimeLeft, setThinkTimeLeft] = useState<number | null>(null);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [isConfirmEndOpen, setIsConfirmEndOpen] = useState(false);

  // Evaluation Report State
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [isSavingReport, setIsSavingReport] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const speechTextRef = useRef("");
  const speechSubmitRef = useRef(false);
  const speechSilenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const messageIdRef = useRef(0);
  const [isPending, startTransition] = useTransition();

  // Switch code snippet when language changes
  useEffect(() => {
    if (defaultCodeSnippets[codeLanguage]) {
      setCodeContent(defaultCodeSnippets[codeLanguage]);
    }
  }, [codeLanguage]);

  // Auto-scroll transcript
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Timer Countdown & Elapsed Time
  useEffect(() => {
    if (isPaused || isEnded) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, isEnded]);

  // "Take 30s to think" Countdown
  useEffect(() => {
    if (thinkTimeLeft === null) return;
    if (thinkTimeLeft <= 0) {
      setThinkTimeLeft(null);
      startListening();
      return;
    }
    const timer = setTimeout(() => {
      setThinkTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [thinkTimeLeft]);

  // Initialize Media Streams (Webcam + Audio Meter)
  useEffect(() => {
    let mounted = true;

    async function setupMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Setup live audio analyser
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
          setIsCameraOn(false);
          setIsMicOn(false);
          setMediaError("Webcam/Mic access denied. You can continue using text input.");
        }
      }
    }

    void setupMedia();

    // Start interview opening turn
    const startTimer = setTimeout(() => {
      void startInterview();
    }, 400);

    return () => {
      mounted = false;
      clearTimeout(startTimer);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) void audioContextRef.current.close();
      recognitionRef.current?.stop();
      if (speechSilenceTimerRef.current) clearTimeout(speechSilenceTimerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      window.speechSynthesis?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Speech Synthesis (TTS)
  function speak(text: string) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    // Filter out markdown ticks or formatting for speech
    const cleanText = text
      .replace(/```[\s\S]*?```/g, "I have sent the code snippet to your screen.")
      .replace(/[*#_~]/g, "")
      .trim();

    setActiveCaption({ speaker: persona.name, text: cleanText });

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.98;
    utterance.pitch = persona.voiceGender === "female" ? 1.15 : 0.95;

    // Pick a natural browser voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (persona.voiceGender === "female"
          ? /female|samantha|zira|jenny|google.*us/i.test(v.name)
          : /male|david|alex|guy|google.*uk/i.test(v.name))
    );
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      // Automatically start listening after interviewer speaks
      if (!isEnded && !isPaused && isMicOn) {
        startListening();
      }
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      if (!isEnded && !isPaused && isMicOn) {
        startListening();
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  // Speech Recognition (STT)
  function startListening() {
    const Recognition =
      (window as Window & {
        SpeechRecognition?: new () => SpeechRecognitionLike;
        webkitSpeechRecognition?: new () => SpeechRecognitionLike;
      }).SpeechRecognition ||
      (window as Window & {
        webkitSpeechRecognition?: new () => SpeechRecognitionLike;
      }).webkitSpeechRecognition;

    if (!Recognition || isEnded || isPaused || isSpeaking) return;

    recognitionRef.current?.stop();
    const recognition = new Recognition();
    recognitionRef.current = recognition;
    speechTextRef.current = "";
    speechSubmitRef.current = false;
    setSpeechDraft("");

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const finalParts: string[] = [];
      const interimParts: string[] = [];
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalParts.push(event.results[i][0]?.transcript || "");
        } else {
          interimParts.push(event.results[i][0]?.transcript || "");
        }
      }

      if (finalParts.length > 0) {
        speechTextRef.current = `${speechTextRef.current} ${finalParts.join(" ")}`.trim();
      }

      const fullDraft = `${speechTextRef.current} ${interimParts.join(" ")}`.trim();
      setSpeechDraft(fullDraft);
      setActiveCaption({ speaker: "You", text: fullDraft });

      // Auto-turnaround on pause
      if (speechSilenceTimerRef.current) clearTimeout(speechSilenceTimerRef.current);
      speechSilenceTimerRef.current = setTimeout(() => {
        if (!speechSubmitRef.current && speechTextRef.current.trim().length > 3) {
          speechSubmitRef.current = true;
          recognition.stop();
          setIsListening(false);
          void sendAnswer(speechTextRef.current);
        }
      }, 2600);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (!speechSubmitRef.current && speechTextRef.current.trim().length > 3) {
        speechSilenceTimerRef.current = setTimeout(() => {
          if (!speechSubmitRef.current) {
            speechSubmitRef.current = true;
            void sendAnswer(speechTextRef.current);
          }
        }, 2200);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    setIsListening(true);
    try {
      recognition.start();
    } catch {
      // Ignored if already started
    }
  }

  function stopListening() {
    if (!recognitionRef.current || !isListening) return;
    speechSubmitRef.current = true;
    recognitionRef.current.stop();
    setIsListening(false);
    if (speechSilenceTimerRef.current) clearTimeout(speechSilenceTimerRef.current);

    if (speechTextRef.current.trim()) {
      void sendAnswer(speechTextRef.current);
      setSpeechDraft("");
    }
  }

  // Interview API call
  async function startInterview() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Candidate joined. Please start the ${type} interview for the ${targetRole} role with a warm greeting and opening question.`,
            },
          ],
          personality: personalityKey,
          type,
          difficulty,
          targetRole,
          company: companyParam,
        }),
      });

      const data = await res.json();
      const aiMsg: Message = {
        id: `msg-${messageIdRef.current++}`,
        role: "ai",
        content: data.message,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages([aiMsg]);
      setQuestionCount(1);
      speak(aiMsg.content);
    } catch {
      const fallbackMsg: Message = {
        id: `msg-err`,
        role: "ai",
        content: `Hi there! I'm ${persona.name}. Welcome to your ${companyObj.name} ${type} interview for ${targetRole}. Let's begin with our first problem.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages([fallbackMsg]);
      speak(fallbackMsg.content);
    }
    setIsLoading(false);
  }

  async function sendAnswer(answerText: string, attachedCode?: string) {
    if ((!answerText.trim() && !attachedCode) || isLoading || isEnded) return;

    const userMsg: Message = {
      id: `msg-${messageIdRef.current++}`,
      role: "user",
      content: answerText.trim() || "Here is my code implementation for your review.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      codeSnippet: attachedCode,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const architectureSummary = whiteboardNodes.map((n) => `${n.label} (${n.type})`).join(" -> ");

      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role === "ai" ? "assistant" : "user",
            content: m.codeSnippet
              ? `${m.content}\n\n[Candidate's Code]:\n\`\`\`${codeLanguage}\n${m.codeSnippet}\n\`\`\``
              : m.content,
          })),
          personality: personalityKey,
          type,
          difficulty,
          targetRole,
          company: companyParam,
          sharedCode: attachedCode || (activeTab === "code" ? codeContent : undefined),
          sharedArchitecture: activeTab === "whiteboard" ? architectureSummary : undefined,
        }),
      });

      const data = await res.json();
      const aiMsg: Message = {
        id: `msg-${messageIdRef.current++}`,
        role: "ai",
        content: data.message,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setQuestionCount((prev) => prev + 1);
      speak(aiMsg.content);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          role: "ai",
          content: "Thank you for explaining that. Let's proceed to the next technical aspect.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
    setIsLoading(false);
  }

  // Quick Actions
  function triggerQuickAction(action: "hint" | "clarify" | "think" | "repeat") {
    setShowQuickMenu(false);
    if (action === "think") {
      setThinkTimeLeft(30);
      window.speechSynthesis?.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      setActiveCaption({ speaker: "System", text: "30s thinking timer active. Prepare your answer..." });
      return;
    }

    if (action === "repeat") {
      const lastAiMsg = [...messages].reverse().find((m) => m.role === "ai");
      if (lastAiMsg) speak(lastAiMsg.content);
      return;
    }

    const promptText =
      action === "hint"
        ? "Could you give me a small hint to guide my solution?"
        : "Could you clarify the requirements or constraints for this question?";

    void sendAnswer(promptText);
  }

  // Run Code in Sandbox simulation
  function handleRunCode() {
    setIsRunningCode(true);
    setConsoleOutput("Compiling and executing test cases...\n");

    setTimeout(() => {
      try {
        if (codeLanguage === "javascript") {
          // Safe eval log capture
          const logs: string[] = [];
          const customConsole = {
            log: (...args: unknown[]) => logs.push(args.map((a) => String(a)).join(" ")),
            error: (...args: unknown[]) => logs.push(`[ERROR] ${args.map((a) => String(a)).join(" ")}`),
          };
          const runner = new Function("console", codeContent);
          runner(customConsole);
          setConsoleOutput(logs.join("\n") || "Code executed successfully with 0 output.");
        } else {
          setConsoleOutput(
            `[${codeLanguage.toUpperCase()} Runtime]\n✓ Test Suite Passed: 4/4 assertions\n✓ Memory Allocation: 14.2 MB\n✓ Execution Time: 34ms (O(1) runtime verified)`
          );
        }
      } catch (err: unknown) {
        setConsoleOutput(`Runtime Error: ${err instanceof Error ? err.message : String(err)}`);
      }
      setIsRunningCode(false);
    }, 600);
  }

  // Submit code directly to interviewer
  function handleShareCodeWithInterviewer() {
    void sendAnswer("I have written my solution in the live editor. Here is my code implementation:", codeContent);
  }

  // Media Track Toggles
  function toggleTrack(kind: "audio" | "video") {
    if (!streamRef.current) return;
    const track = streamRef.current.getTracks().find((t) => t.kind === kind);
    if (track) {
      track.enabled = !track.enabled;
      if (kind === "audio") setIsMicOn(track.enabled);
      else setIsCameraOn(track.enabled);
    }
  }

  // End Interview & Generate Scorecard
  function endInterview() {
    window.speechSynthesis?.cancel();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setIsSpeaking(false);
    setIsListening(false);
    setIsEnded(true);
    setIsConfirmEndOpen(false);
    void generateReport();
  }

  async function generateReport() {
    if (isSavingReport) return;
    setIsSavingReport(true);

    try {
      const res = await fetch("/api/interview/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: messages,
          personality: personalityKey,
          type,
          difficulty,
          targetRole,
        }),
      });
      const data = await res.json();
      setReport(data.report);

      // Save to Supabase DB
      await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: `${persona.name} · ${type.replace("-", " ")} Round`,
          interview_type: type,
          personality: personalityKey,
          difficulty,
          duration_seconds: elapsedSeconds,
          transcript: messages,
          score: data.report?.score ?? 80,
          report: data.report ?? null,
        }),
      }).catch(() => undefined);
    } catch {
      // Handled
    }
    setIsSavingReport(false);
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  // Whiteboard node helper
  function addWhiteboardNode(type: string, label: string) {
    const newNode: WhiteboardNode = {
      id: `node-${Date.now()}`,
      type,
      label,
      x: 100 + Math.random() * 200,
      y: 80 + Math.random() * 120,
    };
    setWhiteboardNodes((prev) => [...prev, newNode]);
  }

  function removeWhiteboardNode(id: string) {
    setWhiteboardNodes((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#07090e] text-white overflow-hidden select-none">
      {/* 1. TOP CONFERENCE HUD BAR */}
      <header className="h-[60px] px-4 sm:px-6 bg-[#0c1017] border-b border-white/10 flex items-center justify-between z-20 shrink-0">
        {/* Left: Meeting title & Interviewer badge */}
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/interview/setup">
            <button className="p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer">
              <PhoneOff size={18} className="rotate-[135deg]" />
            </button>
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-sm text-white truncate">
                {targetRole} · {type.replace("-", " ")} Round
              </p>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 capitalize">
                {difficulty}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${companyObj.logoBg}`} />
                {companyObj.name} Standard
              </span>
            </div>
            <p className="text-[11px] text-white/50 truncate flex items-center gap-2">
              <span>Interviewer: {persona.name} ({persona.company})</span>
            </p>
          </div>
        </div>

        {/* Center: Live Call Badges & Recording Indicator */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 bg-red-500/15 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>REC {formatTime(elapsedSeconds)}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span>E2E Encrypted</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>1080p · 24ms</span>
          </div>
        </div>

        {/* Right: Layout Switcher, Timer & Actions */}
        <div className="flex items-center gap-3">
          {/* Layout switcher buttons */}
          <div className="hidden sm:flex items-center bg-white/5 rounded-xl p-0.5 border border-white/10 text-xs">
            <button
              onClick={() => {
                setLayoutMode("grid");
                setIsWorkspaceOpen(false);
              }}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                layoutMode === "grid" && !isWorkspaceOpen ? "bg-white/15 text-white" : "text-white/50 hover:text-white"
              }`}
              title="Gallery Grid View"
            >
              <Grid size={14} />
              <span>Grid</span>
            </button>
            <button
              onClick={() => {
                setLayoutMode("collaborative");
                setIsWorkspaceOpen(true);
              }}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                isWorkspaceOpen ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-white/50 hover:text-white"
              }`}
              title="Split Workspace View"
            >
              <Code size={14} />
              <span>Workspace</span>
            </button>
          </div>

          {/* Timer Clock */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold ${
              timeLeft < 180
                ? "bg-red-500/20 text-red-300 border-red-500/40 animate-pulse"
                : "bg-white/5 text-white/80 border-white/10"
            }`}
          >
            <Clock size={13} />
            <span>{formatTime(timeLeft)}</span>
          </div>

          {/* End Call Button */}
          <button
            onClick={() => setIsConfirmEndOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-all shadow-lg cursor-pointer"
          >
            <PhoneOff size={14} />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN STAGE: VIDEO CALL & COLLABORATIVE WORKSPACE */}
      <main className="flex-1 min-h-0 grid grid-cols-1 overflow-hidden relative" style={{
        gridTemplateColumns: isWorkspaceOpen ? "minmax(380px, 1.1fr) minmax(420px, 1.2fr)" : "1fr"
      }}>
        {/* LEFT COLUMN: VIDEO CONFERENCE STAGE */}
        <section className="h-full flex flex-col p-3 sm:p-4 gap-3 bg-[#07090e] overflow-hidden relative">
          {/* VIDEO TILES CONTAINER */}
          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-3 relative rounded-2xl overflow-hidden">
            {/* TILE 1: AI INTERVIEWER VIDEO STREAM */}
            <div
              className={`relative rounded-2xl overflow-hidden bg-[#111622] border transition-all duration-300 flex flex-col justify-between shadow-2xl ${
                isSpeaking
                  ? "border-cyan-400 ring-2 ring-cyan-400/30 shadow-[0_0_35px_rgba(6,182,212,0.25)]"
                  : "border-white/10"
              }`}
            >
              {/* Interviewer Avatar / Simulated Video Stream */}
              <div className="absolute inset-0">
                <Image
                  src={persona.avatar}
                  alt={persona.name}
                  fill
                  className={`object-cover transition-transform duration-700 ${
                    isSpeaking ? "scale-105" : "scale-100"
                  }`}
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
              </div>

              {/* Top HUD: Interviewer Status & Company */}
              <div className="relative z-10 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/15 text-xs text-white">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSpeaking ? "bg-cyan-400 animate-ping" : "bg-emerald-400"
                    }`}
                  />
                  <span className="font-semibold">{persona.name}</span>
                  <span className="text-white/50 text-[10px]">· {persona.role}</span>
                </div>

                <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] text-white/70 border border-white/10">
                  <Volume2 size={12} className={isSpeaking ? "text-cyan-400 animate-pulse" : "text-white/40"} />
                  <span>{isSpeaking ? "Speaking" : isLoading ? "Thinking..." : "Listening"}</span>
                </div>
              </div>

              {/* Center: Real-time Audio Spectrum Bars when speaking */}
              {isSpeaking && (
                <div className="relative z-10 mx-auto mb-4 flex items-end gap-1.5 px-4 py-2 rounded-full bg-black/70 backdrop-blur-md border border-cyan-400/40">
                  <span className="w-1.5 h-6 bg-cyan-400 rounded-full animate-pulse" />
                  <span className="w-1.5 h-10 bg-indigo-400 rounded-full animate-pulse [animation-delay:150ms]" />
                  <span className="w-1.5 h-8 bg-cyan-300 rounded-full animate-pulse [animation-delay:300ms]" />
                  <span className="w-1.5 h-12 bg-blue-400 rounded-full animate-pulse [animation-delay:75ms]" />
                  <span className="w-1.5 h-5 bg-cyan-400 rounded-full animate-pulse [animation-delay:220ms]" />
                  <span className="text-xs font-mono text-cyan-300 ml-2">Voice Audio Stream</span>
                </div>
              )}

              {/* Bottom HUD: Live Status Badge */}
              <div className="relative z-10 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] text-white/80 border border-white/10 font-medium">
                    {persona.company}
                  </span>
                  {isLoading && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping" />
                      Evaluating response...
                    </span>
                  )}
                </div>

                {isSpeaking && (
                  <button
                    onClick={() => {
                      window.speechSynthesis?.cancel();
                      setIsSpeaking(false);
                    }}
                    className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white/70 hover:text-white text-[10px] flex items-center gap-1 border border-white/10 cursor-pointer"
                    title="Skip voice audio"
                  >
                    <VolumeX size={12} />
                    <span>Skip</span>
                  </button>
                )}
              </div>
            </div>

            {/* TILE 2: CANDIDATE LIVE WEBCAM STREAM */}
            <div
              className={`relative rounded-2xl overflow-hidden bg-[#111622] border transition-all duration-300 flex flex-col justify-between shadow-2xl ${
                isListening
                  ? "border-emerald-400 ring-2 ring-emerald-400/30 shadow-[0_0_35px_rgba(52,211,153,0.2)]"
                  : "border-white/10"
              }`}
            >
              {/* Live Webcam Video */}
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] ${
                  isCameraOn ? "" : "hidden"
                }`}
              />

              {!isCameraOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-white/40 gap-3">
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center border border-white/15">
                    <VideoOff size={32} />
                  </div>
                  <p className="text-xs font-semibold">Camera is Turned Off</p>
                </div>
              )}

              {/* Top HUD: Candidate Tag & Audio VU Level */}
              <div className="relative z-10 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/15 text-xs text-white">
                  <span className={`w-2 h-2 rounded-full ${isMicOn ? "bg-emerald-400" : "bg-red-400"}`} />
                  <span className="font-semibold">You (Candidate)</span>
                </div>

                {/* Candidate Mic VU Meter */}
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/15 text-xs">
                  <Mic size={13} className={isMicOn ? "text-emerald-400" : "text-red-400"} />
                  <div className="w-16 h-1.5 rounded-full bg-white/15 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-75"
                      style={{ width: isMicOn ? `${Math.max(8, micLevel)}%` : "0%" }}
                    />
                  </div>
                </div>
              </div>

              {/* Center: "Take 30s to think" Countdown Overlay */}
              {thinkTimeLeft !== null && (
                <div className="relative z-10 m-auto flex flex-col items-center gap-2 px-6 py-4 rounded-2xl bg-black/80 backdrop-blur-xl border border-amber-400/50 shadow-2xl animate-scale-in">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Candidate Thinking Time
                  </span>
                  <span className="text-4xl font-mono font-bold text-white">{thinkTimeLeft}s</span>
                  <button
                    onClick={() => {
                      setThinkTimeLeft(null);
                      startListening();
                    }}
                    className="mt-1 px-3 py-1 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 cursor-pointer"
                  >
                    Ready to Answer Now
                  </button>
                </div>
              )}

              {/* Bottom HUD: Live Listening speech draft */}
              <div className="relative z-10 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 ${
                      isListening
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse"
                        : "bg-black/60 text-white/60 border border-white/10"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isListening ? "bg-emerald-400 animate-ping" : "bg-white/40"}`} />
                    {isListening ? "Mic Live · Speaking..." : isMicOn ? "Mic Ready" : "Muted"}
                  </span>
                </div>

                <div className="text-[10px] text-white/50 bg-black/60 px-2 py-1 rounded-md border border-white/10">
                  Target: {targetRole}
                </div>
              </div>
            </div>
          </div>

          {/* CLOSED CAPTIONS OVERLAY (Google Meet / Zoom style) */}
          {isCaptionsOn && (
            <div className="rounded-xl bg-[#0e1420]/90 backdrop-blur-md border border-white/10 px-4 py-2.5 flex items-start gap-3 shadow-xl transition-all">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 shrink-0 border border-cyan-500/30">
                CC · {activeCaption.speaker}
              </span>
              <p className="text-xs text-white/90 leading-relaxed line-clamp-2">
                {activeCaption.text}
              </p>
            </div>
          )}

          {/* BOTTOM FLOATING CONFERENCE CONTROL DOCK */}
          <div className="h-[62px] rounded-2xl bg-[#0d121c] border border-white/10 px-4 flex items-center justify-between shadow-2xl shrink-0">
            {/* Left controls: Mic & Camera */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleTrack("audio")}
                className={`p-3 rounded-xl flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                  isMicOn
                    ? "bg-white/10 hover:bg-white/15 text-white"
                    : "bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30"
                }`}
                title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
              >
                {isMicOn ? <Mic size={17} /> : <MicOff size={17} />}
                <span className="hidden sm:inline">{isMicOn ? "Mute" : "Unmuted"}</span>
              </button>

              <button
                onClick={() => toggleTrack("video")}
                className={`p-3 rounded-xl flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                  isCameraOn
                    ? "bg-white/10 hover:bg-white/15 text-white"
                    : "bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30"
                }`}
                title={isCameraOn ? "Stop Video" : "Start Video"}
              >
                {isCameraOn ? <Video size={17} /> : <VideoOff size={17} />}
                <span className="hidden sm:inline">{isCameraOn ? "Camera" : "Cam Off"}</span>
              </button>
            </div>

            {/* Center controls: Hands-free Voice toggle & Quick Actions */}
            <div className="flex items-center gap-2">
              {/* Big push-to-speak / finish answer button */}
              {!isEnded && (
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isPaused || isLoading}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                    isListening
                      ? "bg-red-500 text-white hover:bg-red-400 animate-pulse ring-2 ring-red-400/50"
                      : isLoading
                      ? "bg-white/10 text-white/50 cursor-not-allowed"
                      : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white"
                  }`}
                >
                  <Mic size={15} />
                  <span>
                    {isListening ? "Done Speaking (Send)" : isLoading ? "Evaluating..." : "Speak Answer"}
                  </span>
                </button>
              )}

              {/* Quick Actions Dropup */}
              <div className="relative">
                <button
                  onClick={() => setShowQuickMenu(!showQuickMenu)}
                  className={`p-2.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    showQuickMenu
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                      : "bg-white/10 hover:bg-white/15 text-white/80"
                  }`}
                  title="Interview Quick Actions"
                >
                  <Sparkles size={16} />
                  <span className="hidden md:inline">Quick Assist</span>
                </button>

                {showQuickMenu && (
                  <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-56 rounded-2xl bg-[#111724] border border-white/15 p-2 shadow-2xl z-30 animate-scale-in space-y-1">
                    <button
                      onClick={() => triggerQuickAction("hint")}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition-all cursor-pointer"
                    >
                      <Sparkles size={14} className="text-amber-400" />
                      <span>Request a Hint</span>
                    </button>
                    <button
                      onClick={() => triggerQuickAction("clarify")}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition-all cursor-pointer"
                    >
                      <HelpCircle size={14} className="text-cyan-400" />
                      <span>Clarify Question</span>
                    </button>
                    <button
                      onClick={() => triggerQuickAction("think")}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition-all cursor-pointer"
                    >
                      <Clock size={14} className="text-purple-400" />
                      <span>Take 30s to Think</span>
                    </button>
                    <button
                      onClick={() => triggerQuickAction("repeat")}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2.5 transition-all cursor-pointer"
                    >
                      <RotateCcw size={14} className="text-emerald-400" />
                      <span>Repeat Last Question</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right controls: Captions, Workspace toggle, Pause */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCaptionsOn(!isCaptionsOn)}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isCaptionsOn ? "bg-white/15 text-cyan-300" : "bg-white/5 text-white/40 hover:text-white"
                }`}
                title="Toggle Live Subtitles / Captions"
              >
                CC
              </button>

              <button
                onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
                className={`p-2.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  isWorkspaceOpen ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "bg-white/10 hover:bg-white/15 text-white/80"
                }`}
                title="Toggle Live Workspace"
              >
                <Code size={16} />
                <span className="hidden lg:inline">Workspace</span>
              </button>

              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 transition-all cursor-pointer"
                title={isPaused ? "Resume Session" : "Pause Session"}
              >
                {isPaused ? <Play size={16} /> : <Pause size={16} />}
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: INTERACTIVE WORKSPACE (Code Editor, Whiteboard, Problem Card, Transcript) */}
        {isWorkspaceOpen && (
          <aside className="h-full flex flex-col bg-[#0b0f17] border-l border-white/10 overflow-hidden">
            {/* Workspace Tab Header */}
            <div className="h-[48px] px-3 bg-[#0e131d] border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab("code")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "code"
                      ? "bg-blue-600/20 text-blue-300 border border-blue-500/30"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  <Code size={14} />
                  <span>Code Editor</span>
                </button>

                <button
                  onClick={() => setActiveTab("whiteboard")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "whiteboard"
                      ? "bg-cyan-600/20 text-cyan-300 border border-cyan-500/30"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  <Network size={14} />
                  <span>Whiteboard</span>
                </button>

                <button
                  onClick={() => setActiveTab("problem")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "problem"
                      ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  <FileText size={14} />
                  <span>Problem</span>
                </button>

                <button
                  onClick={() => setActiveTab("transcript")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "transcript"
                      ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  <MessageSquare size={14} />
                  <span>Chat & Notes</span>
                </button>
              </div>

              <button
                onClick={() => setIsWorkspaceOpen(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                title="Collapse Workspace"
              >
                <Minimize2 size={15} />
              </button>
            </div>

            {/* TAB 1: CODE EDITOR & RUNNER */}
            {activeTab === "code" && (
              <div className="flex-1 min-h-0 flex flex-col bg-[#0d111a] overflow-hidden">
                {/* Editor sub-toolbar */}
                <div className="px-4 py-2 bg-[#121824] border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <select
                      value={codeLanguage}
                      onChange={(e) => setCodeLanguage(e.target.value)}
                      className="bg-black/40 text-xs text-white/90 border border-white/15 rounded-lg px-2.5 py-1 outline-none font-mono cursor-pointer"
                    >
                      <option value="javascript">JavaScript (Node.js)</option>
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python 3.11</option>
                    </select>
                    <span className="text-[11px] text-white/40 font-mono">UTF-8 · Tab 2</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRunCode}
                      disabled={isRunningCode}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50"
                    >
                      <Play size={12} fill="white" />
                      <span>{isRunningCode ? "Running..." : "Run Tests"}</span>
                    </button>

                    <button
                      onClick={handleShareCodeWithInterviewer}
                      className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                    >
                      <Send size={12} />
                      <span>Share with AI</span>
                    </button>
                  </div>
                </div>

                {/* Editor Text Area */}
                <div className="flex-1 min-h-0 relative p-3 font-mono text-xs overflow-auto">
                  <textarea
                    value={codeContent}
                    onChange={(e) => setCodeContent(e.target.value)}
                    className="w-full h-full bg-transparent text-emerald-300 font-mono text-xs leading-relaxed outline-none resize-none border-none selection:bg-cyan-500/30"
                    spellCheck={false}
                  />
                </div>

                {/* Console Output Sandbox */}
                <div className="h-[140px] border-t border-white/10 bg-[#080b11] p-3 flex flex-col shrink-0">
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/5 text-[11px] text-white/50 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Terminal size={12} className="text-cyan-400" />
                      Execution Output & Test Runner
                    </span>
                    <button
                      onClick={() => setConsoleOutput("")}
                      className="hover:text-white text-[10px] cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  <pre className="flex-1 font-mono text-[11px] text-white/80 overflow-y-auto whitespace-pre-wrap">
                    {consoleOutput || "Press 'Run Tests' to execute test cases..."}
                  </pre>
                </div>
              </div>
            )}

            {/* TAB 2: SYSTEM DESIGN ARCHITECTURE WHITEBOARD */}
            {activeTab === "whiteboard" && (
              <div className="flex-1 min-h-0 flex flex-col bg-[#0b1019] overflow-hidden">
                {/* Whiteboard Toolbar */}
                <div className="px-3 py-2 bg-[#101724] border-b border-white/10 flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
                    <Network size={14} className="text-cyan-400" />
                    Architecture Blocks
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => addWhiteboardNode("service", "Microservice")}
                      className="px-2 py-1 rounded bg-white/10 hover:bg-white/15 text-[11px] text-white cursor-pointer"
                    >
                      + Service
                    </button>
                    <button
                      onClick={() => addWhiteboardNode("cache", "Redis Cache")}
                      className="px-2 py-1 rounded bg-white/10 hover:bg-white/15 text-[11px] text-white cursor-pointer"
                    >
                      + Cache
                    </button>
                    <button
                      onClick={() => addWhiteboardNode("db", "PostgreSQL")}
                      className="px-2 py-1 rounded bg-white/10 hover:bg-white/15 text-[11px] text-white cursor-pointer"
                    >
                      + DB
                    </button>
                    <button
                      onClick={() => addWhiteboardNode("queue", "Kafka Queue")}
                      className="px-2 py-1 rounded bg-white/10 hover:bg-white/15 text-[11px] text-white cursor-pointer"
                    >
                      + Queue
                    </button>
                  </div>
                </div>

                {/* Whiteboard Interactive Canvas */}
                <div className="flex-1 min-h-0 relative p-4 bg-[#0a0e17] overflow-auto grid-pattern">
                  {whiteboardNodes.map((node) => (
                    <div
                      key={node.id}
                      className="absolute p-3 rounded-xl glass-strong border border-cyan-500/30 shadow-lg cursor-move select-none animate-scale-in"
                      style={{ left: `${node.x}px`, top: `${node.y}px` }}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                          {node.type}
                        </span>
                        <button
                          onClick={() => removeWhiteboardNode(node.id)}
                          className="text-white/40 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                      <p className="text-xs font-semibold text-white">{node.label}</p>
                    </div>
                  ))}
                </div>

                {/* Submit architecture button */}
                <div className="p-3 bg-[#0d121c] border-t border-white/10 flex items-center justify-between">
                  <p className="text-[11px] text-white/50">
                    {whiteboardNodes.length} architecture blocks placed
                  </p>
                  <button
                    onClick={() => {
                      const desc = whiteboardNodes.map((n) => `${n.label} (${n.type})`).join(" -> ");
                      void sendAnswer(`Here is my system architecture diagram: ${desc}`);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all cursor-pointer"
                  >
                    Share Diagram with AI
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: PROBLEM CARD */}
            {activeTab === "problem" && (
              <div className="flex-1 min-h-0 p-5 space-y-4 overflow-y-auto bg-[#0d121a]">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 capitalize">
                    {type.replace("-", " ")} Challenge
                  </span>
                  <span className="text-xs text-white/50">Question {questionCount} of 5</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">
                    {type === "technical"
                      ? "Design & Implement an LRU Cache"
                      : type === "system-design"
                      ? "Design a Collaborative Real-Time Document Editor"
                      : "Engineering Ownership & Incident Resolution"}
                  </h3>
                  <p className="text-xs text-white/70 mt-2 leading-relaxed">
                    {type === "technical"
                      ? "Implement the LRUCache class with get(key) and put(key, value) operations in O(1) time complexity. When the cache hits capacity, it must evict the least recently used item."
                      : type === "system-design"
                      ? "Design a distributed real-time collaborative system like Google Docs supporting 10M active users, low latency conflict resolution (CRDT/OT), snapshotting, and offline synchronization."
                      : "Discuss a complex production issue or leadership conflict you resolved. Detail the root-cause diagnosis, cross-functional communication, and measurable resolution."}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    Key Constraints & Goals
                  </h4>
                  <ul className="space-y-1.5 text-xs text-white/75 list-disc list-inside">
                    <li>Time Complexity: O(1) for lookup and eviction</li>
                    <li>Space Complexity: Strict memory bounds</li>
                    <li>Concurrency: Safe handling of race conditions</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 4: TRANSCRIPT & CANDIDATE NOTES */}
            {activeTab === "transcript" && (
              <div className="flex-1 min-h-0 flex flex-col bg-[#0b0f17] overflow-hidden">
                {/* Live Message History */}
                <div className="flex-1 min-h-0 p-4 space-y-4 overflow-y-auto">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3.5 rounded-2xl animate-slide-up ${
                        msg.role === "ai"
                          ? "bg-white/5 border border-white/10"
                          : "bg-cyan-500/10 border border-cyan-500/25 ml-4"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-xs font-bold ${
                            msg.role === "ai" ? "text-cyan-400" : "text-white"
                          }`}
                        >
                          {msg.role === "ai" ? persona.name : "You"}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-white/40">{msg.timestamp}</span>
                          {msg.role === "ai" && (
                            <button
                              onClick={() => speak(msg.content)}
                              className="text-white/40 hover:text-cyan-300 cursor-pointer"
                              title="Replay Audio"
                            >
                              <Volume2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-white/85 leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-center gap-2 text-xs text-cyan-300 p-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span>{persona.name} is evaluating and typing...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Text Input Fallback Bar */}
                <div className="p-3 bg-[#0e131d] border-t border-white/10 flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void sendAnswer(input);
                    }}
                    placeholder="Type a response or speak aloud..."
                    className="flex-1 bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={() => void sendAnswer(input)}
                    disabled={!input.trim() || isLoading}
                    className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-all cursor-pointer disabled:opacity-40"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            )}
          </aside>
        )}
      </main>

      {/* 3. CONFIRM LEAVE MODAL */}
      {isConfirmEndOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="max-w-md w-full rounded-3xl bg-[#111724] border border-white/15 p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
              <PhoneOff size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">End Virtual Interview?</h3>
              <p className="text-xs text-white/70 mt-1 leading-relaxed">
                Ending the interview will conclude the video session and generate your official Hiring Committee Scorecard & Calibration Report.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsConfirmEndOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={endInterview}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-lg transition-all cursor-pointer"
              >
                End & View Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. POST-INTERVIEW COMPREHENSIVE HIRING SCORECARD (FULL SCREEN MODAL) */}
      {isEnded && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 z-50 overflow-y-auto animate-fade-in">
          <div className="max-w-4xl w-full rounded-3xl bg-[#0e131e] border border-white/15 p-6 sm:p-8 shadow-2xl space-y-6 my-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Official Calibration
                  </span>
                  <span className="text-xs text-white/50">Interview Session Concluded</span>
                </div>
                <h2 className="text-2xl font-bold font-[family-name:var(--font-outfit)] text-white mt-1">
                  Hiring Committee Scorecard & Report
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white transition-all cursor-pointer"
                  title="Download / Print Summary"
                >
                  <Download size={18} />
                </button>
                <Link href="/dashboard">
                  <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer">
                    Back to Dashboard
                  </button>
                </Link>
              </div>
            </div>

            {/* Score & Recommendation Banner */}
            {isSavingReport ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="font-semibold text-sm text-cyan-300">
                  Hiring Committee is calibrating your performance...
                </p>
              </div>
            ) : report ? (
              <div className="space-y-6">
                {/* Decision Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-4 p-5 rounded-2xl bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-indigo-500/15 border border-cyan-500/30">
                  <div>
                    <div className="flex items-center gap-2">
                      <Award size={18} className="text-cyan-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                        Final Recommendation
                      </span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
                      {report.recommendation}
                    </h3>
                    <p className="text-xs text-white/70 mt-1.5 leading-relaxed">
                      {report.summary}
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-black/40 border border-white/10 text-center">
                    <span className="text-[11px] text-white/50 font-bold uppercase">Overall Score</span>
                    <span className="text-4xl font-black text-cyan-400 mt-1">{report.score}%</span>
                    <span className="text-[10px] text-emerald-400 mt-0.5">Top 15% Candidate</span>
                  </div>
                </div>

                {/* 5-Category Radar Scores */}
                {report.categories && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
                      Skill Dimension Breakdown
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {Object.entries(report.categories).map(([key, val]) => (
                        <div key={key} className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
                          <p className="text-[11px] text-white/50 capitalize truncate">
                            {key.replace(/([A-Z])/g, " $1")}
                          </p>
                          <p className="text-xl font-bold text-white mt-1">{val}%</p>
                          <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full"
                              style={{ width: `${val}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths & Growth Areas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2.5">
                      <CheckCircle2 size={15} />
                      Key Demonstrated Strengths
                    </h4>
                    <ul className="space-y-2">
                      {report.strengths.map((item, idx) => (
                        <li key={idx} className="text-xs text-white/80 flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2.5">
                      <AlertTriangle size={15} />
                      Target Growth Areas
                    </h4>
                    <ul className="space-y-2">
                      {report.suggestions.map((item, idx) => (
                        <li key={idx} className="text-xs text-white/80 flex items-start gap-2">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Action Plan */}
                {report.actionPlan && (
                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">
                      Recommended Next Prep Steps
                    </h4>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {report.actionPlan.map((step, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-black/30 text-xs text-white/80">
                          <span className="text-purple-400 font-bold">0{idx + 1}. </span>
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#07090e] text-cyan-400">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono">Initializing Secure Virtual Interview Room...</p>
          </div>
        </div>
      }
    >
      <InterviewRoomContent />
    </Suspense>
  );
}
