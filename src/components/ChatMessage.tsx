"use client";

import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  role: "ai" | "user";
  content: string;
  isTyping?: boolean;
  timestamp?: string;
}

export default function ChatMessage({
  role,
  content,
  isTyping = false,
  timestamp,
}: ChatMessageProps) {
  const isAI = role === "ai";

  return (
    <div
      className={`flex gap-3 ${isAI ? "justify-start" : "justify-end"} animate-slide-up`}
    >
      {isAI && (
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center shadow-lg">
          <Bot size={18} className="text-white" />
        </div>
      )}

      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
          isAI
            ? "glass-strong rounded-tl-sm"
            : "bg-gradient-to-r from-accent-blue to-accent-purple text-white rounded-tr-sm"
        }`}
      >
        {isTyping ? (
          <div className="flex items-center gap-1.5 py-1">
            <span className="w-2 h-2 bg-accent-purple rounded-full animate-typing" />
            <span
              className="w-2 h-2 bg-accent-purple rounded-full animate-typing"
              style={{ animationDelay: "0.2s" }}
            />
            <span
              className="w-2 h-2 bg-accent-purple rounded-full animate-typing"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
        ) : (
          <>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
            {timestamp && (
              <p
                className={`text-[10px] mt-2 ${
                  isAI ? "text-text-muted" : "text-white/60"
                }`}
              >
                {timestamp}
              </p>
            )}
          </>
        )}
      </div>

      {!isAI && (
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-bg-tertiary border border-border-default flex items-center justify-center">
          <User size={18} className="text-text-secondary" />
        </div>
      )}
    </div>
  );
}
