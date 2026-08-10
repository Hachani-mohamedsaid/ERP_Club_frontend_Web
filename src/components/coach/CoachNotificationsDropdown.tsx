import { useState, useRef, useEffect } from "react";
import {
  Bell, HeartPulse, Trophy, AlertTriangle,
  CheckCircle2, Users,
} from "lucide-react";
import { clubApi } from "../../lib/api/club";
import { apiFetch } from "../../lib/api/authHeaders";

interface CoachNotification {
  id: string;
  title: string;
  description: string;
  type: "injury" | "match" | "player" | "warning" | "info";
  unread: boolean;
}

const TYPE_ICONS = {
  injury: HeartPulse,
  match: Trophy,
  player: Users,
  warning: AlertTriangle,
  info: CheckCircle2,
};

const TYPE_COLORS = {
  injury: "#ef4444",
  match: "#3b82f6",
  player: "#22c55e",
  warning: "#f59e0b",
  info: "#8b5cf6",
};

export function CoachNotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] =
    useState<CoachNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(
    n => n.unread
  ).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current &&
          !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener(
      "mousedown", handleClick
    );
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const notifs: CoachNotification[] = [];

      try {
        const injRes =
          await clubApi.getInjuries() as any;
        const injuries = injRes?.injured ?? [];

        const today = new Date();

        injuries.forEach((inj: any, i: number) => {
          if (inj.returnDate) {
            const parts = String(inj.returnDate).split("/");
            const returnDate = parts.length === 3
              ? new Date(
                  `${parts[2]}-${parts[1]}-${parts[0]}`
                )
              : new Date(inj.returnDate);

            const days = Math.ceil(
              (returnDate.getTime() - today.getTime())
              / 86400000
            );

            if (!Number.isNaN(days) && days <= 0) {
              notifs.push({
                id: `return_${inj.id}`,
                title: `Retour prévu — ${inj.name}`,
                description: `${inj.injury} — évaluation médicale requise`,
                type: "player",
                unread: true,
              });
            } else if (!Number.isNaN(days) && days <= 3) {
              notifs.push({
                id: `soon_${inj.id}`,
                title: `Retour imminent — ${inj.name}`,
                description: `Dans ${days}j — ${inj.injury}`,
                type: "info",
                unread: true,
              });
            }
          }

          if ((inj.riskIA ?? 0) >= 7) {
            notifs.push({
              id: `risk_${inj.id}`,
              title: `Risque élevé — ${inj.name}`,
              description: `${inj.injury} — Risque ${(inj.riskIA ?? 0) * 10}%`,
              type: "warning",
              unread: i === 0,
            });
          }
        });
      } catch (e) { console.warn(e); }

      try {
        const matchRes = await apiFetch(
          "/club/matches"
        );
        if (matchRes.ok) {
          const matchData = await matchRes.json();
          const nextMatch = matchData?.nextMatch;
          if (nextMatch &&
              matchData.daysToNext <= 3 &&
              matchData.daysToNext >= 0) {
            notifs.unshift({
              id: "next_match",
              title: `Match dans ${matchData.daysToNext}j`,
              description: `vs ${nextMatch.opponent} — ${nextMatch.competition}`,
              type: "match",
              unread: true,
            });
          }
        }
      } catch (e) { console.warn(e); }

      try {
        const players =
          await clubApi.getPlayers() as any[];
        const disponibles = players.filter(
          (p: any) => p.status === "DISPONIBLE"
        ).length;
        const total = players.length;

        if (total > 0) {
          notifs.push({
            id: "squad_status",
            title: `Effectif: ${disponibles}/${total} disponibles`,
            description: total - disponibles > 0
              ? `${total - disponibles} joueur(s) indisponible(s)`
              : "Effectif au complet",
            type: disponibles === total
              ? "player" : "warning",
            unread: false,
          });
        }
      } catch (e) { console.warn(e); }

      if (notifs.length === 0) {
        notifs.push({
          id: "all_good",
          title: "Tout est en ordre",
          description:
            "Aucune alerte pour votre équipe",
          type: "info",
          unread: false,
        });
      }

      setNotifications(notifs);
      setLoading(false);
    };

    load();
  }, []);

  const markAllRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, unread: false }))
    );
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          position: "relative",
          width: 36, height: 36, borderRadius: 10,
          background: open
            ? "rgba(255,122,0,0.12)"
            : "rgba(255,255,255,0.05)",
          border: `1px solid ${open
            ? "rgba(255,122,0,0.30)"
            : "rgba(255,255,255,0.10)"}`,
          display: "flex", alignItems: "center",
          justifyContent: "center", cursor: "pointer",
        }}>
        <Bell size={16} style={{
          color: open
            ? "#ff7a00" : "var(--text-secondary)",
        }} />
        {unreadCount > 0 && (
          <span style={{
            position: "absolute",
            top: -4, right: -4,
            width: 16, height: 16,
            borderRadius: "50%",
            background: "#ef4444",
            color: "white",
            fontSize: 9, fontWeight: 800,
            display: "flex", alignItems: "center",
            justifyContent: "center",
            border: "2px solid var(--bg-primary)",
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          width: 320,
          background: "rgba(14,10,35,0.98)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 16,
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          zIndex: 100,
          overflow: "hidden",
        }}>
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            borderBottom:
              "1px solid rgba(255,255,255,0.08)",
          }}>
            <p style={{
              fontSize: 13, fontWeight: 700,
              color: "var(--text-primary)",
            }}>
              Notifications
            </p>
            <div style={{
              display: "flex", gap: 8,
              alignItems: "center",
            }}>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  style={{
                    fontSize: 10, fontWeight: 600,
                    color: "#ff7a00",
                    background: "rgba(255,122,0,0.10)",
                    border:
                      "1px solid rgba(255,122,0,0.25)",
                    borderRadius: 6,
                    padding: "3px 8px",
                    cursor: "pointer",
                  }}>
                  Tout lire
                </button>
              )}
              <span style={{
                fontSize: 10,
                color: "var(--text-muted)",
              }}>
                {unreadCount} non lu(s)
              </span>
            </div>
          </div>

          <div style={{
            maxHeight: 340, overflowY: "auto",
            padding: "8px 0",
          }}>
            {loading ? (
              <div style={{
                textAlign: "center",
                padding: "24px 0",
                color: "var(--text-muted)",
                fontSize: 12,
              }}>
                Chargement...
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = TYPE_ICONS[n.type];
                const color = TYPE_COLORS[n.type];
                return (
                  <div
                    key={n.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: "10px 16px",
                      background: n.unread
                        ? "rgba(255,255,255,0.03)"
                        : "transparent",
                      borderLeft: n.unread
                        ? `3px solid ${color}`
                        : "3px solid transparent",
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}>
                    <div style={{
                      width: 32, height: 32,
                      borderRadius: 9,
                      background: `${color}15`,
                      border: `1px solid ${color}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <Icon size={14}
                        style={{ color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 12, fontWeight: 700,
                        color: "var(--text-primary)",
                        marginBottom: 2,
                      }}>
                        {n.title}
                      </p>
                      <p style={{
                        fontSize: 10,
                        color: "var(--text-muted)",
                        lineHeight: 1.4,
                      }}>
                        {n.description}
                      </p>
                    </div>
                    {n.unread && (
                      <div style={{
                        width: 7, height: 7,
                        borderRadius: "50%",
                        background: color,
                        flexShrink: 0,
                        marginTop: 4,
                      }} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
