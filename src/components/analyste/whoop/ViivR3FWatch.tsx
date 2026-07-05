import { Suspense, useRef, useMemo, useLayoutEffect, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Environment, ContactShadows, RoundedBox, useGLTF, Bounds } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import * as THREE from "three";
import { recoveryColor } from "./whoopTheme";
import { usePrefersReducedMotion } from "../../../hooks/usePrefersReducedMotion";

const TRIPO_WORKSPACE =
  "https://studio.tripo3d.ai/workspace/generate/c9192ab1-edfd-493c-8801-d50827cc19ea";
const MODEL_URL = "/models/viiv-tripo.glb";
const PLACEHOLDER_BYTES = 11_844_116;

interface WatchProps {
  recovery: number;
  energy?: number;
}

function useTripoGlbReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    fetch(MODEL_URL, { method: "HEAD" })
      .then((res) => {
        const len = parseInt(res.headers.get("content-length") ?? "0", 10);
        if (!cancelled) setReady(res.ok && len > 0 && len !== PLACEHOLDER_BYTES);
      })
      .catch(() => { if (!cancelled) setReady(false); });
    return () => { cancelled = true; };
  }, []);
  return ready;
}

/** Texture face striée verticale — design Tripo Viiv */
function useRibbedFaceTexture() {
  return useMemo(() => {
    const w = 512;
    const h = 640;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#08080a";
    ctx.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 3) {
      const shade = x % 6 === 0 ? "#121216" : "#0a0a0e";
      ctx.fillStyle = shade;
      ctx.fillRect(x, 0, 2, h);
    }
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, "rgba(255,255,255,0.04)");
    grad.addColorStop(0.5, "rgba(255,255,255,0)");
    grad.addColorStop(1, "rgba(255,255,255,0.03)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

function useFabricStrapTexture() {
  return useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#0c0c0e";
    ctx.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += 2) {
      ctx.fillStyle = y % 4 === 0 ? "#141418" : "#0a0a0c";
      ctx.fillRect(0, y, size, 1);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 4);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

/** Reproduction fidèle du modèle Tripo : bracelet textile + module rectangulaire + barres chrome */
function ViivTripoDesignWatch() {
  const groupRef = useRef<THREE.Group>(null);
  const reduced = usePrefersReducedMotion();
  const angleIndex = useRef(0);
  const targetY = useRef(0);
  const lastSwitch = useRef(performance.now());
  const faceTex = useRibbedFaceTexture();
  const strapTex = useFabricStrapTexture();

  const chromeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#d4d4d8",
        roughness: 0.12,
        metalness: 0.98,
        envMapIntensity: 1.4,
      }),
    [],
  );

  const strapMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: strapTex,
        color: "#111114",
        roughness: 0.94,
        metalness: 0.02,
      }),
    [strapTex],
  );

  const bodyMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0e0e12",
        roughness: 0.85,
        metalness: 0.15,
      }),
    [],
  );

  const faceMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: faceTex,
        roughness: 0.92,
        metalness: 0.05,
        emissive: "#050508",
        emissiveIntensity: 0.2,
      }),
    [faceTex],
  );

  useFrame((_, delta) => {
    if (!groupRef.current || reduced) return;
    const now = performance.now();
    if (now - lastSwitch.current > 12000) {
      angleIndex.current = (angleIndex.current + 1) % 4;
      targetY.current = [0, Math.PI / 2, Math.PI, Math.PI * 1.5][angleIndex.current];
      lastSwitch.current = now;
    }
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY.current, delta * 0.75);
  });

  const strapW = 0.58;
  const strapT = 0.07;
  const moduleW = 0.62;
  const moduleH = 0.78;
  const moduleD = 0.11;

  return (
    <Float speed={0.55} rotationIntensity={0.025} floatIntensity={0.06}>
      <group ref={groupRef} rotation={[0.04, 0, 0]}>
        {/* Bracelet supérieur — boucle textile */}
        <mesh position={[0, 1.18, -0.01]} material={strapMat} castShadow receiveShadow>
          <boxGeometry args={[strapW, 1.55, strapT]} />
        </mesh>
        <mesh position={[0, 2.02, -0.04]} rotation={[0.42, 0, 0]} material={strapMat} castShadow>
          <boxGeometry args={[strapW * 0.96, 0.62, strapT * 0.9]} />
        </mesh>

        {/* Corps du module — noir mat */}
        <RoundedBox
          args={[moduleW, moduleH, moduleD]}
          radius={0.045}
          smoothness={8}
          position={[0, 0.02, 0]}
          material={bodyMat}
          castShadow
          receiveShadow
        />

        {/* Face striée noire */}
        <RoundedBox
          args={[moduleW * 0.88, moduleH * 0.82, 0.015]}
          radius={0.03}
          smoothness={6}
          position={[0, 0.02, moduleD / 2 + 0.008]}
          material={faceMat}
          castShadow
        />

        {/* Barres chrome haut / bas — signature Tripo */}
        <mesh position={[0, moduleH / 2 - 0.04, moduleD / 2 + 0.012]} material={chromeMat} castShadow>
          <boxGeometry args={[moduleW * 0.92, 0.06, 0.025]} />
        </mesh>
        <mesh position={[0, -moduleH / 2 + 0.04, moduleD / 2 + 0.012]} material={chromeMat} castShadow>
          <boxGeometry args={[moduleW * 0.92, 0.06, 0.025]} />
        </mesh>

        {/* Bords latéraux légèrement biseautés chrome */}
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * (moduleW / 2 - 0.02), 0.02, 0]} material={chromeMat} castShadow>
            <boxGeometry args={[0.025, moduleH * 0.7, moduleD * 0.85]} />
          </mesh>
        ))}

        {/* Bracelet inférieur */}
        <mesh position={[0, -1.18, -0.01]} material={strapMat} castShadow receiveShadow>
          <boxGeometry args={[strapW, 1.55, strapT]} />
        </mesh>
        <mesh position={[0, -2.02, -0.04]} rotation={[-0.42, 0, 0]} material={strapMat} castShadow>
          <boxGeometry args={[strapW * 0.96, 0.62, strapT * 0.9]} />
        </mesh>
      </group>
    </Float>
  );
}

function TripoGlbWatch() {
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const reduced = usePrefersReducedMotion();
  const angleIndex = useRef(0);
  const targetY = useRef(0);
  const lastSwitch = useRef(performance.now());

  const gltf = useGLTF(MODEL_URL, true, true, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
  });

  const model = useMemo(() => {
    const root = gltf.scene.clone(true);
    root.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    return root;
  }, [gltf.scene]);

  useLayoutEffect(() => {
    if (!innerRef.current) return;
    const box = new THREE.Box3().setFromObject(innerRef.current);
    innerRef.current.position.sub(box.getCenter(new THREE.Vector3()));
  }, [model]);

  useFrame((_, delta) => {
    if (!groupRef.current || reduced) return;
    const now = performance.now();
    if (now - lastSwitch.current > 12000) {
      angleIndex.current = (angleIndex.current + 1) % 4;
      targetY.current = [0, Math.PI / 2, Math.PI, Math.PI * 1.5][angleIndex.current];
      lastSwitch.current = now;
    }
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY.current, delta * 0.75);
  });

  return (
    <Float speed={0.55} rotationIntensity={0.025} floatIntensity={0.06}>
      <group ref={groupRef} rotation={[0.04, 0, 0]}>
        <group ref={innerRef} scale={1.05}>
          <primitive object={model} />
        </group>
      </group>
    </Float>
  );
}

function WatchModel({ useGlb }: { useGlb: boolean }) {
  if (useGlb) {
    return (
      <Bounds fit clip observe margin={1.4} maxDuration={0.55}>
        <TripoGlbWatch />
      </Bounds>
    );
  }
  return <ViivTripoDesignWatch />;
}

function Scene({ recovery, energy = 72, useGlb }: WatchProps & { useGlb: boolean }) {
  const accent = recoveryColor(recovery);
  const energyGlow = energy >= 70 ? "#22d3ee" : energy >= 40 ? "#fbbf24" : "#f87171";

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={1.6} castShadow />
      <directionalLight position={[-4, 2, 2]} intensity={0.35} color="#8899aa" />
      <directionalLight position={[0, 3, -2]} intensity={0.25} color="#ffffff" />
      <pointLight position={[0, 0.4, 2.2]} intensity={0.45} color={accent} />
      <pointLight position={[-1, 0, 1.2]} intensity={0.2} color={energyGlow} />
      <WatchModel useGlb={useGlb} />
      <ContactShadows position={[0, -2.15, 0]} opacity={0.6} scale={3.8} blur={3} far={4.5} />
      <Environment preset="studio" environmentIntensity={0.65} />
      <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 3.1} maxPolarAngle={Math.PI / 1.48} target={[0, 0, 0]} />
      <EffectComposer>
        <Bloom intensity={0.1} luminanceThreshold={0.7} luminanceSmoothing={0.9} />
      </EffectComposer>
    </>
  );
}

function Loader() {
  return (
    <mesh>
      <boxGeometry args={[0.62, 0.78, 0.11]} />
      <meshBasicMaterial color="#22d3ee" wireframe />
    </mesh>
  );
}

export function ViivR3FWatch({ recovery, energy }: WatchProps) {
  const reduced = usePrefersReducedMotion();
  const glbReady = useTripoGlbReady();

  return (
    <div
      className="relative h-[420px] w-full overflow-hidden rounded-2xl"
      style={{
        background: "radial-gradient(ellipse at 50% 42%, rgba(120,120,130,0.08) 0%, #030712 74%)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-2">
        <span className="rounded-full bg-white/8 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.25em] text-white/80">
          VIIV
        </span>
        <span className="rounded-full bg-zinc-500/15 px-2 py-0.5 text-[8px] font-bold text-zinc-400">
          {glbReady ? "Tripo GLB" : "Tripo Design"}
        </span>
      </div>

      <Canvas
        shadows
        camera={{ position: [0, 0.1, 3.5], fov: 38, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.12 }}
      >
        <Suspense fallback={<Loader />}>
          <Scene recovery={recovery} energy={energy} useGlb={glbReady} />
        </Suspense>
      </Canvas>

      {!reduced && (
        <p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-[10px] text-white/20">
          Viiv Smartwatch · 360° · Glisser pour tourner
        </p>
      )}

      <a
        href={TRIPO_WORKSPACE}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 right-3 rounded-lg border border-white/8 bg-black/50 px-2 py-1 text-[8px] text-white/35 backdrop-blur-sm transition-colors hover:text-white/60"
      >
        Tripo Studio ↗
      </a>
    </div>
  );
}

if (typeof window !== "undefined") {
  fetch(MODEL_URL, { method: "HEAD" })
    .then((res) => {
      const len = parseInt(res.headers.get("content-length") ?? "0", 10);
      if (res.ok && len > 0 && len !== PLACEHOLDER_BYTES) {
        useGLTF.preload(MODEL_URL, true, true, (loader) => {
          loader.setMeshoptDecoder(MeshoptDecoder);
        });
      }
    })
    .catch(() => undefined);
}
