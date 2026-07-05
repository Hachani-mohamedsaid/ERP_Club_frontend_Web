import { useState } from "react";
import { motion } from "framer-motion";
import { UserCircle, Bell, Globe, Target, Save, Shield } from "lucide-react";
import { ScoutPage, SCard } from "../../components/scout/ScoutUI";
import { S } from "../../data/scoutData";
import { useAuth } from "../../contexts/AuthContext";
import { showToast } from "../../components/scout/ScoutToast";

const POSITIONS_FOCUS = ["BU", "MC", "DC", "Ailier G", "Ailier D", "DG", "DD", "GK"];
const REGIONS = ["Afrique du Nord", "Afrique de l'Ouest", "Afrique Centrale", "Europe", "Moyen-Orient"];

export function ScoutSettingsPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    fullName: user?.fullName ?? "Scout ODIN",
    email: user?.email ?? "",
    phone: "+216 00 000 000",
    specialization: "Attaquants & Milieux offensifs",
    regions: ["Afrique du Nord", "Afrique de l'Ouest"] as string[],
    positions: ["BU", "MC", "Ailier G"] as string[],
    budgetMax: "2",
    ageMin: "16",
    ageMax: "23",
    notifyNewProspect: true,
    notifyShortlist: true,
    notifyMissionReminder: true,
    language: "fr",
  });

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

  const save = () => {
    setSaved(true);
    showToast("Profil scout enregistré ✓", "success");
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <ScoutPage>
      <div>
        <h1 className="text-lg font-extrabold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <UserCircle size={20} style={{ color: S.primary }} /> Mon profil Scout
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          Préférences de recherche, zones géographiques et notifications
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        {/* Avatar card */}
        <SCard className="!p-5 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-black text-white"
            style={{ background: `linear-gradient(135deg,${S.accent},${S.primary})`, boxShadow: `0 0 32px ${S.primary}30` }}>
            {(profile.fullName || "S").split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <p className="text-base font-extrabold mt-3" style={{ color: "var(--text-primary)" }}>{profile.fullName}</p>
          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Scout · FC Carthage</p>
          <div className="mt-4 rounded-xl border p-3 text-left" style={{ borderColor: "var(--surface-panel-border)" }}>
            <p className="text-[10px] font-bold uppercase mb-2" style={{ color: "var(--text-muted)" }}>Statistiques</p>
            {[
              ["Missions ce mois", "4"],
              ["Rapports soumis", "12"],
              ["Prospects suivis", "42"],
              ["Taux conversion", "18%"],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between text-[11px] py-1">
                <span style={{ color: "var(--text-muted)" }}>{l}</span>
                <span className="font-bold" style={{ color: S.primary }}>{v}</span>
              </div>
            ))}
          </div>
        </SCard>

        <div className="space-y-4">
          {/* Identity */}
          <SCard className="!p-5">
            <p className="text-xs font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <Shield size={14} /> Informations personnelles
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { key: "fullName", label: "Nom complet" },
                { key: "email", label: "Email", type: "email" },
                { key: "phone", label: "Téléphone" },
                { key: "specialization", label: "Spécialisation" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-[10px] font-semibold uppercase block mb-1" style={{ color: "var(--text-muted)" }}>{f.label}</label>
                  <input
                    type={f.type ?? "text"}
                    value={profile[f.key as keyof typeof profile] as string}
                    onChange={(e) => setProfile({ ...profile, [f.key]: e.target.value })}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
                  />
                </div>
              ))}
            </div>
          </SCard>

          {/* Search criteria */}
          <SCard className="!p-5">
            <p className="text-xs font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <Target size={14} style={{ color: S.primary }} /> Critères de recherche par défaut
            </p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { key: "ageMin", label: "Âge min" },
                { key: "ageMax", label: "Âge max" },
                { key: "budgetMax", label: "Budget max (M€)" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-[10px] font-semibold uppercase block mb-1" style={{ color: "var(--text-muted)" }}>{f.label}</label>
                  <input
                    value={profile[f.key as keyof typeof profile] as string}
                    onChange={(e) => setProfile({ ...profile, [f.key]: e.target.value })}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
                  />
                </div>
              ))}
            </div>
            <p className="text-[10px] font-bold uppercase mb-2" style={{ color: "var(--text-muted)" }}>Postes ciblés</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {POSITIONS_FOCUS.map((pos) => (
                <motion.button key={pos} type="button" onClick={() => togglePosition(pos)}
                  className="rounded-full px-3 py-1 text-[10px] font-bold"
                  style={{
                    background: profile.positions.includes(pos) ? S.primary : "rgba(255,255,255,0.05)",
                    color: profile.positions.includes(pos) ? "white" : "var(--text-muted)",
                  }}
                  whileTap={{ scale: 0.95 }}>
                  {pos}
                </motion.button>
              ))}
            </div>
            <p className="text-[10px] font-bold uppercase mb-2 flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
              <Globe size={10} /> Régions couvertes
            </p>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((r) => (
                <motion.button key={r} type="button" onClick={() => toggleRegion(r)}
                  className="rounded-full px-3 py-1 text-[10px] font-bold"
                  style={{
                    background: profile.regions.includes(r) ? `${S.info}20` : "rgba(255,255,255,0.05)",
                    color: profile.regions.includes(r) ? S.info : "var(--text-muted)",
                    border: "1px solid var(--surface-panel-border)",
                  }}
                  whileTap={{ scale: 0.95 }}>
                  {r}
                </motion.button>
              ))}
            </div>
          </SCard>

          {/* Notifications */}
          <SCard className="!p-5">
            <p className="text-xs font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <Bell size={14} /> Notifications
            </p>
            {[
              { key: "notifyNewProspect", label: "Nouveau prospect correspondant à mes critères" },
              { key: "notifyShortlist", label: "Mise à jour shortlist / comité recrutement" },
              { key: "notifyMissionReminder", label: "Rappels missions terrain (24h avant)" },
            ].map((n) => (
              <label key={n.key} className="flex items-center justify-between py-2.5 border-b cursor-pointer"
                style={{ borderColor: "var(--surface-panel-border)" }}>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{n.label}</span>
                <input
                  type="checkbox"
                  checked={profile[n.key as keyof typeof profile] as boolean}
                  onChange={(e) => setProfile({ ...profile, [n.key]: e.target.checked })}
                  className="h-4 w-4 accent-orange-500"
                />
              </label>
            ))}
          </SCard>

          <motion.button type="button" onClick={save}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white"
            style={{ background: saved ? S.success : S.primary }}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Save size={16} />
            {saved ? "Enregistré ✓" : "Enregistrer le profil"}
          </motion.button>
        </div>
      </div>
    </ScoutPage>
  );
}
