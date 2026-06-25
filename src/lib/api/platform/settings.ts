export interface PlatformSettingsFull {
  id: string;
  // Général
  platformName: string;
  platformUrl: string;
  contactEmail: string;
  supportPhone: string;
  timezone: string;
  defaultLanguage: string;
  currency: string;
  maintenanceMode: boolean;
  openRegistration: boolean;
  debugMode: boolean;
  trialDays: number;
  // SMTP
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  smtpSecure: boolean;
  smtpFromName: string;
  smtpFromEmail: string;
  // Branding
  primaryColor: string;
  logoUrl: string;
  faviconUrl: string;
  tagline: string;
  darkModeDefault: boolean;
  // Stockage
  storageProvider: "local" | "s3" | "cloudinary";
  maxUploadMb: number;
  s3Bucket: string;
  s3Region: string;
  cdnUrl: string;
  // IA
  aiProvider: "openai" | "anthropic" | "local";
  aiModel: string;
  aiEnabled: boolean;
  aiMaxTokens: number;
  aiApiKey: string;
  // Sécurité
  mfaRequired: boolean;
  sessionTimeoutMin: number;
  maxLoginAttempts: number;
  ipBlockEnabled: boolean;
  passwordMinLength: number;
  requireStrongPassword: boolean;
  // Billing
  stripeEnabled: boolean;
  stripePublicKey: string;
  stripeSecretKey: string;
  taxRate: number;
  invoicePrefix: string;
  gracePeriodDays: number;
  autoSuspendOnFailure: boolean;
  updatedAt: string;
}

export const SETTINGS_KEY = "odin-platform-settings";

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettingsFull = {
  id: "default",
  platformName: "ODIN ERP",
  platformUrl: "https://odin.erp.tn",
  contactEmail: "admin@odin.erp.tn",
  supportPhone: "+216 71 000 000",
  timezone: "Africa/Tunis",
  defaultLanguage: "fr",
  currency: "TND",
  maintenanceMode: false,
  openRegistration: true,
  debugMode: false,
  trialDays: 14,
  smtpHost: "smtp.gmail.com",
  smtpPort: 587,
  smtpUser: "noreply@odin.erp.tn",
  smtpPassword: "",
  smtpSecure: true,
  smtpFromName: "ODIN ERP",
  smtpFromEmail: "noreply@odin.erp.tn",
  primaryColor: "#FF7A00",
  logoUrl: "",
  faviconUrl: "",
  tagline: "Intelligence sportive pour clubs professionnels",
  darkModeDefault: true,
  storageProvider: "local",
  maxUploadMb: 25,
  s3Bucket: "",
  s3Region: "eu-west-1",
  cdnUrl: "",
  aiProvider: "openai",
  aiModel: "gpt-4o-mini",
  aiEnabled: true,
  aiMaxTokens: 4096,
  aiApiKey: "",
  mfaRequired: false,
  sessionTimeoutMin: 480,
  maxLoginAttempts: 5,
  ipBlockEnabled: true,
  passwordMinLength: 8,
  requireStrongPassword: true,
  stripeEnabled: false,
  stripePublicKey: "",
  stripeSecretKey: "",
  taxRate: 19,
  invoicePrefix: "INV",
  gracePeriodDays: 7,
  autoSuspendOnFailure: true,
  updatedAt: new Date().toISOString(),
};

export function mergeSettings(partial: Record<string, unknown>): PlatformSettingsFull {
  return { ...DEFAULT_PLATFORM_SETTINGS, ...partial } as PlatformSettingsFull;
}

export function readLocalSettings(): PlatformSettingsFull {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return mergeSettings(JSON.parse(raw));
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_PLATFORM_SETTINGS };
}

export function writeLocalSettings(body: Record<string, unknown>): PlatformSettingsFull {
  const next = mergeSettings({ ...readLocalSettings(), ...body, updatedAt: new Date().toISOString() });
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  return next;
}

/** Payload complet envoyé à l'API backend */
export function toApiPayload(form: PlatformSettingsFull): Record<string, unknown> {
  return { ...form };
}
