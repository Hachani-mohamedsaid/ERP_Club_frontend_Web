import { useState } from "react";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { FileText, Clock, AlertCircle, TrendingDown, Plus, X, RefreshCw, Trash2 } from "lucide-react";
import { useFinanceBackendData, BackendInvoice } from "../hooks/useFinanceBackendData";
import { clubApi } from "../lib/api/club";

const STATUS_TONE: Record<string, "success" | "warning" | "danger"> = {
  Payée: "success",
  "En attente": "warning",
  Retard: "danger",
};

const TAB_OPTIONS = ["Factures", "Dépenses"] as const;
type FinanceTab = (typeof TAB_OPTIONS)[number];

export function GestionFinanciereFinance() {
  const { invoices, history, loading, refetchInvoices, refetch } = useFinanceBackendData();
  const [activeTab, setActiveTab] = useState<FinanceTab>("Factures");
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({ fournisseur: "", invoiceType: "Fournisseur", montant: "", dueDate: "", description: "" });
  const [expenseForm, setExpenseForm] = useState({ label: "", amount: "", category: "Équipements", entryDate: "" });
  const [saving, setSaving] = useState(false);

  const invoiceList = invoices?.list ?? [];
  const expenseList = history.filter(h => h.entryType === "EXPENSE");

  const overdue = invoiceList.filter(i => i.status === "Retard").length;
  const pending = invoiceList.filter(i => i.status === "En attente").length;
  const totalInvoices = invoiceList.reduce((s, i) => s + i.montant, 0);
  const totalExpenses = expenseList.reduce((s, e) => s + Math.abs(e.amount), 0);

  const KPI_CARDS = [
    { label: "Factures Totales", value: String(invoiceList.length), icon: FileText, color: "#3B82F6" },
    { label: "Dépenses Totales", value: `${(totalExpenses / 1000).toFixed(0)}K DT`, icon: TrendingDown, color: "#EF4444" },
    { label: "En attente", value: String(pending), icon: Clock, color: "#F59E0B" },
    { label: "Retard", value: String(overdue), icon: AlertCircle, color: "#EF4444" },
  ];

  const handleCreateInvoice = async () => {
    if (!invoiceForm.fournisseur || !invoiceForm.montant) return;
    setSaving(true);
    try {
      await clubApi.createInvoice({
        fournisseur: invoiceForm.fournisseur,
        invoiceType: invoiceForm.invoiceType,
        montant: Number(invoiceForm.montant),
        dueDate: invoiceForm.dueDate || undefined,
        description: invoiceForm.description || undefined,
        status: "En attente",
      });
      setShowAddInvoice(false);
      setInvoiceForm({ fournisseur: "", invoiceType: "Fournisseur", montant: "", dueDate: "", description: "" });
      refetchInvoices();
    } catch (_) { /* silent */ } finally {
      setSaving(false);
    }
  };

  const handleCreateExpense = async () => {
    if (!expenseForm.label || !expenseForm.amount) return;
    setSaving(true);
    try {
      await clubApi.createFinance({
        label: expenseForm.label,
        amount: Number(expenseForm.amount),
        type: "EXPENSE",
        category: expenseForm.category,
        entryDate: expenseForm.entryDate || undefined,
      });
      setShowAddExpense(false);
      setExpenseForm({ label: "", amount: "", category: "Équipements", entryDate: "" });
      refetch();
    } catch (_) { /* silent */ } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (invoice: BackendInvoice) => {
    try {
      await clubApi.markInvoicePaid(invoice.id);
      refetchInvoices();
    } catch (_) { /* silent */ }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm("Supprimer cette facture ?")) return;
    try {
      await clubApi.deleteInvoice(id);
      refetchInvoices();
    } catch (_) { /* silent */ }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Supprimer cette dépense ?")) return;
    try {
      await clubApi.deleteFinanceEntry(id);
      refetch();
    } catch (_) { /* silent */ }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw size={20} className="animate-spin" style={{ color: "var(--accent)" }} />
        <span className="ml-3 text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Gestion Financière</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Suivi consolidé des factures et des dépenses du club</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => setShowAddInvoice(true)}>
              <Plus size={14} className="mr-1" /> Facture
            </Button>
            <Button variant="ghost" onClick={() => setShowAddExpense(true)}>
              <Plus size={14} className="mr-1" /> Dépense
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPI_CARDS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <GlassCard key={kpi.label} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{kpi.label}</p>
                  <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>{kpi.value}</p>
                </div>
                <Icon size={22} style={{ color: kpi.color }} />
              </div>
            </GlassCard>
          );
        })}
      </div>

      <GlassCard raised className="p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Navigation</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Passez facilement entre factures et dépenses.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {TAB_OPTIONS.map((tab) => (
              <Button key={tab} variant={tab === activeTab ? "solid" : "ghost"} size="sm" onClick={() => setActiveTab(tab)}>
                {tab}
              </Button>
            ))}
          </div>
        </div>

        {activeTab === "Factures" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <GlassCard className="p-4">
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Montant factures</p>
                <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>{(totalInvoices / 1000).toFixed(0)} K DT</p>
              </GlassCard>
              <GlassCard className="p-4">
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Factures en retard</p>
                <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--color-state-danger)" }}>{overdue}</p>
              </GlassCard>
            </div>

            {invoiceList.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <FileText size={32} style={{ color: "var(--text-muted)" }} className="mb-2" />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucune facture — cliquez sur "+ Facture" pour en ajouter une</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>Référence</th>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>Fournisseur</th>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>Type</th>
                      <th className="px-4 py-3 text-right font-semibold" style={{ color: "var(--text-muted)" }}>Montant</th>
                      <th className="px-4 py-3 text-right font-semibold" style={{ color: "var(--text-muted)" }}>Statut</th>
                      <th className="px-4 py-3 text-right font-semibold" style={{ color: "var(--text-muted)" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceList.map((invoice) => (
                      <tr key={invoice.id} style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                        <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{invoice.reference}</td>
                        <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{invoice.fournisseur}</td>
                        <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{invoice.invoiceType}</td>
                        <td className="px-4 py-3 text-right font-medium" style={{ color: "var(--text-primary)" }}>
                          {invoice.montant.toLocaleString("fr-TN")} DT
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Badge tone={STATUS_TONE[invoice.status] ?? "warning"}>{invoice.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            {invoice.status !== "Payée" && (
                              <Button variant="ghost" size="sm" onClick={() => handleMarkPaid(invoice)}>Payer</Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteInvoice(invoice.id)}>
                              <Trash2 size={13} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <GlassCard className="p-4">
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Total dépenses</p>
                <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>{(totalExpenses / 1000).toFixed(0)} K DT</p>
              </GlassCard>
              <GlassCard className="p-4">
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Nombre de dépenses</p>
                <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>{expenseList.length}</p>
              </GlassCard>
            </div>

            {expenseList.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <TrendingDown size={32} style={{ color: "var(--text-muted)" }} className="mb-2" />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucune dépense — cliquez sur "+ Dépense" pour en ajouter une</p>
              </div>
            ) : (
              <div className="space-y-3">
                {expenseList.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex flex-col gap-3 rounded-[var(--radius-odin-md)] border px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                    style={{ borderColor: "var(--surface-panel-border)" }}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{expense.label}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{expense.date} · Catégorie: {expense.category}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {(Math.abs(expense.amount) / 1000).toFixed(1)} K DT
                      </span>
                      <Badge tone="danger">Dépense</Badge>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteExpense(expense.id)}>
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </GlassCard>

      {/* Add Invoice Modal */}
      {showAddInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border p-6" style={{ background: "var(--surface-panel)", borderColor: "var(--surface-panel-border)" }}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Nouvelle facture</h3>
              <button onClick={() => setShowAddInvoice(false)}><X size={16} style={{ color: "var(--text-muted)" }} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Fournisseur *</label>
                <input value={invoiceForm.fournisseur} onChange={e => setInvoiceForm(f => ({ ...f, fournisseur: e.target.value }))} placeholder="Nom du fournisseur"
                  className="w-full rounded-xl border px-3 py-2 text-xs" style={{ background: "var(--surface-input)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Type</label>
                  <select value={invoiceForm.invoiceType} onChange={e => setInvoiceForm(f => ({ ...f, invoiceType: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-xs" style={{ background: "var(--surface-input)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}>
                    {["Fournisseur", "Équipement", "Médical", "Transport", "Infrastructure", "Autre"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Montant (DT) *</label>
                  <input type="number" value={invoiceForm.montant} onChange={e => setInvoiceForm(f => ({ ...f, montant: e.target.value }))} placeholder="0"
                    className="w-full rounded-xl border px-3 py-2 text-xs" style={{ background: "var(--surface-input)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Date d'échéance</label>
                <input type="date" value={invoiceForm.dueDate} onChange={e => setInvoiceForm(f => ({ ...f, dueDate: e.target.value }))}
                  className="w-full rounded-xl border px-3 py-2 text-xs" style={{ background: "var(--surface-input)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
              </div>
              <div>
                <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Description</label>
                <input value={invoiceForm.description} onChange={e => setInvoiceForm(f => ({ ...f, description: e.target.value }))} placeholder="Description optionnelle"
                  className="w-full rounded-xl border px-3 py-2 text-xs" style={{ background: "var(--surface-input)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowAddInvoice(false)} className="flex-1 rounded-xl border py-2 text-xs font-bold"
                style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-muted)" }}>Annuler</button>
              <button onClick={handleCreateInvoice} disabled={saving || !invoiceForm.fournisseur || !invoiceForm.montant}
                className="flex-1 rounded-xl py-2 text-xs font-bold text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,var(--accent),#ff9d00)" }}>
                {saving ? "Enregistrement…" : "Créer la facture"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border p-6" style={{ background: "var(--surface-panel)", borderColor: "var(--surface-panel-border)" }}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Nouvelle dépense</h3>
              <button onClick={() => setShowAddExpense(false)}><X size={16} style={{ color: "var(--text-muted)" }} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Description *</label>
                <input value={expenseForm.label} onChange={e => setExpenseForm(f => ({ ...f, label: e.target.value }))} placeholder="Ex: Équipement sportif"
                  className="w-full rounded-xl border px-3 py-2 text-xs" style={{ background: "var(--surface-input)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Montant (DT) *</label>
                  <input type="number" value={expenseForm.amount} onChange={e => setExpenseForm(f => ({ ...f, amount: e.target.value }))} placeholder="0"
                    className="w-full rounded-xl border px-3 py-2 text-xs" style={{ background: "var(--surface-input)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Catégorie</label>
                  <select value={expenseForm.category} onChange={e => setExpenseForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-xs" style={{ background: "var(--surface-input)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}>
                    {["Équipements", "Transport", "Hébergement", "Médical", "Infrastructure", "Salaires", "Transferts", "Autre"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Date</label>
                <input type="date" value={expenseForm.entryDate} onChange={e => setExpenseForm(f => ({ ...f, entryDate: e.target.value }))}
                  className="w-full rounded-xl border px-3 py-2 text-xs" style={{ background: "var(--surface-input)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowAddExpense(false)} className="flex-1 rounded-xl border py-2 text-xs font-bold"
                style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-muted)" }}>Annuler</button>
              <button onClick={handleCreateExpense} disabled={saving || !expenseForm.label || !expenseForm.amount}
                className="flex-1 rounded-xl py-2 text-xs font-bold text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,var(--accent),#ff9d00)" }}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
