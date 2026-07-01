import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { getAccessToken } from "../lib/api/authHeaders";
import {
  messagesApi,
  type ChatMessage,
  type MessageContact,
  type MessageStatus,
} from "../lib/api/messages";

function socketBaseUrl() {
  if (import.meta.env.DEV) return window.location.origin;
  return (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function useMessages() {
  const [contacts, setContacts] = useState<MessageContact[]>([]);
  const [myMemberId, setMyMemberId] = useState<string | null>(null);
  const [selectedPeerId, setSelectedPeerId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [threadLoading, setThreadLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
  const [typingPeers, setTypingPeers] = useState<Set<string>>(new Set());

  const socketRef = useRef<Socket | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedPeerIdRef = useRef<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const searchRef = useRef("");
  const myMemberIdRef = useRef<string | null>(null);
  const onlineIdsRef = useRef<Set<string>>(new Set());
  const typingPeersRef = useRef<Set<string>>(new Set());
  const skipNextSearchRef = useRef(true);

  selectedPeerIdRef.current = selectedPeerId;
  conversationIdRef.current = conversationId;
  searchRef.current = search;
  myMemberIdRef.current = myMemberId;
  onlineIdsRef.current = onlineIds;
  typingPeersRef.current = typingPeers;

  const applyPresence = useCallback((list: MessageContact[]) => {
    const online = onlineIdsRef.current;
    const typing = typingPeersRef.current;
    return list.map((c) => ({
      ...c,
      online: online.has(c.memberId),
      typing: typing.has(c.memberId),
    }));
  }, []);

  const loadContacts = useCallback(async (q?: string, options?: { isSearch?: boolean }) => {
    const isSearch = options?.isSearch ?? false;
    if (isSearch) setSearching(true);
    else setLoading(true);
    try {
      const data = await messagesApi.getContacts(q);
      setMyMemberId(data.myMemberId);
      myMemberIdRef.current = data.myMemberId;
      const list = q?.trim() ? (data.searchResults ?? data.items) : data.items;
      setContacts(applyPresence(list));
      setError(null);
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Impossible de charger les conversations.";
      const msg =
        raw.includes("404") || raw.includes("Not Found") || raw.includes("Cannot GET")
          ? "Module Messages en cours de déploiement — réessayez dans 1 à 2 minutes."
          : raw.includes("abort") || raw.includes("Abort")
            ? "Délai dépassé — vérifiez la connexion au serveur."
            : raw;
      setError(msg);
    } finally {
      if (isSearch) setSearching(false);
      else setLoading(false);
    }
  }, [applyPresence]);

  const loadThread = useCallback(async (peerMemberId: string) => {
    setThreadLoading(true);
    try {
      const data = await messagesApi.getThread(peerMemberId);
      setConversationId(data.conversationId);
      setMessages(data.messages);
      setContacts((prev) =>
        prev.map((c) =>
          c.memberId === peerMemberId
            ? { ...c, unread: 0, preview: data.messages.at(-1)?.text ?? c.preview, conversationId: data.conversationId }
            : c,
        ),
      );
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de charger la conversation.");
    } finally {
      setThreadLoading(false);
    }
  }, []);

  const selectPeer = useCallback(
    async (peerMemberId: string) => {
      setSelectedPeerId(peerMemberId);
      setContacts((prev) =>
        prev.map((c) => (c.memberId === peerMemberId ? { ...c, unread: 0 } : c)),
      );
      await loadThread(peerMemberId);
    },
    [loadThread],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!selectedPeerId || !text.trim()) return;
      const peerId = selectedPeerId;
      const optimistic: ChatMessage = {
        id: `tmp-${Date.now()}`,
        text: text.trim(),
        sent: true,
        time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        status: "sent",
      };
      setMessages((prev) => [...prev, optimistic]);
      setContacts((prev) =>
        prev.map((c) =>
          c.memberId === peerId
            ? {
                ...c,
                preview: optimistic.text,
                time: optimistic.time,
                conversationId: c.conversationId ?? "pending",
              }
            : c,
        ),
      );

      try {
        const result = await messagesApi.sendMessage(peerId, text);
        setConversationId(result.conversationId);
        setMessages((prev) =>
          prev.map((m) => (m.id === optimistic.id ? { ...result.message, status: "sent" } : m)),
        );
        setContacts((prev) =>
          prev.map((c) =>
            c.memberId === peerId
              ? {
                  ...c,
                  conversationId: result.conversationId,
                  preview: result.message.text,
                  time: result.message.time,
                }
              : c,
          ),
        );
        void loadContacts(searchRef.current.trim() ? searchRef.current : undefined);
      } catch (e) {
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setError(e instanceof Error ? e.message : "Envoi impossible.");
      }
    },
    [selectedPeerId, loadContacts],
  );

  const deleteConversation = useCallback(async () => {
    if (!conversationId) return;
    try {
      await messagesApi.deleteConversation(conversationId);
      setMessages([]);
      setConversationId(null);
      setSelectedPeerId(null);
      await loadContacts(searchRef.current.trim() ? searchRef.current : undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Suppression impossible.");
    }
  }, [conversationId, loadContacts]);

  const markThreadRead = useCallback(async () => {
    if (!conversationId) return;
    try {
      await messagesApi.markRead(conversationId);
      setContacts((prev) =>
        prev.map((c) => (c.memberId === selectedPeerIdRef.current ? { ...c, unread: 0 } : c)),
      );
    } catch {
      /* silent */
    }
  }, [conversationId]);

  const emitTyping = useCallback((active: boolean) => {
    if (!selectedPeerIdRef.current || !socketRef.current) return;
    socketRef.current.emit(active ? "typing:start" : "typing:stop", {
      peerMemberId: selectedPeerIdRef.current,
    });
  }, []);

  const onInputChange = useCallback(
    (value: string) => {
      emitTyping(!!value.trim());
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => emitTyping(false), 1200);
    },
    [emitTyping],
  );

  useEffect(() => {
    void loadContacts();
  }, [loadContacts]);

  useEffect(() => {
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      void loadContacts(search.trim() || undefined, { isSearch: !!search.trim() });
    }, 300);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [search, loadContacts]);

  useEffect(() => {
    setContacts((prev) => applyPresence(prev));
  }, [onlineIds, typingPeers, applyPresence]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    const socket = io(`${socketBaseUrl()}/messages`, {
      path: "/socket.io",
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setError((prev) => (prev?.includes("temps réel") ? null : prev));
    });

    socket.on("connect_error", () => {
      setError("Connexion temps réel indisponible — messages en mode différé.");
    });

    socket.on("presence:sync", (data: { onlineMemberIds: string[] }) => {
      setOnlineIds(new Set(data.onlineMemberIds ?? []));
    });

    socket.on("presence:update", (data: { memberId: string; online: boolean }) => {
      setOnlineIds((prev) => {
        const next = new Set(prev);
        if (data.online) next.add(data.memberId);
        else next.delete(data.memberId);
        return next;
      });
    });

    socket.on("typing:start", (data: { memberId: string }) => {
      setTypingPeers((prev) => new Set(prev).add(data.memberId));
    });

    socket.on("typing:stop", (data: { memberId: string }) => {
      setTypingPeers((prev) => {
        const next = new Set(prev);
        next.delete(data.memberId);
        return next;
      });
    });

    socket.on(
      "message:new",
      (data: {
        conversationId: string;
        message: ChatMessage;
        sender: { memberId: string };
      }) => {
        const fromPeer = data.sender.memberId;
        const activePeer = selectedPeerIdRef.current;
        setContacts((prev) =>
          prev.map((c) =>
            c.memberId === fromPeer
              ? {
                  ...c,
                  conversationId: data.conversationId,
                  preview: data.message.text,
                  time: data.message.time,
                  unread: activePeer === fromPeer ? 0 : c.unread + 1,
                }
              : c,
          ),
        );

        if (activePeer === fromPeer) {
          setMessages((prev) => [...prev, { ...data.message, sent: false, status: "read" }]);
          setConversationId(data.conversationId);
          socket.emit("message:delivered", {
            messageId: data.message.id,
            conversationId: data.conversationId,
            senderMemberId: fromPeer,
          });
          void messagesApi.markRead(data.conversationId);
        } else {
          void loadContacts(searchRef.current.trim() ? searchRef.current : undefined);
        }
      },
    );

    socket.on("message:status", (data: { messageId: string; status: MessageStatus }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === data.messageId ? { ...m, status: data.status } : m)),
      );
    });

    socket.on("message:read", (data: { conversationId: string }) => {
      if (data.conversationId === conversationIdRef.current) {
        setMessages((prev) => prev.map((m) => (m.sent ? { ...m, status: "read" } : m)));
      }
    });

    socket.on("conversation:deleted", (data: { conversationId: string }) => {
      if (data.conversationId === conversationIdRef.current) {
        setMessages([]);
        setConversationId(null);
        setSelectedPeerId(null);
      }
      void loadContacts(searchRef.current.trim() ? searchRef.current : undefined);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [applyPresence, loadContacts]);

  const selected =
    contacts.find((c) => c.memberId === selectedPeerId) ??
    (selectedPeerId
      ? {
          memberId: selectedPeerId,
          name: "…",
          role: "",
          avatar: "?",
          conversationId,
          preview: "",
          time: "",
          unread: 0,
          online: onlineIds.has(selectedPeerId),
          typing: typingPeers.has(selectedPeerId),
        }
      : null);

  return {
    contacts,
    selected,
    selectedPeerId,
    selectPeer,
    messages,
    search,
    setSearch,
    sendMessage,
    onInputChange,
    deleteConversation,
    markThreadRead,
    loading,
    searching,
    threadLoading,
    error,
    myMemberId,
    onlineCount: [...onlineIds].filter((id) => id !== myMemberId).length,
  };
}
