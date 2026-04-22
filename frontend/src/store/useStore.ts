import { create } from "zustand";
import type { NavPage, ChatMessage } from "@/types";

interface AppState {
  // Navigation
  page: NavPage;
  setPage: (p: NavPage) => void;

  // Chat
  messages: ChatMessage[];
  addMessage: (msg: Omit<ChatMessage, "id" | "ts">) => void;
  aiReady: boolean;
  setAiReady: (v: boolean) => void;
  aiStatus: string;
  setAiStatus: (s: string) => void;
}

export const useStore = create<AppState>((set) => ({
  page: "overview",
  setPage: (page) => set({ page }),

  messages: [],
  addMessage: (msg) =>
    set((s) => ({
      messages: [
        ...s.messages,
        { ...msg, id: crypto.randomUUID(), ts: Date.now() },
      ],
    })),

  aiReady: false,
  setAiReady: (aiReady) => set({ aiReady }),

  aiStatus: "Initializing…",
  setAiStatus: (aiStatus) => set({ aiStatus }),
}));
