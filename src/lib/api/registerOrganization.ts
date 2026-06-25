export interface RegisterOrganizationPayload {
  fullName: string;
  clubName: string;
  country: string;
  league: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  invitationCode?: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  clubLogo?: File;
}

export interface RegisterOrganizationResponse {
  message: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
  organization: {
    id: string;
    clubName: string;
    country: string;
    league: string;
    logoUrl: string | null;
  };
}

import { API_URL, getApiErrorMessage } from "./config";

export async function registerOrganization(
  payload: RegisterOrganizationPayload,
): Promise<RegisterOrganizationResponse> {
  const form = new FormData();
  form.append("fullName", payload.fullName.trim());
  form.append("clubName", payload.clubName.trim());
  form.append("country", payload.country.trim());
  form.append("league", payload.league.trim());
  form.append("email", payload.email.trim().toLowerCase());
  form.append("phone", payload.phone.trim());
  form.append("password", payload.password);
  form.append("confirmPassword", payload.confirmPassword);
  form.append("acceptTerms", String(payload.acceptTerms));
  form.append("acceptPrivacy", String(payload.acceptPrivacy));
  if (payload.invitationCode?.trim()) {
    form.append("invitationCode", payload.invitationCode.trim());
  }
  if (payload.clubLogo) {
    form.append("clubLogo", payload.clubLogo);
  }

  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    body: form,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, "Erreur lors de la création de l'organisation."));
  }

  return data as RegisterOrganizationResponse;
}
