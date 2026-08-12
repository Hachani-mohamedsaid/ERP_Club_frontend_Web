import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Search, MoreHorizontal, Check, CheckCheck, Smile, Trash2, Mail, Loader2 } from "lucide-react";
import { useMessages } from "../hooks/useMessages";
import { useAuth } from "../contexts/AuthContext";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { parseAttachmentMessage, resolveAttachmentUrl, formatMessagePreview } from "../lib/messages/attachment";

/** Default (all roles except doctor) */
const ORANGE = { primary: "#FF7A00", success: "#22C55E", muted: "var(--text-muted)", onPrimary: "#ffffff" };

/** Option A — Steel clinical (doctor only) */
const STEEL = {
  primary: "#38bdf8",
  success: "#34d399",
  muted: "#94a3b8",
  slate: "#64748b",
  white: "#f8fafc",
  onPrimary: "#0f172a",
};

const QUICK_EMOJIS = ["😀", "😂", "😍", "👍", "👏", "🔥", "⚽", "🏆", "💪", "🙏", "✅", "❤️", "😅", "🎉", "👋", "💼"];

function RoleBadge({
  role,
  compact,
  primary,
}: {
  role: string;
  compact?: boolean;
  primary: string;
}) {
  return (
    <span
      className={`shrink-0 rounded-full font-bold uppercase tracking-wide ${compact ? "px-1.5 py-0.5 text-[8px]" : "px-2 py-0.5 text-[9px]"}`}
      style={{
        background: `${primary}24`,
        color: primary,
        border: `1px solid ${primary}59`,
      }}
    >
      {role}
    </span>
  );
}

function MessageContent({ text }: { text: string }) {
  const attachment = parseAttachmentMessage(text);
  if (attachment?.type === "image") {
    const src = resolveAttachmentUrl(attachment.url);
    return (
      <a href={src} target="_blank" rel="noopener noreferrer" className="block">
        <img
          src={src}
          alt={attachment.name}
          className="max-h-64 max-w-[min(100%,280px)] rounded-xl object-cover"
          loading="lazy"
        />
        <p className="mt-1.5 text-[10px] opacity-80">{attachment.name}</p>
      </a>
    );
  }
  return <span className="whitespace-pre-wrap break-words">{text}</span>;
}

export function MessagesPage() {
  const { user } = useAuth();
  const isDoctor = user?.role === "medical";
  const S = isDoctor
    ? { primary: STEEL.primary, success: STEEL.success, muted: STEEL.muted, onPrimary: STEEL.onPrimary }
    : ORANGE;

  const {
    contacts,
    selected,
    selectedPeerId,
    selectPeer,
    messages,
    search,
    setSearch,
    sendMessage,
    sendImage,
    onInputChange,
    deleteConversation,
    markThreadUnread,
    loading,
    searching,
    threadLoading,
    error,
    onlineCount,
  } = useMessages();

  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedPeerId && contacts.length > 0) {
      void selectPeer(contacts[0].memberId);
    }
  }, [contacts, selectedPeerId, selectPeer]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, selectedPeerId]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleSend = () => {
    const text = input.trim();
    if (!text || !selectedPeerId) return;
    void sendMessage(text);
    setInput("");
    onInputChange("");
    setShowEmoji(false);
  };

  const insertEmoji = (emoji: string) => {
    setInput((prev) => prev + emoji);
    onInputChange(input + emoji);
  };

  const handleFilePick = (file: File | null) => {
    if (!file || !selectedPeerId) return;
    if (!file.type.startsWith("image/")) {
      return;
    }
    setUploadingImage(true);
    void sendImage(file).finally(() => {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  };

  const handleDeleteConversation = async () => {
    setDeleting(true);
    try {
      await deleteConversation();
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const panelBorder = isDoctor ? "rgba(100,116,139,0.4)" : "var(--surface-panel-border)";
  const panelBg = isDoctor
    ? "linear-gradient(180deg, rgba(56,189,248,0.04) 0%, var(--surface-panel-solid) 28%)"
    : "var(--surface-panel-solid)";

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1
            className="text-lg font-extrabold"
            style={{ color: isDoctor ? STEEL.white : "var(--text-primary)" }}
          >
            Messages
          </h1>
          <p className="mt-0.5 text-xs" style={{ color: isDoctor ? STEEL.slate : "var(--text-muted)" }}>
            {isDoctor
              ? `${onlineCount} en ligne · Messagerie clinique`
              : `${onlineCount} en ligne · Communication interne`}
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5"
          style={{
            background: isDoctor ? `${STEEL.success}14` : "rgba(34,197,94,0.08)",
            borderColor: isDoctor ? `${STEEL.success}40` : "rgba(34,197,94,0.25)",
          }}
        >
          <div className="h-2 w-2 animate-pulse rounded-full" style={{ background: S.success }} />
          <span className="text-[10px] font-bold" style={{ color: S.success }}>
            {onlineCount} online
          </span>
        </div>
      </div>

      {error && (
        <div
          className="mb-3 rounded-xl border px-3 py-2 text-xs"
          style={{ borderColor: "rgba(239,68,68,0.35)", color: "#f87171", background: "rgba(239,68,68,0.08)" }}
        >
          {error}
        </div>
      )}

      <div className="flex h-[70vh] min-h-[500px] gap-3">
        {/* Contacts */}
        <div
          className={`flex w-72 shrink-0 flex-col overflow-hidden border ${isDoctor ? "rounded-2xl" : "rounded-[20px]"}`}
          style={{
            background: isDoctor ? panelBg : "var(--surface-panel-solid)",
            borderColor: panelBorder,
            borderTop: isDoctor ? `2px solid ${STEEL.primary}` : undefined,
          }}
        >
          <div className="border-b p-3" style={{ borderColor: panelBorder }}>
            <div
              className="flex items-center gap-2 rounded-xl border px-3 py-1.5"
              style={{
                background: isDoctor ? "rgba(100,116,139,0.14)" : "var(--surface-input)",
                borderColor: panelBorder,
              }}
            >
              <Search size={12} style={{ color: isDoctor ? STEEL.slate : "var(--text-muted)" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un membre..."
                className="flex-1 bg-transparent text-xs outline-none"
                style={{ color: isDoctor ? STEEL.white : "var(--text-primary)" }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="px-3 py-6 text-center text-xs" style={{ color: S.muted }}>
                Chargement des conversations...
              </p>
            ) : searching ? (
              <p className="px-3 py-6 text-center text-xs" style={{ color: S.muted }}>
                Recherche...
              </p>
            ) : contacts.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs leading-relaxed" style={{ color: S.muted }}>
                {search.trim()
                  ? "Aucun membre trouvé."
                  : "Aucune conversation. Tapez un nom ci-dessus pour démarrer."}
              </p>
            ) : (
              contacts.map((conv) => {
                const isSel = conv.memberId === selectedPeerId;
                const isSearchResult = !!search.trim();
                return (
                  <motion.button
                    key={conv.memberId}
                    type="button"
                    onClick={() => void selectPeer(conv.memberId)}
                    className="flex w-full items-start gap-3 px-3 py-3 text-left"
                    style={{
                      background: isSel ? `${S.primary}14` : "transparent",
                      borderLeft: isSel ? `3px solid ${S.primary}` : "3px solid transparent",
                    }}
                    whileHover={{ background: isSel ? `${S.primary}14` : "var(--surface-hover)" }}
                  >
                    <div className="relative shrink-0">
                      <div
                        className={`flex h-10 w-10 items-center justify-center text-xs font-extrabold ${isDoctor ? "rounded-xl" : "rounded-2xl"}`}
                        style={{
                          background: isSel
                            ? isDoctor
                              ? `${STEEL.primary}28`
                              : `linear-gradient(135deg,${S.primary},${S.primary}99)`
                            : isDoctor
                              ? "rgba(100,116,139,0.25)"
                              : "linear-gradient(135deg,rgba(255,255,255,0.12),var(--surface-input))",
                          color: isSel
                            ? isDoctor
                              ? STEEL.primary
                              : "#fff"
                            : isDoctor
                              ? STEEL.muted
                              : "#fff",
                          border: isDoctor ? `1px solid ${isSel ? `${STEEL.primary}55` : "rgba(100,116,139,0.35)"}` : undefined,
                        }}
                      >
                        {conv.avatar}
                      </div>
                      {conv.online && (
                        <div
                          className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2"
                          style={{ background: S.success, borderColor: "var(--surface-panel-solid)" }}
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex min-w-0 flex-1 items-center gap-1.5">
                          <p
                            className="truncate text-xs font-bold"
                            style={{ color: isSel ? S.primary : isDoctor ? STEEL.white : "var(--text-primary)" }}
                          >
                            {conv.name}
                          </p>
                          {isSearchResult && <RoleBadge role={conv.role} compact primary={S.primary} />}
                        </div>
                        {conv.time && !isSearchResult && (
                          <span className="shrink-0 text-[9px]" style={{ color: S.muted }}>{conv.time}</span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-[10px]" style={{ color: conv.typing ? S.primary : S.muted }}>
                        {conv.typing ? (
                          <span className="animate-pulse">●●● est en train d&apos;écrire...</span>
                        ) : isSearchResult ? (
                          <span style={{ color: S.muted }}>Appuyez pour démarrer une conversation</span>
                        ) : (
                          formatMessagePreview(conv.preview) || ""
                        )}
                      </p>
                    </div>

                    {conv.unread > 0 && (
                      <div
                        className="flex h-4.5 min-w-[18px] shrink-0 items-center justify-center rounded-full px-1 text-[9px] font-black"
                        style={{
                          background: S.primary,
                          color: isDoctor ? STEEL.onPrimary : "#fff",
                        }}
                      >
                        {conv.unread}
                      </div>
                    )}
                  </motion.button>
                );
              })
            )}
          </div>
        </div>

        {/* Thread */}
        <div
          className={`flex flex-1 flex-col overflow-hidden border ${isDoctor ? "rounded-2xl" : "rounded-[20px]"}`}
          style={{
            background: isDoctor ? panelBg : "var(--surface-panel-solid)",
            borderColor: panelBorder,
            borderTop: isDoctor ? `2px solid ${STEEL.primary}` : undefined,
          }}
        >
          {!selected ? (
            <div className="flex flex-1 items-center justify-center text-sm" style={{ color: S.muted }}>
              Recherchez un membre ou sélectionnez une conversation.
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: panelBorder }}>
                <div className="relative shrink-0">
                  <div
                    className={`flex h-10 w-10 items-center justify-center text-xs font-extrabold ${isDoctor ? "rounded-xl" : "rounded-2xl"}`}
                    style={{
                      background: isDoctor ? `${STEEL.primary}28` : `linear-gradient(135deg,${S.primary},${S.primary}99)`,
                      color: isDoctor ? STEEL.primary : "#fff",
                      border: isDoctor ? `1px solid ${STEEL.primary}55` : undefined,
                    }}
                  >
                    {selected.avatar}
                  </div>
                  {selected.online && (
                    <div
                      className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2"
                      style={{ background: S.success, borderColor: "var(--surface-panel-solid)" }}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className="truncate text-sm font-extrabold"
                      style={{ color: isDoctor ? STEEL.white : "var(--text-primary)" }}
                    >
                      {selected.name}
                    </p>
                    <RoleBadge role={selected.role} primary={S.primary} />
                  </div>
                  <p className="text-[10px]" style={{ color: selected.online ? S.success : S.muted }}>
                    {selected.typing ? "En train d'écrire..." : selected.online ? "En ligne" : "Hors ligne"}
                  </p>
                </div>
                <div className="relative shrink-0" ref={menuRef}>
                  <motion.button
                    type="button"
                    onClick={() => setShowMenu((o) => !o)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border"
                    style={{ borderColor: panelBorder, color: S.muted }}
                    whileHover={{ scale: 1.1, borderColor: S.primary, color: S.primary }}
                  >
                    <MoreHorizontal size={14} />
                  </motion.button>
                  <AnimatePresence>
                    {showMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.97 }}
                        className="absolute right-0 top-full z-20 mt-1 min-w-[200px] overflow-hidden rounded-xl border py-1 shadow-xl"
                        style={{ background: "var(--surface-panel-solid)", borderColor: panelBorder }}
                      >
                        {selected.conversationId && (
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-white/5"
                            style={{ color: isDoctor ? STEEL.white : "var(--text-primary)" }}
                            onClick={() => {
                              void markThreadUnread();
                              setShowMenu(false);
                            }}
                          >
                            <Mail size={13} /> Marquer comme non lue
                          </button>
                        )}
                        {selected.conversationId && (
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-white/5"
                            style={{ color: "#f87171" }}
                            onClick={() => {
                              setShowMenu(false);
                              setShowDeleteConfirm(true);
                            }}
                          >
                            <Trash2 size={13} /> Supprimer la conversation
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {threadLoading ? (
                  <p className="py-8 text-center text-xs" style={{ color: S.muted }}>Chargement...</p>
                ) : messages.length === 0 ? (
                  <div className="flex h-full min-h-[200px] flex-col items-center justify-center px-6 text-center">
                    <p className="text-sm font-semibold" style={{ color: isDoctor ? STEEL.white : "var(--text-primary)" }}>
                      Nouvelle conversation
                    </p>
                    <p className="mt-1 text-xs leading-relaxed" style={{ color: S.muted }}>
                      Aucun message pour l&apos;instant. Écrivez ci-dessous pour démarrer — la conversation apparaîtra dans votre liste après le premier envoi.
                    </p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => {
                      const attachment = parseAttachmentMessage(msg.text);
                      const isImage = attachment?.type === "image";
                      return (
                        <motion.div
                          key={msg.id}
                          layout
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className={`flex ${msg.sent ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`flex max-w-[75%] items-end gap-2 ${msg.sent ? "flex-row-reverse" : "flex-row"}`}>
                            {!msg.sent && (
                              <div
                                className={`mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center text-[10px] font-bold ${isDoctor ? "rounded-lg" : "rounded-xl"}`}
                                style={{
                                  background: isDoctor
                                    ? "rgba(100,116,139,0.3)"
                                    : "linear-gradient(135deg,rgba(255,255,255,0.15),var(--surface-panel-border))",
                                  color: isDoctor ? STEEL.muted : "#fff",
                                }}
                              >
                                {selected.avatar[0]}
                              </div>
                            )}
                            <div>
                              <div
                                className={`text-sm leading-relaxed ${isDoctor ? "rounded-xl" : "rounded-2xl"} ${isImage ? "p-1.5" : "px-4 py-2.5"}`}
                                style={
                                  msg.sent
                                    ? isDoctor
                                      ? {
                                          background: isImage ? `${STEEL.primary}22` : STEEL.primary,
                                          color: isImage ? STEEL.white : STEEL.onPrimary,
                                          borderBottomRightRadius: 6,
                                        }
                                      : {
                                          background: isImage
                                            ? "rgba(255,122,0,0.15)"
                                            : `linear-gradient(135deg,${S.primary},${S.primary}dd)`,
                                          color: "white",
                                          borderBottomRightRadius: 6,
                                        }
                                    : isDoctor
                                      ? {
                                          background: "rgba(100,116,139,0.18)",
                                          color: STEEL.white,
                                          borderBottomLeftRadius: 6,
                                          border: "1px solid rgba(100,116,139,0.4)",
                                          borderLeft: `3px solid ${STEEL.slate}`,
                                        }
                                      : {
                                          background: "var(--surface-input)",
                                          color: "var(--text-primary)",
                                          borderBottomLeftRadius: 6,
                                          border: "1px solid var(--surface-panel-border)",
                                        }
                                }
                              >
                                <MessageContent text={msg.text} />
                              </div>
                              <div
                                className={`mt-0.5 flex items-center gap-1 text-[9px] ${msg.sent ? "justify-end" : "justify-start"}`}
                                style={{ color: S.muted }}
                              >
                                {msg.time}
                                {msg.sent && (
                                  msg.status === "read" ? <CheckCheck size={10} style={{ color: S.primary }} /> :
                                  msg.status === "delivered" ? <CheckCheck size={10} /> :
                                  <Check size={10} />
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}

                <AnimatePresence>
                  {selected.typing && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-end gap-2"
                    >
                      <div
                        className={`flex h-7 w-7 items-center justify-center text-[10px] font-bold ${isDoctor ? "rounded-lg" : "rounded-xl"}`}
                        style={{
                          background: isDoctor
                            ? "rgba(100,116,139,0.3)"
                            : "linear-gradient(135deg,rgba(255,255,255,0.15),var(--surface-panel-border))",
                          color: isDoctor ? STEEL.muted : "#fff",
                        }}
                      >
                        {selected.avatar[0]}
                      </div>
                      <div
                        className={`px-4 py-3 ${isDoctor ? "rounded-xl" : "rounded-2xl"}`}
                        style={{
                          background: isDoctor ? "rgba(100,116,139,0.18)" : "var(--surface-input)",
                          border: `1px solid ${panelBorder}`,
                        }}
                      >
                        <div className="flex items-center gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ background: isDoctor ? STEEL.primary : "rgba(255,255,255,0.45)" }}
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={bottomRef} />
              </div>

              <div className="relative border-t p-3" style={{ borderColor: panelBorder }}>
                <AnimatePresence>
                  {showEmoji && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute bottom-full left-3 z-10 mb-2 flex max-w-[280px] flex-wrap gap-1 rounded-xl border p-2"
                      style={{ background: "var(--surface-panel-solid)", borderColor: panelBorder }}
                    >
                      {QUICK_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-lg hover:bg-white/10"
                          onClick={() => insertEmoji(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFilePick(e.target.files?.[0] ?? null)}
                />

                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border disabled:opacity-50"
                    style={{ borderColor: panelBorder, color: S.muted }}
                    whileHover={{ scale: uploadingImage ? 1 : 1.1, borderColor: S.primary, color: S.primary }}
                    title="Joindre une image"
                  >
                    {uploadingImage ? <Loader2 size={14} className="animate-spin" /> : <Paperclip size={14} />}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setShowEmoji((o) => !o)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
                    style={{
                      borderColor: showEmoji ? `${S.primary}50` : panelBorder,
                      color: showEmoji ? S.primary : S.muted,
                    }}
                    whileHover={{ scale: 1.1 }}
                    title="Emoji"
                  >
                    <Smile size={14} />
                  </motion.button>
                  <div
                    className="flex flex-1 items-center gap-2 rounded-xl border px-3 py-2"
                    style={{
                      background: isDoctor ? "rgba(100,116,139,0.14)" : "var(--surface-input)",
                      borderColor: panelBorder,
                    }}
                  >
                    <input
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        onInputChange(e.target.value);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                      placeholder="Écrire un message..."
                      className="flex-1 bg-transparent text-sm outline-none"
                      style={{ color: isDoctor ? STEEL.white : "var(--text-primary)" }}
                    />
                  </div>
                  <motion.button
                    type="button"
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="flex h-9 w-9 items-center justify-center rounded-xl disabled:opacity-30"
                    style={{
                      background: input.trim()
                        ? isDoctor
                          ? STEEL.primary
                          : `linear-gradient(135deg,${S.primary},${S.primary}cc)`
                        : isDoctor
                          ? "rgba(100,116,139,0.2)"
                          : "var(--surface-input)",
                    }}
                    whileHover={{ scale: input.trim() ? 1.1 : 1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Send size={14} style={{ color: input.trim() ? S.onPrimary : S.muted }} />
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <ConfirmDialog
            title="Supprimer la conversation"
            description={
              <>
                Cette conversation avec <strong style={{ color: "var(--text-primary)" }}>{selected?.name}</strong> sera
                supprimée de votre liste. L&apos;historique restera visible pour l&apos;autre membre.
              </>
            }
            confirmLabel="Supprimer"
            cancelLabel="Annuler"
            variant="danger"
            loading={deleting}
            onConfirm={() => void handleDeleteConversation()}
            onCancel={() => {
              if (!deleting) setShowDeleteConfirm(false);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
