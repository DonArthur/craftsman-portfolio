import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Float } from '@react-three/drei';

// The room environment
function WorkshopRoom() {
  return (
    <group>
      {/* Floor - Dark, warm tone */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#2c1e16" roughness={0.8} />
      </mesh>

      {/* Walls */}
      <mesh receiveShadow position={[0, 2.6, -6]}>
        <boxGeometry args={[12, 6, 0.2]} />
        <meshStandardMaterial color="#3e2a20" roughness={0.9} />
      </mesh>
      <mesh receiveShadow position={[-6, 2.6, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[12, 6, 0.2]} />
        <meshStandardMaterial color="#3e2a20" roughness={0.9} />
      </mesh>
    </group>
  )
}

// This is an individual interactive object in the workshop (e.g. the Workbench)
function WorkbenchItem() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <group
      position={[-2, 0, -2]} // Positioned to the left of the center
      onPointerOver={(e) => {
        e.stopPropagation(); // Prevents the event from bubbling up to other objects
        setIsHovered(true)
      }}
      onPointerOut={() => setIsHovered(false)}
      onClick={() => alert('Zooming into current projects...')}
    >
      {/* 3D object: a simple low poly representation of a workbench table top */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.8, 1.2]} />
        <meshStandardMaterial
          // The table glows warmly when hovered over, otherwise stays a rich wood color
          color={isHovered ? "#e0a96d" : "#8c6239"}
          roughness={0.4}
        />
      </mesh>

      {/* Subtle ambient light underneath the workbench */}
      <mesh position={[0, -0.39, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.5, 2.5]} />
        <meshBasicMaterial
          color="#ffdfa9"
          transparent
          opacity={isHovered ? 0.4 : 0.05} // Intensifies when hovered
        />
      </mesh>

      {/* Floating label for the workbench using drei's Html component */}
      <Html
        position={[0, 1.2, 0]}
        center
        distanceFactor={8} // Makes text scale down naturally with distance
        style={{
          transition: 'all 0.3s ease',
          opacity: isHovered ? 1 : 0, // Fully hidden until hovered
          transform: `scale(${isHovered ? 1 : 0.8})`, // Slightly enlarges when hovered
        }}
      >
        <div className="bg-slate-900/90 text-amber-200 border border-amber-500/30 px-3 py-1 rounded shadow-lg font-mono text-xs whitespace-nowrap select-none pointer-events-none">
          [ WORKBENCH: PROJECTS ]
        </div>
      </Html>
    </group>
  )
}

// The main application layout holding the 3D viewport
export default function App() {
  return (
    <div className="w-screen h-screen bg-neutral-950 text-white relative">
      {/* 2D HUD overlay */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h1 className="text-xl font-mono tracking-widest text-neutral-400">THE WORKSHOP</h1>
        <p className="text-xs text-neutral-600 font-mono mt-1">Status: Operational</p>
      </div>

      {/* The 3D Viewport Window */}
      <Canvas
        camera={{ position: [8, 6, 8], fov: 45 }}
        shadows
      >
        {/* Soft atmospheric background lights */}
        <color attach="background" args={['#1c140d']} />
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[-5, 8, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[ 2048, 2048 ]}
          color="#ffead0"
        />

        {/* The room environment */}
        <WorkshopRoom />
        {/* Dynamic elements wrapped in slow, floating sci-fi motion */}
        <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.1}>
          <WorkbenchItem />
          {/* You can map and add <ShelfItem />, <ToolboxItem />, etc. here later */}
        </Float>

        {/* Camera interaction tool allowing user to look around */}
        <OrbitControls 
          enablePan={false} // Disables panning to keep the user focused on the room 
          maxPolarAngle={Math.PI / 2 - 0.05} // Stops camera from going under the floor
          minDistance={4}
          maxDistance={15}
        />
      </Canvas>
    </div>
  )
}