import type { NotificationKind, NotificationPrefs } from "./types";
import { sendNotificationEmail } from "../api/notifications";

let audioCtx: AudioContext | null = null;

export async function ensurePushPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function showPushNotification(title: string, body: string, tag?: string) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    new Notification(title, {
      body,
      tag: tag ?? title,
      icon: "/src/assets/odin-logo.png",
    });
  } catch {
    /* ignore */
  }
}

export function playNotificationSound() {
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    const ctx = audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.26);
  } catch {
    /* ignore */
  }
}

function prefKeys(kind: NotificationKind): { email: keyof NotificationPrefs; push: keyof NotificationPrefs } {
  if (kind === "message") return { email: "emailMessages", push: "pushMessages" };
  if (kind === "rdv") return { email: "emailRdv", push: "pushRdv" };
  return { email: "emailMatch", push: "pushMatch" };
}

export async function dispatchNotification(
  kind: NotificationKind,
  prefs: NotificationPrefs,
  options: { title: string; body: string; tag?: string; sound?: boolean },
) {
  const keys = prefKeys(kind);
  const emailOn = prefs[keys.email];
  const pushOn = prefs[keys.push];

  if (pushOn) {
    await ensurePushPermission();
    showPushNotification(options.title, options.body, options.tag);
  }

  if (emailOn) {
    void sendNotificationEmail({ kind, subject: options.title, body: options.body }).catch(() => {
      /* silent — SMTP may be unconfigured */
    });
  }

  return { emailOn, pushOn };
}
