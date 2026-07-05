import { API_URL } from "../api/config";

export const ATTACH_PREFIX = "__ATTACH__";

export type AttachmentType = "image" | "file";

export interface MessageAttachmentPayload {
  type: AttachmentType;
  url: string;
  name: string;
  sizeKb: number;
}

export function encodeAttachmentMessage(payload: MessageAttachmentPayload): string {
  return `${ATTACH_PREFIX}${JSON.stringify(payload)}`;
}

export function parseAttachmentMessage(body: string): MessageAttachmentPayload | null {
  if (!body.startsWith(ATTACH_PREFIX)) return null;
  try {
    const parsed = JSON.parse(body.slice(ATTACH_PREFIX.length)) as MessageAttachmentPayload;
    if (!parsed?.url || !parsed?.type) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function formatMessagePreview(body: string): string {
  const attachment = parseAttachmentMessage(body);
  if (attachment?.type === "image") return "📷 Photo";
  if (attachment?.type === "file") return `📎 ${attachment.name}`;
  return body;
}

export function resolveAttachmentUrl(url: string): string {
  if (/^https?:\/\//i.test(url) || url.startsWith("blob:")) return url;
  if (url.startsWith("/")) return `${API_URL}${url}`;
  return url;
}
