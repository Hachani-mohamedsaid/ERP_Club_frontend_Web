import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Briefcase, Phone, Mail, MessageSquare, User, Star, ExternalLink, Search,
} from "lucide-react";
import { ScoutPage, SCard, SBadge } from "../../components/scout/ScoutUI";
import { S } from "../../data/scoutData";
import { useScoutProspects } from "../../hooks/useScoutData";

interface AgentRow {
  name: string;
  agency: string;
  email: string;
  phone: string;
  country: string;
  flag: string;
  players: string[];
  rating: number;
  deals: number;
  lastContact: string;
  status: "actif" | "négociation" | "inactif";
}

const AGENTS: AgentRow[] = [
  {
    name: "Karim Boutaïeb",
    agency: "KB Sports Management",
    email: "k.boutaieb@kbsports.tn",
    phone: "+216 98 123 456",
    country: "Tunisie",
    flag: "🇹🇳",
    players: ["Youssef Ben Ali"],
    rating: 4.5,
    deals: 12,
    lastContact: "20/06/2026",
    status: "négociation",
  },
  {
    name: "Samba Diallo Agency",
    agency: "SDA International",
    email: "contact@sda.sn",
    phone: "+221 77 456 789",
    country: "Sénégal",
    flag: "🇸🇳",
    players: ["Ibrahim Touré"],
    rating: 4.8,
    deals: 28,
    lastContact: "18/06/2026",
    status: "actif",
  },
  {
    name: "Ahmed Merabet",
    agency: "Merabet & Associés",
    email: "a.merabet@merabet.dz",
    phone: "+213 555 234 567",
    country: "Algérie",
    flag: "🇩🇿",
    players: ["Ali Messi"],
    rating: 3.9,
    deals: 8,
    lastContact: "05/06/2026",
    status: "inactif",
  },
];

const STATUS_STYLE = {
  actif: { color: S.success, bg: `${S.success}15`, label: "Actif" },
  négociation: { color: S.primary, bg: `${S.primary}15`, label: "En négociation" },
  inactif: { color: "var(--text-muted)", bg: "rgba(255,255,255,0.06)", label: "Inactif" },
};

export function ScoutAgentsPage() {
  const navigate = useNavigate();
  const { prospects } = useScoutProspects();
  const [search, setSearch] = useState("");

  const agents = useMemo(() => {
    return AGENTS.map((a) => ({
      ...a,
      playerIds: a.players.map((name) => prospects.find((p) => p.name === name)?.id).filter(Boolean) as string[],
    }));
  }, [prospects]);

  const filtered = agents.filter(
    (a) => !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.agency.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <ScoutPage>
      <div>
        <h1 className="text-lg font-extrabold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <Briefcase size={20} style={{ color: S.primary }} /> CRM Agents & Intermédiaires
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          Contacts agents, historique négociations et joueurs représentés
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-xl border px-3 py-2"
        style={{ background: "rgba(8,6,24,0.85)", borderColor: "rgba(255,255,255,0.09)" }}>
        <Search size={14} style={{ color: "var(--text-muted)" }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher agent ou agence..."
          className="flex-1 bg-transparent text-sm outline-none" style={{ color: "var(--text-primary)" }} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filtered.map((agent) => {
          const st = STATUS_STYLE[agent.status];
          return (
            <SCard key={agent.name} className="!p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl"
                  style={{ background: `${S.primary}15` }}>
                  {agent.flag}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-extrabold" style={{ color: "var(--text-primary)" }}>{agent.name}</p>
                    <SBadge color={st.color} bg={st.bg}>{st.label}</SBadge>
                  </div>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{agent.agency} · {agent.country}</p>
                  <div className="mt-2 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={11}
                        fill={i < Math.floor(agent.rating) ? S.primary : "none"}
                        style={{ color: S.primary, opacity: i < agent.rating ? 1 : 0.2 }} />
                    ))}
                    <span className="text-[10px] ml-1 font-bold" style={{ color: S.primary }}>{agent.rating}</span>
                    <span className="text-[10px] ml-2" style={{ color: "var(--text-muted)" }}>{agent.deals} deals</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--text-muted)" }}>
                  <Mail size={12} style={{ color: S.info }} /> {agent.email}
                </div>
                <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--text-muted)" }}>
                  <Phone size={12} style={{ color: S.success }} /> {agent.phone}
                </div>
                <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--text-muted)" }}>
                  <MessageSquare size={12} style={{ color: S.accent }} /> Dernier contact: {agent.lastContact}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <p className="text-[10px] font-bold uppercase mb-2" style={{ color: "var(--text-muted)" }}>
                  Joueurs représentés
                </p>
                <div className="flex flex-wrap gap-2">
                  {agent.players.map((name, i) => {
                    const pid = agent.playerIds[i];
                    return (
                      <motion.button
                        key={name}
                        type="button"
                        disabled={!pid}
                        onClick={() => pid && navigate(`/scout/prospect/${pid}`)}
                        className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[10px] font-bold"
                        style={{
                          borderColor: `${S.primary}30`,
                          color: S.primary,
                          background: `${S.primary}08`,
                          opacity: pid ? 1 : 0.5,
                        }}
                        whileHover={pid ? { scale: 1.03 } : undefined}
                      >
                        <User size={10} /> {name}
                        {pid && <ExternalLink size={9} />}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <motion.button type="button"
                  className="flex-1 rounded-xl py-2 text-[10px] font-bold text-white"
                  style={{ background: S.primary }}
                  whileTap={{ scale: 0.97 }}>
                  Contacter
                </motion.button>
                <motion.button type="button"
                  className="flex-1 rounded-xl py-2 text-[10px] font-bold"
                  style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}
                  whileTap={{ scale: 0.97 }}>
                  Historique
                </motion.button>
              </div>
            </SCard>
          );
        })}
      </div>

      {/* Sans agent */}
      <SCard className="!p-4">
        <p className="text-xs font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Joueurs sans agent — négociation directe
        </p>
        <div className="flex flex-wrap gap-2">
          {prospects.filter((p) => !p.agent).map((p) => (
            <motion.button key={p.id} type="button" onClick={() => navigate(`/scout/prospect/${p.id}`)}
              className="rounded-xl border px-3 py-1.5 text-[10px] font-bold"
              style={{ borderColor: `${S.success}30`, color: S.success, background: `${S.success}08` }}
              whileHover={{ scale: 1.03 }}>
              {p.flag} {p.name}
            </motion.button>
          ))}
        </div>
      </SCard>
    </ScoutPage>
  );
}
