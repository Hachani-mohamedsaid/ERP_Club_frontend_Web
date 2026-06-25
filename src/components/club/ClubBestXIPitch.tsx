import type { BestXiPlayer } from "../../lib/analyticsNormalize";

const ACCENT = "#FF6B57";

export function ClubBestXIPitch({
  formation,
  players,
}: {
  formation: string;
  players: BestXiPlayer[];
}) {
  return (
    <div className="relative mx-auto w-full" style={{ maxWidth: 360 }}>
      <div
        className="relative overflow-hidden rounded-2xl border"
        style={{
          aspectRatio: "3 / 4",
          borderColor: "rgba(255,255,255,0.08)",
          background: "linear-gradient(180deg, #1a5c30 0%, #1e6b38 50%, #1a5c30 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 28px, transparent 28px, transparent 56px)",
          }}
        />
        <div
          className="absolute inset-4 rounded-lg border-2"
          style={{ borderColor: "rgba(255,255,255,0.35)" }}
        />
        <div
          className="absolute left-4 right-4 top-1/2 h-0.5 -translate-y-1/2"
          style={{ background: "rgba(255,255,255,0.3)" }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{ borderColor: "rgba(255,255,255,0.3)" }}
        />

        {players.map((player, i) => (
          <div
            key={`${player.position}-${player.name}-${i}`}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: `${player.x}%`, top: `${player.y}%` }}
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 text-[10px] font-extrabold text-white shadow-lg"
              style={{
                background: player.position === "GB" ? "#F59E0B" : `linear-gradient(135deg,${ACCENT},#E65240)`,
                borderColor: "rgba(255,255,255,0.85)",
                boxShadow: `0 0 12px ${ACCENT}55`,
              }}
            >
              {player.playerPosition ?? player.position}
            </div>
            <span
              className="mt-1 max-w-[72px] truncate text-center text-[10px] font-semibold"
              style={{ color: "rgba(255,255,255,0.95)" }}
            >
              {player.name}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex justify-center">
        <span
          className="rounded-full px-3 py-1 text-xs font-bold"
          style={{ background: `${ACCENT}22`, color: ACCENT }}
        >
          {formation}
        </span>
      </div>
    </div>
  );
}
