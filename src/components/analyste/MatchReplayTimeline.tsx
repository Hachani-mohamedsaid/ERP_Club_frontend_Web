import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Upload, Goal, AlertCircle, Zap, Swords } from "lucide-react";
import type { MatchEvent } from "../../data/analysteData";

const EVENT_ICONS = { tir: Zap, but: Goal, faute: AlertCircle, occasion: Swords, contre: Play };
const EVENT_COLORS = { tir: "#6366F1", but: "#22C55E", faute: "#F59E0B", occasion: "#8B5CF6", contre: "#FF6B57" };

interface MatchReplayTimelineProps {
  events: MatchEvent[];
  videoDuration?: number;
}

export function MatchReplayTimeline({ events, videoDuration = 5400 }: MatchReplayTimelineProps) {
  const [activeId, setActiveId] = useState<string | null>(events[0]?.id ?? null);
  const [currentTime, setCurrentTime] = useState(events[0]?.timestamp ?? 0);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const active = events.find((e) => e.id === activeId);

  function jumpToEvent(event: MatchEvent) {
    setActiveId(event.id);
    setCurrentTime(event.timestamp);
    if (videoRef.current) {
      videoRef.current.currentTime = event.timestamp;
      void videoRef.current.play();
      setPlaying(true);
    }
  }

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-[20px] border" style={{ borderColor: "var(--surface-panel-border)", background: "#000" }}>
        <video
          ref={videoRef}
          className="aspect-video w-full object-cover opacity-80"
          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1280 720'%3E%3Crect fill='%23070B1F' width='1280' height='720'/%3E%3Ctext x='640' y='360' text-anchor='middle' fill='%238B5CF6' font-size='24' font-family='sans-serif'%3EFC Carthage vs EST — Match Footage%3C/text%3E%3C/svg%3E"
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        >
          <track kind="captions" />
        </video>
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <button
            type="button"
            onClick={() => {
              if (videoRef.current) {
                if (playing) videoRef.current.pause();
                else void videoRef.current.play();
              }
            }}
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 backdrop-blur-sm transition-transform hover:scale-110"
            style={{ borderColor: "rgba(139,92,246,0.5)", background: "rgba(139,92,246,0.2)" }}
          >
            <Play size={28} style={{ color: "#8B5CF6" }} fill="#8B5CF6" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
          <div className="mb-2 flex items-center justify-between text-xs" style={{ color: "var(--text-muted)" }}>
            <span>{formatTime(currentTime)}</span>
            <span>{active?.description ?? "Sélectionnez un événement"}</span>
            <span>{formatTime(videoDuration)}</span>
          </div>
          <div className="relative h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
            <motion.div
              className="absolute h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #8B5CF6, #6366F1)", width: `${(currentTime / videoDuration) * 100}%` }}
            />
            {events.map((ev) => (
              <button
                key={ev.id}
                type="button"
                onClick={() => jumpToEvent(ev)}
                className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white transition-transform hover:scale-150"
                style={{
                  left: `${(ev.timestamp / videoDuration) * 100}%`,
                  background: EVENT_COLORS[ev.type],
                  boxShadow: activeId === ev.id ? `0 0 12px ${EVENT_COLORS[ev.type]}` : undefined,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {events.map((ev, i) => {
          const Icon = EVENT_ICONS[ev.type];
          const color = EVENT_COLORS[ev.type];
          const isActive = activeId === ev.id;
          return (
            <motion.button
              key={ev.id}
              type="button"
              onClick={() => jumpToEvent(ev)}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="min-w-[140px] shrink-0 rounded-xl border p-3 text-left transition-all"
              style={{
                borderColor: isActive ? `${color}60` : "rgba(255,255,255,0.06)",
                background: isActive ? `${color}15` : "rgba(15,29,58,0.8)",
                transform: isActive ? "scale(1.05)" : undefined,
              }}
            >
              <div className="flex items-center gap-2">
                <Icon size={14} style={{ color }} />
                <span className="text-lg font-bold" style={{ color }}>{ev.minute}&apos;</span>
                <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{ev.label}</span>
              </div>
              <p className="mt-1 text-[10px] line-clamp-2" style={{ color: "var(--text-muted)" }}>{ev.description}</p>
            </motion.button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-dashed p-4" style={{ borderColor: "rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.05)" }}>
        <Upload size={20} style={{ color: "#8B5CF6" }} />
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Upload Match</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Glissez un fichier vidéo — détection IA automatique des événements</p>
        </div>
      </div>
    </div>
  );
}
