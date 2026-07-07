import { useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Float } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. THE RAW CAMERA CONTROLLER (Updated for Blueprint Table) ---
function CameraRig({ activeTarget }: { activeTarget: string | null }) {
  useFrame((state) => {
    const targetPosition = new THREE.Vector3(8, 6, 8);
    const targetLookAt = new THREE.Vector3(0, 0, 0);

    if (activeTarget === 'workbench') {
      targetPosition.set(3, 2, 2);
      targetLookAt.set(1, 0.4, -1);
    } else if (activeTarget === 'shelves') {
      targetPosition.set(-1, 2.5, -2); 
      targetLookAt.set(-5.4, 2, -2);
    } else if (activeTarget === 'blueprint') {
      // Zoom to the back wall where the drafting table sits
      targetPosition.set(-1.5, 3.5, 0); 
      targetLookAt.set(-1.5, 1, -4.5);
    }

    state.camera.position.lerp(targetPosition, 0.04);
    const currentLookAt = new THREE.Vector3(0, 0, -1).applyQuaternion(state.camera.quaternion);
    currentLookAt.lerp(targetLookAt.clone().sub(state.camera.position).normalize(), 0.04);
    
    const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().lookAt(state.camera.position, targetLookAt, state.camera.up)
    );
    state.camera.quaternion.slerp(targetQuaternion, 0.04);
  });
  return null;
}

// --- 2. THE ROOM STRUCTURE (Unchanged) ---
function WorkshopRoom() {
  return (
    <group>
      <mesh receiveShadow position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#2c1e16" roughness={0.8} />
      </mesh>
      <mesh receiveShadow position={[0, 2.6, -6]}>
        <boxGeometry args={[12, 6, 0.2]} />
        <meshStandardMaterial color="#3e2a20" roughness={0.9} />
      </mesh>
      <mesh receiveShadow position={[-6, 2.6, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[12, 6, 0.2]} />
        <meshStandardMaterial color="#4a3326" roughness={0.9} />
      </mesh>
    </group>
  );
}

// --- 3A. ITEM: THE WORKBENCH (Projects) ---
function WorkbenchItem({ onClick, isFocused }: { onClick: () => void, isFocused: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const active = isHovered || isFocused;

  return (
    <group 
      position={[1, 0, -1]} 
      onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); }}
      onPointerOut={() => setIsHovered(false)}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.8, 1.2]} />
        <meshStandardMaterial color={active ? '#e0a96d' : '#8c6239'} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.5, 2.5]} />
        <meshBasicMaterial color="#ffdfa9" transparent opacity={active ? 0.3 : 0.02} depthWrite={false} />
      </mesh>
      <Html
        position={[0, 1.2, 0]} center distanceFactor={8}
        style={{ transition: 'all 0.3s ease', opacity: isHovered && !isFocused ? 1 : 0, transform: `scale(${isHovered ? 1 : 0.8})` }}
      >
        <div className="bg-stone-900/90 text-amber-200 border border-amber-500/30 px-3 py-1 rounded shadow-5xl font-mono text-3xl whitespace-nowrap select-none cursor-pointer">
          [ WORKBENCH: PROJECTS ]
        </div>
      </Html>
    </group>
  );
}

// --- 3B. ITEM: THE SHELVES (Tech Stack) ---
function TechShelvesItem({ onClick, isFocused }: { onClick: () => void, isFocused: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const active = isHovered || isFocused;
  const woodColor = active ? '#e0a96d' : '#593d26';

  return (
    <group 
      position={[-5.4, 0, -2]} rotation={[0, Math.PI / 2, 0]}
      onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); }}
      onPointerOut={() => setIsHovered(false)}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      <mesh position={[-1.4, 2, 0]} castShadow receiveShadow><boxGeometry args={[0.2, 4, 1.2]} /><meshStandardMaterial color={woodColor} roughness={0.6} /></mesh>
      <mesh position={[1.4, 2, 0]} castShadow receiveShadow><boxGeometry args={[0.2, 4, 1.2]} /><meshStandardMaterial color={woodColor} roughness={0.6} /></mesh>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow><boxGeometry args={[2.6, 0.1, 1.1]} /><meshStandardMaterial color={woodColor} roughness={0.6} /></mesh>
      <mesh position={[0, 1.8, 0]} castShadow receiveShadow><boxGeometry args={[2.6, 0.1, 1.1]} /><meshStandardMaterial color={woodColor} roughness={0.6} /></mesh>
      <mesh position={[0, 3.1, 0]} castShadow receiveShadow><boxGeometry args={[2.6, 0.1, 1.1]} /><meshStandardMaterial color={woodColor} roughness={0.6} /></mesh>
      
      <mesh position={[-0.8, 0.9, 0]} castShadow><boxGeometry args={[0.6, 0.6, 0.6]} /><meshStandardMaterial color={active ? '#61dafb' : '#2b5a66'} /></mesh>
      <mesh position={[0.5, 2.2, 0]} castShadow><cylinderGeometry args={[0.3, 0.3, 0.6, 16]} /><meshStandardMaterial color={active ? '#68a063' : '#324a30'} /></mesh>
      <mesh position={[0, 3.5, 0]} castShadow><boxGeometry args={[0.4, 0.6, 0.4]} /><meshStandardMaterial color={active ? '#f29111' : '#6b430d'} /></mesh>
      
      <mesh position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[4, 3]} /><meshBasicMaterial color="#ffdfa9" transparent opacity={active ? 0.3 : 0.02} depthWrite={false} /></mesh>
      <Html
        position={[0, 4.6, 0]} center distanceFactor={8}
        style={{ transition: 'all 0.3s ease', opacity: isHovered && !isFocused ? 1 : 0, transform: `scale(${isHovered ? 1 : 0.8})` }}
      >
        <div className="bg-stone-900/90 text-amber-200 border border-amber-500/30 px-3 py-1 rounded shadow-5xl font-mono text-3xl whitespace-nowrap select-none cursor-pointer">
          [ SHELVES: TECH STACK ]
        </div>
      </Html>
    </group>
  );
}

// --- 3C. NEW ITEM: THE BLUEPRINT TABLE (About Me) ---
function BlueprintTableItem({ onClick, isFocused }: { onClick: () => void, isFocused: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const active = isHovered || isFocused;
  const woodColor = active ? '#e0a96d' : '#8c6239';

  return (
    <group 
      position={[-1.5, 0, -4.5]} // Tucked in the back corner
      onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); }}
      onPointerOut={() => setIsHovered(false)}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      {/* Table Legs */}
      <mesh position={[-0.8, 0.5, 0]} castShadow><boxGeometry args={[0.1, 1.8, 0.8]} /><meshStandardMaterial color="#4a3326" /></mesh>
      <mesh position={[0.8, 0.5, 0]} castShadow><boxGeometry args={[0.1, 1.8, 0.8]} /><meshStandardMaterial color="#4a3326" /></mesh>

      {/* The Angled Drafting Board */}
      <group position={[0, 1.4, 0.2]} rotation={[Math.PI / 6, 0, 0]}> 
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.1, 1.5]} />
          <meshStandardMaterial color={woodColor} roughness={0.3} />
        </mesh>
        
        {/* The Blueprint Paper resting on the board */}
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[1.8, 1.1]} />
          {/* Paper glows soft blue when active, otherwise standard off-white */}
          <meshStandardMaterial color={active ? '#c7e6fa' : '#dcd0c0'} roughness={1} />
        </mesh>
      </group>

      {/* A simple wooden stool placed in front of the table */}
      <mesh position={[0, 0.2, 1.2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.6, 16]} />
        <meshStandardMaterial color="#593d26" roughness={0.8} />
      </mesh>

      {/* Floor Glow */}
      <mesh position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.5, 3.5]} />
        <meshBasicMaterial color="#ffdfa9" transparent opacity={active ? 0.3 : 0.02} depthWrite={false} />
      </mesh>

      <Html
        position={[0, 2.4, -0.5]} center distanceFactor={8}
        style={{ transition: 'all 0.3s ease', opacity: isHovered && !isFocused ? 1 : 0, transform: `scale(${isHovered ? 1 : 0.8})` }}
      >
        <div className="bg-stone-900/90 text-amber-200 border border-amber-500/30 px-3 py-1 rounded shadow-5xl font-mono text-3xl whitespace-nowrap select-none cursor-pointer">
          [ BLUEPRINTS: ABOUT ME ]
        </div>
      </Html>
    </group>
  );
}

// --- 4. MAIN APP COMPONENT ---
export default function App() {
  const [activeTarget, setActiveTarget] = useState<string | null>(null);

  // Dynamic UI Content mapped to our 3 workstations
  const renderOverlayContent = () => {
    if (activeTarget === 'workbench') {
      return (
        <div className="animate-fade-in">
          <h2 className="text-3xl font-bold text-amber-500 mb-4">Current Projects</h2>
          <p className="text-stone-300 font-mono mb-6">Building robust, scalable architectures.</p>
          <div className="bg-stone-800/50 p-4 rounded border border-stone-700">
            <h3 className="text-amber-300 font-bold">Smart Garden Prototype</h3>
            <p className="text-sm text-stone-400 mt-2">React • Node.js • AWS</p>
          </div>
        </div>
      );
    }
    if (activeTarget === 'shelves') {
      return (
        <div className="animate-fade-in">
          <h2 className="text-3xl font-bold text-amber-500 mb-4">Tech Stack</h2>
          <p className="text-stone-300 font-mono mb-6">The tools of the craftsman.</p>
          <div className="space-y-4">
            <div className="bg-stone-800/50 p-4 rounded border border-stone-700 border-l-4 border-l-sky-400">
              <h3 className="text-sky-400 font-bold">Frontend Architecture</h3>
              <p className="text-sm text-stone-400 mt-2">React, TypeScript, Three.js, Tailwind</p>
            </div>
            <div className="bg-stone-800/50 p-4 rounded border border-stone-700 border-l-4 border-l-green-400">
              <h3 className="text-green-400 font-bold">Backend Systems</h3>
              <p className="text-sm text-stone-400 mt-2">Node.js, Express, Python, Docker</p>
            </div>
          </div>
        </div>
      );
    }
    if (activeTarget === 'blueprint') {
      return (
        <div className="animate-fade-in">
          <h2 className="text-3xl font-bold text-amber-500 mb-4">The Architect</h2>
          <p className="text-stone-300 font-mono mb-6 border-b border-stone-700 pb-4">
            "Measure twice, cut once."
          </p>
          <div className="prose prose-invert prose-stone">
            <p className="text-stone-400 text-sm leading-relaxed mb-4">
              Hi, I'm a software engineer who treats code like physical craftsmanship. 
              I believe in building applications that are not just functional, but structurally sound and highly maintainable.
            </p>
            <p className="text-stone-400 text-sm leading-relaxed">
              When I'm not drafting architecture diagrams or optimizing rendering cycles, 
              you can find me exploring new web technologies or refining my development environment.
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-stone-950 text-white overflow-hidden">
      
      {/* Header */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h1 className="text-2xl font-bold tracking-widest text-amber-500/80">THE WORKSHOP</h1>
        <p className="text-sm text-stone-400 font-mono mt-1">Status: Operational</p>
      </div>

      {/* Back Button */}
      {activeTarget && (
        <button 
          onClick={() => setActiveTarget(null)}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 bg-stone-800 hover:bg-stone-700 text-amber-200 border border-amber-600/50 px-6 py-2 rounded font-mono text-sm transition-colors cursor-pointer"
        >
          ← RETURN TO OVERVIEW
        </button>
      )}

      {/* Information Panel */}
      <div className={`absolute top-0 right-0 w-[400px] h-full bg-stone-900/95 border-l border-amber-900/30 p-12 z-10 transition-transform duration-700 ease-in-out ${activeTarget ? 'translate-x-0' : 'translate-x-full'}`}>
        {renderOverlayContent()}
      </div>

      {/* 3D Scene */}
      <Canvas shadows>
        <CameraRig activeTarget={activeTarget} />
        <color attach="background" args={['#1c140d']} />
        <ambientLight intensity={2.5} />
        <directionalLight position={[6, 12, 6]} intensity={4.5} castShadow shadow-mapSize={[2048, 2048]} color="#ffead0" />

        <WorkshopRoom />

        <Float speed={1.5} rotationIntensity={0.03} floatIntensity={0.05}>
          <WorkbenchItem isFocused={activeTarget === 'workbench'} onClick={() => setActiveTarget('workbench')} />
          <TechShelvesItem isFocused={activeTarget === 'shelves'} onClick={() => setActiveTarget('shelves')} />
          {/* NEW: The Blueprint Table */}
          <BlueprintTableItem isFocused={activeTarget === 'blueprint'} onClick={() => setActiveTarget('blueprint')} />
        </Float>
      </Canvas>
    </div>
  );
}