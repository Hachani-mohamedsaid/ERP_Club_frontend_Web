import { useState, useEffect } from "react";

export function EvalModal({ open, playerName, onClose, onSave }: { open: boolean; playerName?: string; onClose: () => void; onSave: (data: any) => void }) {
  const [technique, setTechnique] = useState(8);
  const [tactique, setTactique] = useState(7);
  const [mental, setMental] = useState(8);
  const [discipline, setDiscipline] = useState(9);

  useEffect(() => {
    if (open) {
      setTechnique(8);
      setTactique(7);
      setMental(8);
      setDiscipline(9);
    }
  }, [open]);

  if (!open) return null;

  function handleSave() {
    const payload = { technique, tactique, mental, discipline, ts: Date.now() };
    try {
      if (playerName) localStorage.setItem(`eval_${playerName}`, JSON.stringify(payload));
    } catch (e) {
      // ignore
    }
    onSave(payload);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-lg bg-[#0f0f12] p-6 shadow-lg">
        <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Évaluer {playerName}</h3>
        <div className="mt-4 space-y-3 text-sm" style={{ color: "var(--text-secondary)" }}>
          <label className="flex flex-col">
            <span className="text-xs text-muted">Technique</span>
            <input type="range" min={1} max={10} value={technique} onChange={(e) => setTechnique(Number(e.target.value))} />
            <div className="mt-1">{technique}/10</div>
          </label>

          <label className="flex flex-col">
            <span className="text-xs text-muted">Tactique</span>
            <input type="range" min={1} max={10} value={tactique} onChange={(e) => setTactique(Number(e.target.value))} />
            <div className="mt-1">{tactique}/10</div>
          </label>

          <label className="flex flex-col">
            <span className="text-xs text-muted">Mental</span>
            <input type="range" min={1} max={10} value={mental} onChange={(e) => setMental(Number(e.target.value))} />
            <div className="mt-1">{mental}/10</div>
          </label>

          <label className="flex flex-col">
            <span className="text-xs text-muted">Discipline</span>
            <input type="range" min={1} max={10} value={discipline} onChange={(e) => setDiscipline(Number(e.target.value))} />
            <div className="mt-1">{discipline}/10</div>
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button className="glass-input px-3 py-2" onClick={onClose}>Annuler</button>
          <button className="px-4 py-2 rounded bg-accent text-white" onClick={handleSave}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}
