"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Html, OrbitControls, useGLTF, useProgress } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { FloorGroupId } from "@/types/floor";

const MODEL_URL = "/models/AksharFinal-optimized.glb";
const MODEL_HEIGHT = 13.6;
const MODEL_BASE_Y = -6.55;
const HIGHLIGHT_COLOR = "#3b82f6";

/**
 * Vertical highlight ranges measured as a percentage of the complete GLB height.
 * These ranges follow the Level23 floor groups:
 * G, 1, 2-5, 6, 7-22 and 23.
 *
 * The model and the highlight use the same transform, so the band continues to
 * match the building while the user rotates or zooms it.
 */
const FLOOR_BANDS: Record<FloorGroupId, { from: number; to: number }> = {
  ground: { from: 0.0, to: 0.065 },
  first: { from: 0.065, to: 0.115 },
  parking: { from: 0.115, to: 0.295 },
  amenities: { from: 0.295, to: 0.35 },
  offices: { from: 0.35, to: 0.955 },
  premium: { from: 0.955, to: 1.0 },
};

type ModelMetrics = {
  size: THREE.Vector3;
  center: THREE.Vector3;
  minY: number;
  scale: number;
};

function ModelLoadingIndicator() {
  const { progress } = useProgress();

  return (
    <Html center>
      <div
        style={{
          minWidth: 178,
          padding: "0.72rem 1rem",
          borderRadius: 999,
          border: "1px solid rgba(49, 78, 98, 0.16)",
          background: "rgba(255, 255, 255, 0.88)",
          boxShadow: "0 16px 38px rgba(42, 67, 84, 0.14)",
          color: "#27475d",
          fontSize: "0.76rem",
          fontWeight: 700,
          textAlign: "center",
          whiteSpace: "nowrap",
          backdropFilter: "blur(12px)",
        }}
      >
        Loading building model {Math.round(progress)}%
      </div>
    </Html>
  );
}

function FloorHighlight({ selected, size }: { selected: FloorGroupId; size: THREE.Vector3 }) {
  const range = FLOOR_BANDS[selected];
  const bandHeight = Math.max(size.y * (range.to - range.from), size.y * 0.018);
  const bandCenterY = size.y * range.from + bandHeight / 2;
  const edgeHeight = Math.max(size.y * 0.004, 0.22);
  const bandWidth = size.x * 0.85;
  const bandDepth = size.z * 0.85;

  return (
    <group>
      <mesh position={[0, bandCenterY, 0]} renderOrder={40} frustumCulled={false}>
        <boxGeometry args={[bandWidth, bandHeight, bandDepth]} />
        <meshBasicMaterial
          color={HIGHLIGHT_COLOR}
          transparent
          opacity={0.19}
          depthTest={false}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {[size.y * range.from, size.y * range.to].map((y, index) => (
        <mesh key={`${selected}-edge-${index}`} position={[0, y, 0]} renderOrder={41} frustumCulled={false}>
          <boxGeometry args={[bandWidth * 1.006, edgeHeight, bandDepth * 1.006]} />
          <meshBasicMaterial
            color={HIGHLIGHT_COLOR}
            transparent
            opacity={0.7}
            depthTest={false}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function LoadedBuilding({ selected, nudge, paused }: { selected: FloorGroupId; nudge: number; paused: boolean }) {
  const rotatingGroup = useRef<THREE.Group>(null);
  const targetRotation = useRef(-0.42);
  const previousNudge = useRef(nudge);
  const { scene } = useGLTF(MODEL_URL);

  const model = useMemo(() => {
    const clonedScene = scene.clone(true);

    clonedScene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
    });

    return clonedScene;
  }, [scene]);

  const metrics = useMemo<ModelMetrics>(() => {
    model.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());

    if (bounds.isEmpty() || !Number.isFinite(size.y) || size.y <= 0) {
      return {
        size: new THREE.Vector3(8, 13.6, 8),
        center: new THREE.Vector3(),
        minY: 0,
        scale: 1,
      };
    }

    return {
      size,
      center,
      minY: bounds.min.y,
      scale: MODEL_HEIGHT / size.y,
    };
  }, [model]);

  useEffect(() => {
    const difference = nudge - previousNudge.current;
    targetRotation.current += difference * 0.52;
    previousNudge.current = nudge;
  }, [nudge]);

  useFrame((_, delta) => {
    if (!rotatingGroup.current) return;
    if (!paused) targetRotation.current += delta * 0.055;
    rotatingGroup.current.rotation.y = THREE.MathUtils.damp(
      rotatingGroup.current.rotation.y,
      targetRotation.current,
      5.5,
      delta,
    );
  });

  return (
    <group
      ref={rotatingGroup}
      position={[0, MODEL_BASE_Y, 0]}
      rotation={[0, -0.42, 0]}
      scale={metrics.scale}
    >
      <primitive
        object={model}
        position={[-metrics.center.x, -metrics.minY, -metrics.center.z]}
      />
      <FloorHighlight selected={selected} size={metrics.size} />
    </group>
  );
}

export default function BuildingModel({ selected, nudge }: { selected: FloorGroupId; nudge: number }) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [interacting, setInteracting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const endTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const pause = () => {
    if (endTimer.current) clearTimeout(endTimer.current);
    setInteracting(true);
  };

  const resume = () => {
    if (endTimer.current) clearTimeout(endTimer.current);
    endTimer.current = setTimeout(() => setInteracting(false), 1100);
  };

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;

    const preventBrowserGesture = (event: Event) => event.preventDefault();
    surface.addEventListener("gesturestart", preventBrowserGesture, { passive: false });
    surface.addEventListener("gesturechange", preventBrowserGesture, { passive: false });
    surface.addEventListener("gestureend", preventBrowserGesture, { passive: false });

    return () => {
      surface.removeEventListener("gesturestart", preventBrowserGesture);
      surface.removeEventListener("gesturechange", preventBrowserGesture);
      surface.removeEventListener("gestureend", preventBrowserGesture);
      if (endTimer.current) clearTimeout(endTimer.current);
    };
  }, []);

  return (
    <div ref={surfaceRef} className="model-interaction-surface">
      <Canvas
        camera={{
          position: isMobile ? [24.08, 13.72, 32.76] : [17.2, 9.8, 23.4],
          fov: isMobile ? 36 : 32,
        }}
        dpr={[1, 1.65]}
        gl={{ antialias: true, alpha: true }}
        style={{ touchAction: "none" }}
        onCreated={({ gl }) => {
          gl.domElement.style.touchAction = "none";
          gl.domElement.style.userSelect = "none";
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
        shadows
      >
        <ambientLight intensity={1.18} />
        <hemisphereLight intensity={1.1} color="#ffffff" groundColor="#a99b88" />
        <directionalLight
          position={[9, 15, 10]}
          intensity={2.45}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-9, 8, -6]} intensity={0.72} color="#b7d4e6" />

        <Suspense fallback={<ModelLoadingIndicator />}>
          <LoadedBuilding selected={selected} nudge={nudge} paused={interacting} />
        </Suspense>

        <ContactShadows
          position={[0, MODEL_BASE_Y - 0.05, 0]}
          opacity={0.25}
          scale={18}
          blur={2.8}
          far={9}
        />
        <OrbitControls
          makeDefault
          target={[0, 0.2, 0]}
          enablePan={false}
          enableZoom
          zoomSpeed={0.9}
          rotateSpeed={0.65}
          touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE }}
          minDistance={11}
          maxDistance={38}
          minPolarAngle={Math.PI / 3.55}
          maxPolarAngle={Math.PI / 1.87}
          dampingFactor={0.065}
          enableDamping
          onStart={pause}
          onEnd={resume}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
