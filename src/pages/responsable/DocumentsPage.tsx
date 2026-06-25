import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, Download, Trash2, Eye, Plus, Search, FileCheck, Stethoscope, IdCard } from "lucide-react";
import { RPage, RHeader, RSection, RRow, RPills, RBtn, RKpiCard, RSearch, pageVariants, cardVariants } from "../../components/responsable";

type DocCategory = "Contrats PDF" | "Rapports PDF" | "Documents médicaux" | "Licences joueurs";

interface Doc {
  id: string; name: string; category: DocCategory;
  player?: string; size: string; date: string; status: "Valide" | "Expiré" | "En révision";
}

const CAT_COLOR: Record<DocCategory, string> = {
  "Contrats PDF":         "#FF7A00",
  "Rapports PDF":         "#3B82F6",
  "Documents médicaux":   "#EF4444",
  "Licences joueurs":     "#22C55E",
};

const CAT_ICON: Record<DocCategory, typeof FileText> = {
  "Contrats PDF":       FileText,
  "Rapports PDF":       FileCheck,
  "Documents médicaux": Stethoscope,
  "Licences joueurs":   IdCard,
};

const STATUS_COLOR: Record<string, string> = {
  Valide:       "#22C55E",
  Expiré:       "#EF4444",
  "En révision":"#FF7A00",
};

const DOCS: Doc[] = [
  { id: "d1",  name: "Contrat_Karim_Gharbi_2024.pdf",      category: "Contrats PDF",       player: "Karim Gharbi",      size: "245 KB", date: "01/01/2024", status: "En révision" },
  { id: "d2",  name: "Contrat_Ahmed_BenSalah_2025.pdf",    category: "Contrats PDF",       player: "Ahmed Ben Salah",   size: "312 KB", date: "15/03/2025", status: "Valide" },
  { id: "d3",  name: "Contrat_Nader_Trabelsi_2026.pdf",    category: "Contrats PDF",       player: "Nader Trabelsi",    size: "289 KB", date: "01/07/2026", status: "Valide" },
  { id: "d4",  name: "Rapport_Analytique_J28_Ligue1.pdf",  category: "Rapports PDF",       size: "1.2 MB", date: "15/06/2026", status: "Valide" },
  { id: "d5",  name: "Rapport_Scouting_YBA_2026.pdf",      category: "Rapports PDF",       player: "Youssef Ben Ali",   size: "890 KB", date: "15/06/2026", status: "Valide" },
  { id: "d6",  name: "Rapport_Bilan_Saison2025.pdf",       category: "Rapports PDF",       size: "3.4 MB", date: "30/06/2025", status: "Expiré" },
  { id: "d7",  name: "Certificat_Medical_Karim_Gharbi.pdf",category: "Documents médicaux", player: "Karim Gharbi",      size: "156 KB", date: "10/06/2026", status: "Valide" },
  { id: "d8",  name: "Fiche_Blessure_Ahmed_BS.pdf",        category: "Documents médicaux", player: "Ahmed Ben Salah",   size: "98 KB",  date: "14/06/2026", status: "Valide" },
  { id: "d9",  name: "Aptitude_Equipe_PreSaison.pdf",      category: "Documents médicaux", size: "445 KB", date: "01/08/2025", status: "Expiré" },
  { id: "d10", name: "Licence_FTF_Karim_Gharbi.pdf",       category: "Licences joueurs",   player: "Karim Gharbi",      size: "78 KB",  date: "01/07/2026", status: "Valide" },
  { id: "d11", name: "Licence_FTF_Ahmed_BenSalah.pdf",     category: "Licences joueurs",   player: "Ahmed Ben Salah",   size: "78 KB",  date: "01/07/2026", status: "Valide" },
  { id: "d12", name: "Licence_FTF_Nader_Trabelsi.pdf",     category: "Licences joueurs",   player: "Nader Trabelsi",    size: "78 KB",  date: "01/07/2024", status: "Expiré" },
];

const CATEGORIES: DocCategory[] = ["Contrats PDF", "Rapports PDF", "Documents médicaux", "Licences joueurs"];
const FILTER_OPTIONS = ["Tous", ...CATEGORIES];

export function DocumentsPage() {
  const [filter, setFilter] = useState("Tous");
  const [search, setSearch] = useState("");
  const [docs, setDocs] = useState<Doc[]>(DOCS);

  const filtered = useMemo(
    () => docs.filter(d => {
      const matchCat = filter === "Tous" || d.category === filter;
      const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
        (d.player ?? "").toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    }),
    [docs, filter, search]
  );

  function deleteDoc(id: string) {
    setDocs(prev => prev.filter(d => d.id !== id));
  }

  return (
    <RPage>
      <RHeader
        title="Gestion Documents"
        subtitle="Contrats PDF, rapports, documents médicaux et licences joueurs."
        badge="DOCUMENT_VIEW"
        action={<RBtn><Upload size={14} /> Importer document</RBtn>}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {CATEGORIES.map(cat => {
          const catDocs = docs.filter(d => d.category === cat);
          const Icon = CAT_ICON[cat];
          const color = CAT_COLOR[cat];
          const expired = catDocs.filter(d => d.status === "Expiré").length;
          return (
            <RKpiCard key={cat} label={cat} value={String(catDocs.length)} icon={Icon} color={color}
              trend={expired > 0 ? `${expired} expiré${expired > 1 ? "s" : ""}` : "Tous valides"} />
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <RSearch value={search} onChange={setSearch} placeholder="Rechercher document, joueur..." />
        </div>
      </div>
      <RPills options={FILTER_OPTIONS} value={filter} onChange={setFilter} />

      <RSection title="Documents" subtitle={`${filtered.length} fichier${filtered.length > 1 ? "s" : ""}`}>
        <AnimatePresence mode="wait">
          <motion.div key={filter + search} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filtered.map((d, i) => {
              const Icon = CAT_ICON[d.category];
              const color = CAT_COLOR[d.category];
              return (
                <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  exit={{ opacity: 0 }}>
                  <RRow>
                    <div className="flex items-start gap-3">
                      <motion.div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: `${color}15` }}
                        animate={d.status === "Expiré" ? { boxShadow: ["0 0 0px #EF444400", "0 0 12px #EF444460", "0 0 0px #EF444400"] } : {}}
                        transition={{ duration: 1.8, repeat: Infinity }}>
                        <Icon size={15} style={{ color }} />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{d.name}</p>
                            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                              {d.player && (
                                <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{d.player}</span>
                              )}
                              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{d.size}</span>
                              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{d.date}</span>
                            </div>
                          </div>
                          <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{ background: `${STATUS_COLOR[d.status]}18`, color: STATUS_COLOR[d.status] }}>
                            {d.status}
                          </span>
                        </div>
                        <div className="mt-2 flex gap-1.5">
                          <RBtn variant="ghost"><Eye size={11} /> Voir</RBtn>
                          <RBtn variant="ghost"><Download size={11} /> Télécharger</RBtn>
                          <RBtn onClick={() => deleteDoc(d.id)} variant="danger"><Trash2 size={11} /></RBtn>
                        </div>
                      </div>
                    </div>
                  </RRow>
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-2 py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                <FileText size={28} className="mx-auto mb-2 opacity-30" />
                Aucun document trouvé
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </RSection>
    </RPage>
  );
}
