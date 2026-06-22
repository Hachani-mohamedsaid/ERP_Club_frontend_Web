import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Search, Phone, Video, MoreHorizontal, Check, CheckCheck, Smile } from "lucide-react";

const S = { primary: "#FF7A00", success: "#22C55E", muted: "rgba(255,255,255,0.4)" };

interface Conversation {
  id: string; name: string; role: string; avatar: string;
  preview: string; time: string; unread: number; online: boolean; typing?: boolean;
}
interface Message {
  id: string; text: string; sent: boolean; time: string;
  status: "sent" | "delivered" | "read"; attachments?: string[];
}

const CONVERSATIONS: Conversation[] = [
  { id: "1", name: "Nabil Maaloul",     role: "Coach Principal",    avatar: "NM", preview: "Le plan tactique pour samedi est prêt.", time: "14:32", unread: 2, online: true,  typing: true },
  { id: "2", name: "Staff médical",     role: "Médical",            avatar: "SM", preview: "Mise à jour sur Walid Hammami.",         time: "11:05", unread: 1, online: true  },
  { id: "3", name: "Direction sportive",role: "Direction",          avatar: "DS", preview: "Réunion effectif — jeudi 10h.",          time: "Hier",  unread: 0, online: false },
  { id: "4", name: "Karim Sassi",       role: "Joueur",             avatar: "KS", preview: "Merci pour le retour.",                 time: "Hier",  unread: 0, online: true  },
  { id: "5", name: "Ahmed Ben Youssef", role: "Scout",              avatar: "AY", preview: "Rapport Trabelsi prêt.",                time: "Lun.",   unread: 0, online: false },
  { id: "6", name: "Comptabilité",      role: "Finance",            avatar: "CP", preview: "Factures de juin à valider.",           time: "Lun.",   unread: 0, online: false },
];

const THREADS: Record<string, Message[]> = {
  "1": [
    { id: "m1", text: "Bonjour, as-tu validé la composition pour le match de samedi ?", sent: false, time: "14:10", status: "read" },
    { id: "m2", text: "Oui, je t'envoie la liste dans l'heure.", sent: true, time: "14:15", status: "read" },
    { id: "m3", text: "Parfait. Pense à inclure Mehdi en réserve — retour prévu vendredi.", sent: false, time: "14:18", status: "read" },
    { id: "m4", text: "Noté. Je le mets en option sur le banc.", sent: true, time: "14:22", status: "read" },
    { id: "m5", text: "Le plan tactique pour samedi est prêt.", sent: false, time: "14:30", status: "read" },
    { id: "m6", text: "Super, je le consulte tout de suite.", sent: true, time: "14:32", status: "delivered" },
  ],
  "2": [
    { id: "m1", text: "Walid a repris l'entraînement partiel aujourd'hui.", sent: false, time: "11:00", status: "read" },
    { id: "m2", text: "Bonne nouvelle. Quel délai pour retour complet ?", sent: true, time: "11:03", status: "read" },
    { id: "m3", text: "Mise à jour sur Walid Hammami — 5 jours.", sent: false, time: "11:05", status: "read" },
  ],
};

export function MessagesPage() {
  const [selectedId, setSelectedId] = useState("1");
  const [messages, setMessages] = useState<Record<string, Message[]>>({ ...THREADS });
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [convs, setConvs] = useState<Conversation[]>(CONVERSATIONS);
  const bottomRef = useRef<HTMLDivElement>(null);

  const selected = convs.find(c => c.id === selectedId)!;
  const thread = messages[selectedId] ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.length, selectedId]);

  // Simulate typing → message after a delay
  useEffect(() => {
    if (!selected?.typing) return;
    const t = setTimeout(() => {
      setConvs(prev => prev.map(c => c.id === selectedId ? { ...c, typing: false } : c));
    }, 3000);
    return () => clearTimeout(t);
  }, [selectedId, selected?.typing]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const newMsg: Message = { id: `m${Date.now()}`, text, sent: true, time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }), status: "sent" };
    setMessages(prev => ({ ...prev, [selectedId]: [...(prev[selectedId] ?? []), newMsg] }));
    setInput("");
    // Simulate delivery
    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [selectedId]: prev[selectedId].map(m => m.id === newMsg.id ? { ...m, status: "delivered" } : m),
      }));
    }, 800);
  };

  const filteredConvs = convs.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  const onlineCount = convs.filter(c => c.online).length;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Header */}
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

      {/* Chat layout */}
      <div className="flex gap-3 h-[70vh] min-h-[500px]">
        {/* ── Sidebar conversations ── */}
        <div className="flex w-72 shrink-0 flex-col rounded-[20px] border overflow-hidden"
          style={{ background: "rgba(8,6,24,0.92)", borderColor: "rgba(255,255,255,0.07)" }}>
          {/* Search */}
          <div className="border-b p-3" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-2 rounded-xl border px-3 py-1.5"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
              <Search size={12} style={{ color: "var(--text-muted)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher..." className="flex-1 bg-transparent text-xs outline-none"
                style={{ color: "var(--text-primary)" }} />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {filteredConvs.map(conv => {
              const isSel = conv.id === selectedId;
              return (
                <motion.button key={conv.id} type="button" onClick={() => {
                  setSelectedId(conv.id);
                  setConvs(prev => prev.map(c => c.id === conv.id ? { ...c, unread: 0 } : c));
                }}
                  className="flex w-full items-start gap-3 px-3 py-3 text-left"
                  style={{
                    background: isSel ? `${S.primary}10` : "transparent",
                    borderLeft: isSel ? `2px solid ${S.primary}` : "2px solid transparent",
                  }}
                  whileHover={{ background: isSel ? `${S.primary}10` : "rgba(255,255,255,0.03)" }}>

                  {/* Avatar + online dot */}
                  <div className="relative shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-xs font-extrabold text-white"
                      style={{ background: isSel ? `linear-gradient(135deg,${S.primary},${S.primary}99)` : "linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.06))" }}>
                      {conv.avatar}
                    </div>
                    {conv.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2"
                        style={{ background: S.success, borderColor: "rgba(8,6,24,0.92)" }} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold truncate" style={{ color: isSel ? S.primary : "var(--text-primary)" }}>
                        {conv.name}
                      </p>
                      <span className="text-[9px] shrink-0" style={{ color: "var(--text-muted)" }}>{conv.time}</span>
                    </div>
                    <p className="text-[9px] mt-0.5" style={{ color: "var(--text-muted)" }}>{conv.role}</p>
                    <p className="text-[10px] mt-0.5 truncate" style={{ color: conv.typing ? S.primary : "var(--text-muted)" }}>
                      {conv.typing ? <span><span className="animate-pulse">●●● est en train d'écrire...</span></span> : conv.preview}
                    </p>
                  </div>

                  {conv.unread > 0 && (
                    <div className="flex h-4.5 w-4.5 min-w-[18px] items-center justify-center rounded-full text-[9px] font-black text-white shrink-0"
                      style={{ background: S.primary }}>
                      {conv.unread}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── Chat window ── */}
        <div className="flex flex-1 flex-col rounded-[20px] border overflow-hidden"
          style={{ background: "rgba(8,6,24,0.88)", borderColor: "rgba(255,255,255,0.07)" }}>

          {/* Chat header */}
          <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <div className="relative shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-xs font-extrabold text-white"
                style={{ background: `linear-gradient(135deg,${S.primary},${S.primary}99)` }}>
                {selected.avatar}
              </div>
              {selected.online && (
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2"
                  style={{ background: S.success, borderColor: "rgba(8,6,24,0.88)" }} />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-extrabold" style={{ color: "var(--text-primary)" }}>{selected.name}</p>
              <p className="text-[10px]" style={{ color: selected.online ? S.success : "var(--text-muted)" }}>
                {selected.typing ? "En train d'écrire..." : selected.online ? "En ligne" : "Hors ligne"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {[Phone, Video, MoreHorizontal].map((Icon, i) => (
                <motion.button key={i} type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-xl border"
                  style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}
                  whileHover={{ scale: 1.1, borderColor: S.primary, color: S.primary }}>
                  <Icon size={14} />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <AnimatePresence initial={false}>
              {thread.map((msg, i) => (
                <motion.div key={msg.id} layout
                  initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.sent ? "justify-end" : "justify-start"}`}>
                  <div className={`flex items-end gap-2 max-w-[75%] ${msg.sent ? "flex-row-reverse" : "flex-row"}`}>
                    {!msg.sent && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold text-white mb-0.5"
                        style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.15),rgba(255,255,255,0.08))" }}>
                        {selected.avatar[0]}
                      </div>
                    )}
                    <div>
                      <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed`}
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
                      <div className={`flex items-center gap-1 mt-0.5 text-[9px] ${msg.sent ? "justify-end" : "justify-start"}`}
                        style={{ color: "var(--text-muted)" }}>
                        {msg.time}
                        {msg.sent && (
                          msg.status === "read"      ? <CheckCheck size={10} style={{ color: S.primary }} /> :
                          msg.status === "delivered" ? <CheckCheck size={10} /> :
                          <Check size={10} />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            <AnimatePresence>
              {selected.typing && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-end gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl text-[10px] font-bold text-white"
                    style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.15),rgba(255,255,255,0.08))" }}>
                    {selected.avatar[0]}
                  </div>
                  <div className="rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="flex gap-1 items-center">
                      {[0,1,2].map(i => (
                        <motion.div key={i} className="h-1.5 w-1.5 rounded-full"
                          style={{ background: "rgba(255,255,255,0.45)" }}
                          animate={{ y: [0, -4, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t p-3" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-2">
              <motion.button type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
                style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}
                whileHover={{ scale: 1.1, borderColor: S.primary, color: S.primary }}>
                <Paperclip size={14} />
              </motion.button>
              <motion.button type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
                style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}
                whileHover={{ scale: 1.1 }}>
                <Smile size={14} />
              </motion.button>
              <div className="flex flex-1 items-center gap-2 rounded-xl border px-3 py-2"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.09)" }}>
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder="Écrire un message..."
                  className="flex-1 bg-transparent text-sm outline-none" style={{ color: "var(--text-primary)" }} />
              </div>
              <motion.button type="button" onClick={sendMessage} disabled={!input.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-xl disabled:opacity-30"
                style={{ background: input.trim() ? `linear-gradient(135deg,${S.primary},${S.primary}cc)` : "rgba(255,255,255,0.06)" }}
                whileHover={{ scale: input.trim() ? 1.1 : 1 }} whileTap={{ scale: 0.9 }}>
                <Send size={14} className="text-white" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
