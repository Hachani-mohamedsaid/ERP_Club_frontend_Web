import { useRef, type ReactNode } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

interface TiltKpiCardProps {
  children: ReactNode;
  glowColor: string;
  accent?: string;
  className?: string;
}

export function TiltKpiCard({ children, glowColor, accent, className = "" }: TiltKpiCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const borderColor = accent ?? glowColor;

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cardRef.current.style.transform = `perspective(800px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateZ(6px)`;
  };

  const handleLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "";
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`rounded-xl border bg-[#111827]/90 px-4 py-3 transition-[transform,box-shadow] duration-300 ease-out ${className}`}
      style={{
        borderColor: `${borderColor}40`,
        boxShadow: `0 4px 24px ${glowColor}18, inset 3px 0 0 ${borderColor}`,
      }}
    >
      {children}
    </div>
  );
}
