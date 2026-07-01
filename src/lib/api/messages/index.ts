import { parseApiError } from "../config";
import { apiFetch } from "../authHeaders";

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

export const messagesApi = {
  getContacts: (search?: string) => {
    const q = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
    return apiFetch(`/messages/contacts${q}`).then(parse<ContactsResponse>);
  },

  getThread: (peerMemberId: string) =>
    apiFetch(`/messages/thread/${peerMemberId}`).then(parse<ThreadResponse>),

  sendMessage: (peerMemberId: string, body: string) =>
    apiFetch(`/messages/thread/${peerMemberId}`, {
      method: "POST",
      body: JSON.stringify({ body }),
    }).then(parse<{
      conversationId: string;
      message: ChatMessage;
      peerMemberId: string;
    }>),

  markRead: (conversationId: string) =>
    apiFetch(`/messages/conversations/${conversationId}/read`, {
      method: "PATCH",
    }).then(parse<{ marked: number }>),
};
