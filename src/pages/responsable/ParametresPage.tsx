import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Building2, Palette, Shield, Bell, Upload } from "lucide-react";
import { RPage, RCard, RHeader, RSection, RPills, RBtn, RToggle } from "../../components/responsable";

function Field({ label, placeholder, value, onChange, type = "text" }: {
  label: string; placeholder?: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>{label}</label>
      <motion.input type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
        style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
        whileFocus={{ borderColor: "rgba(255,122,0,0.5)", boxShadow: "0 0 0 2px rgba(255,122,0,0.1)" }}
      />
    </div>
  );
}

function SaveRow({ onSave }: { onSave: () => void }) {
  const [saved, setSaved] = useState(false);
  return (
    <div className="mt-4 flex justify-end">
      <RBtn onClick={() => { onSave(); setSaved(true); setTimeout(() => setSaved(false), 2000); }}>
        <Save size={13} /> {saved ? "Enregistré ✓" : "Enregistrer"}
      </RBtn>
    </div>
  );
}

const TABS = ["Général", "Identité visuelle", "Sécurité", "Notifications"] as const;
type Tab = (typeof TABS)[number];

export function ParametresPage() {
  const [tab, setTab] = useState<Tab>("Général");

  /* Général state */
  const [nom, setNom] = useState("FC Carthage");
  const [adresse, setAdresse] = useState("Route de Carthage, Tunis");
  const [ville, setVille] = useState("Tunis");
  const [phone, setPhone] = useState("+216 71 000 000");
  const [email, setEmail] = useState("contact@fc-carthage.tn");
  const [stade, setStade] = useState("Stade El Menzah");
  const [fond, setFond] = useState("2001");

  /* Identity state */
  const [couleur1, setCouleur1] = useState("#FF7A00");
  const [couleur2, setCouleur2] = useState("#0F1D3A");
  const [slogan, setSlogan] = useState("La passion du football tunisien");

  /* Security state */
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  return (
    <RPage>
      <RHeader
        title="Paramètres Club"
        subtitle="Configuration générale, identité visuelle et sécurité."
        badge="CLUB_EDIT"
      />

      <RPills options={[...TABS]} value={tab} onChange={v => setTab(v as Tab)} />

      {/* ── Général ─────────────────────────────────────────────── */}
      {tab === "Général" && (
        <RSection title="Informations générales" subtitle="Nom, adresse et contact du club." icon={Building2}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nom du club"     value={nom}      onChange={setNom}      placeholder="FC Carthage" />
            <Field label="Fondé en"        value={fond}     onChange={setFond}     placeholder="2001" />
            <Field label="Ville"           value={ville}    onChange={setVille}    placeholder="Tunis" />
            <Field label="Stade"           value={stade}    onChange={setStade}    placeholder="Stade El Menzah" />
            <div className="sm:col-span-2">
              <Field label="Adresse"       value={adresse}  onChange={setAdresse}  placeholder="Route de Carthage" />
            </div>
            <Field label="Téléphone"       value={phone}    onChange={setPhone}    placeholder="+216 71 000 000" />
            <Field label="Email contact"   value={email}    onChange={setEmail}    placeholder="contact@club.tn" type="email" />
          </div>
          <SaveRow onSave={() => {}} />
        </RSection>
      )}

      {/* ── Identité visuelle ──────────────────────────────────── */}
      {tab === "Identité visuelle" && (
        <div className="space-y-4">
          <RSection title="Logo du club" icon={Palette}>
            <div className="flex items-center gap-6">
              <motion.div
                className="flex h-20 w-20 items-center justify-center rounded-2xl text-3xl font-black"
                style={{ background: `${couleur1}22`, color: couleur1, border: `2px solid ${couleur1}40` }}
                animate={{ boxShadow: [`0 0 0px ${couleur1}00`, `0 0 20px ${couleur1}40`, `0 0 0px ${couleur1}00`] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                FC
              </motion.div>
              <div className="space-y-2">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>FC Carthage</p>
                <RBtn variant="ghost"><Upload size={13} /> Changer logo</RBtn>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>PNG, SVG · max 2 MB</p>
              </div>
            </div>
          </RSection>

          <RSection title="Couleurs du club" icon={Palette}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs" style={{ color: "var(--text-muted)" }}>Couleur principale</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={couleur1} onChange={e => setCouleur1(e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded-xl border-0 bg-transparent p-0" />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{couleur1}</p>
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Couleur primaire</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs" style={{ color: "var(--text-muted)" }}>Couleur secondaire</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={couleur2} onChange={e => setCouleur2(e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded-xl border-0 bg-transparent p-0" />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{couleur2}</p>
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Couleur secondaire</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Preview card */}
            <div className="mt-4 rounded-2xl p-4" style={{ background: couleur2, border: `1px solid ${couleur1}40` }}>
              <p className="text-sm font-bold" style={{ color: couleur1 }}>Aperçu couleurs</p>
              <p className="text-xs text-white/70 mt-1">FC Carthage · {slogan}</p>
              <div className="mt-3 inline-block rounded-xl px-3 py-1.5 text-xs font-semibold text-white"
                style={{ background: couleur1 }}>Bouton exemple</div>
            </div>
            <Field label="Slogan du club" value={slogan} onChange={setSlogan} placeholder="La passion du football..." />
            <SaveRow onSave={() => {}} />
          </RSection>
        </div>
      )}

      {/* ── Sécurité ────────────────────────────────────────────── */}
      {tab === "Sécurité" && (
        <div className="space-y-4">
          <RSection title="Changer mot de passe" icon={Shield}>
            <div className="space-y-3">
              <Field label="Mot de passe actuel"    value={oldPwd}     onChange={setOldPwd}     type="password" />
              <Field label="Nouveau mot de passe"   value={newPwd}     onChange={setNewPwd}     type="password" />
              <Field label="Confirmer mot de passe" value={confirmPwd} onChange={setConfirmPwd} type="password" />
            </div>
            <SaveRow onSave={() => {}} />
          </RSection>

          <RSection title="Options de sécurité" icon={Shield}>
            <div className="space-y-3">
              <RToggle label="Authentification 2FA" description="Activer la vérification en deux étapes." />
              <RToggle label="Notifications de connexion" description="Email à chaque nouvelle session." />
              <RToggle label="Session timeout (30 min)" description="Déconnexion automatique après inactivité." defaultOn={false} />
            </div>
            <SaveRow onSave={() => {}} />
          </RSection>
        </div>
      )}

      {/* ── Notifications ───────────────────────────────────────── */}
      {tab === "Notifications" && (
        <RSection title="Préférences de notification" icon={Bell}>
          <div className="space-y-3">
            <RToggle label="Contrats expirants"        description="Alertes 30 jours avant expiration." />
            <RToggle label="Demandes de validation"    description="Nouvelles demandes à valider." />
            <RToggle label="Blessures joueurs"         description="Notifications médicales." />
            <RToggle label="Résultats de matchs"       description="Score en temps réel." />
            <RToggle label="Recrutement"               description="Prospects et rapports scouting." defaultOn={false} />
            <RToggle label="Résumé quotidien"          description="Email récapitulatif chaque soir." defaultOn={false} />
          </div>
          <SaveRow onSave={() => {}} />
        </RSection>
      )}
    </RPage>
  );
}
