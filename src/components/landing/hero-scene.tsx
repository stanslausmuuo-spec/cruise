"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function GoldParticles({ count = 150 }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return pos;
  }, [count]);

  useFrame((_state) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(Date.now() * 0.0005) * 0.2;
      ref.current.rotation.y = Math.sin(Date.now() * 0.0003) * 0.2;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#C9A84C"
        size={0.05}
        sizeAttenuation
        depthWrite={false}
      />
    </Points>
  );
}

function CenterRing() {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame((_state) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(Date.now() * 0.0002) * 0.1;
      ref.current.rotation.y += 0.005;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={ref} scale={2}>
        <torusKnotGeometry args={[1, 0.3, 128, 16]} />
        <MeshDistortMaterial
          color="#C9A84C"
          metalness={0.9}
          roughness={0.1}
          envMapIntensity={1.5}
          clearcoat={0.5}
          clearcoatRoughness={0.3}
          distort={0.1}
        />
      </mesh>
    </Float>
  );
}

function Scene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={2} color="#C9A84C" />
      <pointLight position={[-5, -3, -5]} intensity={1} color="#6B2737" />
      <spotLight position={[0, 5, 5]} intensity={0.5} color="#C9A84C" />
      <GoldParticles count={200} />
      <CenterRing />
    </Canvas>
  );
}

function FallbackGradient() {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-brand-gold-400/20 via-transparent to-surface-light dark:to-surface-dark" />
  );
}

export function HeroScene() {
  return (
    <>
      <div className="hidden md:block absolute inset-0">
        <Scene3D />
      </div>
      <FallbackGradient />
    </>
  );
}
