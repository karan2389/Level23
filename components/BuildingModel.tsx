"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { FloorGroupId } from "@/types/floor";

const accent = new THREE.Color("#e87f4f");

function Material({ active, color, opacity = 1 }: { active: boolean; color: string; opacity?: number }) {
  return (
    <meshStandardMaterial
      color={active ? accent : color}
      emissive={active ? accent : new THREE.Color("#000000")}
      emissiveIntensity={active ? 0.34 : 0}
      roughness={0.36}
      metalness={0.24}
      transparent={opacity < 1}
      opacity={opacity}
    />
  );
}

function Building({ selected, nudge, paused }: { selected: FloorGroupId; nudge: number; paused: boolean }) {
  const group = useRef<THREE.Group>(null);
  const targetRotation = useRef(-0.42);
  const previousNudge = useRef(nudge);

  useEffect(() => {
    const difference = nudge - previousNudge.current;
    targetRotation.current += difference * 0.52;
    previousNudge.current = nudge;
  }, [nudge]);

  useFrame((_, delta) => {
    if (!group.current) return;
    if (!paused) targetRotation.current += delta * 0.065;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetRotation.current, 5.5, delta);
  });

  const fins = useMemo(() => Array.from({ length: 22 }, (_, i) => -2.4 + i * 0.225), []);
  const sideFins = useMemo(() => Array.from({ length: 13 }, (_, i) => -1.4 + i * 0.235), []);
  const slabs = useMemo(() => Array.from({ length: 16 }, (_, i) => 5.0 + i * 0.47), []);

  return (
    <group ref={group} position={[0, -2.9, 0]} rotation={[0, -0.42, 0]}>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.8, 0.7, 4.35]} />
        <Material active={selected === "ground"} color="#dad5ce" />
      </mesh>
      <mesh position={[0, 1.08, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.45, 0.68, 4.05]} />
        <Material active={selected === "first"} color="#cbd0d2" />
      </mesh>
      <mesh position={[0, 2.48, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.45, 2.08, 4.05]} />
        <Material active={selected === "parking"} color="#b9bcbd" />
      </mesh>
      <mesh position={[0, 3.91, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.35, 0.7, 3.98]} />
        <Material active={selected === "amenities"} color="#ddd6ca" />
      </mesh>

      <mesh position={[-0.34, 8.56, -0.12]} castShadow receiveShadow>
        <boxGeometry args={[4.72, 8.75, 3.48]} />
        <Material active={selected === "offices"} color="#7893a5" opacity={0.9} />
      </mesh>

      <mesh position={[1.65, 8.48, 1.24]} castShadow receiveShadow>
        <boxGeometry args={[1.46, 8.5, 0.8]} />
        <Material active={selected === "offices"} color="#65594f" />
      </mesh>

      {[5.65, 6.78, 7.91, 9.04, 10.17].map((y) => (
        <mesh key={y} position={[1.67, y, 1.72]} castShadow>
          <boxGeometry args={[1.86, 0.17, 0.88]} />
          <meshStandardMaterial color="#50463f" roughness={0.62} />
        </mesh>
      ))}

      {fins.map((x) => (
        <mesh key={`front-${x}`} position={[x, 8.51, 1.66]} castShadow>
          <boxGeometry args={[0.052, 8.86, 0.13]} />
          <meshStandardMaterial color="#e3e9ec" metalness={0.6} roughness={0.24} />
        </mesh>
      ))}
      {sideFins.map((z) => (
        <mesh key={`side-${z}`} position={[-2.73, 8.51, z]} castShadow>
          <boxGeometry args={[0.13, 8.86, 0.052]} />
          <meshStandardMaterial color="#e3e9ec" metalness={0.6} roughness={0.24} />
        </mesh>
      ))}
      {slabs.map((y) => (
        <mesh key={`slab-${y}`} position={[-0.34, y, -0.12]}>
          <boxGeometry args={[4.58, 0.034, 3.35]} />
          <meshStandardMaterial color="#f7fafb" transparent opacity={0.3} />
        </mesh>
      ))}

      <mesh position={[-0.34, 13.08, -0.12]} castShadow>
        <boxGeometry args={[4.76, 0.56, 3.52]} />
        <Material active={selected === "premium"} color="#d9d2c8" />
      </mesh>

      {[-1.95, -1.05, -0.05, 0.9, 1.78].map((x, index) => (
        <group key={x} position={[x, 4.34, 1.78]}>
          <mesh castShadow>
            <boxGeometry args={[0.45, 0.18, 0.32]} />
            <meshStandardMaterial color="#816b55" />
          </mesh>
          <mesh position={[0, 0.2, 0]} castShadow>
            <sphereGeometry args={[0.19 + (index % 2) * 0.055, 14, 14]} />
            <meshStandardMaterial color="#66845f" roughness={0.82} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, -0.15, 0]} receiveShadow>
        <cylinderGeometry args={[4.6, 5.0, 0.22, 72]} />
        <meshStandardMaterial color="#ebe6df" roughness={0.92} />
      </mesh>
    </group>
  );
}

export default function BuildingModel({ selected, nudge }: { selected: FloorGroupId; nudge: number }) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [interacting, setInteracting] = useState(false);
  const endTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    };
  }, []);

  return (
    <div ref={surfaceRef} className="model-interaction-surface">
    <Canvas
      camera={{ position: [16.74, 15.0, 22.47], fov: 32 }}
      dpr={[1, 1.65]}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: "none" }}
      onCreated={({ gl }) => {
        gl.domElement.style.touchAction = "none";
        gl.domElement.style.userSelect = "none";
      }}
      shadows
    >
      <ambientLight intensity={1.38} />
      <hemisphereLight intensity={1.12} color="#ffffff" groundColor="#bda98d" />
      <directionalLight position={[9, 14, 8]} intensity={2.65} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-8, 8, -5]} intensity={0.8} color="#b7d4e6" />
      <Building selected={selected} nudge={nudge} paused={interacting} />
      <ContactShadows position={[0, -3.0, 0]} opacity={0.25} scale={16} blur={2.8} far={8} />
      <OrbitControls
        makeDefault
        target={[0, 4, 0]}
        enablePan={false}
        enableZoom
        zoomSpeed={0.9}
        rotateSpeed={0.65}
        touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE }}
        minDistance={9.5}
        maxDistance={35}
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
