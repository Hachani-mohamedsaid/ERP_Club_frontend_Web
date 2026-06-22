import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  motion, AnimatePresence, useMotionValue, useSpring, useTransform, type MotionValue,
} from "framer-motion";
import { Bell, CheckCircle2, Cpu, Sparkles, Radar } from "lucide-react";
import odinLogo from "../../assets/odin-logo.png";

const FLOATING_STATS = [
  { label: "Joueurs", end: 24, decimals: 0, prefix: "", suffix: "", x: "7%", y: "20%", color: "#3B82F6" },
  { label: "Fitness", end: 78, decimals: 0, prefix: "", suffix: "%", x: "85%", y: "28%", color: "#22C55E" },
  { label: "Budget", end: 2.4, decimals: 1, prefix: "", suffix: "M€", x: "11%", y: "74%", color: "#EAB308" },
  { label: "Blessures", end: 3, decimals: 0, prefix: "", suffix: "", x: "88%", y: "68%", color: "#EF4444" },
];

export const HERO_COUNTERS = [
  { end: 24, decimals: 0, suffix: "", label: "Clubs" },
  { end: 750, decimals: 0, suffix: "", label: "Joueurs" },
  { end: 18, decimals: 0, suffix: "", label: "Staff" },
  { end: 3.2, decimals: 1, suffix: "M", label: "Events analysés" },
];

const LIVE_NOTIFS = [
  { icon: CheckCircle2, text: "FC Carthage connecté", color: "#22C55E" },
  { icon: Radar, text: "Nouveau rapport scouting", color: "#3B82F6" },
  { icon: Sparkles, text: "Analyse IA terminée", color: "#A855F7" },
];

const FAINT_NUMBERS = [
  { end: 87, decimals: 0, numSuffix: "", u: "xG", x: "16%", y: "14%" },
  { end: 92, decimals: 0, numSuffix: "", u: "AI Score", x: "72%", y: "9%" },
  { end: 145, decimals: 0, numSuffix: "", u: "bpm", x: "84%", y: "46%" },
  { end: 11.4, decimals: 1, numSuffix: "", u: "km GPS", x: "5%", y: "52%" },
  { end: 78, decimals: 0, numSuffix: "%", u: "Fitness", x: "26%", y: "86%" },
  { end: 2.4, decimals: 1, numSuffix: "M€", u: "Budget", x: "68%", y: "84%" },
];

export const AUTH_CARD_STYLE = {
  background: "rgba(15,20,35,0.55)",
  backdropFilter: "blur(25px)",
  WebkitBackdropFilter: "blur(25px)",
  borderColor: "rgba(255,255,255,0.08)",
  boxShadow: "0 24px 60px rgba(0,0,0,0.4), 0 0 80px rgba(99,102,241,0.15)",
} as const;

function pentagon(cx: number, cy: number, r: number, rot: number) {
  return Array.from({ length: 5 })
    .map((_, i) => {
      const a = ((rot - 90 + i * 72) * Math.PI) / 180;
      return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
    })
    .join(" ");
}

const OUTER_ANGLES = [-90, -18, 54, 126, 198];

function SoccerBall({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <radialGradient id="ballSphere" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="65%" stopColor="#e9edf2" />
          <stop offset="100%" stopColor="#b9c2cc" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#ballSphere)" stroke="#0f172a" strokeWidth="2" />
      <g fill="#111827">
        <polygon points={pentagon(50, 50, 15, 0)} />
        {OUTER_ANGLES.map((deg) => {
          const cx = 50 + 31 * Math.cos((deg * Math.PI) / 180);
          const cy = 50 + 31 * Math.sin((deg * Math.PI) / 180);
          return <polygon key={deg} points={pentagon(cx, cy, 8.5, deg + 180)} opacity={0.92} />;
        })}
      </g>
      <g stroke="#1f2937" strokeWidth="1.6" opacity="0.7">
        {OUTER_ANGLES.map((deg) => {
          const a = (deg * Math.PI) / 180;
          return <line key={deg} x1={50 + 15 * Math.cos(a)} y1={50 + 15 * Math.sin(a)} x2={50 + 23 * Math.cos(a)} y2={50 + 23 * Math.sin(a)} />;
        })}
      </g>
      <ellipse cx="38" cy="32" rx="16" ry="11" fill="#ffffff" opacity="0.35" />
    </svg>
  );
}

export function OdinLogo({ width = 220 }: { width?: number }) {
  return (
    <div className="relative" style={{ width }}>
      <motion.div
        className="absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ width: width * 0.7, height: width * 0.7, background: "radial-gradient(circle, rgba(255,122,24,0.35), transparent 70%)", filter: "blur(20px)" }}
        animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.08, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.img
        src={odinLogo}
        alt="ODIN ERP — Football Intelligence Platform"
        draggable={false}
        style={{ width: "100%", height: "auto" }}
        animate={{
          y: [0, -5, 0],
          rotate: [0, 2, 0, -2, 0],
          filter: [
            "drop-shadow(0 10px 24px rgba(255,122,24,0.25))",
            "drop-shadow(0 14px 40px rgba(255,122,24,0.55))",
            "drop-shadow(0 10px 24px rgba(255,122,24,0.25))",
          ],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export function CountTo({ end, decimals = 0, prefix = "", suffix = "", duration = 1.6, start }: { end: number; decimals?: number; prefix?: string; suffix?: string; duration?: number; start: boolean }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(end * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, end, duration]);
  return <>{prefix}{val.toFixed(decimals)}{suffix}</>;
}

function Stars() {
  const stars = useMemo(
    () => Array.from({ length: 40 }).map((_, i) => ({
      id: i, left: Math.random() * 100, top: Math.random() * 100,
      size: 0.8 + Math.random() * 1.8, dur: 2 + Math.random() * 3, delay: Math.random() * 4,
    })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((s) => (
        <motion.span
          key={s.id}
          className="absolute rounded-full"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, background: "#fff" }}
          animate={{ opacity: [0.1, 0.7, 0.1] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function FaintNumbers({ px, py, start }: { px: MotionValue<number>; py: MotionValue<number>; start: boolean }) {
  const tx = useTransform(px, [-0.5, 0.5], [18, -18]);
  const ty = useTransform(py, [-0.5, 0.5], [14, -14]);
  return (
    <motion.div className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block" style={{ x: tx, y: ty }}>
      {FAINT_NUMBERS.map((n, i) => (
        <motion.div
          key={n.u}
          className="absolute select-none font-black leading-none"
          style={{ left: n.x, top: n.y, color: "#ffffff", opacity: 0.05, fontSize: 64 }}
          animate={{ y: [0, -16, 0], opacity: [0.04, 0.07, 0.04] }}
          transition={{ duration: 8 + i, repeat: Infinity, ease: "easeInOut" }}
        >
          <CountTo end={n.end} decimals={n.decimals} suffix={n.numSuffix} start={start} duration={2} />
          <span className="ml-1 text-xl font-bold">{n.u}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

function BackgroundBall() {
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-1/2 hidden lg:block"
      style={{ width: 420, height: 420, marginLeft: -210, marginTop: -210, opacity: 0.05, perspective: 1000 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.06 }}
      transition={{ duration: 2 }}
    >
      <motion.div style={{ transformStyle: "preserve-3d" }} animate={{ rotateY: 360, rotateX: 8 }} transition={{ duration: 22, repeat: Infinity, ease: "linear" }}>
        <SoccerBall size={420} />
      </motion.div>
    </motion.div>
  );
}

function BootScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
      style={{ background: "radial-gradient(circle at 50% 40%, #14141f, #0d0d18)" }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
        <OdinLogo width={320} />
      </motion.div>
      <motion.p className="mt-4 flex items-center gap-1.5 text-sm" style={{ color: "#94A3B8" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
        <Cpu size={14} /> Loading AI Platform...
      </motion.p>
      <div className="mt-6 h-1 w-56 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
        <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#C0392B,#8B5CF6,#3A7BD5)" }} initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 1.9, ease: "easeInOut" }} />
      </div>
    </motion.div>
  );
}

function NeonCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 200, damping: 20 });
  const ringY = useSpring(y, { stiffness: 200, damping: 20 });

  useEffect(() => {
    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <>
      <motion.div className="neon-cursor-dot" style={{ x, y, width: 7, height: 7, marginLeft: -3.5, marginTop: -3.5, background: "#8B5CF6", boxShadow: "0 0 10px #8B5CF6" }} />
      <motion.div className="neon-cursor-ring" style={{ x: ringX, y: ringY, width: 30, height: 30, marginLeft: -15, marginTop: -15, border: "1.5px solid rgba(139,92,246,0.6)", boxShadow: "0 0 14px rgba(139,92,246,0.4)" }} />
    </>
  );
}

function Particles() {
  const dots = useMemo(
    () => Array.from({ length: 30 }).map((_, i) => ({
      id: i, left: Math.random() * 100, top: Math.random() * 100,
      size: 1.5 + Math.random() * 3, dur: 6 + Math.random() * 8, delay: Math.random() * 6,
    })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d) => (
        <motion.span
          key={d.id}
          className="absolute rounded-full"
          style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size, background: "rgba(255,255,255,0.5)" }}
          animate={{ y: [0, -30, 0], opacity: [0, 0.4, 0] }}
          transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function FloatingStats({ px, py, start }: { px: MotionValue<number>; py: MotionValue<number>; start: boolean }) {
  const tx = useTransform(px, [-0.5, 0.5], [22, -22]);
  const ty = useTransform(py, [-0.5, 0.5], [16, -16]);
  return (
    <motion.div className="pointer-events-none absolute inset-0 hidden lg:block" style={{ x: tx, y: ty }}>
      {FLOATING_STATS.map((s, i) => (
        <motion.div
          key={s.label}
          className="absolute flex flex-col items-center rounded-2xl border px-5 py-3 backdrop-blur-md"
          style={{ left: s.x, top: s.y, background: "rgba(255,255,255,0.03)", borderColor: `${s.color}33`, opacity: 0.6, boxShadow: `0 0 24px ${s.color}18` }}
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-2xl font-black" style={{ color: s.color }}>
            <CountTo end={s.end} decimals={s.decimals} prefix={s.prefix} suffix={s.suffix} start={start} />
          </span>
          <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{s.label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

function AIOrb({ px, py }: { px: MotionValue<number>; py: MotionValue<number> }) {
  const tx = useTransform(px, [-0.5, 0.5], [-34, 34]);
  const ty = useTransform(py, [-0.5, 0.5], [-24, 24]);
  return (
    <motion.div className="pointer-events-none absolute right-12 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-3 xl:flex" style={{ x: tx, y: ty }}>
      <motion.div
        className="relative flex h-28 w-28 items-center justify-center"
        animate={{ y: [0, -16, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.span className="absolute inset-0 rounded-full" style={{ border: "1px solid rgba(168,85,247,0.5)" }} animate={{ scale: [1, 2], opacity: [0.6, 0] }} transition={{ duration: 3, repeat: Infinity }} />
        <motion.span className="absolute inset-0 rounded-full" style={{ border: "1px solid rgba(168,85,247,0.5)" }} animate={{ scale: [1, 2], opacity: [0.6, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 1.5 }} />
        <motion.div
          className="absolute h-24 w-24 rounded-full"
          style={{ background: "conic-gradient(from 0deg, rgba(168,85,247,0.0), rgba(168,85,247,0.7), rgba(6,182,212,0.6), rgba(168,85,247,0.0))" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="relative flex h-20 w-20 items-center justify-center rounded-full"
          style={{ background: "radial-gradient(circle at 35% 30%, #C084FC, #6D28D9)", boxShadow: "0 0 60px rgba(139,92,246,0.7)" }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Cpu size={30} className="text-white" />
        </motion.div>
      </motion.div>
      <div className="text-center">
        <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>AI Engine</div>
        <div className="flex items-center justify-center gap-1.5 text-xs" style={{ color: "#22C55E" }}>
          <motion.span className="h-1.5 w-1.5 rounded-full" style={{ background: "#22C55E" }} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} /> Active · Temps réel
        </div>
      </div>
    </motion.div>
  );
}

function LiveNotifications() {
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setShow(false);
      setTimeout(() => { setIdx((i) => (i + 1) % LIVE_NOTIFS.length); setShow(true); }, 400);
    }, 3200);
    return () => clearInterval(t);
  }, []);
  const n = LIVE_NOTIFS[idx];
  const Icon = n.icon;
  return (
    <div className="pointer-events-none absolute right-6 top-6 z-20 hidden md:block">
      <AnimatePresence mode="wait">
        {show && (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 40, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.9 }}
            className="flex items-center gap-3 rounded-2xl border px-4 py-2.5 backdrop-blur-xl"
            style={{ background: "rgba(255,255,255,0.04)", borderColor: `${n.color}40`, boxShadow: "0 8px 30px rgba(0,0,0,0.3)" }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${n.color}1f`, color: n.color }}><Icon size={16} /></div>
            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{n.text}</span>
            <Bell size={13} style={{ color: "var(--text-muted)" }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface AuthShellProps {
  children: ReactNode;
  overlay?: ReactNode;
  maxWidth?: string;
  bootDelay?: number;
  showBoot?: boolean;
}

export function AuthShell({ children, overlay, maxWidth = "600px", bootDelay = 2100, showBoot = true }: AuthShellProps) {
  const [booted, setBooted] = useState(!showBoot);

  useEffect(() => {
    if (!showBoot) return;
    const t = setTimeout(() => setBooted(true), bootDelay);
    return () => clearTimeout(t);
  }, [bootDelay, showBoot]);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const tiltX = useSpring(useTransform(py, [-0.5, 0.5], [6, -6]), { stiffness: 150, damping: 18 });
  const tiltY = useSpring(useTransform(px, [-0.5, 0.5], [-6, 6]), { stiffness: 150, damping: 18 });

  function handlePointer(e: React.MouseEvent) {
    px.set(e.clientX / window.innerWidth - 0.5);
    py.set(e.clientY / window.innerHeight - 0.5);
  }

  return (
    <div className="relative min-h-screen overflow-hidden" onMouseMove={handlePointer} style={{ cursor: "none" }}>
      <div className="login-aurora"><div className="login-grid" /></div>
      <Stars />
      <FaintNumbers px={px} py={py} start={booted} />
      <BackgroundBall />
      <Particles />
      <NeonCursor />
      <LiveNotifications />
      <FloatingStats px={px} py={py} start={booted} />
      <AIOrb px={px} py={py} />

      <AnimatePresence>{showBoot && !booted && <BootScreen />}</AnimatePresence>
      <AnimatePresence>{overlay}</AnimatePresence>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <motion.div
          className="w-full"
          style={{ maxWidth, rotateX: tiltX, rotateY: tiltY, transformPerspective: 1200, transformStyle: "preserve-3d" }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: booted ? 1 : 0, y: booted ? 0 : 24 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="mb-7 flex flex-col items-center gap-3 text-center">
            <OdinLogo width={240} />
            <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "#F97316" }}>
              Football Intelligence Platform
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {["IA", "Analyse", "Performance", "Recrutement"].map((tag, i) => (
                <motion.span
                  key={tag}
                  className="rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                  style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "var(--text-secondary)" }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: booted ? 1 : 0, y: booted ? 0 : 6 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  {tag}
                </motion.span>
              ))}
            </div>
            <motion.div
              className="mt-2 grid grid-cols-4 gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: booted ? 1 : 0 }}
              transition={{ delay: 0.6 }}
            >
              {HERO_COUNTERS.map((c) => (
                <div key={c.label} className="flex flex-col items-center">
                  <span className="text-lg font-black" style={{ color: "var(--text-primary)" }}>
                    +<CountTo end={c.end} decimals={c.decimals} suffix={c.suffix} start={booted} />
                  </span>
                  <span className="text-center text-[9px] uppercase leading-tight tracking-wide" style={{ color: "var(--text-muted)" }}>{c.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            className="rounded-3xl border p-7"
            style={AUTH_CARD_STYLE}
            animate={booted ? { y: [0, -6, 0] } : { y: 0 }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            {children}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
