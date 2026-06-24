import { API_URL, parseApiError } from "./config";

export interface LoginResponse {
  message: string;
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: "ADMIN_CLUB" | "SUPER_ADMIN";
    clubMemberRole?: string;
  };
  organization: {
    id: string;
    clubName: string;
    country: string;
    league: string;
    logoUrl: string | null;
  } | null;
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json() as Promise<LoginResponse>;
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/`, { method: "GET" });
    return response.ok;
  } catch {
    return false;
  }
}
