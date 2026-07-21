import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, ShieldAlert, Stethoscope, AlertTriangle, CheckCircle2, ChevronDown } from "lucide-react";
import type { InjuryRiskEntry } from "../../data/preparateurData";
import { getRiskColor } from "../../data/preparateurData";
import { clubApi } from "../../lib/api/club";

const BODY_ZONES = [
  "Hamstring", "Genou gauche", "Genou droit", "Cheville gauche", "Cheville droite",
  "Épaule gauche", "Épaule droite", "Ischio-jambiers", "Mollet gauche", "Mollet droit",
  "Dos / Lombaires", "Hanche", "Cuisse gauche", "Cuisse droite", "Adducteurs",
  "Pied gauche", "Pied droit", "Cervicales", "Abdominaux",
];

const QUICK_RECS = [
  "Réduire charge 20%", "Repos 48h", "Repos 72h", "Cryothérapie",
  "Renforcement proprioception", "Suivi médecin", "Pas de sprint",
  "Course linéaire uniquement", "Pas de contact", "Étirements quotidiens",
  "Mobilité lombaire", "Réathlétisation progressive", "Hydratation renforcée",
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (entry: InjuryRiskEntry) => void;
  editEntry?: InjuryRiskEntry | null;
}

function RiskSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const color = getRiskColor(value);
  const pct = value;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
          Risque blessure
        </span>
        <div className="flex items-center gap-1.5">
          <motion.span
            key={value}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="text-2xl font-black tabular-nums"
            style={{ color }}
          >
            {value}%
          </motion.span>
          <span className="text-xs font-semibold" style={{ color }}>
            {value >= 60 ? "Critique" : value >= 30 ? "Moyen" : "Faible"}
          </span>
        </div>
      </div>

      <div className="relative h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: `linear-gradient(90deg, #22C55E, ${color})`, width: `${pct}%` }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        />
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-3 opacity-0 absolute"
        style={{ cursor: "pointer", marginTop: -12 }}
      />

      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: color, cursor: "pointer" }}
      />

      <div className="flex justify-between text-[10px]" style={{ color: "var(--text-muted)" }}>
        <span>0 — Faible</span>
        <span>50 — Moyen</span>
        <span>100 — Critique</span>
      </div>
    </div>
  );
}

function SelectField({
  label, value, onChange, options, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-sm text-left transition-colors"
        style={{
          background: "rgba(255,255,255,0.04)",
          borderColor: open ? "rgba(255,107,87,0.5)" : "rgba(255,255,255,0.08)",
          color: value ? "var(--text-primary)" : "var(--text-muted)",
          boxShadow: open ? "0 0 0 2px rgba(255,107,87,0.15)" : "none",
        }}
      >
        <span>{value || placeholder}</span>
        <ChevronDown size={15} className={`transition-transform ${open ? "rotate-180" : ""}`} style={{ color: "var(--text-muted)" }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1.5 w-full rounded-xl border overflow-hidden"
            style={{ background: "rgba(10,18,40,0.99)", borderColor: "rgba(255,255,255,0.1)", boxShadow: "0 16px 40px rgba(0,0,0,0.5)" }}
          >
            <div className="max-h-48 overflow-y-auto py-1">
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className="flex w-full items-center px-4 py-2 text-sm hover:bg-white/[0.05] text-left transition-colors"
                  style={{ color: value === opt ? "#FF6B57" : "var(--text-primary)" }}
                >
                  {value === opt && <CheckCircle2 size={12} className="mr-2 shrink-0" style={{ color: "#FF6B57" }} />}
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PrepRiskModal({ open, onClose, onSubmit, editEntry }: Props) {
  const isEdit = !!editEntry;

  const [playerName, setPlayerName] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [apiPlayers, setApiPlayers] = useState<{ id: string; name: string }[]>([]);
  const [zone, setZone] = useState("");
  const [risk, setRisk] = useState(50);
  const [recs, setRecs] = useState<string[]>([""]);
  const [medComment, setMedComment] = useState("");
  const [medAuthor, setMedAuthor] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Charger les joueurs depuis l'API une seule fois
  useEffect(() => {
    (clubApi.getPlayers() as Promise<{ id: string; name: string }[]>)
      .then(setApiPlayers)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (open) {
      if (editEntry) {
        setPlayerName(editEntry.name);
        setPlayerId(editEntry.playerId ?? "");
        setZone(editEntry.zone);
        setRisk(editEntry.risk);
        setRecs(editEntry.recommendation.length ? editEntry.recommendation : [""]);
        setMedComment(editEntry.medicalComment ?? "");
        setMedAuthor(editEntry.medicalAuthor ?? "");
      } else {
        setPlayerName("");
        setPlayerId("");
        setZone("");
        setRisk(50);
        setRecs([""]);
        setMedComment("");
        setMedAuthor("");
      }
      setErrors({});
    }
  }, [open, editEntry]);

  function selectPlayer(name: string) {
    setPlayerName(name);
    const found = apiPlayers.find((p) => p.name === name);
    if (found) setPlayerId(found.id);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!playerName.trim()) e.player = "Joueur requis";
    if (!isEdit && !playerId) e.player = "Joueur requis";
    if (!zone.trim()) e.zone = "Zone corporelle requise";
    const validRecs = recs.filter((r) => r.trim());
    if (validRecs.length === 0) e.recs = "Au moins une recommandation requise";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const entry: InjuryRiskEntry = {
      id: editEntry?.id ?? String(Date.now()),
      playerId: playerId || editEntry?.playerId,
      name: playerName.trim(),
      zone: zone.trim(),
      risk,
      recommendation: recs.filter((r) => r.trim()),
      medicalComment: medComment.trim() || undefined,
      medicalAuthor: medAuthor.trim() || undefined,
    };
    onSubmit(entry);
    onClose();
  }

  function addRec() {
    setRecs((r) => [...r, ""]);
  }
  function removeRec(i: number) {
    setRecs((r) => r.filter((_, idx) => idx !== i));
  }
  function updateRec(i: number, val: string) {
    setRecs((r) => r.map((rec, idx) => (idx === i ? val : rec)));
  }
  function addQuickRec(rec: string) {
    if (recs.includes(rec)) return;
    const empty = recs.findIndex((r) => !r.trim());
    if (empty >= 0) {
      setRecs((r) => r.map((rec2, i) => (i === empty ? rec : rec2)));
    } else {
      setRecs((r) => [...r, rec]);
    }
  }

  const color = getRiskColor(risk);
  const playerOptions = apiPlayers.map((p) => p.name);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[28px] border"
            style={{
              background: "rgba(8,14,32,0.97)",
              borderColor: `${color}35`,
              boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px ${color}20, 0 0 80px ${color}10`,
            }}
            initial={{ scale: 0.92, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.93, y: 16, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 rounded-t-[28px]"
              style={{ background: "rgba(8,14,32,0.97)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: `${color}18`, color }}
                >
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold" style={{ color: "var(--text-primary)" }}>
                    {isEdit ? "Modifier le risque" : "Nouveau risque blessure"}
                  </h2>
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    {isEdit ? `Édition — ${editEntry?.name}` : "FC Carthage · Effectif 2026"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl transition-colors hover:bg-white/[0.07]"
                style={{ color: "var(--text-muted)" }}
              >
                <X size={17} />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-5 px-6 py-5">

              {/* Joueur */}
              <div>
                <SelectField
                  label="Joueur"
                  value={playerName}
                  onChange={selectPlayer}
                  options={playerOptions}
                  placeholder="Sélectionner un joueur..."
                />
                {errors.player && (
                  <p className="mt-1 flex items-center gap-1 text-xs" style={{ color: "#EF4444" }}>
                    <AlertTriangle size={11} /> {errors.player}
                  </p>
                )}
              </div>

              {/* Zone */}
              <div>
                <SelectField
                  label="Zone corporelle"
                  value={zone}
                  onChange={setZone}
                  options={BODY_ZONES}
                  placeholder="Sélectionner une zone..."
                />
                {errors.zone && (
                  <p className="mt-1 flex items-center gap-1 text-xs" style={{ color: "#EF4444" }}>
                    <AlertTriangle size={11} /> {errors.zone}
                  </p>
                )}
              </div>

              {/* Risk Slider */}
              <div
                className="rounded-2xl border p-4"
                style={{ borderColor: `${color}25`, background: `${color}08` }}
              >
                <RiskSlider value={risk} onChange={setRisk} />
              </div>

              {/* Recommandations */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                    Recommandations IA
                  </label>
                  <button
                    type="button"
                    onClick={addRec}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors hover:bg-white/[0.05]"
                    style={{ color: "#FF6B57" }}
                  >
                    <Plus size={11} /> Ajouter
                  </button>
                </div>

                {/* Quick suggestions */}
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {QUICK_RECS.map((rec) => {
                    const active = recs.includes(rec);
                    return (
                      <button
                        key={rec}
                        type="button"
                        onClick={() => addQuickRec(rec)}
                        disabled={active}
                        className="rounded-full border px-2.5 py-1 text-[10px] font-medium transition-all"
                        style={{
                          borderColor: active ? "#FF6B5740" : "rgba(255,255,255,0.08)",
                          background: active ? "rgba(255,107,87,0.12)" : "rgba(255,255,255,0.03)",
                          color: active ? "#FF6B57" : "var(--text-muted)",
                          opacity: active ? 0.6 : 1,
                          cursor: active ? "default" : "pointer",
                        }}
                      >
                        {active ? "✓ " : ""}{rec}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {recs.map((rec, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2"
                      >
                        <span className="shrink-0 text-xs font-bold tabular-nums" style={{ color: "var(--text-muted)", minWidth: 16 }}>
                          {i + 1}.
                        </span>
                        <input
                          type="text"
                          value={rec}
                          onChange={(e) => updateRec(i, e.target.value)}
                          placeholder={`Recommandation ${i + 1}...`}
                          className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none transition-colors"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            borderColor: "rgba(255,255,255,0.08)",
                            color: "var(--text-primary)",
                          }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(255,107,87,0.4)"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(255,107,87,0.12)"; }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                        />
                        {recs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRec(i)}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-red-500/10"
                            style={{ color: "var(--text-muted)" }}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {errors.recs && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs" style={{ color: "#EF4444" }}>
                    <AlertTriangle size={11} /> {errors.recs}
                  </p>
                )}
              </div>

              {/* Commentaire médecin */}
              <div
                className="rounded-2xl border p-4 space-y-3"
                style={{ borderColor: "rgba(245,158,11,0.2)", background: "rgba(245,158,11,0.04)" }}
              >
                <div className="flex items-center gap-2">
                  <Stethoscope size={14} style={{ color: "#F59E0B" }} />
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#F59E0B" }}>
                    Commentaire médecin (optionnel)
                  </span>
                </div>
                <textarea
                  value={medComment}
                  onChange={(e) => setMedComment(e.target.value)}
                  rows={3}
                  placeholder="Ex: Repos obligatoire 72h. Pas de sprint..."
                  className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(245,158,11,0.2)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.5)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.2)"; }}
                />
                <input
                  type="text"
                  value={medAuthor}
                  onChange={(e) => setMedAuthor(e.target.value)}
                  placeholder="Nom du médecin — ex: Dr. Amira Khelifi"
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(245,158,11,0.2)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.5)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.2)"; }}
                />
              </div>
            </div>

            {/* Footer */}
            <div
              className="sticky bottom-0 flex items-center justify-between gap-3 rounded-b-[28px] px-6 py-4"
              style={{ background: "rgba(8,14,32,0.97)", borderTop: "1px solid rgba(255,255,255,0.05)" }}
            >
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-white/[0.05]"
                style={{ color: "var(--text-muted)" }}
              >
                Annuler
              </button>

              <motion.button
                type="button"
                onClick={handleSubmit}
                whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(255,107,87,0.4)" }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #e0584a, #c0392b)" }}
              >
                <ShieldAlert size={15} />
                {isEdit ? "Mettre à jour" : "Enregistrer le risque"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
