import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Briefcase, Phone, Mail, MessageSquare, User, Star, ExternalLink, Search,
  Loader2, RefreshCw, AlertTriangle, X, History, Sparkles, Plus, Trash2,
} from "lucide-react";
import { ScoutPage, SCard, SBadge } from "../../components/scout/ScoutUI";
import { S } from "../../data/scoutData";
import { scoutApi, type ScoutAgentDto } from "../../lib/api/scout";
import { showToast } from "../../components/scout/ScoutToast";

const STATUS_STYLE = {
  actif: { color: S.success, bg: `${S.success}15`, label: "Actif" },
  négociation: { color: S.primary, bg: `${S.primary}15`, label: "En négociation" },
  inactif: { color: "var(--text-muted)", bg: "rgba(255,255,255,0.06)", label: "Inactif" },
};

function AgentCard({
  agent,
  onContact,
  onHistory,
  onAdd,
  onRemove,
  adding,
  mode,
}: {
  agent: ScoutAgentDto;
  onContact?: () => void;
  onHistory?: () => void;
  onAdd?: () => void;
  onRemove?: () => void;
  adding?: boolean;
  mode: "crm" | "pick";
}) {
  const st = STATUS_STYLE[agent.status];
  return (
    <SCard className="!p-5">
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
        {agent.email && (
          <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--text-muted)" }}>
            <Mail size={12} style={{ color: S.info }} /> {agent.email}
          </div>
        )}
        {agent.phone && (
          <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--text-muted)" }}>
            <Phone size={12} style={{ color: S.success }} /> {agent.phone}
          </div>
        )}
        {agent.lastContact && (
          <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--text-muted)" }}>
            <MessageSquare size={12} style={{ color: S.accent }} /> Dernier contact: {agent.lastContact}
          </div>
        )}
        {agent.aiNotes && (
          <p className="text-[10px] italic" style={{ color: "var(--text-secondary)" }}>{agent.aiNotes}</p>
        )}
      </div>

      {agent.players.length > 0 && (
        <div className="mt-4 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <p className="text-[10px] font-bold uppercase mb-2" style={{ color: "var(--text-muted)" }}>
            Joueurs représentés
          </p>
          <div className="flex flex-wrap gap-2">
            {agent.players.map((player) => (
              <span key={player.id}
                className="flex items-center gap-1 rounded-xl border px-2 py-1 text-[10px] font-bold"
                style={{ borderColor: `${S.primary}30`, color: S.primary, background: `${S.primary}08` }}>
                <User size={10} /> {player.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        {mode === "pick" && onAdd && (
          <motion.button type="button" onClick={onAdd} disabled={adding}
            className="flex-1 flex items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-bold text-white disabled:opacity-50"
            style={{ background: S.success }}
            whileTap={{ scale: 0.97 }}>
            {adding ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
            Ajouter au CRM
          </motion.button>
        )}
        {mode === "crm" && (
          <>
            {onContact && (
              <motion.button type="button" onClick={onContact}
                className="flex-1 rounded-xl py-2 text-[10px] font-bold text-white"
                style={{ background: S.primary }}
                whileTap={{ scale: 0.97 }}>
                Contacter
              </motion.button>
            )}
            {onHistory && (
              <motion.button type="button" onClick={onHistory}
                className="flex-1 rounded-xl py-2 text-[10px] font-bold"
                style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}
                whileTap={{ scale: 0.97 }}>
                Historique
              </motion.button>
            )}
            {onRemove && (
              <motion.button type="button" onClick={onRemove}
                className="rounded-xl px-3 py-2 text-[10px] font-bold"
                style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444" }}
                whileTap={{ scale: 0.97 }}>
                <Trash2 size={12} />
              </motion.button>
            )}
          </>
        )}
      </div>
    </SCard>
  );
}

export function ScoutAgentsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [data, setData] = useState<Awaited<ReturnType<typeof scoutApi.getAgents>> | null>(null);
  const [pickList, setPickList] = useState<ScoutAgentDto[]>([]);
  const [pickText, setPickText] = useState("");
  const [pickMode, setPickMode] = useState<"search" | "suggest" | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historyAgent, setHistoryAgent] = useState<ScoutAgentDto | null>(null);
  const [historyData, setHistoryData] = useState<Awaited<ReturnType<typeof scoutApi.getAgentHistory>> | null>(null);
  const [contactData, setContactData] = useState<Awaited<ReturnType<typeof scoutApi.getAgentContactDraft>> | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const loadAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await scoutApi.getAgents();
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur chargement agents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAgents();
  }, [loadAgents]);

  const crmAgents = useMemo(() => {
    const agents = data?.agents ?? [];
    if (!search.trim() || pickMode) return agents;
    const q = search.toLowerCase();
    return agents.filter(
      (a) => a.name.toLowerCase().includes(q) || a.agency.toLowerCase().includes(q),
    );
  }, [data?.agents, search, pickMode]);

  async function runSearch() {
    if (search.trim().length < 2) {
      showToast("Tapez au moins 2 caractères", "info");
      return;
    }
    setSearching(true);
    setError(null);
    setPickMode("search");
    try {
      const res = await scoutApi.searchAgents(search.trim());
      setPickList(res.results);
      setPickText(res.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur recherche agent.");
      setPickList([]);
    } finally {
      setSearching(false);
    }
  }

  async function runSuggest() {
    setSuggesting(true);
    setError(null);
    setPickMode("suggest");
    setSearch("");
    try {
      const res = await scoutApi.suggestAgents();
      setPickList(res.suggestions);
      setPickText(res.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur propositions IA.");
      setPickList([]);
    } finally {
      setSuggesting(false);
    }
  }

  async function addToCrm(agent: ScoutAgentDto) {
    setAddingId(agent.id);
    try {
      await scoutApi.addAgent(agent);
      showToast(`${agent.name} ajouté au CRM ✓`, "success");
      setPickList((prev) => prev.filter((a) => a.id !== agent.id));
      await loadAgents();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur ajout.", "error");
    } finally {
      setAddingId(null);
    }
  }

  async function removeFromCrm(agentId: string) {
    try {
      await scoutApi.removeAgent(agentId);
      showToast("Agent retiré du CRM", "info");
      await loadAgents();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur suppression.", "error");
    }
  }

  async function openHistory(agent: ScoutAgentDto) {
    setHistoryAgent(agent);
    setHistoryData(null);
    setContactData(null);
    setModalLoading(true);
    try {
      setHistoryData(await scoutApi.getAgentHistory(agent.id));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur historique.", "error");
      setHistoryAgent(null);
    } finally {
      setModalLoading(false);
    }
  }

  async function openContact(agent: ScoutAgentDto) {
    setHistoryAgent(agent);
    setHistoryData(null);
    setContactData(null);
    setModalLoading(true);
    try {
      setContactData(await scoutApi.getAgentContactDraft(agent.id));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur email.", "error");
      setHistoryAgent(null);
    } finally {
      setModalLoading(false);
    }
  }

  function closeModal() {
    setHistoryAgent(null);
    setHistoryData(null);
    setContactData(null);
  }

  if (loading && !data) {
    return (
      <ScoutPage className="flex items-center justify-center gap-2 py-16">
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: S.primary }} />
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement CRM agents…</span>
      </ScoutPage>
    );
  }

  return (
    <ScoutPage>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Briefcase size={20} style={{ color: S.primary }} /> CRM Agents & Intermédiaires
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {data?.summary.totalAgents ?? 0} agents CRM · recherche agents réels via OpenAI
          </p>
        </div>
        <motion.button type="button" onClick={() => void runSuggest()} disabled={suggesting}
          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
          style={{ background: `linear-gradient(135deg,${S.accent},#4F46E5)` }}
          whileTap={{ scale: 0.96 }}>
          {suggesting ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
          Propositions IA
        </motion.button>
      </div>

      {data?.status === "no_key" && (
        <div className="flex items-start gap-2 rounded-xl border p-3 text-sm text-amber-300"
          style={{ borderColor: "rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.08)" }}>
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          Clé OpenAI requise pour rechercher et proposer des agents réels.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
      )}

      <div className="flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border px-3 py-2"
          style={{ background: "rgba(8,6,24,0.85)", borderColor: "rgba(255,255,255,0.09)" }}>
          <Search size={14} style={{ color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); if (!e.target.value) { setPickMode(null); setPickList([]); } }}
            onKeyDown={(e) => e.key === "Enter" && void runSearch()}
            placeholder="Rechercher un agent réel par nom ou agence…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--text-primary)" }}
          />
        </div>
        <motion.button type="button" onClick={() => void runSearch()} disabled={searching}
          className="rounded-xl px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
          style={{ background: S.primary }}
          whileTap={{ scale: 0.96 }}>
          {searching ? <Loader2 size={14} className="animate-spin" /> : "Rechercher"}
        </motion.button>
      </div>

      {(pickMode && (searching || suggesting)) && (
        <SCard className="!p-6 flex items-center justify-center gap-2">
          <Loader2 size={18} className="animate-spin" style={{ color: S.primary }} />
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            {pickMode === "suggest" ? "L'IA propose des agents…" : "Recherche d'agents réels…"}
          </span>
        </SCard>
      )}

      {pickList.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              {pickMode === "suggest" ? "Propositions IA — choisissez un agent" : `Résultats pour "${search}"`}
            </p>
            <button type="button" className="text-[10px]" style={{ color: "var(--text-muted)" }}
              onClick={() => { setPickList([]); setPickMode(null); setPickText(""); }}>
              Fermer
            </button>
          </div>
          {pickText && (
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{pickText}</p>
          )}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {pickList.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                mode="pick"
                adding={addingId === agent.id}
                onAdd={() => void addToCrm(agent)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Mon CRM ({crmAgents.length})</p>
        {crmAgents.length === 0 ? (
          <SCard className="!p-8 text-center">
            <Sparkles size={28} className="mx-auto mb-2 opacity-30" style={{ color: S.accent }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Aucun agent dans votre CRM.
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Cliquez <strong>Propositions IA</strong> ou recherchez par nom pour ajouter un agent réel.
            </p>
          </SCard>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {crmAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                mode="crm"
                onContact={() => void openContact(agent)}
                onHistory={() => void openHistory(agent)}
                onRemove={() => void removeFromCrm(agent.id)}
              />
            ))}
          </div>
        )}
      </div>

      <SCard className="!p-4">
        <p className="text-xs font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Joueurs sans agent — négociation directe
        </p>
        <div className="flex flex-wrap gap-2">
          {(data?.withoutAgent ?? []).map((p) => (
            <motion.button key={p.id} type="button" onClick={() => navigate(`/scout/prospect/${p.id}`)}
              className="rounded-xl border px-3 py-1.5 text-[10px] font-bold"
              style={{ borderColor: `${S.success}30`, color: S.success, background: `${S.success}08` }}
              whileHover={{ scale: 1.03 }}>
              {p.flag} {p.name}
            </motion.button>
          ))}
        </div>
      </SCard>

      <AnimatePresence>
        {historyAgent && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.65)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="w-full max-w-lg rounded-2xl border p-5 max-h-[80vh] overflow-y-auto"
              style={{ background: "rgba(12,9,30,0.98)", borderColor: "rgba(255,255,255,0.1)" }}
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  {contactData ? <Mail size={16} style={{ color: S.primary }} /> : <History size={16} style={{ color: S.info }} />}
                  {contactData?.subject ?? historyData?.title ?? historyAgent.name}
                </p>
                <button type="button" onClick={closeModal}><X size={18} style={{ color: "var(--text-muted)" }} /></button>
              </div>
              {modalLoading ? (
                <div className="flex items-center justify-center gap-2 py-8">
                  <Loader2 size={18} className="animate-spin" style={{ color: S.primary }} />
                </div>
              ) : contactData ? (
                <div className="space-y-3 text-sm">
                  <p style={{ color: "var(--text-muted)" }}>À: {contactData.email}</p>
                  <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{contactData.subject}</p>
                  <div className="rounded-xl border p-3 whitespace-pre-line text-xs"
                    style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--text-secondary)" }}>
                    {contactData.body}
                  </div>
                </div>
              ) : historyData ? (
                <div className="space-y-3">
                  {historyData.summary && <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{historyData.summary}</p>}
                  {historyData.entries.map((entry, i) => (
                    <div key={i} className="rounded-xl border p-3 text-xs" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                      <div className="flex justify-between mb-1">
                        <span className="font-bold" style={{ color: S.primary }}>{entry.date}</span>
                        <span style={{ color: "var(--text-muted)" }}>{entry.type}</span>
                      </div>
                      <p style={{ color: "var(--text-primary)" }}>{entry.subject}</p>
                      <p className="mt-1" style={{ color: "var(--text-muted)" }}>{entry.outcome}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ScoutPage>
  );
}
