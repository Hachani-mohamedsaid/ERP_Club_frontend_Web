import { parseApiError } from "../config";
import { apiFetchWithTimeout } from "../authHeaders";

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json() as Promise<T>;
}

export type MessageStatus = "sent" | "delivered" | "read";

export interface MessageContact {
  memberId: string;
  name: string;
  role: string;
  avatar: string;
  conversationId: string | null;
  preview: string;
  time: string;
  unread: number;
  online: boolean;
  typing: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  sent: boolean;
  time: string;
  status: MessageStatus;
}

export interface ContactsResponse {
  myMemberId: string;
  items: MessageContact[];
  searchResults?: MessageContact[];
}

export interface ThreadResponse {
  conversationId: string;
  peer: {
    memberId: string;
    name: string;
    role: string;
    avatar: string;
  };
  messages: ChatMessage[];
}

const fetchMsg = (path: string, init?: RequestInit, timeoutMs = 15000) =>
  apiFetchWithTimeout(path, init, timeoutMs).then(parse);

export const messagesApi = {
  getContacts: (search?: string) => {
    const q = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
    return fetchMsg(`/messages/contacts${q}`) as Promise<ContactsResponse>;
  },

  getThread: (peerMemberId: string) =>
    fetchMsg(`/messages/thread/${peerMemberId}`) as Promise<ThreadResponse>,

  sendMessage: (peerMemberId: string, body: string) =>
    fetchMsg(`/messages/thread/${peerMemberId}`, {
      method: "POST",
      body: JSON.stringify({ body }),
    }) as Promise<{
      conversationId: string;
      message: ChatMessage;
      peerMemberId: string;
    }>,

  markRead: (conversationId: string) =>
    fetchMsg(`/messages/conversations/${conversationId}/read`, {
      method: "PATCH",
    }) as Promise<{ marked: number }>,

  deleteConversation: (conversationId: string) =>
    fetchMsg(`/messages/conversations/${conversationId}`, {
      method: "DELETE",
    }) as Promise<{ deleted: boolean }>,
};
