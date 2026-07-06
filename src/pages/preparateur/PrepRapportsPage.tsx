import { useState, useEffect, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { PrepPageTransition } from "../../components/preparateur/PrepPageTransition";
import { PrepKpiCard } from "../../components/preparateur/PrepKpiCard";
import { PrepToolbar, downloadCsv, downloadTextReport } from "../../components/preparateur/PrepToolbar";
import { PlayerAvatar } from "../../components/player/PlayerAvatar";
import { clubApi } from "../../lib/api/club";

interface ReportEntry {
  id: string;
  playerId: string;
  player: string;
  position: string;
  photoUrl: string | null;
  date: string;
  type: string;
  charge: number;
  fatigue: number;
  endurance: number;
  wellness: number;
  evolution: { month: string; charge: number; fatigue: number; endurance: number }[];
}

function SkeletonList() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-12 animate-pulse rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }} />
      ))}
    </div>
  );
}

function SkeletonDetail() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }} />
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-16 animate-pulse rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map(i => (
          <div key={i} className="h-40 animate-pulse rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }} />
        ))}
      </div>
    </div>
  );
}

export function PrepRapportsPage() {
  const [reports, setReports]   = useState<ReportEntry[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<ReportEntry | null>(null);
  const [search, setSearch]     = useState("");

  const fetchReports = useCallback(() => {
    setLoading(true);
    (clubApi.getReports() as Promise<ReportEntry[]>)
      .then(data => {
        setReports(data);
        if (data.length > 0) setSelected(data[0]);
      })
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const filtered = reports.filter(r =>
    r.player.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase()),
  );

  function exportCsv() {
    downloadCsv(
      "rapports-physiques.csv",
      ["Joueur", "Date", "Type", "Charge", "Fatigue", "Wellness", "Endurance"],
      filtered.map(r => [r.player, r.date, r.type, String(r.charge), String(r.fatigue), String(r.wellness), String(r.endurance)]),
    );
  }

  function exportPdf() {
    if (!selected) return;
    downloadTextReport(
      `rapport-${selected.player.replace(/\s/g, "-")}.txt`,
      `RAPPORT PHYSIQUE — ${selected.player}\nDate: ${selected.date}\nType: ${selected.type}\n\nCharge: ${selected.charge}%\nFatigue: ${selected.fatigue}%\nWellness: ${selected.wellness}/100\nEndurance: ${selected.endurance}\n\nProgression charge: ${selected.evolution.map(e => `${e.month}: ${e.charge}`).join(", ")}\nProgression endurance: ${selected.evolution.map(e => `${e.month}: ${e.endurance}`).join(", ")}\n\n— Rapport généré automatiquement`,
    );
  }

  const TOOLTIP = {
    contentStyle: { background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, color: "white" },
  };

  return (
    <PrepPageTransition>
      <PrepToolbar
        search={search}
        onSearchChange={setSearch}
        onExportCsv={exportCsv}
        onExportPdf={exportPdf}
        placeholder="Rechercher rapport..."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Historique */}
        <PrepKpiCard hover={false} className="lg:col-span-1">
          <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Historique</h3>
          {loading ? (
            <SkeletonList />
          ) : filtered.length === 0 ? (
            <p className="py-6 text-center text-xs" style={{ color: "var(--text-muted)" }}>
              Aucun rapport — ajoutez des données de charge dans "Charge Équipe"
            </p>
          ) : (
            <div className="max-h-[400px] space-y-2 overflow-y-auto">
              {filtered.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelected(r)}
                  className="w-full rounded-xl border px-3 py-2.5 text-left transition-all"
                  style={{
                    borderColor: selected?.id === r.id ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.05)",
                    background:  selected?.id === r.id ? "rgba(99,102,241,0.1)" : "transparent",
                  }}>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{r.player}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{r.type} · {new Date(r.date).toLocaleDateString("fr-FR")}</p>
                </button>
              ))}
            </div>
          )}
        </PrepKpiCard>

        {/* Détail */}
        <PrepKpiCard delay={0.1} className="lg:col-span-2">
          {loading ? (
            <SkeletonDetail />
          ) : !selected ? (
            <p className="py-20 text-center text-sm" style={{ color: "var(--text-muted)" }}>
              Sélectionnez un rapport
            </p>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-4">
                {selected.player !== "Équipe" && <PlayerAvatar name={selected.player} size={56} />}
                <div>
                  <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                    Rapport — {selected.player}
                  </h3>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {selected.type} · {new Date(selected.date).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>

              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Charge",    value: `${selected.charge}%`,      color: "#EF4444" },
                  { label: "Fatigue",   value: `${selected.fatigue}%`,     color: "#F59E0B" },
                  { label: "Wellness",  value: `${selected.wellness}/100`, color: "#22C55E" },
                  { label: "Endurance", value: `${selected.endurance}%`,   color: "#6366F1" },
                ].map(s => (
                  <div key={s.label} className="rounded-xl border p-3"
                    style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    <p className="text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                    <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>

              {selected.evolution.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="mb-2 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                      Évolution charge
                    </h4>
                    <ResponsiveContainer width="100%" height={160}>
                      <LineChart data={selected.evolution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                        <YAxis domain={[0, 100]} tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                        <Tooltip {...TOOLTIP} />
                        <Line type="monotone" dataKey="charge" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} animationDuration={800} />
                        <Line type="monotone" dataKey="fatigue" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} animationDuration={800} strokeDasharray="4 2" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h4 className="mb-2 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                      Évolution endurance
                    </h4>
                    <ResponsiveContainer width="100%" height={160}>
                      <LineChart data={selected.evolution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                        <YAxis domain={[0, 100]} tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                        <Tooltip {...TOOLTIP} />
                        <Line type="monotone" dataKey="endurance" stroke="#6366F1" strokeWidth={2} dot={{ r: 3 }} animationDuration={800} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <p className="py-6 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                  Pas encore d'historique de charge pour ce joueur.
                </p>
              )}
            </>
          )}
        </PrepKpiCard>
      </div>
    </PrepPageTransition>
  );
}
