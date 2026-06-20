import { X, Send } from "lucide-react";

interface Conversation {
  id: string;
  name: string;
  preview: string;
  time: string;
  unread: boolean;
}

interface Message {
  id: string;
  text: string;
  sent: boolean;
  time: string;
}

const CONVERSATIONS: Conversation[] = [
  { id: "1", name: "Nabil Maaloul", preview: "Le plan tactique pour samedi est prêt.", time: "14:32", unread: true },
  { id: "2", name: "Staff médical", preview: "Mise à jour sur Walid Hammami.", time: "11:05", unread: true },
  { id: "3", name: "Direction sportive", preview: "Réunion effectif — jeudi 10h.", time: "Hier", unread: false },
  { id: "4", name: "Karim Sassi", preview: "Merci pour le retour.", time: "Hier", unread: false },
];

const THREAD: Message[] = [
  { id: "m1", text: "Bonjour, as-tu validé la composition pour le match de samedi ?", sent: false, time: "14:10" },
  { id: "m2", text: "Oui, je t'envoie la liste dans l'heure.", sent: true, time: "14:15" },
  { id: "m3", text: "Parfait. Pense à inclure Mehdi en réserve — retour prévu vendredi.", sent: false, time: "14:18" },
  { id: "m4", text: "Le plan tactique pour samedi est prêt.", sent: false, time: "14:30" },
];

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function ChatDrawer({ open, onClose }: ChatDrawerProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col shadow-2xl"
        style={{ background: "var(--surface-canvas)" }}
      >
        <div className="flex items-center justify-between border-b px-4 py-4" style={{ borderColor: "var(--surface-panel-border)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Messages</h2>
          <button type="button" onClick={onClose} className="glass-input flex h-8 w-8 items-center justify-center">
            <X size={16} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-2/5 overflow-y-auto border-r p-2" style={{ borderColor: "var(--surface-panel-border)" }}>
            {CONVERSATIONS.map((c) => (
              <div
                key={c.id}
                className="mb-1 cursor-pointer rounded-[var(--radius-odin-md)] px-3 py-2.5"
                style={{ background: c.id === "1" ? "rgba(var(--accent-rgb), 0.15)" : "transparent" }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{c.name}</p>
                  {c.unread && <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />}
                </div>
                <p className="mt-0.5 truncate text-[10px]" style={{ color: "var(--text-muted)" }}>{c.preview}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-1 flex-col">
            <div className="border-b px-4 py-3" style={{ borderColor: "var(--surface-panel-border)" }}>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Nabil Maaloul</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Entraîneur principal</p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {THREAD.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sent ? "justify-end" : "justify-start"}`}>
                  <div
                    className="max-w-[85%] rounded-[var(--radius-odin-md)] px-3 py-2 text-xs"
                    style={{
                      background: msg.sent ? "var(--accent)" : "rgba(var(--accent-rgb), 0.1)",
                      color: msg.sent ? "white" : "var(--text-primary)",
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 border-t p-3" style={{ borderColor: "var(--surface-panel-border)" }}>
              <input type="text" placeholder="Écrire un message..." className="glass-input flex-1 py-2 px-3 text-xs" />
              <button type="button" className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-odin-md)]" style={{ background: "var(--accent)", color: "white" }}>
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
