/**
 * WCAG 2.x contrast ratio checker for ODIN light-mode tokens.
 * Run: node scripts/verify-contrast.mjs
 */

function hexToRgb(hex) {
  const n = hex.replace("#", "");
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16),
  };
}

function blendRgba(rgba, bgHex) {
  const match = rgba.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/,
  );
  if (!match) throw new Error(`Invalid rgba: ${rgba}`);
  const fg = { r: +match[1], g: +match[2], b: +match[3] };
  const a = match[4] !== undefined ? +match[4] : 1;
  const bg = hexToRgb(bgHex);
  return {
    r: Math.round(fg.r * a + bg.r * (1 - a)),
    g: Math.round(fg.g * a + bg.g * (1 - a)),
    b: Math.round(fg.b * a + bg.b * (1 - a)),
  };
}

function relativeLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(fg, bg) {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function report(label, fgHex, bgHex) {
  const fg = hexToRgb(fgHex);
  const bg = hexToRgb(bgHex);
  const ratio = contrastRatio(fg, bg);
  console.log(`${label}: ${ratio.toFixed(2)}:1  (${fgHex} on ${bgHex})`);
  return ratio;
}

function reportRgbaBorder(label, rgba, bgHex) {
  const blended = blendRgba(rgba, bgHex);
  const hex = rgbToHex(blended);
  return report(`${label} (blended rgba)`, hex, bgHex);
}

const BEFORE = {
  canvas: "#eef0f3",
  borderRgba: "rgba(26, 26, 46, 0.08)",
  textPrimary: "#1a1a2e",
  textSecondary: "#4a4a4a",
  textMuted: "#7f8c8d",
};

const AFTER = {
  canvas: "#dfe3e8",
  border: "#727986",
  pitchLine: "#5f6b7a",
  textPrimary: "#1a1a2e",
  textSecondary: "#4a4a4a",
  textMuted: "#656f70",
};

function runSet(name, tokens) {
  console.log(`\n=== ${name} ===\n`);
  report("text-primary / canvas", tokens.textPrimary, tokens.canvas);
  report("text-secondary / canvas", tokens.textSecondary, tokens.canvas);
  report("text-muted / canvas", tokens.textMuted, tokens.canvas);
  if (tokens.borderRgba) {
    reportRgbaBorder("surface-panel-border / canvas", tokens.borderRgba, tokens.canvas);
  }
  if (tokens.border) {
    report("surface-panel-border / canvas (solid)", tokens.border, tokens.canvas);
  }
  if (tokens.pitchLine) {
    report("pitch-line / canvas (solid)", tokens.pitchLine, tokens.canvas);
  }
}

runSet("BEFORE (light mode)", BEFORE);
runSet("AFTER (light mode)", AFTER);
