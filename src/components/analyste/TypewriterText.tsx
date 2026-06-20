import { useState, useEffect } from "react";

export function TypewriterText({ text, speed = 28, className = "", style }: { text: string; speed?: number; className?: string; style?: React.CSSProperties }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span className={className} style={style}>
      {displayed}
      {!done && <span className="animate-pulse" style={{ color: "#8B5CF6" }}>|</span>}
    </span>
  );
}
