"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { CfoChatThread, CfoChatMessage, Entity } from "@/lib/types";

export function useCfoChatHistory(entity: Entity) {
  const [threads, setThreads] = useState<CfoChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchThreads() {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("cfo_chat_threads")
          .select("*")
          .eq("entity", entity)
          .eq("user_id", session.user.id)
          .order("updated_at", { ascending: false });

        if (error) throw error;

        if (isMounted && data) {
          setThreads(data.map(d => ({
            ...d,
            created_at: new Date(d.created_at),
            updated_at: new Date(d.updated_at),
          })));
        }
      } catch (e) {
        if (isMounted) {
          console.error("Failed to fetch chat threads:", e);
          setError(e instanceof Error ? e.message : "Failed to load chat history");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchThreads();

    return () => {
      isMounted = false;
    };
  }, [entity]);

  const createNewThread = async (title: string = "New Conversation"): Promise<CfoChatThread | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const { data, error } = await supabase
        .from("cfo_chat_threads")
        .insert({
          user_id: session.user.id,
          entity,
          title,
        })
        .select()
        .single();

      if (error) throw error;

      const newThread = {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      };

      setThreads(prev => [newThread, ...prev]);
      return newThread;
    } catch (e) {
      console.error("Failed to create thread:", e);
      return null;
    }
  };

  const getThreadMessages = async (threadId: string): Promise<CfoChatMessage[]> => {
    try {
      const { data, error } = await supabase
        .from("cfo_chat_messages")
        .select("*")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      return data.map(d => ({
        ...d,
        created_at: new Date(d.created_at),
      }));
    } catch (e) {
      console.error("Failed to fetch messages for thread", threadId, e);
      return [];
    }
  };

  const deleteThread = async (threadId: string) => {
    try {
      setThreads(prev => prev.filter(t => t.id !== threadId));
      const { error } = await supabase
        .from("cfo_chat_threads")
        .delete()
        .eq("id", threadId);

      if (error) throw error;
    } catch (e) {
      console.error("Failed to delete thread:", e);
      // We could add the thread back to state on failure, but for now simple optimistic update is fine.
    }
  };

  return {
    threads,
    loading,
    error,
    createNewThread,
    getThreadMessages,
    deleteThread,
    setThreads
  };
}
