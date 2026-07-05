export type ExtractedFrame = {
  timeSec: number;
  base64: string;
  motionScore: number;
};

function waitForEvent(el: HTMLVideoElement, event: string) {
  return new Promise<void>((resolve, reject) => {
    const onOk = () => { cleanup(); resolve(); };
    const onErr = () => { cleanup(); reject(new Error('Erreur chargement vidéo')); };
    const cleanup = () => {
      el.removeEventListener(event, onOk);
      el.removeEventListener('error', onErr);
    };
    el.addEventListener(event, onOk, { once: true });
    el.addEventListener('error', onErr, { once: true });
  });
}

function captureFrame(video: HTMLVideoElement, canvas: HTMLCanvasElement, maxW = 512): string {
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const ratio = video.videoWidth / video.videoHeight;
  const w = Math.min(maxW, video.videoWidth || maxW);
  const h = Math.round(w / (ratio || 16 / 9));
  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(video, 0, 0, w, h);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.62);
  const comma = dataUrl.indexOf(',');
  return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
}

function motionBetween(a: ImageData, b: ImageData): number {
  const step = 8;
  let diff = 0;
  let count = 0;
  for (let i = 0; i < a.data.length; i += 4 * step) {
    const dr = Math.abs(a.data[i] - b.data[i]);
    const dg = Math.abs(a.data[i + 1] - b.data[i + 1]);
    const db = Math.abs(a.data[i + 2] - b.data[i + 2]);
    diff += (dr + dg + db) / 3;
    count++;
  }
  return count ? diff / count : 0;
}

/** Extrait N frames haute qualité pour analyse ULTRA */
export async function extractVideoFrames(file: File, count = 14): Promise<ExtractedFrame[]> {
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.src = url;
  video.muted = true;
  video.playsInline = true;
  video.crossOrigin = 'anonymous';

  await waitForEvent(video, 'loadedmetadata');
  const duration = video.duration || 60;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponible');

  const times = Array.from({ length: count }, (_, i) =>
    duration <= 0.5 ? 0 : (duration * (i + 0.5)) / count,
  );

  const frames: ExtractedFrame[] = [];
  let prevData: ImageData | null = null;

  for (const timeSec of times) {
    video.currentTime = Math.min(timeSec, Math.max(duration - 0.05, 0));
    await waitForEvent(video, 'seeked');
    const base64 = captureFrame(video, canvas);
    const w = canvas.width;
    const h = canvas.height;
    const imgData = ctx.getImageData(0, 0, w, h);
    const motionScore = prevData ? motionBetween(prevData, imgData) : 0;
    prevData = imgData;
    frames.push({ timeSec: Math.round(timeSec * 10) / 10, base64, motionScore });
  }

  URL.revokeObjectURL(url);
  video.remove();
  return frames;
}

export function motionToSpeedKmh(motionScore: number, peak = 34): number {
  const normalized = Math.min(1, motionScore / 45);
  return Math.round(12 + normalized * (peak - 12));
}

export function buildClientSpeedTimeline(frames: ExtractedFrame[]) {
  return frames.map((f) => ({
    timeSec: f.timeSec,
    speedKmh: motionToSpeedKmh(f.motionScore),
  }));
}

export function fmtVideoTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
