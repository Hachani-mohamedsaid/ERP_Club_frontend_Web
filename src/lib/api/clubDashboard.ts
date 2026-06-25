import { API_URL, parseApiError } from "./config";
import { authHeaders } from "./authHeaders";

export interface ClubDashboardKpi {
  label: string;
  value: number;
  icon: "users" | "staff" | "budget" | "salary" | "injured" | "contract";
  color: string;
  prefix?: string;
  suffix?: string;
}

export interface ClubDashboardAlert {
  type: "warning" | "danger";
  text: string;
}

export interface ClubDashboardResponse {
  organization: {
    id: string;
    clubName: string;
    country: string;
    league: string;
    logoUrl: string | null;
  };
  owner: {
    fullName: string;
    email: string;
  };
  season: string;
  kpis: ClubDashboardKpi[];
  budgetChart: { month: string; budget: number; spent: number }[];
  alerts: ClubDashboardAlert[];
  aiSummary: string[];
  budgetUsedPct: number;
}

export async function fetchClubDashboard(
  organizationId: string,
): Promise<ClubDashboardResponse> {
  const response = await fetch(
    `${API_URL}/organizations/${organizationId}/dashboard`,
    { headers: authHeaders() },
  );

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json() as Promise<ClubDashboardResponse>;
}
