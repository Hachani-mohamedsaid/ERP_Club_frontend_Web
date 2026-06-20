import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { PrepPageTransition } from "../../components/preparateur/PrepPageTransition";
import { PrepKpiCard } from "../../components/preparateur/PrepKpiCard";
import { PrepToolbar, downloadCsv, downloadTextReport } from "../../components/preparateur/PrepToolbar";
import { PlayerAvatar } from "../../components/player/PlayerAvatar";
import { REPORT_HISTORY, PHYSICAL_PROFILES } from "../../data/preparateurData";

export function PrepRapportsPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(REPORT_HISTORY[0]);

  const filtered = REPORT_HISTORY.filter((r) =>
    r.player.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase())
  );

  const profile = PHYSICAL_PROFILES.find((p) => p.name === selected.player) ?? PHYSICAL_PROFILES[0];

  function exportCsv() {
    downloadCsv(
      "rapports-physiques.csv",
      ["Joueur", "Date", "Type", "Charge", "Fatigue"],
      filtered.map((r) => [r.player, r.date, r.type, String(r.charge), String(r.fatigue)])
    );
  }

  function exportPdf() {
    downloadTextReport(
      `rapport-${selected.player.replace(/\s/g, "-")}.txt`,
      `RAPPORT PHYSIQUE — ${selected.player}\nDate: ${selected.date}\nType: ${selected.type}\n\nCharge: ${selected.charge}%\nFatigue: ${selected.fatigue}%\n\nProgression vitesse: ${profile.evolution.map((e) => `${e.month}: ${e.speed}`).join(", ")}\nProgression endurance: ${profile.evolution.map((e) => `${e.month}: ${e.endurance}`).join(", ")}\n\nRisques: voir module Risque Blessures\n\n— Hichem Mansouri, Préparateur Physique`
    );
  }

  return (
    <PrepPageTransition>
      <PrepToolbar search={search} onSearchChange={setSearch} onExportCsv={exportCsv} onExportPdf={exportPdf} placeholder="Rechercher rapport..." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <PrepKpiCard hover={false} className="lg:col-span-1">
          <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Historique</h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filtered.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelected(r)}
                className="w-full rounded-xl border px-3 py-2.5 text-left transition-all"
                style={{
                  borderColor: selected.id === r.id ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.05)",
                  background: selected.id === r.id ? "rgba(99,102,241,0.1)" : "transparent",
                }}
              >
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{r.player}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{r.type} · {r.date}</p>
              </button>
            ))}
          </div>
        </PrepKpiCard>

        <PrepKpiCard delay={0.1} className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-4">
            {selected.player !== "Équipe" && <PlayerAvatar name={selected.player} size={56} />}
            <div>
              <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Rapport — {selected.player}</h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{selected.type} · {selected.date}</p>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Charge", value: `${selected.charge}%`, color: "#EF4444" },
              { label: "Fatigue", value: `${selected.fatigue}%`, color: "#F59E0B" },
              { label: "Vitesse", value: profile.speed, color: "#FF6B57" },
              { label: "Endurance", value: profile.endurance, color: "#6366F1" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border p-3" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <p className="text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <h4 className="mb-2 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Évolution vitesse</h4>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={profile.evolution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                  <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }} />
                  <Line type="monotone" dataKey="speed" stroke="#FF6B57" strokeWidth={2} dot={{ r: 3 }} animationDuration={1000} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="mb-2 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Évolution endurance</h4>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={profile.evolution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                  <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }} />
                  <Line type="monotone" dataKey="endurance" stroke="#6366F1" strokeWidth={2} dot={{ r: 3 }} animationDuration={1000} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </PrepKpiCard>
      </div>
    </PrepPageTransition>
  );
}
