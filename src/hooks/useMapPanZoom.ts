import { useCallback, useEffect, useRef, useState } from "react";

export interface MapTransform {
  x: number;
  y: number;
  k: number;
}

const MIN_K = 0.5;
const MAX_K = 5;

export function fitTransformToPins(
  pins: { x: number; y: number; r: number }[],
  width: number,
  height: number,
  padding = 48,
): MapTransform {
  if (pins.length === 0) return { x: 0, y: 0, k: 1 };

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const p of pins) {
    const pad = p.r + padding;
    minX = Math.min(minX, p.x - pad);
    maxX = Math.max(maxX, p.x + pad);
    minY = Math.min(minY, p.y - pad);
    maxY = Math.max(maxY, p.y + pad + 20);
  }

  const boxW = maxX - minX;
  const boxH = maxY - minY;
  const k = Math.min(width / boxW, height / boxH, MAX_K);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  return {
    k,
    x: width / 2 - cx * k,
    y: height / 2 - cy * k,
  };
}

export function useMapPanZoom(
  width: number,
  height: number,
  resetKey: string,
  autoFit?: MapTransform | null,
) {
  const [transform, setTransform] = useState<MapTransform>({ x: 0, y: 0, k: 1 });
  const dragging = useRef(false);
  const lastPt = useRef({ x: 0, y: 0 });

  const autoFitRef = useRef(autoFit);
  autoFitRef.current = autoFit;

  useEffect(() => {
    setTransform(autoFitRef.current ?? { x: 0, y: 0, k: 1 });
  }, [resetKey]);

  const zoomAt = useCallback(
    (clientX: number, clientY: number, rect: DOMRect, factor: number) => {
      setTransform((prev) => {
        const mx = clientX - rect.left;
        const my = clientY - rect.top;
        const newK = Math.min(MAX_K, Math.max(MIN_K, prev.k * factor));
        const wx = (mx - prev.x) / prev.k;
        const wy = (my - prev.y) / prev.k;
        return { k: newK, x: mx - wx * newK, y: my - wy * newK };
      });
    },
    [],
  );

  const onWheel = useCallback(
    (e: React.WheelEvent<SVGSVGElement>) => {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      zoomAt(e.clientX, e.clientY, rect, factor);
    },
    [zoomAt],
  );

  const onPointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    const target = e.target as Element;
    if (target.closest("[data-pin]")) return;
    dragging.current = true;
    lastPt.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPt.current.x;
    const dy = e.clientY - lastPt.current.y;
    lastPt.current = { x: e.clientX, y: e.clientY };
    setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    dragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  const zoomIn = useCallback(() => {
    setTransform((prev) => ({ ...prev, k: Math.min(MAX_K, prev.k * 1.25) }));
  }, []);

  const zoomOut = useCallback(() => {
    setTransform((prev) => ({ ...prev, k: Math.max(MIN_K, prev.k / 1.25) }));
  }, []);

  const reset = useCallback(() => {
    setTransform(autoFit ?? { x: 0, y: 0, k: 1 });
  }, [autoFit]);

  return {
    transform,
    setTransform,
    onWheel,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    zoomIn,
    zoomOut,
    reset,
  };
}
