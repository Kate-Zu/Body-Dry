import { create } from 'zustand';
import { chatApi } from '../api/endpoints';

export interface ChatMessage {
  id?: string;
  isUser: boolean;
  text?: string;
  metadata?: any;
  // Frontend-only fields (not persisted as separate DB columns)
  options?: any[];
  analysis?: any;
  mealPlan?: any;
}

export interface Conversation {
  id: string;
  type: string; // 'dry_plan' | 'recipes'
  title: string;
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatState {
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;

  fetchConversations: (type?: string) => Promise<void>;
  createConversation: (type: string) => Promise<string | null>;
  loadConversation: (id: string) => Promise<ChatMessage[] | null>;
  saveMessages: (conversationId: string, messages: ChatMessage[], title?: string) => Promise<boolean>;
  deleteConversation: (id: string) => Promise<boolean>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  isLoading: false,
  error: null,

  fetchConversations: async (type?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await chatApi.getConversations(type);
      set({ conversations: response.data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      set({ error: 'Failed to load chat history', isLoading: false });
    }
  },

  createConversation: async (type: string) => {
    try {
      const response = await chatApi.createConversation(type);
      return response.data.id;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      return null;
    }
  },

  loadConversation: async (id: string) => {
    try {
      const response = await chatApi.getConversation(id);
      const raw = response.data.messages || [];
      // Re-hydrate metadata fields back to top-level message props
      return raw.map((m: any) => {
        const msg: ChatMessage = {
          id: m.id,
          isUser: m.isUser,
          text: m.text,
        };
        if (m.metadata) {
          if (m.metadata.options) msg.options = m.metadata.options;
          if (m.metadata.analysis) msg.analysis = m.metadata.analysis;
          if (m.metadata.mealPlan) msg.mealPlan = m.metadata.mealPlan;
          // Preserve any other metadata keys
          msg.metadata = m.metadata;
        }
        return msg;
      });
    } catch (error) {
      console.error('Failed to load conversation:', error);
      return null;
    }
  },

  saveMessages: async (conversationId: string, messages: ChatMessage[], title?: string) => {
    try {
      // Serialize frontend message format into API format
      const serialized = messages.map((m) => {
        const msg: any = {
          isUser: m.isUser,
          text: m.text || null,
        };
        // Pack special fields into metadata
        const metadata: any = {};
        if (m.options) metadata.options = m.options;
        if (m.analysis) metadata.analysis = m.analysis;
        if (m.mealPlan) metadata.mealPlan = m.mealPlan;
        if (Object.keys(metadata).length > 0) msg.metadata = metadata;
        return msg;
      });

      await chatApi.saveMessages({ conversationId, title, messages: serialized });
      return true;
    } catch (error) {
      console.error('Failed to save messages:', error);
      return false;
    }
  },

  deleteConversation: async (id: string) => {
    try {
      await chatApi.deleteConversation(id);
      set({ conversations: get().conversations.filter((c) => c.id !== id) });
      return true;
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      return false;
    }
  },
}));
