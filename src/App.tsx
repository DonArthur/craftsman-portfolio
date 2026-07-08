import { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import QRCode from 'react-qr-code';

// --- 1. THE RAW CAMERA CONTROLLER ---
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
      targetPosition.set(-1.5, 3.5, 0); 
      targetLookAt.set(-1.5, 1, -4.5);
    } else if (activeTarget === 'toolbox') {
      targetPosition.set(4, 2.5, 1);
      targetLookAt.set(2.5, 0.3, -2.5);
    } else if (activeTarget === 'contact') {
      targetPosition.set(4.5, 3, -1);
      targetLookAt.set(4.5, 2, -5.9);
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

// --- MAGICAL FIREFLIES COMPONENT ---
function Fireflies({ active, radius = 1.2, height = 0.5, count = 4 }: { active: boolean, radius?: number, height?: number, count?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  
  const [particles] = useState(() => 
    Array.from({ length: count }).map(() => ({
      speed: 0.5 + Math.random() * 0.5,
      angle: Math.random() * Math.PI * 2,
      yOffset: Math.random() * Math.PI * 2,
      rOffset: 0.8 + Math.random() * 0.4
    }))
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const time = clock.elapsedTime;
    
    groupRef.current.children.forEach((mesh, i) => {
      const p = particles[i];
      const currentSpeed = active ? p.speed * 2.5 : p.speed;
      const currentAngle = (time * currentSpeed) + p.angle;
      const r = radius * p.rOffset;
      
      mesh.position.x = Math.cos(currentAngle) * r;
      mesh.position.z = Math.sin(currentAngle) * r;
      mesh.position.y = Math.sin(time * p.speed * 2 + p.yOffset) * 0.3 + height;
      
      const mat = (mesh as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.opacity = active ? 1 : 0.5;
      mat.color.set(active ? "#4ade80" : "#fde047");
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#fde047" transparent opacity={0.5} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

// --- 2. THE ROOM STRUCTURE ---
function WorkshopRoom({ isNight }: { isNight: boolean }) {
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

      {/* The Craftsman's Window */}
      <group position={[-5.85, 3.2, 1.5]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 2.2, 0.1]} />
          <meshStandardMaterial color="#2a1810" />
        </mesh>
        <mesh position={[0, 0, -0.02]}>
          <boxGeometry args={[3, 2, 0.05]} />
          <meshBasicMaterial color={isNight ? "#1e293b" : "#bae6fd"} />
        </mesh>
        <mesh position={[0, 0, 0.02]} castShadow>
          <boxGeometry args={[0.1, 2, 0.1]} />
          <meshStandardMaterial color="#2a1810" />
        </mesh>
        <mesh position={[0, 0, 0.02]} castShadow>
          <boxGeometry args={[3.2, 0.1, 0.1]} />
          <meshStandardMaterial color="#2a1810" />
        </mesh>
      </group>
    </group>
  );
}

// --- 3. DIEGETIC TOGGLE: THE STANDING LAMP ---
function StandingLampItem({ isNight, toggleNight }: { isNight: boolean, toggleNight: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <group 
      position={[-4.5, -0.5, -4.5]} // Back left corner
      onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); document.body.style.cursor = 'pointer'; }} 
      onPointerOut={() => { setIsHovered(false); document.body.style.cursor = 'auto'; }} 
      onClick={(e) => { e.stopPropagation(); toggleNight(); }}
    >
      {/* Base */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.1, 16]} />
        <meshStandardMaterial color="#2a1810" />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.05, 2.5, 8]} />
        <meshStandardMaterial color="#4a3326" metalness={0.5} />
      </mesh>
      {/* Lampshade */}
      <mesh position={[0, 2.7, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.5, 0.6, 16]} />
        <meshStandardMaterial color={isNight ? "#fef08a" : "#e5e7eb"} side={THREE.DoubleSide} />
      </mesh>
      
      {/* The Actual Light Source */}
      {isNight && (
        <pointLight position={[0, 2.5, 0]} intensity={8} color="#fef08a" distance={15} decay={2} castShadow />
      )}
      
      {/* Glowing Bulb inside */}
      <mesh position={[0, 2.6, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color={isNight ? "#ffffff" : "#9ca3af"} />
      </mesh>
      
      <Fireflies active={isHovered} radius={0.8} height={2.5} count={6} />
      
      <Html position={[0, 3.8, 0]} center distanceFactor={8} style={{ transition: 'all 0.3s ease', opacity: isHovered ? 1 : 0, transform: `scale(${isHovered ? 1 : 0.8})`, pointerEvents: 'none' }}>
        <div className="bg-stone-900/90 text-amber-200 border border-amber-500/30 px-3 py-1 rounded shadow-2xl font-mono text-3xl whitespace-nowrap select-none">
          [ LAMP: LIGHT SWITCH ]
        </div>
      </Html>
    </group>
  );
}

// --- 3A. THE WORKBENCH ---
function WorkbenchItem({ onClick, isFocused }: { onClick: () => void, isFocused: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const active = isHovered || isFocused;
  return (
    <group position={[0, 0, -0.5]} onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); document.body.style.cursor = 'pointer'; }} onPointerOut={() => { setIsHovered(false); document.body.style.cursor = 'auto'; }} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <mesh castShadow receiveShadow><boxGeometry args={[2.5, 0.8, 1.2]} /><meshStandardMaterial color={active ? '#e0a96d' : '#8c6239'} roughness={0.4} /></mesh>
      <mesh position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[3.5, 2.5]} /><meshBasicMaterial color="#ffdfa9" transparent opacity={active ? 0.3 : 0.02} depthWrite={false} /></mesh>
      <Fireflies active={active} radius={1.8} height={0.5} count={20} />
      <Html position={[0, 1.2, 0]} center distanceFactor={8} style={{ transition: 'all 0.3s ease', opacity: isHovered && !isFocused ? 1 : 0, transform: `scale(${isHovered ? 1 : 0.8})` }}>
        <div className="bg-stone-900/90 text-amber-200 border border-amber-500/30 px-3 py-1 rounded shadow-2xl font-mono text-3xl whitespace-nowrap select-none cursor-pointer">
          [ WORKBENCH: PROJECTS ]
        </div>
      </Html>
    </group>
  );
}

// --- 3B. THE SHELVES (Portfolios) ---
function TechShelvesItem({ onClick, isFocused }: { onClick: () => void, isFocused: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const active = isHovered || isFocused;
  const woodColor = active ? '#e0a96d' : '#593d26';
  return (
    <group position={[-5.4, 0, -2]} rotation={[0, Math.PI / 2, 0]} onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); document.body.style.cursor = 'pointer'; }} onPointerOut={() => { setIsHovered(false); document.body.style.cursor = 'auto'; }} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <mesh position={[-1.4, 2, 0]} castShadow receiveShadow><boxGeometry args={[0.2, 4, 1.2]} /><meshStandardMaterial color={woodColor} roughness={0.6} /></mesh>
      <mesh position={[1.4, 2, 0]} castShadow receiveShadow><boxGeometry args={[0.2, 4, 1.2]} /><meshStandardMaterial color={woodColor} roughness={0.6} /></mesh>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow><boxGeometry args={[2.6, 0.1, 1.1]} /><meshStandardMaterial color={woodColor} roughness={0.6} /></mesh>
      <mesh position={[0, 1.8, 0]} castShadow receiveShadow><boxGeometry args={[2.6, 0.1, 1.1]} /><meshStandardMaterial color={woodColor} roughness={0.6} /></mesh>
      <mesh position={[0, 3.1, 0]} castShadow receiveShadow><boxGeometry args={[2.6, 0.1, 1.1]} /><meshStandardMaterial color={woodColor} roughness={0.6} /></mesh>
      <mesh position={[-0.8, 0.9, 0]} castShadow><boxGeometry args={[0.6, 0.6, 0.6]} /><meshStandardMaterial color={active ? '#61dafb' : '#2b5a66'} /></mesh>
      <mesh position={[0.5, 2.2, 0]} castShadow><cylinderGeometry args={[0.3, 0.3, 0.6, 16]} /><meshStandardMaterial color={active ? '#68a063' : '#324a30'} /></mesh>
      <mesh position={[0, 3.5, 0]} castShadow><boxGeometry args={[0.4, 0.6, 0.4]} /><meshStandardMaterial color={active ? '#f29111' : '#6b430d'} /></mesh>
      <mesh position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[4, 3]} /><meshBasicMaterial color="#ffdfa9" transparent opacity={active ? 0.3 : 0.02} depthWrite={false} /></mesh>
      <Fireflies active={active} radius={1.4} height={2} count={24} />
      <Html position={[0, 4.6, 0]} center distanceFactor={8} style={{ transition: 'all 0.3s ease', opacity: isHovered && !isFocused ? 1 : 0, transform: `scale(${isHovered ? 1 : 0.8})` }}>
        <div className="bg-stone-900/90 text-amber-200 border border-amber-500/30 px-3 py-1 rounded shadow-2xl font-mono text-3xl whitespace-nowrap select-none cursor-pointer">
          [ SHELVES: PORTFOLIOS ]
        </div>
      </Html>
    </group>
  );
}

// --- 3C. THE BLUEPRINT TABLE ---
function BlueprintTableItem({ onClick, isFocused }: { onClick: () => void, isFocused: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const active = isHovered || isFocused;
  return (
    <group position={[-1.5, 0, -4.5]} onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); document.body.style.cursor = 'pointer'; }} onPointerOut={() => { setIsHovered(false); document.body.style.cursor = 'auto'; }} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <mesh position={[-0.8, 0.5, 0]} castShadow><boxGeometry args={[0.1, 1.8, 0.8]} /><meshStandardMaterial color="#4a3326" /></mesh>
      <mesh position={[0.8, 0.5, 0]} castShadow><boxGeometry args={[0.1, 1.8, 0.8]} /><meshStandardMaterial color="#4a3326" /></mesh>
      <group position={[0, 1.4, 0.2]} rotation={[Math.PI / 6, 0, 0]}> 
        <mesh castShadow receiveShadow><boxGeometry args={[2.2, 0.1, 1.5]} /><meshStandardMaterial color={active ? '#e0a96d' : '#8c6239'} roughness={0.3} /></mesh>
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[1.8, 1.1]} /><meshStandardMaterial color={active ? '#c7e6fa' : '#dcd0c0'} roughness={1} /></mesh>
      </group>
      <mesh position={[0, 0.2, 1.2]} castShadow receiveShadow><cylinderGeometry args={[0.4, 0.4, 0.6, 16]} /><meshStandardMaterial color="#593d26" roughness={0.8} /></mesh>
      <mesh position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[3.5, 3.5]} /><meshBasicMaterial color="#ffdfa9" transparent opacity={active ? 0.3 : 0.02} depthWrite={false} /></mesh>
      <Fireflies active={active} radius={1.4} height={0.8} count={16} />
      <Html position={[0, 2.4, -0.5]} center distanceFactor={8} style={{ transition: 'all 0.3s ease', opacity: isHovered && !isFocused ? 1 : 0, transform: `scale(${isHovered ? 1 : 0.8})` }}>
        <div className="bg-stone-900/90 text-amber-200 border border-amber-500/30 px-3 py-1 rounded shadow-2xl font-mono text-3xl whitespace-nowrap select-none cursor-pointer">
          [ BLUEPRINTS: ABOUT ME ]
        </div>
      </Html>
    </group>
  );
}

// --- 3D. THE TOOLBOX (Tech Stack) ---
function ToolboxItem({ onClick, isFocused }: { onClick: () => void, isFocused: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const active = isHovered || isFocused;
  
  return (
    <group 
      position={[2.8, -0.2, -2.5]} 
      rotation={[0, -Math.PI / 6, 0]} 
      onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); document.body.style.cursor = 'pointer'; }} 
      onPointerOut={() => { setIsHovered(false); document.body.style.cursor = 'auto'; }} 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow><boxGeometry args={[1.2, 0.5, 0.6]} /><meshStandardMaterial color={active ? '#ff6b6b' : '#8b0000'} roughness={0.3} metalness={0.2} /></mesh>
      <mesh position={[0, 0.7, -0.3]} rotation={[-Math.PI / 4, 0, 0]} castShadow><boxGeometry args={[1.2, 0.5, 0.05]} /><meshStandardMaterial color={active ? '#ff6b6b' : '#8b0000'} /></mesh>
      <mesh position={[-0.3, 0.6, 0]} rotation={[0, 0, Math.PI / 8]} castShadow><cylinderGeometry args={[0.05, 0.05, 0.6]} /><meshStandardMaterial color={active ? '#ffd93d' : '#a08b35'} /></mesh>
      <mesh position={[0.3, 0.6, 0.1]} rotation={[Math.PI / 6, 0, -Math.PI / 6]} castShadow><boxGeometry args={[0.1, 0.7, 0.1]} /><meshStandardMaterial color={active ? '#4dabf7' : '#335e7a'} /></mesh>
      <mesh position={[0, -0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[2.5, 2]} /><meshBasicMaterial color="#ffdfa9" transparent opacity={active ? 0.4 : 0.02} depthWrite={false} /></mesh>
      <Fireflies active={active} radius={0.8} height={0.5} count={12} />
      <Html position={[0, 1.2, 0]} center distanceFactor={8} style={{ transition: 'all 0.3s ease', opacity: isHovered && !isFocused ? 1 : 0, transform: `scale(${isHovered ? 1 : 0.8})` }}>
        <div className="bg-stone-900/90 text-amber-200 border border-amber-500/30 px-3 py-1 rounded shadow-2xl font-mono text-3xl whitespace-nowrap select-none cursor-pointer">
          [ TOOLBOX: TECH STACK ]
        </div>
      </Html>
    </group>
  );
}

// --- 3E. THE EXIT DOOR ---
function ContactDoorItem({ onClick, isFocused }: { onClick: () => void, isFocused: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const active = isHovered || isFocused;
  const woodColor = active ? '#e0a96d' : '#3d2516';
  
  return (
    <group 
      position={[4.5, 0, -5.9]} 
      onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); document.body.style.cursor = 'pointer'; }} 
      onPointerOut={() => { setIsHovered(false); document.body.style.cursor = 'auto'; }} 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      <mesh position={[0, 1.8, 0]} castShadow><boxGeometry args={[2.2, 3.6, 0.3]} /><meshStandardMaterial color="#2a1810" /></mesh>
      <mesh position={[0, 1.8, -0.1]} receiveShadow><boxGeometry args={[1.8, 3.4, 0.1]} /><meshStandardMaterial color={woodColor} /></mesh>
      <group position={[-1.6, 1.5, 0.1]}>
        <mesh castShadow><boxGeometry args={[0.5, 0.8, 0.3]} /><meshStandardMaterial color={active ? '#a8b2c1' : '#4a5059'} metalness={0.6} roughness={0.4} /></mesh>
        <mesh position={[0, 0.2, 0.16]}><planeGeometry args={[0.3, 0.1]} /><meshBasicMaterial color={active ? '#4ade80' : '#000000'} /></mesh>
      </group>
      <mesh position={[-0.2, -0.28, 0.5]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[2.5, 2]} /><meshBasicMaterial color="#ffdfa9" transparent opacity={active ? 0.3 : 0.02} depthWrite={false} /></mesh>
      <Fireflies active={active} radius={1.2} height={1.6} count={16} />
      <Html position={[-1.6, 2.3, 0.2]} center distanceFactor={8} style={{ transition: 'all 0.3s ease', opacity: isHovered && !isFocused ? 1 : 0, transform: `scale(${isHovered ? 1 : 0.8})` }}>
        <div className="bg-stone-900/90 text-amber-200 border border-amber-500/30 px-3 py-1 rounded shadow-2xl font-mono text-3xl whitespace-nowrap select-none cursor-pointer">
          [ MAILBOX: CONTACT ]
        </div>
      </Html>
    </group>
  );
}

// --- 3F. THE CRAFTSMAN'S RUG ---
function WorkshopRug() {
  return (
    <group position={[2.5, -0.49, 2.5]}>
      <mesh receiveShadow position={[-2.5, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[7.5, 3.5]} /><meshStandardMaterial color="#5e2720" roughness={1} /></mesh>
      <mesh receiveShadow position={[-2.5, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[7.1, 3.1]} /><meshStandardMaterial color="#4a1e18" roughness={1} /></mesh>
    </group>
  );
}

// --- 3G. THE LOW-POLY OFFICE PLANT ---
function OfficePlant() {
  return (
    <group position={[2, 0, 5]}>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow><cylinderGeometry args={[0.3, 0.2, 0.6, 8]} /><meshStandardMaterial color="#b55d45" roughness={0.9} /></mesh>
      <mesh position={[0, 0.58, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.28, 8]} /><meshStandardMaterial color="#2b1a10" /></mesh>
      <group position={[0, 0.8, 0]}>
        <mesh position={[0, 0.2, 0]} castShadow><dodecahedronGeometry args={[0.5]} /><meshStandardMaterial color="#2d5a27" roughness={0.7} /></mesh>
        <mesh position={[0.3, 0, 0.2]} castShadow><dodecahedronGeometry args={[0.3]} /><meshStandardMaterial color="#3a7332" roughness={0.7} /></mesh>
        <mesh position={[-0.2, -0.1, 0.3]} castShadow><dodecahedronGeometry args={[0.25]} /><meshStandardMaterial color="#428239" roughness={0.7} /></mesh>
        <mesh position={[-0.3, 0.1, -0.2]} castShadow><dodecahedronGeometry args={[0.35]} /><meshStandardMaterial color="#264d21" roughness={0.7} /></mesh>
      </group>
    </group>
  );
}

// --- 4. MAIN APP COMPONENT ---
export default function App() {
  const [activeTarget, setActiveTarget] = useState<string | null>(null);
  
  // DYNAMIC TIME HOOK
  const [timeState, setTimeState] = useState({ isNight: false, timeString: "" });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const night = hours < 6 || hours >= 18;
      
      const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      // Only set based on actual time on the first load to respect manual toggles later
      setTimeState(prev => prev.timeString === "" ? { isNight: night, timeString: formattedTime } : { ...prev, timeString: formattedTime });
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const { isNight, timeString } = timeState;

  const toggleNight = () => setTimeState(prev => ({ ...prev, isNight: !prev.isNight }));

  const renderOverlayContent = () => {
    if (activeTarget === 'workbench') {
      return (
        <div className="animate-fade-in">
          <h2 className="text-3xl font-bold text-amber-500 mb-4">Experience</h2>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="bg-stone-800/50 p-4 rounded border border-stone-700">
              <h3 className="text-amber-300 font-bold">Tata Consultancy Services</h3>
              <p className="text-xs text-stone-400 mb-2">Insurance Client • 2025 - 2026</p>
              <p className="text-sm text-stone-300">Built customer-facing onboarding apps, financial workflows, and RBAC admin platforms.</p>
            </div>
            <div className="bg-stone-800/50 p-4 rounded border border-stone-700">
              <h3 className="text-amber-300 font-bold">Maucash (Astra Welab)</h3>
              <p className="text-xs text-stone-400 mb-2">Fintech • 2022 - 2025</p>
              <p className="text-sm text-stone-300">Developed customer loan applications and operational dashboards for risk & finance teams.</p>
            </div>
            <div className="bg-stone-800/50 p-4 rounded border border-stone-700">
              <h3 className="text-amber-300 font-bold">Sahassa Panca Manunggal</h3>
              <p className="text-xs text-stone-400 mb-2">Banking Reporting • 2019 - 2021</p>
              <p className="text-sm text-stone-300">Developed reporting platforms for multinational banks using Vue.js, .NET Core, and SQL Server.</p>
            </div>
          </div>
        </div>
      );
    }
    
    if (activeTarget === 'shelves') {
      return (
        <div className="animate-fade-in">
          <h2 className="text-3xl font-bold text-amber-500 mb-4">Other Work</h2>
          <p className="text-stone-300 font-mono mb-6 border-b border-stone-700 pb-4">
            Side projects, open-source, and UI experiments.
          </p>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-4 pb-12 custom-scrollbar">
            <a href="https://github.com/DonArthur/stack-underflow" target="_blank" rel="noreferrer" className="block bg-stone-800/50 hover:bg-stone-700/80 p-4 rounded border border-stone-700 transition-colors">
              <h3 className="text-amber-300 font-bold flex justify-between items-center">
                Stack Underflow <span>↗</span>
              </h3>
              <p className="text-sm text-stone-400 mt-1">A simple React.js Q&A web application project inspired by Stack Overflow with login and user's features such as browse-, post new-, update their own questions, and participate in discussion through comments.</p>
            </a>
          </div>
        </div>
      );
    }
    
    if (activeTarget === 'blueprint') {
      return (
        <div className="animate-fade-in">
          <h2 className="text-3xl font-bold text-amber-500 mb-4">Geraldy Miero</h2>
          <p className="text-stone-300 font-mono mb-6 border-b border-stone-700 pb-4">Frontend Developer</p>
          <p className="text-stone-400 text-sm leading-relaxed mb-4">
            With 7+ years of experience building enterprise applications in the banking, fintech, and insurance industries.
          </p>
          <p className="text-stone-400 text-sm leading-relaxed">
             I specialize in bridging complex backend architectures with seamless, scalable frontend solutions, taking ownership from feature design through production support.
          </p>
        </div>
      );
    }
    
    if (activeTarget === 'toolbox') {
      return (
        <div className="animate-fade-in">
          <h2 className="text-3xl font-bold text-amber-500 mb-4">Tech Stack & Skills</h2>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-4 pb-12 custom-scrollbar">
            <div className="bg-stone-800/50 p-4 rounded border-l-4 border-l-sky-400">
              <h3 className="text-sky-400 font-bold">Frontend</h3>
              <p className="text-sm text-stone-400 mt-2">Vue.js, React.js, Next.js, TypeScript, Tailwind, Ant Design</p>
            </div>
            <div className="bg-stone-800/50 p-4 rounded border-l-4 border-l-green-400">
              <h3 className="text-green-400 font-bold">Backend & API</h3>
              <p className="text-sm text-stone-400 mt-2">ASP.NET Core, Node.js, Express.js, Spring Boot</p>
            </div>
            <div className="bg-stone-800/50 p-4 rounded border-l-4 border-l-orange-400">
              <h3 className="text-orange-400 font-bold">Databases</h3>
              <p className="text-sm text-stone-400 mt-2">SQL Server, MySQL, MongoDB</p>
            </div>
            <div className="mt-6 pt-6 border-t border-stone-700">
              <h3 className="text-amber-300 font-bold mb-4">Professional Practices</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center text-stone-400"><span className="text-amber-500 mr-2">▸</span> State Management (Pinia, Vuex, Redux)</li>
                <li className="flex items-center text-stone-400"><span className="text-amber-500 mr-2">▸</span> Agile / Scrum & SDLC</li>
                <li className="flex items-center text-stone-400"><span className="text-amber-500 mr-2">▸</span> Feature Ownership & Code Review</li>
                <li className="flex items-center text-stone-400"><span className="text-amber-500 mr-2">▸</span> Git Flow & Production Support</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }
    
    if (activeTarget === 'contact') {
      return (
        <div className="animate-fade-in">
          <h2 className="text-3xl font-bold text-amber-500 mb-4">Download My CV</h2>
          <div className="overflow-y-auto max-h-[70vh] pr-4 pb-12 custom-scrollbar">
            <p className="text-stone-300 font-mono mb-6 border-b border-stone-700 pb-4">
              Scan to save a copy directly to your device.
            </p>
            <div className="bg-stone-200 p-4 rounded-xl inline-block mb-6 shadow-xl">
              <QRCode 
                value="https://your-future-website.vercel.app/Geraldy_Miero_CV.pdf" 
                size={180} 
                bgColor="#e7e5e4" 
                fgColor="#1c140d" 
              />
            </div>
            <div className="flex flex-col space-y-4">
               <a 
                 href="/Geraldy_Miero_CV.pdf" 
                 download="Geraldy_Miero_CV.pdf" 
                 className="bg-amber-600 hover:bg-amber-500 text-stone-950 text-center font-bold py-3 px-6 rounded transition-colors w-[212px]"
               >
                 DIRECT DOWNLOAD
               </a>
               <p className="text-sm text-stone-400 mt-2">
                 Or reach out directly:<br/>
                 <a href="mailto:geraldy.miero@gmail.com" className="text-amber-400 hover:underline">
                   geraldy.miero@gmail.com
                 </a>
               </p>
            </div>
            <div className="mt-8 flex space-x-4 border-t border-stone-800 pt-6">
              <a href="https://github.com/DonArthur" target="_blank" rel="noreferrer" className="text-stone-400 hover:text-amber-400 transition-colors">GitHub</a>
              <a href="https://www.linkedin.com/in/geraldy-m-07a09815a/" target="_blank" rel="noreferrer" className="text-stone-400 hover:text-amber-400 transition-colors">LinkedIn</a>
            </div>
          </div> 
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-stone-950 text-white overflow-hidden">
      
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h1 className="text-2xl font-bold tracking-widest text-amber-500/80">THE WORKSHOP</h1>
        <p className="text-sm text-stone-400 font-mono mt-1">
          Status: Operational • Local Time: {timeString}
        </p>
      </div>

      {activeTarget && (
        <button 
          onClick={() => setActiveTarget(null)}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 bg-stone-800 hover:bg-stone-700 text-amber-200 border border-amber-600/50 px-6 py-2 rounded font-mono text-sm transition-colors cursor-pointer"
        >
          ← RETURN TO OVERVIEW
        </button>
      )}

      <div className={`absolute top-0 right-0 w-[400px] h-full bg-stone-900/95 border-l border-amber-900/30 p-12 z-10 transition-transform duration-700 ease-in-out ${activeTarget ? 'translate-x-0' : 'translate-x-full'}`}>
        {renderOverlayContent()}
      </div>

      <Canvas shadows>
        <CameraRig activeTarget={activeTarget} />
        
        {/* Dynamic Canvas Background */}
        <color attach="background" args={[isNight ? '#0a0806' : '#1c140d']} />
        
        {/* Dynamic Lighting */}
        <ambientLight intensity={isNight ? 0.8 : 2.5} />
        <directionalLight 
           position={[6, 12, 6]} 
           intensity={isNight ? 1.5 : 4.5} 
           castShadow 
           shadow-mapSize={[2048, 2048]} 
           color={isNight ? "#8b9bb4" : "#ffead0"} 
        />

        <WorkshopRoom isNight={isNight} />

        <Float speed={1.5} rotationIntensity={0.03} floatIntensity={0.05}>
          {/* NEW: Interactive Standing Lamp */}
          <StandingLampItem isNight={isNight} toggleNight={toggleNight} />
          
          <WorkbenchItem isFocused={activeTarget === 'workbench'} onClick={() => setActiveTarget('workbench')} />
          <TechShelvesItem isFocused={activeTarget === 'shelves'} onClick={() => setActiveTarget('shelves')} />
          <BlueprintTableItem isFocused={activeTarget === 'blueprint'} onClick={() => setActiveTarget('blueprint')} />          
          <ToolboxItem isFocused={activeTarget === 'toolbox'} onClick={() => setActiveTarget('toolbox')} />
          <ContactDoorItem isFocused={activeTarget === 'contact'} onClick={() => setActiveTarget('contact')} />
          <WorkshopRug />
          <OfficePlant />
        </Float>
      </Canvas>
    </div>
  );
}