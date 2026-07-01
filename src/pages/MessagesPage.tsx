import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Search, MoreHorizontal, Check, CheckCheck, Smile } from "lucide-react";
import { useMessages } from "../hooks/useMessages";

const S = { primary: "#FF7A00", success: "#22C55E", muted: "rgba(255,255,255,0.4)" };

export function MessagesPage() {
  const {
    contacts,
    selected,
    selectedPeerId,
    selectPeer,
    messages,
    search,
    setSearch,
    sendMessage,
    onInputChange,
    loading,
    searching,
    threadLoading,
    error,
    onlineCount,
  } = useMessages();

  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedPeerId && contacts.length > 0) {
      void selectPeer(contacts[0].memberId);
    }
  }, [contacts, selectedPeerId, selectPeer]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, selectedPeerId]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || !selectedPeerId) return;
    void sendMessage(text);
    setInput("");
    onInputChange("");
  };

  const sidebarList = search.trim() ? contacts : contacts;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Messages</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {onlineCount} en ligne · Communication interne
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5"
          style={{ background: "rgba(34,197,94,0.08)", borderColor: "rgba(34,197,94,0.25)" }}>
          <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: S.success }} />
          <span className="text-[10px] font-bold" style={{ color: S.success }}>{onlineCount} online</span>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-xl border px-3 py-2 text-xs"
          style={{ borderColor: "rgba(239,68,68,0.35)", color: "#f87171", background: "rgba(239,68,68,0.08)" }}>
          {error}
        </div>
      )}

      <div className="flex gap-3 h-[70vh] min-h-[500px]">
        <div className="flex w-72 shrink-0 flex-col rounded-[20px] border overflow-hidden"
          style={{ background: "rgba(8,6,24,0.92)", borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="border-b p-3" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-2 rounded-xl border px-3 py-1.5"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
              <Search size={12} style={{ color: "var(--text-muted)" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="flex-1 bg-transparent text-xs outline-none"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="px-3 py-6 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                Chargement des conversations...
              </p>
            ) : searching ? (
              <p className="px-3 py-6 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                Recherche...
              </p>
            ) : sidebarList.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                {search.trim()
                  ? "Aucun utilisateur trouvé."
                  : "Tapez un nom pour démarrer une conversation."}
              </p>
            ) : (
              sidebarList.map((conv) => {
                const isSel = conv.memberId === selectedPeerId;
                return (
                  <motion.button
                    key={conv.memberId}
                    type="button"
                    onClick={() => void selectPeer(conv.memberId)}
                    className="flex w-full items-start gap-3 px-3 py-3 text-left"
                    style={{
                      background: isSel ? `${S.primary}10` : "transparent",
                      borderLeft: isSel ? `2px solid ${S.primary}` : "2px solid transparent",
                    }}
                    whileHover={{ background: isSel ? `${S.primary}10` : "rgba(255,255,255,0.03)" }}
                  >
                    <div className="relative shrink-0">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-2xl text-xs font-extrabold text-white"
                        style={{
                          background: isSel
                            ? `linear-gradient(135deg,${S.primary},${S.primary}99)`
                            : "linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.06))",
                        }}
                      >
                        {conv.avatar}
                      </div>
                      {conv.online && (
                        <div
                          className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2"
                          style={{ background: S.success, borderColor: "rgba(8,6,24,0.92)" }}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold truncate" style={{ color: isSel ? S.primary : "var(--text-primary)" }}>
                          {conv.name}
                        </p>
                        {conv.time && (
                          <span className="text-[9px] shrink-0" style={{ color: "var(--text-muted)" }}>{conv.time}</span>
                        )}
                      </div>
                      <p className="text-[9px] mt-0.5" style={{ color: "var(--text-muted)" }}>{conv.role}</p>
                      <p className="text-[10px] mt-0.5 truncate" style={{ color: conv.typing ? S.primary : "var(--text-muted)" }}>
                        {conv.typing ? (
                          <span className="animate-pulse">●●● est en train d&apos;écrire...</span>
                        ) : (
                          conv.preview || (search.trim() ? "Nouvelle conversation" : "")
                        )}
                      </p>
                    </div>

                    {conv.unread > 0 && (
                      <div
                        className="flex h-4.5 min-w-[18px] items-center justify-center rounded-full px-1 text-[9px] font-black text-white shrink-0"
                        style={{ background: S.primary }}
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

        <div className="flex flex-1 flex-col rounded-[20px] border overflow-hidden"
          style={{ background: "rgba(8,6,24,0.88)", borderColor: "rgba(255,255,255,0.07)" }}>
          {!selected ? (
            <div className="flex flex-1 items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>
              Sélectionnez un contact pour commencer.
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="relative shrink-0">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-2xl text-xs font-extrabold text-white"
                    style={{ background: `linear-gradient(135deg,${S.primary},${S.primary}99)` }}
                  >
                    {selected.avatar}
                  </div>
                  {selected.online && (
                    <div
                      className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2"
                      style={{ background: S.success, borderColor: "rgba(8,6,24,0.88)" }}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-extrabold" style={{ color: "var(--text-primary)" }}>{selected.name}</p>
                  <p className="text-[10px]" style={{ color: selected.online ? S.success : "var(--text-muted)" }}>
                    {selected.typing ? "En train d'écrire..." : selected.online ? "En ligne" : "Hors ligne"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-xl border"
                    style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}
                    whileHover={{ scale: 1.1, borderColor: S.primary, color: S.primary }}
                  >
                    <MoreHorizontal size={14} />
                  </motion.button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {threadLoading ? (
                  <p className="text-center text-xs py-8" style={{ color: "var(--text-muted)" }}>Chargement...</p>
                ) : (
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        layout
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex ${msg.sent ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`flex items-end gap-2 max-w-[75%] ${msg.sent ? "flex-row-reverse" : "flex-row"}`}>
                          {!msg.sent && (
                            <div
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold text-white mb-0.5"
                              style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.15),rgba(255,255,255,0.08))" }}
                            >
                              {selected.avatar[0]}
                            </div>
                          )}
                          <div>
                            <div className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                              style={msg.sent ? {
                                background: `linear-gradient(135deg,${S.primary},${S.primary}dd)`,
                                color: "white",
                                borderBottomRightRadius: 6,
                              } : {
                                background: "rgba(255,255,255,0.06)",
                                color: "var(--text-primary)",
                                borderBottomLeftRadius: 6,
                                border: "1px solid rgba(255,255,255,0.08)",
                              }}>
                              {msg.text}
                            </div>
                            <div
                              className={`flex items-center gap-1 mt-0.5 text-[9px] ${msg.sent ? "justify-end" : "justify-start"}`}
                              style={{ color: "var(--text-muted)" }}
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
                    ))}
                  </AnimatePresence>
                )}

                <AnimatePresence>
                  {selected.typing && (
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-end gap-2">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-xl text-[10px] font-bold text-white"
                        style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.15),rgba(255,255,255,0.08))" }}
                      >
                        {selected.avatar[0]}
                      </div>
                      <div className="rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <div className="flex gap-1 items-center">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ background: "rgba(255,255,255,0.45)" }}
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

              <div className="border-t p-3" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
                    style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}
                    whileHover={{ scale: 1.1, borderColor: S.primary, color: S.primary }}
                  >
                    <Paperclip size={14} />
                  </motion.button>
                  <motion.button
                    type="button"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
                    style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Smile size={14} />
                  </motion.button>
                  <div className="flex flex-1 items-center gap-2 rounded-xl border px-3 py-2"
                    style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.09)" }}>
                    <input
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        onInputChange(e.target.value);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Écrire un message..."
                      className="flex-1 bg-transparent text-sm outline-none"
                      style={{ color: "var(--text-primary)" }}
                    />
                  </div>
                  <motion.button
                    type="button"
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="flex h-9 w-9 items-center justify-center rounded-xl disabled:opacity-30"
                    style={{ background: input.trim() ? `linear-gradient(135deg,${S.primary},${S.primary}cc)` : "rgba(255,255,255,0.06)" }}
                    whileHover={{ scale: input.trim() ? 1.1 : 1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Send size={14} className="text-white" />
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
