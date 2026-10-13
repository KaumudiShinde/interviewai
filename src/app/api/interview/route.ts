import { NextRequest, NextResponse } from "next/server";
import {
  buildInterviewSystemPrompt,
  INTERVIEWER_PERSONAS,
  TARGET_COMPANIES,
} from "@/lib/interview-prompts";

interface Message {
  role: "user" | "assistant" | "system" | "ai";
  content: string;
}

// Company-specific real interview question pools (MANG / Top Tech)
const companyQuestionPool: Record<string, Record<string, string[][]>> = {
  google: {
    technical: [
      [
        "Welcome to your Google Technical Round. Today, let's explore an algorithmic and memory efficiency problem: Design and implement a dynamic Prefix-Tree (Trie) with autocomplete that supports fuzzy typo matching (Levenshtein distance <= 1) and sub-millisecond prefix frequency queries. How would you structure your tree nodes and frequency rankings?",
        "Google processes billions of queries. How would you optimize your Trie memory footprint using Radix Trees (Patricia tries) or double-array representations?",
        "If multiple worker nodes need to serve autocompletions from an updated 100GB dictionary, how would you distribute the index and handle zero-downtime updates?",
        "Suppose network latency spikes during peak load. How would you implement client-side caching and predictive prefetching?",
        "We're nearing the end of the round. What questions do you have for me about Google's infrastructure team?",
      ],
      [
        "Welcome! Let's examine a core systems problem: Design and implement a Thread-Safe In-Memory Key-Value Store with Snapshot Isolation and Multi-Version Concurrency Control (MVCC). How would you track transaction read-timestamps and garbage-collect obsolete versions?",
        "Now, consider handling concurrent writes to the same key. Would you use optimistic concurrency control (OCC) or two-phase locking (2PL)? What are the tail latency implications under high write contention?",
        "If we scale this across Google Borg containers where machines can crash at any instant, how do you achieve atomic commits without single-point bottlenecks?",
        "How would you integrate a Write-Ahead Log (WAL) with group-commit batching to maximize SSD NVMe write throughput?",
        "Great technical analysis. Do you have any questions for me about engineering at Google?",
      ],
    ],
    "system-design": [
      [
        "Welcome to your Google System Design interview. Today, let's design Google Docs Real-Time Collaborative Editor supporting millions of concurrent documents and concurrent edits per second. Walk me through your high-level architecture and document synchronization model.",
        "Let's compare Operational Transformation (OT) versus Conflict-Free Replicated Data Types (CRDTs). Why would you pick one over the other for rich-text styling and offline conflict resolution?",
        "How would you design the WebSocket gateway cluster to scale to 50M concurrent persistent connections with sub-20ms broadcast latency?",
        "What happens when a regional network partition isolates users in Asia from North America? How is document state reconciled when connectivity restores?",
        "Outstanding design breakdown. Do you have any questions about large-scale distributed systems here at Google?",
      ],
    ],
    behavioral: [
      [
        "Welcome to your Googliness and Leadership round. Tell me about a time you worked on a technically ambiguous project where requirements were shifting rapidly. How did you define success and rally your team?",
        "Describe a situation where you identified a significant technical debt or scalability bottleneck in a codebase that wasn't assigned to you. How did you advocate for fixing it?",
        "Tell me about a time you had a strong disagreement with a peer or Tech Lead over an architectural decision. How did you evaluate both viewpoints objectively?",
        "How do you ensure psychological safety and mentor junior engineers while maintaining an extraordinarily high quality bar?",
        "Thank you for sharing those experiences. What questions do you have for me about team culture at Google?",
      ],
    ],
  },
  meta: {
    technical: [
      [
        "Welcome to your Meta Technical Round. We focus on fast execution and rock-solid code. Here is your problem: Implement an LRU-K Cache eviction policy that evicts the item whose K-th most recent access is furthest in the past, operating in O(1) time complexity. Walk me through your design and write the implementation in the editor.",
        "What happens when concurrent threads execute get() and put() simultaneously? How would you partition locks to minimize contention?",
        "Suppose memory usage spikes past 95% under high burst traffic. How would you handle dynamic shedding and priority-based cache invalidation?",
        "How would you test this implementation against concurrency race conditions and memory leaks?",
        "Excellent work under timed conditions. What questions do you have for me about Meta engineering?",
      ],
    ],
    "system-design": [
      [
        "Welcome to your Meta System Design round. Today, let's design the Meta News Feed / Instagram Stories ranking and delivery pipeline for 3 billion daily active users. Walk me through your ingestion, fanout-out-on-write vs fanout-on-read trade-offs, and storage hierarchy.",
        "How do you handle celebrities or accounts with 100M+ followers without causing celebrity fanout hot-spots?",
        "Walk me through your multi-tier caching layer (e.g. TAO graph cache / Memcached) and how you ensure read-after-write consistency for the poster.",
        "How does your ML feature retrieval pipeline assemble ranking signals in under 50ms before serving the feed?",
        "Great architectural breakdown! Do you have any questions about Meta's infrastructure scale?",
      ],
    ],
    behavioral: [
      [
        "Welcome to your Meta Behavioral interview. Meta's culture values moving fast, taking bold bets, and building for impact. Tell me about a time you took a calculated engineering risk to ship a high-priority feature quickly. What was the outcome?",
        "Describe a scenario where a feature you deployed caused a critical regression in production. How quickly did you remediate it and what post-mortem safeguards did you introduce?",
        "Tell me about a time you had to push back on a Product Manager's roadmap because it compromised system stability or scalability.",
        "How do you prioritize your time when balancing multiple critical initiatives across different teams?",
        "Thanks for that insight. Do you have any questions for me about working at Meta?",
      ],
    ],
  },
  amazon: {
    technical: [
      [
        "Welcome to your Amazon Technical Round. Let's look at an operational systems problem: Design and code an In-Memory Token Bucket and Leaky Bucket Rate Limiter supporting multi-tier customer SLAs, burst allowance, and strict O(1) latency. Walk me through your logic in the editor.",
        "How would you adapt this rate limiter to run across an AWS ECS cluster of 100 instances without overwhelming a central Redis cluster?",
        "In accordance with Amazon's 'Customer Obsession', how do you handle rate-limit degradation gracefully when a downstream dependency is throttling?",
        "What metrics and CloudWatch alarms would you emit to detect cascading failures before customers are impacted?",
        "Well done. Do you have any questions for me about our AWS and retail engineering stacks?",
      ],
    ],
    "system-design": [
      [
        "Welcome to Amazon System Design. Let's design Amazon's Prime Day Flash Sale & Inventory Reservation System. The system must process 500,000 checkout attempts per second for limited-stock items without ever overselling. Walk me through your architecture.",
        "How do you implement atomic inventory decrement with temporary cart hold timers (e.g. 10 minutes) across distributed DynamoDB partitions?",
        "How does your checkout pipeline withstand sudden 100x traffic surges without database connection pool exhaustion?",
        "If a payment gateway times out during checkout confirmation, how do you achieve strict idempotency and avoid double-charging customers?",
        "Fantastic architectural review! What questions do you have for me about building at Amazon scale?",
      ],
    ],
    behavioral: [
      [
        "Welcome to your Amazon Leadership Principles round. Let's dive deep into 'Customer Obsession' and 'Ownership'. Tell me about a time you went above and beyond for a customer or solved a problem outside your designated area of responsibility.",
        "Can you share an example where you 'Invented and Simplified'? What was a complex architectural problem you distilled into an elegant, maintainable solution?",
        "Tell me about a time you had to 'Have Backbone; Disagree and Commit'. What was the technical debate, how did you defend your position, and how did you execute once the decision was made?",
        "Give an example of a time you 'Delivered Results' against an aggressive timeline with limited resources.",
        "Thank you for those detailed STAR examples. What questions do you have for me about Amazon?",
      ],
    ],
  },
  netflix: {
    technical: [
      [
        "Welcome to your Netflix Technical Round. We value high autonomy and bulletproof resilience. Design and code a Distributed Circuit Breaker with Exponential Backoff, Jitter, and Fallback Handlers for microservice RPC calls. Walk me through your state machine (CLOSED, OPEN, HALF-OPEN).",
        "How do you dynamically compute error rate thresholds across sliding time windows using ring buffers without consuming excessive memory?",
        "If network latency spikes between AWS availability zones, how does your circuit breaker avoid false-positive trips while protecting downstream services?",
        "How do you test this against Chaos Engineering scenarios like simulated packet loss and CPU starvation?",
        "Superb breakdown. What questions do you have for me about Netflix's engineering culture of Freedom & Responsibility?",
      ],
    ],
    "system-design": [
      [
        "Welcome to Netflix System Design. Today, let's design a Global Adaptive Video Streaming & Edge CDN Delivery Network for 250M subscribers worldwide. Walk me through video ingestion, chunk transcoding (HLS/DASH), and manifest generation.",
        "Explain your Open Connect CDN edge caching strategy: how do you pre-position popular video chunks into ISP networks overnight before peak evening viewing?",
        "When an entire AWS region experiences a total outage during the finale of a blockbuster show, how does traffic seamlessly failover without viewer re-buffering?",
        "How do you collect and analyze telemetry from millions of smart TVs and devices in real-time to adjust adaptive bitrate algorithms?",
        "Exceptional architectural depth. What questions do you have for me about our streaming platform?",
      ],
    ],
    behavioral: [
      [
        "Welcome! Netflix culture is built on 'Freedom and Responsibility' and 'Context, Not Control'. Tell me about a time you operated with high autonomy to solve an open-ended engineering challenge without direct managerial oversight.",
        "How do you handle giving and receiving candid, critical feedback to peers and leadership?",
        "Describe a time when you identified that an ongoing engineering initiative was no longer adding business value and advocated to shut it down.",
        "How do you balance engineering perfectionism with the need to iterate and deploy quickly?",
        "Thank you. What questions would you like to ask me about life at Netflix?",
      ],
    ],
  },
  "yc-startup": {
    technical: [
      [
        "Welcome to your YC Startup Technical Round! We move fast and ship relentlessly. Here's a real-world problem: We need a high-performance Background Job Worker Queue in TypeScript/Python with concurrency limits, retry with exponential backoff, and dead-letter queues. Walk me through your design and write working code in the editor.",
        "How would you make this worker queue crash-resilient if the process dies midway through a 30-second job?",
        "We're launching on Product Hunt tomorrow and expect a 50x traffic surge. What is the single biggest bottleneck in your code, and how do we patch it in 1 hour?",
        "How do you balance writing unit tests vs shipping fast when you have a 3-week deadline to launch?",
        "Awesome energy! What questions do you have for me about our company vision and runway?",
      ],
    ],
    "system-design": [
      [
        "Welcome! We're building a fast-growing B2B AI SaaS product. Today, let's design a Multi-Tenant Real-Time AI Analytics Pipeline that streams events from customer webhooks, performs real-time deduplication, and exposes sub-100ms dashboard queries. Walk me through your stack choices.",
        "Startups don't have time to manage 10 distinct databases. Would you build this on Postgres with partitioned tables or spin up ClickHouse/Kafka right away? Defend your trade-off.",
        "How do you prevent noisy-neighbor problems where one massive enterprise client consumes all backend workers and starves smaller accounts?",
        "How would you monitor and secure this infrastructure on a bootstrap budget?",
        "Great practical mindset! What questions do you have for me about our engineering roadmap?",
      ],
    ],
    behavioral: [
      [
        "Welcome! At an early-stage startup, everyone wears multiple hats. Tell me about a time you had to learn an unfamiliar technology stack or domain in just a few days to unblock a company launch.",
        "Describe a situation where you had to prioritize ruthlessly between three critical feature requests with only 48 hours remaining before a client demo.",
        "Tell me about a product idea or engineering optimization you initiated completely on your own that drove measurable user growth.",
        "How do you handle ambiguous requirements when there is no product spec or design document?",
        "Love that initiative. What questions do you have for me about our founding team?",
      ],
    ],
  },
};

// Generic fallback pools for default / other setups
const genericQuestionPool: Record<string, string[][]> = {
  technical: [
    [
      "Let's dive into your coding and data structures round. Today I want you to design and implement an in-memory Key-Value Store with Transactional Support (BEGIN, COMMIT, ROLLBACK) and nested transactions. How would you model the state and rollback stack?",
      "Now, how would you handle concurrent transactions with snapshot isolation or optimistic concurrency control to prevent dirty reads?",
      "Suppose the dataset exceeds single-machine RAM (say 500GB). How would you partition the keys and maintain atomic multi-key transactions across shards?",
      "If a write-ahead log (WAL) is introduced for persistence, how would you optimize disk I/O and checkpointing without blocking live writes?",
      "We're wrapping up. Do you have any questions for me regarding our engineering stack or architecture challenges?",
    ],
  ],
  "system-design": [
    [
      "Welcome to your System Design round. Today, let's design a Global Real-Time Ride-Hailing Platform (like Uber or Lyft). The system must handle driver location updates every 4 seconds, geospatial proximity matching, and high-frequency ride matching. Walk me through your high-level architecture.",
      "Let's focus on geospatial indexing. Would you use Geohash, H3 hexagonal cells, or QuadTrees for fast spatial queries? What are the memory and write throughput trade-offs?",
      "How do you prevent race conditions when 10 drivers try to accept the same ride request at the exact same millisecond?",
      "During peak surge pricing, how does your pricing engine recalculate supply/demand elasticity in real-time without falling behind?",
      "Excellent discussion. We're at the end of the architectural design. Do you have any questions for me about our engineering challenges?",
    ],
  ],
  behavioral: [
    [
      "Welcome! Let's start with a key engineering project you led end-to-end. Can you walk me through the technical problem, the architectural trade-offs you evaluated, and the measurable impact on the business?",
      "Tell me about a time you had a fundamental disagreement with a Senior Architect or Product Manager on technical direction. How did you build consensus and what was the outcome?",
      "Describe the most severe production outage or post-mortem incident you personally investigated. What was the root cause and what architectural safeguards did you introduce?",
      "How do you balance shipping fast versus investing in refactoring and technical debt when product roadmap pressure is intense?",
      "Looking back at your recent engineering work, what is one major decision you would make differently today? We'll leave the remaining time for your questions for me.",
    ],
  ],
};

function getFallbackResponse(
  messages: Message[],
  type: string,
  personality: string,
  companyId?: string
) {
  const persona = INTERVIEWER_PERSONAS[personality] || INTERVIEWER_PERSONAS.alex;

  // Select company pool if available
  const compKey = companyId?.toLowerCase() || "";
  const matchedComp = TARGET_COMPANIES.find(
    (c) => c.id.toLowerCase() === compKey || c.name.toLowerCase() === compKey
  );

  let pool: string[][] = [];
  if (matchedComp && companyQuestionPool[matchedComp.id]?.[type]) {
    pool = companyQuestionPool[matchedComp.id][type];
  } else if (genericQuestionPool[type]) {
    pool = genericQuestionPool[type];
  } else {
    pool = genericQuestionPool.technical;
  }

  const questionSet = pool[0];
  const userMessages = messages.filter((m) => m.role === "user");
  const answerCount = Math.max(0, userMessages.length - 1);
  const lastUserMessage = userMessages[userMessages.length - 1]?.content || "";

  if (lastUserMessage.toLowerCase().includes("hint")) {
    if (type === "technical") {
      return "Here's an authentic interviewer hint: Focus on how you can achieve O(1) state transitions using an auxiliary hash map and doubly linked list, or consider monotonic queues.";
    }
    return "Hint: Consider isolating your stateful data persistence layer from stateless compute nodes, and analyze write amplification bottlenecks.";
  }

  if (lastUserMessage.toLowerCase().includes("clarify") || lastUserMessage.toLowerCase().includes("repeat")) {
    const currentQ = questionSet[Math.min(answerCount, questionSet.length - 1)];
    return `Let me clarify that problem statement: ${currentQ}`;
  }

  if (answerCount >= questionSet.length) {
    return `Thank you so much for your time today! You demonstrated strong technical depth and structured communication. I have everything I need to calibrate your hiring scorecard for ${matchedComp ? matchedComp.name : "our engineering team"}. Feel free to conclude the call when you're ready!`;
  }

  const nextQuestion = questionSet[answerCount];

  if (answerCount === 0) {
    const compGreeting = matchedComp ? ` at ${matchedComp.name}` : "";
    return `Hi! I'm ${persona.name}, ${persona.role}${compGreeting}. Great to meet you today. Let's dive straight into your ${type.replace("-", " ")} interview.\n\n${nextQuestion}`;
  }

  return `Thanks for walking through that. That gives me good visibility into your engineering trade-offs.\n\n${nextQuestion}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      messages,
      personality = "alex",
      type = "technical",
      difficulty = "medium",
      targetRole = "Senior Software Engineer",
      company = "google",
      sharedCode = "",
      sharedArchitecture = "",
    } = body as {
      messages: Message[];
      personality?: string;
      type?: string;
      difficulty?: string;
      targetRole?: string;
      company?: string;
      sharedCode?: string;
      sharedArchitecture?: string;
    };

    const systemPrompt = buildInterviewSystemPrompt(personality, type, difficulty, targetRole, company);
    const apiKey = process.env.GEMINI_API_KEY;

    let enrichedSystemPrompt = `${systemPrompt}

REALISTIC COMPANY-LEVEL RECRUITER & STAFF ENGINEER PROTOCOL:
- You are conducting an authentic interview loop at the target company level.
- Assess candidate's exact responses with high technical rigor (Big-O analysis, failure modes, trade-offs, STAR clarity).
- NEVER repeat a previously asked question. Generate fresh, industry-standard questions tailored to ${targetRole}.
- If the candidate provided code in the live editor, review and critique their code directly: point out any bugs, edge cases, or complexity improvements.
- Keep each spoken response punchy, natural, and conversational (1 to 3 short paragraphs max).
- Ask exactly ONE clear, thoughtful follow-up question per turn.`;

    if (sharedCode) {
      enrichedSystemPrompt += `\n\n[CANDIDATE'S CODE IMPLEMENTATION IN LIVE EDITOR]:\n\`\`\`\n${sharedCode}\n\`\`\`\nReview their code directly in your feedback.`;
    }
    if (sharedArchitecture) {
      enrichedSystemPrompt += `\n\n[CANDIDATE'S SYSTEM WHITEBOARD DIAGRAM]:\n${sharedArchitecture}\nComment on their diagram blocks and data flow.`;
    }

    if (apiKey && apiKey !== "your_gemini_api_key_here") {
      const geminiMessages = messages.map((msg: Message) => ({
        role: msg.role === "ai" || msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      // Try gemini-1.5-flash or gemini-2.5-flash
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: enrichedSystemPrompt }] },
              contents: geminiMessages,
              generationConfig: {
                temperature: 0.85,
                maxOutputTokens: 800,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const aiResponse =
            data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (aiResponse) {
            return NextResponse.json({ message: aiResponse });
          }
        } else {
          console.warn(`Gemini API returned status ${response.status}; checking fallback.`);
        }
      } catch (geminiErr) {
        console.error("Gemini call error:", geminiErr);
      }
    }

    // Dynamic realistic fallback
    await new Promise((resolve) => setTimeout(resolve, 600));
    return NextResponse.json({
      message: getFallbackResponse(messages, type, personality, company),
      fallback: true,
    });
  } catch (error) {
    console.error("Interview API error:", error);
    return NextResponse.json(
      { error: "Failed to process interview request" },
      { status: 500 }
    );
  }
}
