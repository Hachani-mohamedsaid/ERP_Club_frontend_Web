import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserCircle, Bell, Globe, Target, Save, Shield, Loader2, RefreshCw } from "lucide-react";
import { ScoutPage, SCard } from "../../components/scout/ScoutUI";
import { S } from "../../data/scoutData";
import { useAuth } from "../../contexts/AuthContext";
import { showToast } from "../../components/scout/ScoutToast";
import { scoutApi, type ScoutProfileDto } from "../../lib/api/scout";

const POSITIONS_FOCUS = ["BU", "MC", "DC", "Ailier G", "Ailier D", "DG", "DD", "GK", "MOC", "MDC"];
const REGIONS = [
  "Afrique du Nord",
  "Afrique de l'Ouest",
  "Afrique Centrale",
  "Europe",
  "Royaume-Uni",
  "Amérique du Sud",
  "Moyen-Orient",
  "Asie",
];

type ProfileForm = {
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  regions: string[];
  positions: string[];
  budgetMax: string;
  ageMin: string;
  ageMax: string;
  notifyNewProspect: boolean;
  notifyShortlist: boolean;
  notifyMissionReminder: boolean;
  language: string;
};

function fromDto(dto: ScoutProfileDto): ProfileForm {
  return {
    fullName: dto.fullName,
    email: dto.email,
    phone: dto.phone || "",
    specialization: dto.specialization,
    regions: dto.regions,
    positions: dto.positions,
    budgetMax: dto.budgetMax,
    ageMin: dto.ageMin,
    ageMax: dto.ageMax,
    notifyNewProspect: dto.notifyNewProspect,
    notifyShortlist: dto.notifyShortlist,
    notifyMissionReminder: dto.notifyMissionReminder,
    language: dto.language,
  };
}

export function ScoutSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [meta, setMeta] = useState<{
    clubName: string;
    country: string;
    league: string;
    season: string;
    stats: ScoutProfileDto["stats"];
  } | null>(null);
  const [profile, setProfile] = useState<ProfileForm>({
    fullName: user?.fullName ?? "Scout ODIN",
    email: user?.email ?? "",
    phone: "",
    specialization: "Attaquants & Milieux offensifs",
    regions: ["Europe"],
    positions: ["BU", "MC"],
    budgetMax: "25",
    ageMin: "16",
    ageMax: "25",
    notifyNewProspect: true,
    notifyShortlist: true,
    notifyMissionReminder: true,
    language: "fr",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const dto = await scoutApi.getProfile();
      setProfile(fromDto(dto));
      setMeta({
        clubName: dto.clubName,
        country: dto.country,
        league: dto.league,
        season: dto.season,
        stats: dto.stats,
      });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur chargement profil", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleRegion = (r: string) => {
    setProfile((p) => ({
      ...p,
      regions: p.regions.includes(r) ? p.regions.filter((x) => x !== r) : [...p.regions, r],
    }));
  };

  const togglePosition = (pos: string) => {
    setProfile((p) => ({
      ...p,
      positions: p.positions.includes(pos) ? p.positions.filter((x) => x !== pos) : [...p.positions, pos],
    }));
  };

  const save = async () => {
    if (!profile.fullName.trim()) {
      showToast("Nom complet requis", "error");
      return;
    }
    const ageMin = Number(profile.ageMin);
    const ageMax = Number(profile.ageMax);
    if (Number.isFinite(ageMin) && Number.isFinite(ageMax) && ageMin > ageMax) {
      showToast("Âge min doit être ≤ âge max", "error");
      return;
    }

    setSaving(true);
    try {
      const dto = await scoutApi.updateProfile({
        fullName: profile.fullName.trim(),
        phone: profile.phone.trim(),
        specialization: profile.specialization,
        regions: profile.regions,
        positions: profile.positions,
        budgetMax: profile.budgetMax,
        ageMin: profile.ageMin,
        ageMax: profile.ageMax,
        notifyNewProspect: profile.notifyNewProspect,
        notifyShortlist: profile.notifyShortlist,
        notifyMissionReminder: profile.notifyMissionReminder,
        language: profile.language,
      });
      setProfile(fromDto(dto));
      setMeta({
        clubName: dto.clubName,
        country: dto.country,
        league: dto.league,
        season: dto.season,
        stats: dto.stats,
      });
      setSaved(true);
      showToast("Profil scout enregistré ✓", "success");
      window.setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur sauvegarde", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScoutPage className="flex items-center justify-center gap-2 py-16">
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: S.primary }} />
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement du profil…</span>
      </ScoutPage>
    );
  }

  const clubLabel = meta?.clubName || user?.organization?.clubName || "Club";
  const stats = meta?.stats;

  return (
    <ScoutPage>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <UserCircle size={20} style={{ color: S.primary }} /> Mon profil Scout
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Préférences live · stats réelles · saison {meta?.season ?? "2026-2027"}
          </p>
        </div>
        <motion.button
          type="button"
          onClick={() => void load()}
          className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold"
          style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-muted)" }}
          whileTap={{ scale: 0.96 }}
        >
          <RefreshCw size={12} /> Actualiser
        </motion.button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <SCard className="!p-5 text-center">
          <div
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-black text-white"
            style={{
              background: `linear-gradient(135deg,${S.accent},${S.primary})`,
              boxShadow: `0 0 32px ${S.primary}30`,
            }}
          >
            {(profile.fullName || "S")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <p className="text-base font-extrabold mt-3" style={{ color: "var(--text-primary)" }}>
            {profile.fullName}
          </p>
          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            Scout · {clubLabel}
            {meta?.league ? ` · ${meta.league}` : ""}
          </p>
          {meta?.country && (
            <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{meta.country}</p>
          )}
          <div className="mt-4 rounded-xl border p-3 text-left" style={{ borderColor: "var(--surface-panel-border)" }}>
            <p className="text-[10px] font-bold uppercase mb-2" style={{ color: "var(--text-muted)" }}>
              Statistiques live
            </p>
            {[
              ["Missions ce mois", String(stats?.missionsThisMonth ?? 0)],
              ["Rapports soumis", String(stats?.reportsSubmitted ?? 0)],
              ["Prospects suivis", String(stats?.prospectsFollowed ?? 0)],
              ["Pipeline total", String(stats?.prospectsTotal ?? 0)],
              ["Taux conversion", `${stats?.conversionRate ?? 0}%`],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between text-[11px] py-1">
                <span style={{ color: "var(--text-muted)" }}>{l}</span>
                <span className="font-bold" style={{ color: S.primary }}>{v}</span>
              </div>
            ))}
          </div>
        </SCard>

        <div className="space-y-4">
          <SCard className="!p-5">
            <p className="text-xs font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <Shield size={14} /> Informations personnelles
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { key: "fullName" as const, label: "Nom complet" },
                { key: "email" as const, label: "Email", type: "email", readOnly: true },
                { key: "phone" as const, label: "Téléphone" },
                { key: "specialization" as const, label: "Spécialisation" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-[10px] font-semibold uppercase block mb-1" style={{ color: "var(--text-muted)" }}>
                    {f.label}
                  </label>
                  <input
                    type={f.type ?? "text"}
                    readOnly={f.readOnly}
                    value={profile[f.key]}
                    onChange={(e) => setProfile({ ...profile, [f.key]: e.target.value })}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{
                      background: f.readOnly ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)",
                      borderColor: "var(--surface-panel-border)",
                      color: "var(--text-primary)",
                      opacity: f.readOnly ? 0.7 : 1,
                    }}
                  />
                </div>
              ))}
            </div>
          </SCard>

          <SCard className="!p-5">
            <p className="text-xs font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <Target size={14} style={{ color: S.primary }} /> Critères de recherche par défaut
            </p>
            <p className="text-[10px] mb-3" style={{ color: "var(--text-muted)" }}>
              Ces filtres s&apos;appliquent automatiquement à la page Recherche
            </p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { key: "ageMin" as const, label: "Âge min" },
                { key: "ageMax" as const, label: "Âge max" },
                { key: "budgetMax" as const, label: "Budget max (M€)" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-[10px] font-semibold uppercase block mb-1" style={{ color: "var(--text-muted)" }}>
                    {f.label}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={profile[f.key]}
                    onChange={(e) => setProfile({ ...profile, [f.key]: e.target.value })}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      borderColor: "var(--surface-panel-border)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              ))}
            </div>
            <p className="text-[10px] font-bold uppercase mb-2" style={{ color: "var(--text-muted)" }}>
              Postes ciblés
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {POSITIONS_FOCUS.map((pos) => (
                <motion.button
                  key={pos}
                  type="button"
                  onClick={() => togglePosition(pos)}
                  className="rounded-full px-3 py-1 text-[10px] font-bold"
                  style={{
                    background: profile.positions.includes(pos) ? S.primary : "rgba(255,255,255,0.05)",
                    color: profile.positions.includes(pos) ? "white" : "var(--text-muted)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {pos}
                </motion.button>
              ))}
            </div>
            <p className="text-[10px] font-bold uppercase mb-2 flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
              <Globe size={10} /> Régions couvertes
            </p>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((r) => (
                <motion.button
                  key={r}
                  type="button"
                  onClick={() => toggleRegion(r)}
                  className="rounded-full px-3 py-1 text-[10px] font-bold"
                  style={{
                    background: profile.regions.includes(r) ? `${S.info}20` : "rgba(255,255,255,0.05)",
                    color: profile.regions.includes(r) ? S.info : "var(--text-muted)",
                    border: "1px solid var(--surface-panel-border)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {r}
                </motion.button>
              ))}
            </div>
          </SCard>

          <SCard className="!p-5">
            <p className="text-xs font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <Bell size={14} /> Notifications
            </p>
            {[
              { key: "notifyNewProspect" as const, label: "Nouveau prospect correspondant à mes critères" },
              { key: "notifyShortlist" as const, label: "Mise à jour shortlist / comité recrutement" },
              { key: "notifyMissionReminder" as const, label: "Rappels missions terrain (24h avant)" },
            ].map((n) => (
              <label
                key={n.key}
                className="flex items-center justify-between py-2.5 border-b cursor-pointer"
                style={{ borderColor: "var(--surface-panel-border)" }}
              >
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{n.label}</span>
                <input
                  type="checkbox"
                  checked={profile[n.key]}
                  onChange={(e) => setProfile({ ...profile, [n.key]: e.target.checked })}
                  className="h-4 w-4 accent-orange-500"
                />
              </label>
            ))}
          </SCard>

          <motion.button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white disabled:opacity-60"
            style={{ background: saved ? S.success : S.primary }}
            whileHover={{ scale: saving ? 1 : 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saved ? "Enregistré ✓" : saving ? "Enregistrement…" : "Enregistrer le profil"}
          </motion.button>
        </div>
      </div>
    </ScoutPage>
  );
}
