import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import * as THREE from "three";

interface Props { length: number; mass: number; speed: number; }

export function PendulumScene({ length = 1.5, mass = 0.5, speed = 1 }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const bobRef = useRef<THREE.Mesh>(null);
  const forcesRef = useRef<THREE.Group>(null);
  const gVal = 9.8;
  const omega = Math.sqrt(gVal / length);
  const period = 2 * Math.PI * Math.sqrt(length / gVal);
  const maxAngle = THREE.MathUtils.degToRad(20);
  const visLen = Math.min(2.2, length * 0.85);
  const bobR = 0.18;
  const elapsed = useRef(0);
  const mg = mass * gVal;

  useFrame((_, delta) => {
    elapsed.current += Math.min(delta, 0.1) * speed;
    const angle = maxAngle * Math.cos(omega * elapsed.current);
    if (groupRef.current) groupRef.current.rotation.z = angle;

    // Update forces position to follow bob
    if (forcesRef.current) {
      const bx = Math.sin(angle) * visLen;
      const by = -Math.cos(angle) * visLen;
      forcesRef.current.position.set(bx, by, 0);
    }
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.1, 0]} receiveShadow>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#d1d5db" />
      </mesh>

      {/* Support */}
      <mesh position={[0, 0.12, 0]} castShadow>
        <boxGeometry args={[1, 0.12, 0.25]} />
        <meshStandardMaterial color="#6b7280" roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[-0.4, -0.25, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.5, 8]} />
        <meshStandardMaterial color="#6b7280" roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[0.4, -0.25, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.5, 8]} />
        <meshStandardMaterial color="#6b7280" roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[0, -0.55, 0]}>
        <boxGeometry args={[1, 0.08, 0.3]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.4} />
      </mesh>

      {/* Pivot */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#6b7280" metalness={0.5} />
      </mesh>

      {/* Coordinate cross */}
      <Line points={[[-1, 0, 0.15], [1, 0, 0.15]]} color="#6b7280" lineWidth={1.5} />
      <mesh position={[0.95, 0, 0.15]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.05, 0.14, 6]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
      <Html position={[1.2, -0.12, 0.15]} center>
        <span style={{ color: "#374151", fontSize: 13, fontWeight: 700, fontFamily: "serif", textShadow: "0 0 4px #fff" }}>x</span>
      </Html>
      <Line points={[[0, 0.5, 0.15], [0, -2.8, 0.15]]} color="#6b7280" lineWidth={1.5} />
      <mesh position={[0, -2.75, 0.15]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.05, 0.14, 6]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
      <Html position={[0.15, -2.95, 0.15]} center>
        <span style={{ color: "#374151", fontSize: 13, fontWeight: 700, fontFamily: "serif", textShadow: "0 0 4px #fff" }}>y</span>
      </Html>
      <mesh position={[0, 0, 0.16]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      <Html position={[0.18, 0.18, 0.16]} center>
        <span style={{ color: "#374151", fontSize: 11, fontWeight: 700 }}>O</span>
      </Html>

      {/* Pendulum arm + bob */}
      <group ref={groupRef}>
        <mesh position={[0, -visLen / 2, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, visLen, 8]} />
          <meshStandardMaterial color="#9ca3af" roughness={0.2} metalness={0.5} />
        </mesh>
        <mesh ref={bobRef} position={[0, -visLen, 0]} castShadow>
          <sphereGeometry args={[bobR, 32, 32]} />
          <meshStandardMaterial color="#ef4444" roughness={0.12} metalness={0.2} />
        </mesh>
      </group>

      {/* Force arrows following bob */}
      <group ref={forcesRef}>
        {/* mg — always downward */}
        <mesh position={[0, -0.5, 0]} renderOrder={1}>
          <cylinderGeometry args={[0.03, 0.03, 0.85, 8]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.3} depthTest={false} depthWrite={false} />
        </mesh>
        <mesh position={[0, -0.95, 0]} renderOrder={1}>
          <coneGeometry args={[0.08, 0.18, 8]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.3} depthTest={false} depthWrite={false} />
        </mesh>
        <Html position={[0.25, -0.55, 0.35]} center style={{ pointerEvents: "none" }}>
          <span style={fl("#ef4444")}>mg={mg.toFixed(1)}N</span>
        </Html>

        {/* T — along arm toward pivot */}
        <ForceTowardPivot visLen={visLen} mass={mass} gVal={gVal} />
      </group>

      {/* Equilibrium line */}
      {Array.from({ length: 14 }).map((_, i) => (
        <mesh key={i} position={[0, -0.12 - i * 0.17, -0.01]}>
          <boxGeometry args={[0.018, 0.07, 0.01]} />
          <meshStandardMaterial color="#9ca3af" />
        </mesh>
      ))}

      <Html position={[1.2, 1.3, 1]}>
        <div style={panelS}>
          <div style={{ color: "#d97706", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>单摆运动分析</div>
          <div>L = {length} m &nbsp;|&nbsp; m = {mass} kg</div>
          <div style={{color:"#3b82f6"}}>T = 2π√(L/g) = {period.toFixed(2)} s</div>
          <div>ω = √(g/L) = {omega.toFixed(2)} rad/s</div>
          <div style={{color:"#ef4444"}}>mg = {mg.toFixed(1)} N</div>
          <div style={{ color: "#6b7280", marginTop: 4 }}>θ₀ = 20° (小角度)</div>
        </div>
      </Html>

      <gridHelper args={[6, 12, "#e5e7eb", "#d1d5db"]} position={[0, -3.09, -0.5]} />
    </group>
  );
}

// Tension force — points from bob toward pivot
function ForceTowardPivot({ visLen, mass, gVal }: { visLen: number; mass: number; gVal: number }) {
  // T ≈ mg*cosθ (radial component, small angle approximation)
  return (
    <group>
      <mesh position={[0, visLen / 2, 0]} rotation={[0, 0, Math.PI]} renderOrder={1}>
        <cylinderGeometry args={[0.03, 0.03, visLen - 0.1, 8]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.3} depthTest={false} depthWrite={false} />
      </mesh>
      <mesh position={[0, visLen - 0.15, 0]} rotation={[0, 0, Math.PI]} renderOrder={1}>
        <coneGeometry args={[0.08, 0.18, 8]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.3} depthTest={false} depthWrite={false} />
      </mesh>
      <Html position={[0.25, visLen / 2, 0.35]} center style={{ pointerEvents: "none" }}>
        <span style={fl("#3b82f6")}>T</span>
      </Html>
    </group>
  );
}

const fl = (c: string): React.CSSProperties => ({
  color: c, fontSize: 12, fontWeight: 800, fontFamily: "monospace",
  textShadow: "0 0 6px #fff, 0 0 10px #fff",
  background: "rgba(255,255,255,0.88)", padding: "2px 6px", borderRadius: 4,
});
const panelS: React.CSSProperties = { background: "rgba(255,255,255,0.94)", border: "1px solid #d1d5db", borderRadius: 10, padding: "12px 16px", color: "#1e293b", fontSize: 12, fontFamily: "monospace", lineHeight: 1.7, whiteSpace: "nowrap", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" };
