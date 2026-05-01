"use client";

import { useState, useEffect } from "react";
import { useEntity } from "@/contexts/entity-context";
import { useCompanyConfig } from "@/hooks/useCompanyConfig";
import { useExpenses } from "@/hooks/useExpenses";
import { useCfoChatHistory } from "@/hooks/useCfoChatHistory";
import { getCockpitMetrics } from "@/components/cockpit-bar";
import { CfoChatWindow } from "@/components/cfo-chat-window";
import { MessageSquarePlus, MessageSquare, Trash2, Loader2, Menu } from "lucide-react";
import type { CfoChatMessage } from "@/lib/types";

export default function CfoChatPage() {
  const { entity } = useEntity();
  
  // Get financial data for context injection
  const { sharedConfig, entityConfig } = useCompanyConfig(entity);
  const { monthlyBurn } = useExpenses(entity);
  const metrics = getCockpitMetrics(
    sharedConfig.totalFunds,
    monthlyBurn,
    entityConfig.monthlyIncome,
    sharedConfig.baselineOverhead
  );

  // Chat history hook
  const { threads, loading: historyLoading, createNewThread, getThreadMessages, deleteThread } = useCfoChatHistory(entity);

  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<CfoChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Initialize a thread if none exists once history is loaded
  useEffect(() => {
    if (!historyLoading && threads.length === 0 && !activeThreadId) {
      handleNewChat();
    } else if (!historyLoading && threads.length > 0 && !activeThreadId) {
      // Auto-select the most recent thread
      loadThread(threads[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyLoading, threads.length, activeThreadId]);

  const handleNewChat = async () => {
    const thread = await createNewThread();
    if (thread) {
      setActiveThreadId(thread.id);
      setActiveMessages([]);
      // On mobile, close sidebar when starting a new chat
      if (window.innerWidth < 1024) setSidebarOpen(false);
    }
  };

  const loadThread = async (threadId: string) => {
    setActiveThreadId(threadId);
    setMessagesLoading(true);
    const messages = await getThreadMessages(threadId);
    setActiveMessages(messages);
    setMessagesLoading(false);
    // On mobile, close sidebar when selecting a chat
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  return (
    <div className="h-[calc(100vh-80px)] md:h-screen flex flex-col page-fade-in relative">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950 shrink-0">
        <h1 className="font-bold text-zinc-100 uppercase tracking-widest text-sm">Conversational CFO</h1>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar History */}
        <div 
          className={`
            ${sidebarOpen ? 'flex' : 'hidden'} 
            lg:flex flex-col w-full lg:w-80 shrink-0 border-r border-zinc-800 bg-zinc-950
            absolute lg:relative inset-y-0 left-0 z-50 lg:z-auto transition-transform
          `}
        >
          <div className="p-4 border-b border-zinc-800">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-100 transition-colors group"
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                <MessageSquarePlus className="w-4 h-4 text-emerald-500" />
                New Chat
              </div>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {historyLoading ? (
              <div className="flex items-center justify-center p-8 opacity-50">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
              </div>
            ) : threads.length === 0 ? (
              <p className="text-center text-xs font-semibold text-zinc-600 mt-8 uppercase tracking-wider">
                No history yet
              </p>
            ) : (
              threads.map((thread) => (
                <div
                  key={thread.id}
                  className={`
                    group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors border
                    ${activeThreadId === thread.id 
                      ? 'bg-zinc-800/80 border-zinc-700 text-zinc-100' 
                      : 'bg-transparent border-transparent hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'}
                  `}
                  onClick={() => loadThread(thread.id)}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare className={`w-4 h-4 shrink-0 ${activeThreadId === thread.id ? 'text-emerald-500' : 'text-zinc-600'}`} />
                    <span className="text-sm font-medium truncate">
                      {/* Normally you'd generate a title with AI, here we fallback to Date or ID for simplicity if title is generic */}
                      {thread.title === 'New Conversation' ? new Date(thread.created_at).toLocaleDateString() : thread.title}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteThread(thread.id);
                      if (activeThreadId === thread.id) setActiveThreadId(null);
                    }}
                    className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 bg-zinc-950/50 relative overflow-hidden">
          {messagesLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500 opacity-50" />
            </div>
          ) : activeThreadId ? (
            // We use a key to force complete re-mount of the chat window when switching threads,
            // so useChat hook resets its internal state.
            <CfoChatWindow 
              key={activeThreadId}
              threadId={activeThreadId}
              initialHistory={activeMessages}
              metrics={metrics}
              entity={entity}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm font-bold text-zinc-600 uppercase tracking-widest">Select a chat to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
