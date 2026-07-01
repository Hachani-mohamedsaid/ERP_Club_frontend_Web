import { useState, useEffect, useCallback } from "react";
import { clubApi } from "../lib/api/club";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FinanceKPIs {
  budget: number;
  expenses: number;
  revenue: number;
  profit: number;
}

export interface FinanceHistoryItem {
  id: string;
  date: string;
  amount: number;
  label: string;
  category: string;
  entryType: "REVENUE" | "EXPENSE";
}

export interface FinanceChartSlice {
  name: string;
  value: number;
  amount: number;
  color: string;
}

export interface BackendContract {
  id: string;
  holderName: string;
  startDate: string;
  endDate: string;
  salaryMonthly: number;
  bonus: number;
  releaseClause: string | null;
  consumedPct: number;
  createdAt: string;
  updatedAt: string;
}

export interface BackendSponsor {
  id: string;
  nom: string;
  logo: string;
  secteur: string;
  montant: number;
  startDate: string;
  endDate: string;
  renewalProbability: number;
  status: string;
  contact: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackendInvoice {
  id: string;
  reference: string;
  fournisseur: string;
  invoiceType: string;
  montant: number;
  invoiceDate: string;
  dueDate: string | null;
  status: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackendTransfer {
  id: string;
  playerName: string;
  transferType: string;
  club: string;
  value: string;
  status: string;
  probability: number;
  fee: number;
  createdAt: string;
}

function parseTransferFee(value: string, fee?: number): number {
  if (fee != null && fee > 0) return fee;
  const cleaned = value.replace(/\s/g, '').toUpperCase();
  const num = parseFloat(cleaned.replace(/[^\d.,]/g, '').replace(',', '.'));
  if (!Number.isFinite(num)) return 0;
  if (cleaned.includes('M')) return num * 1_000_000;
  if (cleaned.includes('K')) return num * 1_000;
  return num;
}

function normalizeTransfer(raw: Record<string, unknown>): BackendTransfer {
  const value = String(raw.value ?? '0');
  const fee = parseTransferFee(value, Number(raw.fee ?? 0));
  return {
    id: String(raw.id ?? ''),
    playerName: String(raw.playerName ?? ''),
    transferType: String(raw.transferType ?? ''),
    club: String(raw.club ?? ''),
    value,
    status: String(raw.status ?? ''),
    probability: Number(raw.probability ?? 0),
    fee,
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
  };
}

export interface FinanceAlert {
  type: string;
  message: string;
  severity: string;
  icon: string;
}

export interface FinanceReportData {
  kpis: FinanceKPIs;
  revenueSources: FinanceChartSlice[];
  expenseBreakdown: FinanceChartSlice[];
  monthlyExpenses: { month: string; amount: number }[];
  history: FinanceHistoryItem[];
  contracts: {
    total: number;
    active: number;
    expiringSoon: number;
    expired: number;
    totalMonthlySalary: number;
    list: BackendContract[];
  };
  sponsors: {
    total: number;
    active: number;
    expiringSoon: number;
    totalAnnual: number;
    list: BackendSponsor[];
  };
  invoices: {
    total: number;
    overdue: number;
    pending: number;
    totalAmount: number;
    list: BackendInvoice[];
  };
  alerts: FinanceAlert[];
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useFinanceBackendData() {
  const [report, setReport] = useState<FinanceReportData | null>(null);
  const [transfers, setTransfers] = useState<BackendTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Remove legacy demo rows once (safe to call repeatedly)
      await clubApi.purgeFinanceDemo().catch(() => null);

      const [reportData, transfersData] = await Promise.allSettled([
        clubApi.getFinanceReport() as Promise<FinanceReportData>,
        clubApi.getTransfers() as Promise<BackendTransfer[]>,
      ]);

      if (reportData.status === "fulfilled") {
        setReport(reportData.value);
      } else {
        setError("Impossible de charger les données financières.");
      }
      if (transfersData.status === "fulfilled") {
        const raw = transfersData.value;
        setTransfers(
          Array.isArray(raw)
            ? raw.map((t) => normalizeTransfer(t as Record<string, unknown>))
            : [],
        );
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Convenience helpers
  const refetch = useCallback(() => load(), [load]);

  const refetchContracts = useCallback(async () => {
    try {
      const data = await clubApi.getFinanceReport() as FinanceReportData;
      setReport(data);
    } catch (_) { /* silent */ }
  }, []);

  const refetchSponsors = useCallback(async () => {
    try {
      const data = await clubApi.getFinanceReport() as FinanceReportData;
      setReport(data);
    } catch (_) { /* silent */ }
  }, []);

  const refetchInvoices = useCallback(async () => {
    try {
      const data = await clubApi.getFinanceReport() as FinanceReportData;
      setReport(data);
    } catch (_) { /* silent */ }
  }, []);

  return {
    report,
    transfers,
    loading,
    error,
    refetch,
    refetchContracts,
    refetchSponsors,
    refetchInvoices,
    // Shortcuts into report
    kpis: report?.kpis ?? null,
    history: report?.history ?? [],
    revenueSources: report?.revenueSources ?? [],
    expenseBreakdown: report?.expenseBreakdown ?? [],
    monthlyExpenses: report?.monthlyExpenses ?? [],
    contracts: report?.contracts ?? null,
    sponsors: report?.sponsors ?? null,
    invoices: report?.invoices ?? null,
    alerts: report?.alerts ?? [],
  };
}
