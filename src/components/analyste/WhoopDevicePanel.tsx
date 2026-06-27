import { useState } from "react";
import { Battery, Bluetooth, Signal } from "lucide-react";
import { SmartWatch3D } from "./SmartWatch3D";
import { WhoopAppMirror } from "./WhoopAppMirror";

interface WhoopDevicePanelProps {
  playerId: string;
  recovery: number;
  strain: number;
  strainTarget: number;
  sleepHours: number;
  sleepPerformance: number;
  hrv: number;
  hrvBaseline: number;
  restingHr: number;
  connected: boolean;
  battery: number;
  playerName: string;
  deviceId: string;
  firmware: string;
  athleteId: string;
  memberSince: string;
}

export function WhoopDevicePanel(props: WhoopDevicePanelProps) {
  const [appTab, setAppTab] = useState<"recovery" | "strain" | "sleep">("recovery");
  const { playerId, connected, battery, playerName, deviceId, firmware, athleteId, memberSince, recovery, strain } = props;

  return (
    <div
      className="grid min-h-[580px] grid-cols-1 overflow-hidden rounded-2xl border border-slate-600/60 lg:grid-cols-2"
      style={{
        background: "linear-gradient(145deg, #111827 0%, #0d1117 100%)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {/* 3D sensor */}
      <div className="relative flex min-h-[420px] flex-col border-b border-slate-700/60 lg:border-b-0 lg:border-r">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-700/60 bg-slate-800/40 px-5 py-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/70">Appareil assigné</p>
            <p className="text-sm font-semibold text-white">{playerName}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-semibold"
              style={{
                background: connected ? "rgba(52,211,153,0.15)" : "rgba(239,68,68,0.15)",
                borderColor: connected ? "rgba(52,211,153,0.4)" : "rgba(239,68,68,0.4)",
                color: connected ? "#34d399" : "#f87171",
              }}
            >
              {connected ? <Bluetooth size={11} /> : <Signal size={11} />}
              {connected ? "Connecté" : "Déconnecté"}
            </span>
            <span className="flex items-center gap-1 rounded-lg border border-slate-600 bg-slate-800/60 px-2.5 py-1 text-[10px] font-semibold tabular-nums text-slate-200">
              <Battery size={11} className="text-emerald-400" />
              {battery}%
            </span>
          </div>
        </div>

        <div className="p-4">
          <SmartWatch3D playerId={playerId} recovery={recovery} strain={strain} />
          <p className="mt-2 text-center text-[10px] text-slate-500">
            Glisser pour pivoter · rotation auto
          </p>
        </div>

        <div className="mt-auto grid shrink-0 grid-cols-2 gap-px border-t border-slate-700/60 bg-slate-700/40 text-[10px]">
          {[
            { label: "Modèle", value: "WHOOP 4.0" },
            { label: "Serial", value: deviceId },
            { label: "Firmware", value: firmware },
            { label: "Athlete ID", value: athleteId },
            { label: "Membre depuis", value: memberSince },
            { label: "Source", value: "WHOOP API v2" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-900/60 px-4 py-2.5">
              <p className="text-slate-500">{label}</p>
              <p className="mt-0.5 font-medium tabular-nums text-slate-100">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* App mirror */}
      <div className="flex min-h-[420px] flex-col bg-slate-900/30 p-4">
        <div className="mb-3 flex shrink-0 items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400/80">
            Données app WHOOP · miroir live
          </p>
          <div className="flex gap-1 rounded-lg border border-slate-700 bg-slate-800/50 p-0.5">
            {(["recovery", "strain", "sleep"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setAppTab(t)}
                className="rounded-md px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide transition-all duration-200"
                style={{
                  background: appTab === t ? "rgba(52,211,153,0.2)" : "transparent",
                  color: appTab === t ? "#34d399" : "rgba(148,163,184,0.8)",
                  border: appTab === t ? "1px solid rgba(52,211,153,0.35)" : "1px solid transparent",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="min-h-[400px] flex-1">
          <WhoopAppMirror key={`${playerId}-${appTab}`} {...props} activeTab={appTab} />
        </div>
      </div>
    </div>
  );
}
