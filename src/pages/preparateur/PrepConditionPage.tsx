import { useState, useEffect } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { PrepPageTransition } from "../../components/preparateur/PrepPageTransition";
import { PrepKpiCard } from "../../components/preparateur/PrepKpiCard";
import { PrepToolbar, downloadCsv } from "../../components/preparateur/PrepToolbar";
import { PlayerAvatar } from "../../components/player/PlayerAvatar";
import { PrepPlayerDrawer } from "../../components/preparateur/PrepPlayerDrawer";
import { clubApi } from "../../lib/api/club";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PhysicalProfile {
  id: string;
  name: string;
  position: string;
  ovr: number;
  speed: number;
  endurance: number;
  force: number;
  explosivity: number;
  agility: number;
  recovery: number;
  evolution: { month: string; speed: number; endurance: number }[];
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }} />)}
      </div>
      <div className="grid grid-cols-3 gap-3 lg:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-20 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)" }} />)}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-80 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)" }} />
        <div className="h-80 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)" }} />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function PrepConditionPage() {
  const [profiles, setProfiles] = useState<PhysicalProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerId, setDrawerId] = useState<string | null>(null);

  useEffect(() => {
    (clubApi.getPhysicalCondition() as Promise<PhysicalProfile[]>)
      .then((data) => {
        setProfiles(data);
        if (data.length > 0) setSelectedId(data[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = profiles.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const player = profiles.find((p) => p.id === selectedId) ?? profiles[0] ?? null;

  const metrics = player
    ? [
        { label: "Vitesse",      value: player.speed,       color: "#FF6B57" },
        { label: "Endurance",    value: player.endurance,   color: "#6366F1" },
        { label: "Force",        value: player.force,       color: "#EF4444" },
        { label: "Explosivité",  value: player.explosivity, color: "#F59E0B" },
        { label: "Agilité",      value: player.agility,     color: "#22C55E" },
        { label: "Récupération", value: player.recovery,    color: "#3B82F6" },
      ]
    : [];

  const radarData = player
    ? [
        { stat: "Vitesse",      value: player.speed },
        { stat: "Endurance",    value: player.endurance },
        { stat: "Force",        value: player.force },
        { stat: "Explosivité",  value: player.explosivity },
        { stat: "Agilité",      value: player.agility },
        { stat: "Récupération", value: player.recovery },
      ]
    : [];

  function exportCsv() {
    if (!player) return;
    downloadCsv(
      `condition-${player.name.replace(/\s/g, "-")}.csv`,
      ["Métrique", "Score"],
      metrics.map((m) => [m.label, String(m.value)])
    );
  }

  // Drawer : on passe les données physiques dans le drawer
  const drawerPlayer = drawerId
    ? (() => {
        const p = profiles.find((x) => x.id === drawerId);
        if (!p) return null;
        return {
          id: p.id,
          name: p.name,
          position: p.position,
          age: 0,
          weight: "—",
          height: "—",
          weekCharge: p.ovr,
          injuryHistory: [],
          activePrograms: [`OVR ${p.ovr}`, `Vitesse ${p.speed}`, `Endurance ${p.endurance}`],
          lastMatch: { opponent: "—", date: "—", rating: 0 },
          availability: "Disponible",
          charge: p.speed,
          fatigue: Math.round(100 - p.recovery),
          recovery: p.recovery,
        };
      })()
    : null;

  return (
    <PrepPageTransition>
      <PrepToolbar
        search={search}
        onSearchChange={setSearch}
        onExportCsv={exportCsv}
        placeholder="Filtrer joueurs..."
      />

      {loading ? (
        <PageSkeleton />
      ) : (
        <>
          {/* Sélecteur joueurs */}
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
                  <div>
                    <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{p.name}</span>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.position} · OVR {p.ovr}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {player && (
            <>
              {/* KPIs métriques */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {metrics.map((m) => (
                  <PrepKpiCard key={m.label} delay={0.05}>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{m.label}</p>
                    <p className="mt-1 text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
                  </PrepKpiCard>
                ))}
              </div>

              {/* Graphiques */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <PrepKpiCard delay={0.1}>
                  <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    Profil FIFA — {player.name}
                  </h3>
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
                  <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    Évolution — Mars → Juin
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={player.evolution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                      <YAxis domain={[65, 95]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }} />
                      <Line type="monotone" dataKey="speed"     stroke="#FF6B57" strokeWidth={2} dot={{ r: 4 }} animationDuration={1000} name="Vitesse" />
                      <Line type="monotone" dataKey="endurance" stroke="#6366F1" strokeWidth={2} dot={{ r: 4 }} animationDuration={1000} name="Endurance" />
                    </LineChart>
                  </ResponsiveContainer>
                </PrepKpiCard>
              </div>
            </>
          )}

          {filtered.length === 0 && (
            <div className="py-16 text-center text-sm" style={{ color: "var(--text-muted)" }}>
              Aucun joueur trouvé
            </div>
          )}
        </>
      )}

      <PrepPlayerDrawer player={drawerPlayer} open={!!drawerId} onClose={() => setDrawerId(null)} />
    </PrepPageTransition>
  );
}
