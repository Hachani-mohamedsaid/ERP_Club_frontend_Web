/**
 * Medical OCR API Client
 * Sends a medical report (PDF / image) to the deployed FastAPI AI service and
 * extracts lab/nutrition values (vitamin D, ferritin, CRP, …). The extracted
 * values are persisted per player (backend) and later fed into the analyste
 * injury-prediction models via `medical_nutrition`.
 *
 * The AI service is unauthenticated and expects multipart/form-data, so this
 * client uses raw `fetch` (not `apiFetch`, which forces application/json) and
 * intentionally sets NO Content-Type header — the browser adds the multipart
 * boundary itself.
 */

import { VIIV_AI_BASE_URL, type MedicalNutritionValues } from "./viivAiApi";

export type NutrientStatus = "low" | "high" | "normal" | "unknown";

export interface MedicalNutrientMention {
  nutrient: string;
  matched_alias: string;
  value: number | null;
  unit: string | null;
  status: NutrientStatus;
  text_snippet: string;
}

export interface MedicalNutrientExtractionResponse {
  source: string;
  extracted_text: string;
  nutrients_found: string[];
  mentions: MedicalNutrientMention[];
  flagged: MedicalNutrientMention[];
}

/** Canonical keys the three prediction models can consume (see viivAiApi). */
export const MODEL_NUTRITION_KEYS = [
  "vitamin_d",
  "ferritin",
  "hemoglobin",
  "vitamin_b12",
  "magnesium",
  "zinc",
  "iron",
  "calcium",
  "c_reactive_protein",
] as const satisfies readonly (keyof MedicalNutritionValues)[];

/** Display metadata (French label + expected clinical unit) for the model nutrients. */
export const NUTRITION_META: Record<
  keyof MedicalNutritionValues,
  { label: string; unit: string }
> = {
  vitamin_d: { label: "Vitamine D", unit: "ng/mL" },
  ferritin: { label: "Ferritine", unit: "ng/mL" },
  hemoglobin: { label: "Hémoglobine", unit: "g/dL" },
  vitamin_b12: { label: "Vitamine B12", unit: "pg/mL" },
  magnesium: { label: "Magnésium", unit: "mg/dL" },
  zinc: { label: "Zinc", unit: "µg/dL" },
  iron: { label: "Fer sérique", unit: "µg/dL" },
  calcium: { label: "Calcium", unit: "mg/dL" },
  c_reactive_protein: { label: "CRP", unit: "mg/L" },
};

const MODEL_KEY_SET = new Set<string>(MODEL_NUTRITION_KEYS);

/**
 * Uploads a medical report to the OCR endpoint and returns the parsed nutrient
 * mentions. Accepts PDF, image, or DOCX files.
 */
export async function extractMedicalNutrients(
  file: File,
): Promise<MedicalNutrientExtractionResponse> {
  const form = new FormData();
  form.append("file", file);
  form.append("use_ocr", "true");

  // NOTE: do NOT set Content-Type — the browser sets the multipart boundary.
  const res = await fetch(`${VIIV_AI_BASE_URL}/extract-medical-nutrients`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`OCR /extract-medical-nutrients error (${res.status}): ${errText}`);
  }

  return res.json();
}

/**
 * Reduces OCR mentions into the flat `MedicalNutritionValues` map the models use.
 * Keeps only model-relevant nutrients with a finite numeric value; when a nutrient
 * is mentioned more than once, prefers a mention that carries a unit and an
 * out-of-range status (more likely to be the actual result line, not a reference range).
 */
export function mentionsToNutritionValues(
  mentions: MedicalNutrientMention[] | undefined | null,
): MedicalNutritionValues {
  const values: MedicalNutritionValues = {};
  if (!mentions?.length) return values;

  const best = new Map<string, MedicalNutrientMention>();
  for (const m of mentions) {
    if (!MODEL_KEY_SET.has(m.nutrient)) continue;
    if (typeof m.value !== "number" || !Number.isFinite(m.value)) continue;
    const current = best.get(m.nutrient);
    if (!current || scoreMention(m) > scoreMention(current)) {
      best.set(m.nutrient, m);
    }
  }

  for (const [nutrient, m] of best) {
    values[nutrient as keyof MedicalNutritionValues] = m.value as number;
  }
  return values;
}

function scoreMention(m: MedicalNutrientMention): number {
  let score = 0;
  if (m.unit) score += 2;
  if (m.status && m.status !== "unknown") score += 1;
  return score;
}
