import { motion } from "framer-motion";
import type { WhoopTimelineEvent } from "../../../data/whoopData";

export function WhoopTimeline({ events }: { events: WhoopTimelineEvent[] }) {
  return (
    <div className="relative pl-4">
      <div className="absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-orange-500/50 via-emerald-500/30 to-transparent" />
      {events.map((e, i) => (
        <motion.div
          key={`${e.time}-${e.label}`}
          className="relative mb-4 flex gap-3"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
        >
          <div className="relative z-10 mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-orange-400 bg-[#070b14]" />
          <div>
            <p className="text-[10px] font-bold tabular-nums text-orange-400">{e.time}</p>
            <p className="text-xs text-slate-300">{e.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
