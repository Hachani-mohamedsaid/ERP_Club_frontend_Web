import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Droplets, AlertTriangle, Scale, Ruler, FileText, Pill, History } from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { AnimatedBadge } from "../../components/ui/AnimatedBadge";
import { PLAYERS, getInitials, getAvailabilityColor, type PlayerMedicalRecord } from "../../data/medicalMockData";

type Tab = "Informations" | "Antécédents" | "Blessures" | "Documents" | "Traitements";

const TABS: Tab[] = ["Informations", "Antécédents", "Blessures", "Documents", "Traitements"];

function PlayerCard({ player }: { player: PlayerMedicalRecord }) {
  const availColor = getAvailabilityColor(player.availability);
  const tone = player.availability === "Disponible" ? "success" : player.availability === "Partiellement disponible" ? "warning" : "danger";

  return (
    <GlassCard raised className="relative overflow-hidden p-6">
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: `linear-gradient(90deg, var(--accent), ${availColor})` }}
      />
      <div className="flex items-start gap-5">
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold"
          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
        >
          {getInitials(player.name)}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{player.name}</h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {player.position} • {player.age} ans
          </p>
          <div className="mt-2">
            <AnimatedBadge tone={tone}>{player.availability}</AnimatedBadge>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function VitalStats({ player }: { player: PlayerMedicalRecord }) {
  const stats = [
    { icon: Droplets, label: "Groupe sanguin", value: player.bloodGroup, color: "#c0392b" },
    { icon: AlertTriangle, label: "Allergies", value: player.allergies.join(", "), color: "#d99a1f" },
    { icon: Scale, label: "Poids", value: `${player.weight} kg`, color: "#3a7bd5" },
    { icon: Ruler, label: "Taille", value: `${(player.height / 100).toFixed(2).replace(".", "m")}`, color: "#2e9e5b" },
  ];

  return (
    <div className="space-y-3">
      {stats.map(({ icon: Icon, label, value, color }) => (
        <GlassCard key={label} className="p-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ background: `${color}22`, color }}
            >
              <Icon size={16} />
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{value}</p>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

function TabContent({ player, tab }: { player: PlayerMedicalRecord; tab: Tab }) {
  if (tab === "Informations") {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Poste</p>
            <p className="mt-1 font-semibold" style={{ color: "var(--text-primary)" }}>{player.position}</p>
          </div>
          <div className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>IMC</p>
            <p className="mt-1 font-semibold" style={{ color: "var(--text-primary)" }}>
              {(player.weight / ((player.height / 100) ** 2)).toFixed(1)}
            </p>
          </div>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Certificats médicaux</h3>
          {player.certificates.map((cert) => (
            <div
              key={cert.name}
              className="mb-2 flex items-center justify-between rounded-[var(--radius-odin-md)] border px-4 py-3"
              style={{ borderColor: "var(--surface-panel-border)" }}
            >
              <div className="flex items-center gap-2">
                <FileText size={15} style={{ color: "var(--accent)" }} />
                <span className="text-sm" style={{ color: "var(--text-primary)" }}>{cert.name}</span>
              </div>
              <AnimatedBadge tone={cert.valid ? "success" : "danger"}>
                {cert.valid ? "Valide" : "Expiré"}
              </AnimatedBadge>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tab === "Antécédents") {
    return (
      <div className="space-y-3">
        {player.antecedents.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucun antécédent enregistré.</p>
        ) : (
          player.antecedents.map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-[var(--radius-odin-md)] border px-4 py-3"
              style={{ borderColor: "var(--surface-panel-border)" }}
            >
              <History size={15} style={{ color: "var(--color-state-warning)" }} />
              <span className="text-sm" style={{ color: "var(--text-primary)" }}>{item}</span>
            </div>
          ))
        )}
      </div>
    );
  }

  if (tab === "Blessures") {
    return (
      <div className="space-y-3">
        {player.previousInjuries.map((inj) => (
          <div
            key={inj.injury + inj.date}
            className="rounded-[var(--radius-odin-md)] border p-4"
            style={{ borderColor: "var(--surface-panel-border)" }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>{inj.injury}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{inj.date}</p>
              </div>
              <AnimatedBadge tone="info">{inj.duration}</AnimatedBadge>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tab === "Documents") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {player.history.filter((h) => h.type === "exam" || h.type === "certificat").map((doc) => (
          <div
            key={doc.date + doc.event}
            className="flex items-center gap-3 rounded-[var(--radius-odin-md)] border p-4"
            style={{ borderColor: "var(--surface-panel-border)" }}
          >
            <FileText size={18} style={{ color: "var(--accent)" }} />
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{doc.event}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{doc.date}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {player.treatments.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucun traitement en cours.</p>
      ) : (
        player.treatments.map((t) => (
          <div
            key={t.name}
            className="flex items-center gap-3 rounded-[var(--radius-odin-md)] border px-4 py-3"
            style={{ borderColor: "var(--surface-panel-border)" }}
          >
            <Pill size={15} style={{ color: "var(--color-state-info)" }} />
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{t.name}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.dosage} — depuis {t.since}</p>
            </div>
          </div>
        ))
      )}
      {player.medications.length > 0 && (
        <>
          <h3 className="mt-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Médicaments</h3>
          {player.medications.map((med) => (
            <div
              key={med}
              className="rounded-[var(--radius-odin-md)] border px-4 py-3 text-sm"
              style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-secondary)" }}
            >
              {med}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export function MedicalDossiersPage() {
  const [selectedId, setSelectedId] = useState(PLAYERS[0].id);
  const [tab, setTab] = useState<Tab>("Informations");
  const [search, setSearch] = useState("");

  const player = PLAYERS.find((p) => p.id === selectedId) ?? PLAYERS[0];
  const filtered = PLAYERS.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-3">
          <GlassCard className="p-4">
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Rechercher un joueur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="glass-input w-full py-2 pl-9 pr-3 text-sm"
              />
            </div>
            <div className="space-y-1">
              {filtered.map((p) => {
                const active = p.id === selectedId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedId(p.id)}
                    className="flex w-full items-center gap-3 rounded-[var(--radius-odin-md)] px-3 py-2.5 text-left transition-colors"
                    style={{
                      background: active ? "rgba(var(--accent-rgb), 0.15)" : "transparent",
                      borderLeft: active ? "3px solid var(--accent)" : "3px solid transparent",
                    }}
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                      style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                    >
                      {getInitials(p.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.position}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-4 xl:col-span-6">
          <motion.div key={player.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <PlayerCard player={player} />
          </motion.div>

          <GlassCard raised className="p-4">
            <div className="mb-4 flex flex-wrap gap-1 border-b pb-3" style={{ borderColor: "var(--surface-panel-border)" }}>
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className="rounded-[var(--radius-odin-md)] px-4 py-2 text-sm font-medium transition-colors"
                  style={{
                    background: tab === t ? "var(--accent)" : "transparent",
                    color: tab === t ? "white" : "var(--text-muted)",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <TabContent player={player} tab={tab} />
          </GlassCard>

          <GlassCard className="p-4">
            <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Historique complet</h3>
            <div className="space-y-2">
              {player.history.map((h) => (
                <div
                  key={h.date + h.event}
                  className="flex items-center gap-3 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span className="w-20 shrink-0 text-xs" style={{ color: "var(--text-muted)" }}>{h.date}</span>
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{
                      background:
                        h.type === "injury" ? "var(--color-state-danger)" :
                        h.type === "exam" ? "var(--color-state-info)" :
                        h.type === "certificat" ? "var(--color-state-success)" :
                        "var(--color-state-warning)",
                    }}
                  />
                  <span>{h.event}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="xl:col-span-3">
          <VitalStats player={player} />
        </div>
      </div>
    </div>
  );
}
