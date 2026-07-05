import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import whoopProductUrl from "../../assets/whoop-4-product.png";

export interface SmartWatch3DProps {
  recovery: number;
  strain: number;
  playerId: string;
  className?: string;
}

const RECOVERY_GREEN = "#34d399";
const RECOVERY_YELLOW = "#fbbf24";
const RECOVERY_RED = "#ef4444";

function recoveryHex(v: number): string {
  if (v >= 67) return RECOVERY_GREEN;
  if (v >= 34) return RECOVERY_YELLOW;
  return RECOVERY_RED;
}

function hexToColor(hex: string): THREE.Color {
  return new THREE.Color(hex);
}

function createScreenTexture(): { texture: THREE.CanvasTexture; ctx: CanvasRenderingContext2D; size: number } {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return { texture, ctx, size };
}

function drawScreen(ctx: CanvasRenderingContext2D, size: number, recovery: number, strain: number, pulse: number) {
  const color = recoveryHex(recovery);
  ctx.clearRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;

  const bg = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
  bg.addColorStop(0, "#1e1e24");
  bg.addColorStop(1, "#08080c");
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = size * 0.022;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.88, 0, Math.PI * 2);
  ctx.stroke();

  const start = -Math.PI / 2;
  const end = start + (recovery / 100) * Math.PI * 2;
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.026;
  ctx.lineCap = "round";
  ctx.shadowColor = color;
  ctx.shadowBlur = 16 + pulse * 20;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.88, start, end);
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#fff";
  ctx.font = `200 ${size * 0.22}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(Math.round(recovery)), cx, cy - 6);

  ctx.fillStyle = color;
  ctx.font = `700 ${size * 0.055}px system-ui, sans-serif`;
  ctx.fillText("RECOVERY", cx, cy + size * 0.12);

  ctx.fillStyle = "#f97316";
  ctx.font = `600 ${size * 0.05}px system-ui, sans-serif`;
  ctx.fillText(`STRAIN ${strain.toFixed(1)}`, cx, cy + size * 0.22);
}

function buildWhoopModel(
  productTex: THREE.Texture,
  screenTex: THREE.CanvasTexture,
): THREE.Group {
  const group = new THREE.Group();

  // Real product photo — vertical strap
  const imgAspect = 0.42;
  const strapH = 3.2;
  const strapW = strapH * imgAspect;
  const strapGeo = new THREE.PlaneGeometry(strapW, strapH, 1, 32);

  // Slight curve on the strap
  const pos = strapGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const bend = Math.pow(Math.abs(y / (strapH / 2)), 1.5) * 0.12;
    pos.setZ(i, bend);
  }
  pos.needsUpdate = true;
  strapGeo.computeVertexNormals();

  const strapMat = new THREE.MeshStandardMaterial({
    map: productTex,
    roughness: 0.55,
    metalness: 0.15,
    side: THREE.DoubleSide,
  });
  const strap = new THREE.Mesh(strapGeo, strapMat);
  strap.name = "whoop-strap";
  group.add(strap);

  // Sensor housing rim (metallic ring around screen area)
  const rimGeo = new THREE.TorusGeometry(0.28, 0.025, 24, 64);
  const rimMat = new THREE.MeshStandardMaterial({
    color: "#3a3a40",
    roughness: 0.2,
    metalness: 0.9,
  });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.position.set(0, 0.02, 0.14);
  group.add(rim);

  // Live recovery screen on sensor face
  const screenGeo = new THREE.CircleGeometry(0.26, 64);
  const screenMat = new THREE.MeshStandardMaterial({
    map: screenTex,
    roughness: 0.3,
    metalness: 0.05,
    emissive: new THREE.Color("#000"),
    emissiveIntensity: 0.5,
    transparent: true,
  });
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.set(0, 0.02, 0.16);
  screen.name = "whoop-screen";
  group.add(screen);

  // Subtle glass reflection layer
  const glassGeo = new THREE.CircleGeometry(0.27, 64);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: "#ffffff",
    transparent: true,
    opacity: 0.06,
    roughness: 0.05,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
  });
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.set(0, 0.02, 0.17);
  group.add(glass);

  // Pedestal shadow catcher
  const pedestalGeo = new THREE.CylinderGeometry(0.55, 0.65, 0.06, 64);
  const pedestalMat = new THREE.MeshStandardMaterial({
    color: "#12141c",
    roughness: 0.8,
    metalness: 0.2,
  });
  const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
  pedestal.position.y = -1.55;
  group.add(pedestal);

  group.rotation.x = 0.08;
  return group;
}

export function SmartWatch3D({ recovery, strain, playerId, className = "" }: SmartWatch3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);

  const recoveryRef = useRef(recovery);
  const strainRef = useRef(strain);
  const transitionRef = useRef({ active: false, t: 0, duration: 0.55 });
  const prevPlayerIdRef = useRef(playerId);
  recoveryRef.current = recovery;
  strainRef.current = strain;

  useEffect(() => {
    if (playerId !== prevPlayerIdRef.current) {
      transitionRef.current = { active: true, t: 0, duration: reducedMotion ? 0.01 : 0.55 };
      prevPlayerIdRef.current = playerId;
    }
  }, [playerId, reducedMotion]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let raf = 0;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const defaultH = isMobile ? 300 : 380;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0e1a, 0.04);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.1, 3.8);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0e1a, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%;";
    container.appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();
    let watch: THREE.Group | null = null;
    let screenTexture: THREE.CanvasTexture | null = null;
    let screenCtx: CanvasRenderingContext2D | null = null;
    let screenSize = 512;
    let productTexture: THREE.Texture | null = null;

    const accentLight = new THREE.PointLight(hexToColor(recoveryHex(recoveryRef.current)), 1.2, 14);
    accentLight.position.set(0.5, 0.5, 2);
    scene.add(accentLight);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(4, 6, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x34d399, 0.35);
    fill.position.set(-3, 2, 4);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xf97316, 0.45);
    rim.position.set(0, -2, -4);
    scene.add(rim);

    // Ground glow
    const groundGeo = new THREE.CircleGeometry(1.4, 64);
    const groundMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.08,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.58;
    scene.add(ground);

    const { texture, ctx, size } = createScreenTexture();
    screenTexture = texture;
    screenCtx = ctx;
    screenSize = size;
    drawScreen(ctx, size, recoveryRef.current, strainRef.current, 0);
    texture.needsUpdate = true;

    loader.load(
      whoopProductUrl,
      (tex) => {
        if (disposed) { tex.dispose(); return; }
        productTexture = tex;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        watch = buildWhoopModel(tex, screenTexture!);
        scene.add(watch);
        setReady(true);
      },
      undefined,
      () => {
        if (disposed) return;
        watch = buildWhoopModel(screenTexture!, screenTexture!);
        scene.add(watch);
        setReady(true);
      },
    );

    const drag = { active: false, lastX: 0, velY: 0, rotY: 0 };

    const onPointerDown = (e: PointerEvent) => {
      if (isMobile) return;
      drag.active = true;
      drag.lastX = e.clientX;
      drag.velY = 0;
      renderer.domElement.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!drag.active || isMobile) return;
      const dx = e.clientX - drag.lastX;
      drag.lastX = e.clientX;
      drag.velY = dx * 0.007;
      drag.rotY += drag.velY;
    };
    const onPointerUp = () => { drag.active = false; };
    const onTap = () => { if (isMobile) drag.rotY += 0.5; };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointercancel", onPointerUp);
    renderer.domElement.addEventListener("click", onTap);

    let pulseT = 0;
    let lastRec = -1;
    let lastStr = -1;

    const resize = () => {
      const w = Math.max(container.clientWidth, 220);
      const h = Math.max(container.clientHeight, defaultH);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    requestAnimationFrame(resize);

    const animate = () => {
      if (disposed) return;
      raf = requestAnimationFrame(animate);
      const t = performance.now() * 0.001;
      pulseT = reducedMotion ? 0 : (Math.sin(t * 2) + 1) * 0.5;

      if (watch) {
        const tr = transitionRef.current;
        if (tr.active) {
          tr.t += 1 / 60 / tr.duration;
          const ease = 1 - Math.pow(1 - Math.min(1, tr.t), 3);
          watch.rotation.y = drag.rotY + ease * Math.PI * 0.4;
          if (tr.t >= 1) {
            drag.rotY += Math.PI * 0.4;
            tr.active = false;
          }
        } else if (!drag.active && !reducedMotion) {
          drag.rotY += 0.0025 + drag.velY;
          drag.velY *= 0.94;
          watch.rotation.y = drag.rotY;
        } else {
          watch.rotation.y = drag.rotY;
        }
        watch.rotation.x = 0.08 + Math.sin(t * 0.35) * (reducedMotion ? 0 : 0.05);
        watch.position.y = Math.sin(t * 0.5) * (reducedMotion ? 0 : 0.03);
      }

      const rec = recoveryRef.current;
      const str = strainRef.current;
      if (screenCtx && screenTexture && (rec !== lastRec || str !== lastStr || !reducedMotion)) {
        drawScreen(screenCtx, screenSize, rec, str, pulseT);
        screenTexture.needsUpdate = true;
        lastRec = rec;
        lastStr = str;
      }

      const col = hexToColor(recoveryHex(rec));
      accentLight.color.lerp(col, 0.06);
      accentLight.intensity = 0.7 + pulseT * 0.5;
      (groundMat as THREE.MeshBasicMaterial).color.lerp(col, 0.04);

      if (watch) {
        const screenMesh = watch.getObjectByName("whoop-screen") as THREE.Mesh | undefined;
        if (screenMesh?.material instanceof THREE.MeshStandardMaterial) {
          screenMesh.material.emissive.copy(col);
          screenMesh.material.emissiveIntensity = 0.2 + pulseT * 0.35;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointercancel", onPointerUp);
      renderer.domElement.removeEventListener("click", onTap);

      if (watch) {
        watch.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
            mats.forEach((m) => {
              if (m.map && m.map !== screenTexture && m.map !== productTexture) m.map.dispose();
              m.dispose();
            });
          }
        });
      }
      groundGeo.dispose();
      groundMat.dispose();
      screenTexture?.dispose();
      productTexture?.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
      setReady(false);
    };
  }, [reducedMotion]);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl ${className}`}
      style={{
        height: 380,
        background: "radial-gradient(ellipse at 50% 60%, rgba(52,211,153,0.12) 0%, rgba(10,14,26,0.95) 55%, #0a0e1a 100%)",
        border: "1px solid rgba(52,211,153,0.15)",
      }}
    >
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-400" />
        </div>
      )}
      <div ref={containerRef} className="absolute inset-0" aria-label={`WHOOP 3D — recovery ${recovery}%`} />
    </div>
  );
}
