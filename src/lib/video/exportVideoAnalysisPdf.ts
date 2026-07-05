import { jsPDF } from "jspdf";
import type { VideoAnalysisAiResult } from "../api/analyste/videoAnalysisTypes";
import type { PoseFrameAnalysis } from "./poseAnalysis";
import { summarizePoseSession, POSE_MODEL_LABEL } from "./poseAnalysis";
import type { YoloPoseDetection } from "./yoloPoseAnalysis";
import { YOLO_MODEL_LABEL } from "./yoloPoseAnalysis";

type ExportInput = {
  result: VideoAnalysisAiResult;
  playerName: string;
  fileName?: string;
  poseFrames?: PoseFrameAnalysis[];
  yoloFrames?: YoloPoseDetection[];
};

function wrapText(doc: jsPDF, text: string, x: number, y: number, maxW: number, lineH: number) {
  const lines = doc.splitTextToSize(text, maxW) as string[];
  lines.forEach((line, i) => doc.text(line, x, y + i * lineH));
  return y + lines.length * lineH;
}

function sectionTitle(doc: jsPDF, title: string, y: number) {
  doc.setFillColor(30, 41, 59);
  doc.rect(14, y - 5, 182, 8, "F");
  doc.setTextColor(129, 140, 248);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(title.toUpperCase(), 18, y);
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "normal");
  return y + 10;
}

/** Export PDF rapport coach professionnel ODIN */
export function exportVideoAnalysisPdf({
  result,
  playerName,
  fileName,
  poseFrames = [],
  yoloFrames = [],
}: ExportInput) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const date = new Date().toLocaleString("fr-FR");
  const poseSummary = summarizePoseSession(poseFrames);
  const yoloDetected = yoloFrames.filter((f) => f.detected).length;

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 38, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("ODIN ERP", 14, 16);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Video Analysis Pro — Rapport Coach IA", 14, 24);
  doc.setFontSize(8);
  doc.text(`Généré le ${date}`, 14, 31);

  doc.setTextColor(30, 30, 30);
  let y = 48;

  // Player block
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(playerName || result.player.name, 14, y);
  y += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Position: ${result.player.position || "—"} · Maillot: ${result.player.jersey || "—"} · Vidéo: ${fileName ?? "—"} · Durée: ${result.durationSec}s`,
    14, y,
  );
  y += 10;

  // KPI row
  const kpis = [
    ["PPI", String(result.playerProfile?.ppi ?? "—")],
    ["Vitesse max", `${result.speed.maxKmh} km/h`],
    ["Sprints", String(result.speed.sprints)],
    ["Potentiel", String(result.playerProfile?.potential ?? "—")],
    ["Confiance IA", `${result.confidence}%`],
  ];
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y, 182, 18, "F");
  kpis.forEach(([label, val], i) => {
    const x = 18 + i * 36;
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(label, x, y + 6);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text(val, x, y + 13);
    doc.setFont("helvetica", "normal");
  });
  y += 26;

  y = sectionTitle(doc, "Synthèse IA", y);
  doc.setFontSize(9);
  y = wrapText(doc, result.summary, 14, y, 182, 4.5) + 4;

  y = sectionTitle(doc, "Données physiques", y);
  const phys = [
    `Distance estimée: ${result.physical.distanceKm} km`,
    `Runs haute intensité: ${result.physical.highIntensityRuns}`,
    `Accélérations: ${result.physical.accelerationPeaks} · Décélérations: ${result.physical.decelerationPeaks}`,
    `Work rate: ${result.physical.workRate}`,
  ];
  phys.forEach((line) => { doc.text(`• ${line}`, 16, y); y += 5; });
  y += 4;

  if (result.biomechanics) {
    y = sectionTitle(doc, "Biomécanique", y);
    const bio = result.biomechanics;
    const bioLines = [
      `Foulée moyenne: ${bio.avgStrideLengthCm} cm · Cadence: ${bio.avgCadenceSpm} spm`,
      `Symétrie: ${bio.symmetryIndex}% · Posture: ${bio.postureScore}/100 · Explosivité: ${bio.explosivenessIndex}`,
      ...bio.keyFindings.map((k) => `▸ ${k}`),
    ];
    bioLines.forEach((line) => { y = wrapText(doc, line, 16, y, 178, 4.5) + 1; });
    y += 4;
  }

  if (poseFrames.length) {
    if (y > 240) { doc.addPage(); y = 20; }
    y = sectionTitle(doc, "Deep Learning — Pose Engine", y);
    doc.setFontSize(8);
    doc.text(POSE_MODEL_LABEL, 16, y); y += 5;
    if (yoloDetected) {
      doc.text(`${YOLO_MODEL_LABEL} — ${yoloDetected}/${yoloFrames.length} frames`, 16, y); y += 5;
    }
    doc.text(
      `Détection: ${poseSummary.detectionRate}% · Genou G/D: ${poseSummary.avgLeftKnee}°/${poseSummary.avgRightKnee}° · Symétrie: ${poseSummary.avgSymmetry}%`,
      16, y,
    );
    y += 8;
  }

  if (y > 230) { doc.addPage(); y = 20; }
  y = sectionTitle(doc, "Scores techniques", y);
  result.technical.forEach((t) => {
    doc.setFontSize(9);
    doc.text(`${t.category}: ${t.score}/100`, 16, y);
    doc.setDrawColor(99, 102, 241);
    doc.setFillColor(99, 102, 241);
    const barW = (t.score / 100) * 100;
    doc.rect(70, y - 3, barW, 3, "F");
    y += 7;
  });
  y += 4;

  if (result.movementFrames?.length) {
    if (y > 220) { doc.addPage(); y = 20; }
    y = sectionTitle(doc, "Analyse mouvements (extrait)", y);
    result.movementFrames.slice(0, 8).forEach((m) => {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(`${m.timeLabel} — ${m.action} (${m.speedKmh} km/h)`, 16, y);
      doc.setFont("helvetica", "normal");
      y = wrapText(doc, m.biomechanics, 16, y + 4, 178, 3.8) + 3;
    });
    y += 4;
  }

  if (y > 200) { doc.addPage(); y = 20; }
  y = sectionTitle(doc, "Rapport Coach IA", y);
  doc.setFontSize(9);
  wrapText(doc, result.coachReport, 14, y, 182, 4.5);

  // Footer all pages
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `ODIN ERP · Video Analysis Pro · ${result.models.openai ?? "IA"}${result.models.claude ? " + Claude" : ""} · Page ${p}/${pages}`,
      14, 290,
    );
  }

  const safeName = (playerName || result.player.name).replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_");
  doc.save(`ODIN_VideoAnalysis_${safeName}_${Date.now()}.pdf`);
}
