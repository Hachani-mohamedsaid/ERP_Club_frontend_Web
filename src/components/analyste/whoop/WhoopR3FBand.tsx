import { Suspense, useMemo, useRef, useLayoutEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Environment, ContactShadows, useGLTF, Bounds } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import * as THREE from "three";
import { recoveryColor } from "./whoopTheme";
import { usePrefersReducedMotion } from "../../../hooks/usePrefersReducedMotion";

const MODEL_URL = "/models/whoop-tripo.glb";

interface BandProps {
  recovery: number;
  strain: number;
}

useGLTF.preload(MODEL_URL, true, true, (loader) => {
  loader.setMeshoptDecoder(MeshoptDecoder);
});

/** Modèle Tripo AI — fitness band WHOOP (GLB PBR) */
function TripoWhoopModel() {
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
    if (now - lastSwitch.current > 15000) {
      angleIndex.current = (angleIndex.current + 1) % 4;
      targetY.current = [0, Math.PI / 2, Math.PI, Math.PI * 2][angleIndex.current];
      lastSwitch.current = now;
    }
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY.current, delta * 0.75);
  });

  return (
    <Float speed={0.75} rotationIntensity={0.05} floatIntensity={0.12}>
      <group ref={groupRef} rotation={[0.12, 0, 0]}>
        <group ref={innerRef} scale={0.85}>
          <primitive object={model} />
        </group>
      </group>
    </Float>
  );
}

function Scene({ recovery }: Pick<BandProps, "recovery">) {
  const accent = recoveryColor(recovery);
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 8, 6]} intensity={1.4} castShadow />
      <directionalLight position={[-4, 3, 2]} intensity={0.45} color="#8899aa" />
      <directionalLight position={[0, -2, -4]} intensity={0.15} color="#f97316" />
      <pointLight position={[0, 1, 3]} intensity={0.5} color={accent} />
      <Bounds fit clip observe margin={1.55} maxDuration={0.6}>
        <TripoWhoopModel />
      </Bounds>
      <ContactShadows position={[0, -0.55, 0]} opacity={0.45} scale={2.2} blur={2.8} far={3} />
      <Environment preset="studio" environmentIntensity={0.5} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.65}
        target={[0, 0, 0]}
      />
      <EffectComposer>
        <Bloom intensity={0.12} luminanceThreshold={0.65} luminanceSmoothing={0.9} />
      </EffectComposer>
    </>
  );
}

function Loader() {
  return (
    <mesh>
      <torusGeometry args={[0.25, 0.018, 12, 48]} />
      <meshBasicMaterial color="#34d399" wireframe />
    </mesh>
  );
}

export function WhoopR3FBand({ recovery }: BandProps) {
  const reduced = usePrefersReducedMotion();

  return (
    <div
      className="relative h-[420px] w-full overflow-hidden rounded-2xl"
      style={{
        background: "radial-gradient(ellipse at 50% 50%, rgba(52,211,153,0.06) 0%, #000 72%)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <Canvas
        shadows
        camera={{ position: [0, 0.15, 4.2], fov: 42, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      >
        <Suspense fallback={<Loader />}>
          <Scene recovery={recovery} />
        </Suspense>
      </Canvas>
      {!reduced && (
        <p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-[10px] text-white/25">
          Tripo 3D · 360° · Glisser pour tourner
        </p>
      )}
    </div>
  );
}
