import { Film } from "lucide-react";
import { AnalystePageTransition } from "../../components/analyste/AnalystePageTransition";
import { MatchReplayTimeline } from "../../components/analyste/MatchReplayTimeline";

export function AnalysteReplayPage() {
  return (
    <AnalystePageTransition>
      <div className="flex items-center gap-3">
        <Film size={24} style={{ color: "#6366F1" }} />
        <div>
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Match Replay Intelligence</h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Détection automatique · Timeline Netflix · Jump vidéo</p>
        </div>
      </div>
      <MatchReplayTimeline />
    </AnalystePageTransition>
  );
}
