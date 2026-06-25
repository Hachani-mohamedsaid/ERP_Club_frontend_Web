import { useState } from "react";
import { motion } from "framer-motion";
import { X, Send } from "lucide-react";
import { JOUEUR_CONVERSATIONS, JOUEUR_MESSAGES } from "../../data/joueurExtendedData";

interface JoueurChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function JoueurChatDrawer({ open, onClose }: JoueurChatDrawerProps) {
  const [activeId, setActiveId] = useState("coach");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(JOUEUR_MESSAGES);

  if (!open) return null;

  const active = JOUEUR_CONVERSATIONS.find((c) => c.id === activeId)!;
  const thread = messages[activeId] ?? [];

  function send() {
    if (!input.trim()) return;
    setMessages((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] ?? []), { id: Date.now().toString(), text: input, sent: true, time: "Maintenant" }],
    }));
    setInput("");
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col shadow-2xl" style={{ background: "var(--surface-canvas)" }}>
        <div className="flex items-center justify-between border-b px-4 py-4" style={{ borderColor: "var(--surface-panel-border)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Messages</h2>
          <button type="button" onClick={onClose} className="glass-input flex h-8 w-8 items-center justify-center">
            <X size={16} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-2/5 overflow-y-auto border-r p-2" style={{ borderColor: "var(--surface-panel-border)" }}>
            {JOUEUR_CONVERSATIONS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveId(c.id)}
                className="mb-1 w-full rounded-[var(--radius-odin-md)] px-3 py-2.5 text-left"
                style={{ background: activeId === c.id ? "rgba(var(--accent-rgb),0.15)" : "transparent" }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{c.name}</p>
                  {c.unread && <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />}
                </div>
                <p className="text-[10px]" style={{ color: "var(--accent)" }}>{c.role}</p>
                <p className="mt-0.5 truncate text-[10px]" style={{ color: "var(--text-muted)" }}>{c.preview}</p>
              </button>
            ))}
          </div>
          <div className="flex flex-1 flex-col">
            <div className="border-b px-4 py-3" style={{ borderColor: "var(--surface-panel-border)" }}>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{active.name}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{active.role}</p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {thread.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sent ? "justify-end" : "justify-start"}`}>
                  <div
                    className="max-w-[85%] rounded-[var(--radius-odin-md)] px-3 py-2 text-xs"
                    style={{ background: msg.sent ? "var(--accent)" : "rgba(var(--accent-rgb),0.08)", color: msg.sent ? "white" : "var(--text-primary)" }}
                  >
                    {msg.text}
                    <p className="mt-1 text-[9px] opacity-60">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 border-t p-3" style={{ borderColor: "var(--surface-panel-border)" }}>
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Écrire un message..." className="glass-input flex-1 py-2 px-3 text-xs" />
              <button type="button" onClick={send} className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-odin-md)]" style={{ background: "var(--accent)" }}>
                <Send size={14} color="white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
