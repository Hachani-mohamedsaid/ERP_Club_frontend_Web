import { useState } from "react";
import { Shield, Bell, Users, Palette } from "lucide-react";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import { CLUB_SETTINGS } from "../../data/clubAdminData";

export function ClubParametresPage() {
  const [settings, setSettings] = useState(CLUB_SETTINGS);

  return (
    <ClubPageTransition>
      <ClubKpiCard delay={0.05}>
        <div className="mb-4 flex items-center gap-2">
          <Palette size={16} style={{ color: "#FF6B57" }} />
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Général</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Nom du club</label>
            <input value={settings.general.name} onChange={(e) => setSettings({ ...settings, general: { ...settings.general, name: e.target.value } })} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.05)", color: "var(--text-primary)" }} />
          </div>
          <div>
            <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Couleur principale</label>
            <div className="mt-1 flex items-center gap-2">
              <input type="color" value={settings.general.primaryColor} onChange={(e) => setSettings({ ...settings, general: { ...settings.general, primaryColor: e.target.value } })} className="h-10 w-14 cursor-pointer rounded-lg border-0" />
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{settings.general.primaryColor}</span>
            </div>
          </div>
        </div>
      </ClubKpiCard>

      <ClubKpiCard delay={0.1}>
        <div className="mb-4 flex items-center gap-2">
          <Shield size={16} style={{ color: "#22C55E" }} />
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Sécurité</h3>
        </div>
        <div className="flex items-center justify-between rounded-xl border px-4 py-3" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Authentification 2FA</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Dernière connexion : {settings.security.lastLogin}</p>
          </div>
          <button
            type="button"
            onClick={() => setSettings({ ...settings, security: { ...settings.security, twoFA: !settings.security.twoFA } })}
            className="relative h-6 w-11 rounded-full transition-colors"
            style={{ background: settings.security.twoFA ? "#22C55E" : "rgba(255,255,255,0.1)" }}
          >
            <div className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform" style={{ left: settings.security.twoFA ? 22 : 2 }} />
          </button>
        </div>
      </ClubKpiCard>

      <ClubKpiCard delay={0.15}>
        <div className="mb-4 flex items-center gap-2">
          <Users size={16} style={{ color: "#6366F1" }} />
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Utilisateurs & Rôles</h3>
        </div>
        <div className="space-y-2">
          {settings.users.map((u) => (
            <div key={u.email} className="flex items-center justify-between rounded-xl border px-4 py-3" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{u.name}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{u.email}</p>
              </div>
              <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: "rgba(255,107,87,0.15)", color: "#FF6B57" }}>{u.role}</span>
            </div>
          ))}
        </div>
      </ClubKpiCard>

      <ClubKpiCard delay={0.2}>
        <div className="mb-4 flex items-center gap-2">
          <Bell size={16} style={{ color: "#F59E0B" }} />
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Notifications</h3>
        </div>
        <div className="space-y-3">
          {(["email", "sms", "push"] as const).map((key) => (
            <div key={key} className="flex items-center justify-between rounded-xl border px-4 py-3" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <span className="text-sm capitalize" style={{ color: "var(--text-primary)" }}>{key === "email" ? "Email" : key === "sms" ? "SMS" : "Push"}</span>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, notifications: { ...settings.notifications, [key]: !settings.notifications[key] } })}
                className="relative h-6 w-11 rounded-full transition-colors"
                style={{ background: settings.notifications[key] ? "#FF6B57" : "rgba(255,255,255,0.1)" }}
              >
                <div className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform" style={{ left: settings.notifications[key] ? 22 : 2 }} />
              </button>
            </div>
          ))}
        </div>
      </ClubKpiCard>
    </ClubPageTransition>
  );
}
