import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Plus, Target, Clock } from "lucide-react";
import { ScoutPage, SCard } from "../../components/scout/ScoutUI";
import { S } from "../../data/scoutData";
import { scoutApi, type ScoutMissionDto } from "../../lib/api/scout";
import { showToast } from "../../components/scout/ScoutToast";

function formatMissionDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ScoutMissionsPage() {
  const [missions, setMissions] = useState<ScoutMissionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    time: "15:00",
    location: "",
    opponent: "",
    prospectName: "",
    notes: "",
  });

  const load = () => {
    setLoading(true);
    scoutApi
      .getMissions()
      .then(setMissions)
      .catch(() => showToast("Erreur chargement missions", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    if (!form.title.trim()) {
      showToast("Titre requis", "error");
      return;
    }
    try {
      await scoutApi.createMission(form);
      showToast("Mission créée ✓", "success");
      setShowForm(false);
      setForm({
        title: "",
        date: new Date().toISOString().split("T")[0],
        time: "15:00",
        location: "",
        opponent: "",
        prospectName: "",
        notes: "",
      });
      load();
    } catch {
      showToast("Erreur création mission", "error");
    }
  };

  const upcoming = missions.filter((m) => new Date(m.date) >= new Date());
  const past = missions.filter((m) => new Date(m.date) < new Date());

  return (
    <ScoutPage>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Missions Scout</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Calendrier des observations terrain et déplacements
          </p>
        </div>
        <motion.button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white"
          style={{ background: `linear-gradient(135deg,${S.primary},${S.primary}cc)` }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          <Plus size={16} /> Planifier mission
        </motion.button>
      </div>

      {showForm && (
        <SCard className="!p-5">
          <p className="text-xs font-bold mb-3" style={{ color: "var(--text-primary)" }}>Nouvelle mission</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { key: "title", label: "Titre", placeholder: "Observation AS Ariana vs ES Sahel" },
              { key: "prospectName", label: "Joueur cible", placeholder: "Youssef Ben Ali" },
              { key: "opponent", label: "Adversaire", placeholder: "ES Sahel" },
              { key: "location", label: "Lieu", placeholder: "Stade de Radès" },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-[10px] font-semibold uppercase block mb-1" style={{ color: "var(--text-muted)" }}>
                  {f.label}
                </label>
                <input
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }}
                />
              </div>
            ))}
            <div>
              <label className="text-[10px] font-semibold uppercase block mb-1" style={{ color: "var(--text-muted)" }}>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase block mb-1" style={{ color: "var(--text-muted)" }}>Heure</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }}
              />
            </div>
          </div>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Notes / consignes..."
            rows={2}
            className="mt-3 w-full rounded-xl border px-3 py-2 text-sm outline-none resize-none"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.09)", color: "var(--text-primary)" }}
          />
          <motion.button
            type="button"
            onClick={() => void submit()}
            className="mt-3 w-full rounded-xl py-2.5 text-sm font-bold text-white"
            style={{ background: S.success }}
            whileTap={{ scale: 0.98 }}
          >
            Enregistrer la mission
          </motion.button>
        </SCard>
      )}

      {loading ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement...</p>
      ) : (
        <>
          <section>
            <p className="text-xs font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <Target size={14} style={{ color: S.primary }} /> À venir ({upcoming.length})
            </p>
            {upcoming.length === 0 ? (
              <SCard className="!p-6 text-center">
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Aucune mission planifiée</p>
              </SCard>
            ) : (
              <div className="space-y-2">
                {upcoming.map((m) => (
                  <MissionCard key={m.id} mission={m} />
                ))}
              </div>
            )}
          </section>

          {past.length > 0 && (
            <section className="mt-6">
              <p className="text-xs font-bold mb-3" style={{ color: "var(--text-muted)" }}>Passées ({past.length})</p>
              <div className="space-y-2 opacity-70">
                {past.map((m) => (
                  <MissionCard key={m.id} mission={m} past />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </ScoutPage>
  );
}

function MissionCard({ mission, past }: { mission: ScoutMissionDto; past?: boolean }) {
  const extra = mission.extra as { opponent?: string; prospectName?: string } | null;

  return (
    <motion.div
      className="rounded-[18px] border p-4"
      style={{
        background: "rgba(12,9,30,0.85)",
        borderColor: past ? "rgba(255,255,255,0.05)" : `${S.primary}25`,
      }}
      whileHover={{ y: past ? 0 : -2 }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: `${S.primary}15`, color: S.primary }}
        >
          <Calendar size={18} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{mission.title}</p>
          <p className="text-[10px] mt-1 flex flex-wrap gap-3" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1"><Calendar size={10} /> {formatMissionDate(mission.date)}</span>
            {mission.time && <span className="flex items-center gap-1"><Clock size={10} /> {mission.time}</span>}
            {mission.location && <span className="flex items-center gap-1"><MapPin size={10} /> {mission.location}</span>}
          </p>
          {extra?.prospectName && (
            <p className="text-[10px] mt-1" style={{ color: S.info }}>Cible: {extra.prospectName}</p>
          )}
          {extra?.opponent && (
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>vs {extra.opponent}</p>
          )}
          {mission.notes && (
            <p className="text-[10px] mt-2 italic" style={{ color: "var(--text-muted)" }}>{mission.notes}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
