"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { Send, User, BrainCircuit, Loader2 } from "lucide-react";
import type { CfoChatMessage, CockpitMetrics, Entity } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CfoChatWindowProps {
  threadId: string;
  initialHistory: CfoChatMessage[];
  metrics: CockpitMetrics;
  entity: Entity;
}

export function CfoChatWindow({ threadId, initialHistory, metrics, entity }: CfoChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Map our DB format to the ai/react format
  const formattedInitialMessages = initialHistory.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant" | "system" | "data",
    content: m.content,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chatOptions: any = {
    api: "/api/cfo-chat",
    initialMessages: formattedInitialMessages,
    body: {
      threadId,
      entity,
      metrics,
    },
  };
  const chat = useChat(chatOptions);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { messages, input, handleInputChange, handleSubmit, isLoading } = chat as any;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-full bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden shadow-sm relative">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <BrainCircuit className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-100">Flowwled AI CFO</h2>
            <p className="text-xs text-zinc-500 font-medium">Using live data from your ledger</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 px-4">
            <BrainCircuit className="w-12 h-12 text-zinc-600 mb-4" />
            <h3 className="text-lg font-bold text-zinc-300">Ask your AI CFO anything.</h3>
            <p className="text-sm text-zinc-500 max-w-[300px] mt-2">
              Try asking about your burn rate, runway, or whether you can afford a new expense.
            </p>
          </div>
        ) : (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          messages.map((m: any) => (
            <div
              key={m.id}
              className={cn(
                "flex gap-4 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className="shrink-0 mt-0.5">
                {m.role === "user" ? (
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                    <User className="w-4 h-4 text-zinc-400" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)]">
                    <BrainCircuit className="w-4 h-4 text-zinc-950" />
                  </div>
                )}
              </div>
              
              <div
                className={cn(
                  "px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm",
                  m.role === "user"
                    ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-300"
                )}
              >
                {/* A simple way to render basic markdown/newlines without importing react-markdown */}
                <div className="whitespace-pre-wrap font-medium">
                  {m.content}
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && messages[messages.length - 1]?.role === "user" && (
           <div className="flex gap-4 max-w-[85%] mr-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="shrink-0 mt-0.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)]">
                  <BrainCircuit className="w-4 h-4 text-zinc-950" />
                </div>
             </div>
             <div className="px-4 py-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce"></span>
             </div>
           </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-zinc-900 border-t border-zinc-800 shrink-0">
        <form
          onSubmit={handleSubmit}
          className="relative max-w-4xl mx-auto flex items-center"
        >
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask your CFO about your finances..."
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-3.5 pl-4 pr-12 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors shadow-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2 rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 transition-all"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
        <p className="text-center text-[10px] text-zinc-600 mt-3 uppercase tracking-widest font-bold">
          AI can make mistakes. Check important numbers.
        </p>
      </div>
    </div>
  );
}
