import { Download, Upload } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

type DocType = "Contrat" | "Certificat médical" | "Facture" | "Autre";

interface DocumentRow {
  name: string;
  type: DocType;
  addedAt: string;
  size: string;
}

const DOCUMENTS: DocumentRow[] = [
  { name: "Contrat_Yassine_Brahmi_2026.pdf", type: "Contrat", addedAt: "14 juin 2026", size: "1,2 Mo" },
  { name: "Certificat_medical_Karim_Sassi.pdf", type: "Certificat médical", addedAt: "12 juin 2026", size: "840 Ko" },
  { name: "Facture_equipement_juin.pdf", type: "Facture", addedAt: "10 juin 2026", size: "520 Ko" },
  { name: "Contrat_Mehdi_Trabelsi_2026.pdf", type: "Contrat", addedAt: "8 juin 2026", size: "1,1 Mo" },
  { name: "Reglement_interieur_club.pdf", type: "Autre", addedAt: "5 juin 2026", size: "2,4 Mo" },
  { name: "Certificat_medical_Anis_Khelifi.pdf", type: "Certificat médical", addedAt: "3 juin 2026", size: "760 Ko" },
  { name: "Facture_deplacement_sahel.pdf", type: "Facture", addedAt: "1 juin 2026", size: "310 Ko" },
  { name: "Convention_sponsor_Q2.pdf", type: "Autre", addedAt: "28 mai 2026", size: "3,1 Mo" },
];

const TYPE_TONE: Record<DocType, "info" | "success" | "warning" | "neutral"> = {
  Contrat: "info",
  "Certificat médical": "success",
  Facture: "warning",
  Autre: "neutral",
};

export function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Documents
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Contrats, certificats et pièces administratives
        </p>
      </div>

      <div
        className="glass-input flex flex-col items-center justify-center gap-2 rounded-[var(--radius-odin-lg)] border-dashed px-6 py-10 text-center"
        style={{ borderStyle: "dashed" }}
      >
        <Upload size={24} style={{ color: "var(--text-muted)" }} />
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          Glissez vos fichiers ici ou cliquez pour parcourir
        </p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          PDF, DOCX — max. 10 Mo
        </p>
      </div>

      <GlassCard raised className="p-6">
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Fichiers récents
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ color: "var(--text-muted)" }}>
                <th className="pb-2 text-xs font-medium">Nom du fichier</th>
                <th className="pb-2 text-xs font-medium">Type</th>
                <th className="pb-2 text-xs font-medium">Date d'ajout</th>
                <th className="pb-2 text-xs font-medium">Taille</th>
                <th className="pb-2 text-right text-xs font-medium" />
              </tr>
            </thead>
            <tbody>
              {DOCUMENTS.map((doc) => (
                <tr
                  key={doc.name}
                  style={{ borderTop: "1px solid var(--surface-panel-border)" }}
                >
                  <td className="py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                    {doc.name}
                  </td>
                  <td className="py-3">
                    <Badge tone={TYPE_TONE[doc.type]}>{doc.type}</Badge>
                  </td>
                  <td className="py-3" style={{ color: "var(--text-secondary)" }}>
                    {doc.addedAt}
                  </td>
                  <td className="py-3" style={{ color: "var(--text-secondary)" }}>
                    {doc.size}
                  </td>
                  <td className="py-3 text-right">
                    <Button type="button" variant="ghost" className="!px-2 !py-1.5">
                      <Download size={15} />
                      Télécharger
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
