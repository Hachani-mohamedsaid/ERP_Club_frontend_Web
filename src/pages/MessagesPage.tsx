import { GlassCard } from "../components/ui/GlassCard";

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
  { id: "5", name: "Comptabilité", preview: "Factures de juin à valider.", time: "Lun.", unread: false },
];

const THREAD: Message[] = [
  { id: "m1", text: "Bonjour, as-tu validé la composition pour le match de samedi ?", sent: false, time: "14:10" },
  { id: "m2", text: "Oui, je t'envoie la liste dans l'heure.", sent: true, time: "14:15" },
  { id: "m3", text: "Parfait. Pense à inclure Mehdi en réserve — retour prévu vendredi.", sent: false, time: "14:18" },
  { id: "m4", text: "Noté. Je le mets en option sur le banc.", sent: true, time: "14:22" },
  { id: "m5", text: "Le plan tactique pour samedi est prêt.", sent: false, time: "14:30" },
  { id: "m6", text: "Super, je le consulte tout de suite.", sent: true, time: "14:32" },
];

const SELECTED = CONVERSATIONS[0];

export function MessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Messages
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Communication interne du club
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard className="p-4 lg:col-span-1">
          <h2 className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Conversations
          </h2>
          <div className="space-y-1">
            {CONVERSATIONS.map((conversation) => {
              const selected = conversation.id === SELECTED.id;
              return (
                <div
                  key={conversation.id}
                  className="flex cursor-default items-start gap-3 rounded-[var(--radius-odin-md)] px-3 py-2.5"
                  style={{
                    background: selected ? "var(--accent-soft)" : "transparent",
                  }}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                    style={{
                      background: selected ? "var(--accent)" : "var(--surface-panel-border)",
                      color: selected ? "white" : "var(--text-secondary)",
                    }}
                  >
                    {conversation.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {conversation.name}
                      </p>
                      <span className="shrink-0 text-[11px]" style={{ color: "var(--text-muted)" }}>
                        {conversation.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs" style={{ color: "var(--text-muted)" }}>
                        {conversation.preview}
                      </p>
                      {conversation.unread && (
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ background: "var(--accent)" }}
                          aria-label="Non lu"
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard raised className="flex flex-col p-4 lg:col-span-2">
          <div
            className="mb-4 border-b pb-3"
            style={{ borderColor: "var(--surface-panel-border)" }}
          >
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {SELECTED.name}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Entraîneur principal
            </p>
          </div>

          <div className="flex flex-1 flex-col gap-3">
            {THREAD.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sent ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[80%] rounded-[var(--radius-odin-md)] px-3 py-2"
                  style={{
                    background: message.sent ? "var(--accent)" : "var(--surface-panel)",
                    color: message.sent ? "var(--text-on-accent)" : "var(--text-primary)",
                    border: message.sent ? "none" : "1px solid var(--surface-panel-border)",
                  }}
                >
                  <p className="text-sm">{message.text}</p>
                  <p
                    className="mt-1 text-[10px] opacity-70"
                    style={{ color: message.sent ? "inherit" : "var(--text-muted)" }}
                  >
                    {message.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div
            className="mt-4 rounded-[var(--radius-odin-md)] px-3 py-2 text-sm"
            style={{
              background: "var(--surface-panel)",
              border: "1px solid var(--surface-panel-border)",
              color: "var(--text-muted)",
            }}
          >
            Écrire un message…
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
