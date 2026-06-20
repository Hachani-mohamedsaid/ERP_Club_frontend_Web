import { useState } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { PrepPageTransition } from "../../components/preparateur/PrepPageTransition";
import { PrepKpiCard } from "../../components/preparateur/PrepKpiCard";
import { PrepToolbar, downloadCsv } from "../../components/preparateur/PrepToolbar";
import { PlayerAvatar } from "../../components/player/PlayerAvatar";
import { PHYSICAL_PROFILES, getPlayerDetail } from "../../data/preparateurData";
import { PrepPlayerDrawer } from "../../components/preparateur/PrepPlayerDrawer";

export function PrepConditionPage() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(PHYSICAL_PROFILES[0].id);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const drawerPlayer = drawerId ? getPlayerDetail(drawerId) ?? null : null;

  const filtered = PHYSICAL_PROFILES.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const player = PHYSICAL_PROFILES.find((p) => p.id === selectedId) ?? PHYSICAL_PROFILES[0];

  const radarData = [
    { stat: "Vitesse", value: player.speed },
    { stat: "Endurance", value: player.endurance },
    { stat: "Force", value: player.force },
    { stat: "Explosivité", value: player.explosivity },
    { stat: "Agilité", value: player.agility },
    { stat: "Récupération", value: player.recovery },
  ];

  const metrics = [
    { label: "Vitesse", value: player.speed, color: "#FF6B57" },
    { label: "Endurance", value: player.endurance, color: "#6366F1" },
    { label: "Force", value: player.force, color: "#EF4444" },
    { label: "Explosivité", value: player.explosivity, color: "#F59E0B" },
    { label: "Agilité", value: player.agility, color: "#22C55E" },
    { label: "Récupération", value: player.recovery, color: "#3B82F6" },
  ];

  function exportCsv() {
    downloadCsv(
      `condition-${player.name.replace(/\s/g, "-")}.csv`,
      ["Métrique", "Score"],
      metrics.map((m) => [m.label, String(m.value)])
    );
  }

  return (
    <PrepPageTransition>
      <PrepToolbar search={search} onSearchChange={setSearch} onExportCsv={exportCsv} placeholder="Filtrer joueurs..." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => { setSelectedId(p.id); setDrawerId(p.id); }}
            className="rounded-xl border p-3 text-left transition-all hover:-translate-y-1"
            style={{
              borderColor: selectedId === p.id ? "rgba(255,107,87,0.4)" : "rgba(255,255,255,0.06)",
              background: selectedId === p.id ? "rgba(255,107,87,0.08)" : "rgba(255,255,255,0.02)",
            }}
          >
            <div className="flex items-center gap-3">
              <PlayerAvatar name={p.name} size={40} />
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{p.name}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {metrics.map((m) => (
          <PrepKpiCard key={m.label} delay={0.05}>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{m.label}</p>
            <p className="mt-1 text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
          </PrepKpiCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PrepKpiCard delay={0.1}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Profil FIFA — {player.name}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="stat" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <Radar name="Score" dataKey="value" stroke="#FF6B57" fill="#FF6B57" fillOpacity={0.3} animationDuration={1000} animationBegin={200} />
              <Tooltip contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </PrepKpiCard>

        <PrepKpiCard delay={0.15}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Évolution — Mars → Juin</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={player.evolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <YAxis domain={[65, 95]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }} />
              <Line type="monotone" dataKey="speed" stroke="#FF6B57" strokeWidth={2} dot={{ r: 4 }} animationDuration={1000} name="Vitesse" />
              <Line type="monotone" dataKey="endurance" stroke="#6366F1" strokeWidth={2} dot={{ r: 4 }} animationDuration={1000} name="Endurance" />
            </LineChart>
          </ResponsiveContainer>
        </PrepKpiCard>
      </div>

      <PrepPlayerDrawer player={drawerPlayer} open={!!drawerId} onClose={() => setDrawerId(null)} />
    </PrepPageTransition>
  );
}
