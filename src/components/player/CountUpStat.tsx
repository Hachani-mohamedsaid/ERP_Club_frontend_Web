import { useRef } from "react";
import { useCountUp } from "react-countup";

interface CountUpStatProps {
  end: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function CountUpStat({ end, suffix = "", prefix = "", decimals = 0, className = "", style }: CountUpStatProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useCountUp({
    ref,
    end,
    duration: 1.8,
    decimals,
    prefix,
    suffix,
    enableScrollSpy: true,
    scrollSpyOnce: true,
  });

  return <span className={className} style={style} ref={ref} />;
}
