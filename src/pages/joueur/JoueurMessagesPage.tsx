import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle, CalendarClock, Download, Bell } from "lucide-react";
import { JoueurPageTransition } from "../../components/player/JoueurPageTransition";
import { JoueurKpiCard } from "../../components/player/JoueurKpiCard";
import { PlayerAvatar } from "../../components/player/PlayerAvatar";
import { useCurrentPlayer } from "../../hooks/useCurrentPlayer";
import { useLocale } from "../../contexts/LocaleContext";
import { JOUEUR_CONVERSATIONS, JOUEUR_MESSAGES } from "../../data/joueurExtendedData";
import { MESSAGE_NOTIFICATIONS } from "../../data/joueurPersonalData";

const ROLE_COLORS: Record<string, string> = {
  coach: "#FF6B57",
  medical: "#3B82F6",
  direction: "#F59E0B",
  scout: "#22C55E",
};

const ROLE_AVATARS: Record<string, string> = {
  coach: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=80&h=80&fit=crop&crop=faces",
  medical: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=faces",
  direction: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=faces",
};

export function JoueurMessagesPage() {
  const { player } = useCurrentPlayer();
  const { t } = useLocale();
  const [activeId, setActiveId] = useState("coach");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(JOUEUR_MESSAGES);
  const [toast, setToast] = useState("");

  const active = JOUEUR_CONVERSATIONS.find((c) => c.id === activeId)!;
  const thread = messages[activeId] ?? [];

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function send() {
    if (!input.trim()) return;
    setMessages((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] ?? []), { id: Date.now().toString(), text: input, sent: true, time: "Maintenant" }],
    }));
    setInput("");
  }

  if (!player) return null;

  return (
    <JoueurPageTransition>
      {toast && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="fixed right-8 top-24 z-50 rounded-xl border px-4 py-3 text-sm shadow-xl" style={{ background: "#141B2D", borderColor: "rgba(34,197,94,0.4)", color: "#22C55E" }}>
          ✓ {toast}
        </motion.div>
      )}

      {/* Notification cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {MESSAGE_NOTIFICATIONS.map((n, idx) => (
          <motion.button
            key={n.id}
            type="button"
            onClick={() => setActiveId(n.role === "direction" ? "coach" : n.role)}
            className="rounded-[20px] border p-4 text-left transition-all hover:scale-[1.02]"
            style={{ borderColor: n.unread ? `${ROLE_COLORS[n.role]}44` : "rgba(255,255,255,0.08)", background: n.unread ? `${ROLE_COLORS[n.role]}11` : "rgba(255,255,255,0.02)" }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
          >
            <div className="flex items-center gap-2">
              <Bell size={14} style={{ color: ROLE_COLORS[n.role] }} />
              <span className="text-xs font-semibold uppercase" style={{ color: ROLE_COLORS[n.role] }}>{n.from}</span>
              {n.unread && <span className="ml-auto h-2 w-2 rounded-full" style={{ background: "#FF6B57" }} />}
            </div>
            <p className="mt-2 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{n.message}</p>
            <p className="mt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>{n.time}</p>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <JoueurKpiCard className="p-3 lg:col-span-1">
          <h3 className="mb-3 px-1 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Conversations</h3>
          {JOUEUR_CONVERSATIONS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveId(c.id)}
              className="mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all hover:scale-[1.01]"
              style={{ background: activeId === c.id ? "rgba(255,107,87,0.12)" : "transparent" }}
            >
              <img src={ROLE_AVATARS[c.id] ?? ROLE_AVATARS.coach} alt={c.name} className="h-10 w-10 rounded-full object-cover" style={{ border: `2px solid ${ROLE_COLORS[c.id] ?? "#FF6B57"}44` }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{c.name}</p>
                  {c.unread && <span className="h-2 w-2 rounded-full" style={{ background: "#FF6B57" }} />}
                </div>
                <p className="text-[10px]" style={{ color: ROLE_COLORS[c.id] }}>{c.role}</p>
                <p className="truncate text-xs" style={{ color: "var(--text-muted)" }}>{c.preview}</p>
              </div>
            </button>
          ))}
        </JoueurKpiCard>

        <JoueurKpiCard className="flex flex-col lg:col-span-2 p-0 overflow-hidden">
          <div className="flex items-center gap-3 border-b px-5 py-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <img src={ROLE_AVATARS[activeId] ?? ROLE_AVATARS.coach} alt="" className="h-10 w-10 rounded-full object-cover" />
            <div>
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{active.name}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{active.role}</p>
            </div>
            <div className="ml-auto hidden sm:block">
              <PlayerAvatar name={player.name} size={36} ring={false} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 border-b px-5 py-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <p className="w-full text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{t.messages.quickActions}</p>
            {[
              { label: t.messages.confirmPresence, icon: CheckCircle, action: () => showToast(t.messages.confirmPresence) },
              { label: t.messages.reschedule, icon: CalendarClock, action: () => showToast(t.messages.reschedule) },
              { label: t.messages.downloadDoc, icon: Download, action: () => showToast(t.messages.downloadDoc) },
            ].map(({ label, icon: Icon, action }) => (
              <button key={label} type="button" onClick={action} className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all hover:brightness-110 active:scale-[0.98]" style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--text-secondary)" }}>
                <Icon size={12} />{label}
              </button>
            ))}
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-5" style={{ minHeight: 280 }}>
            {thread.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.sent ? "justify-end" : "justify-start"}`}>
                {!msg.sent && <img src={ROLE_AVATARS[activeId]} alt="" className="mt-1 h-7 w-7 rounded-full object-cover" />}
                <div className="max-w-[75%] rounded-[16px] px-4 py-2.5 text-sm" style={{ background: msg.sent ? "#FF6B57" : "rgba(255,255,255,0.06)", color: msg.sent ? "white" : "var(--text-primary)" }}>
                  {msg.text}
                  <p className="mt-1 text-[10px] opacity-60">{msg.time}</p>
                </div>
                {msg.sent && <PlayerAvatar name={player.name} size={28} ring={false} />}
              </div>
            ))}
          </div>

          <div className="flex gap-2 border-t p-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={t.messages.write} className="glass-input flex-1 rounded-xl py-2.5 px-4 text-sm" />
            <button type="button" onClick={send} className="flex h-10 w-10 items-center justify-center rounded-xl transition-all active:scale-[0.98]" style={{ background: "#FF6B57" }}>
              <Send size={16} color="white" />
            </button>
          </div>
        </JoueurKpiCard>
      </div>
    </JoueurPageTransition>
  );
}
