import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import * as THREE from "three";

interface Props { velocity: number; launchAngle: number; gravity: number; speed: number; }

export function ProjectileScene({ velocity = 20, launchAngle = 45, gravity = 9.8, speed = 1 }: Props) {
  const ballRef = useRef<THREE.Mesh>(null);
  const vGroupRef = useRef<THREE.Group>(null);
  const infoRef = useRef<THREE.Group>(null);
  const rad = THREE.MathUtils.degToRad(launchAngle);
  const v0x = velocity * Math.cos(rad);
  const v0y = velocity * Math.sin(rad);
  const flightTime = (2 * v0y) / gravity;
  const maxHeight = (v0y * v0y) / (2 * gravity);
  const range = v0x * flightTime;
  const scale = 4.5 / range;
  const elapsed = useRef(0);
  const speedScale = 0.28;

  const pts = useMemo(() => {
    const p: THREE.Vector3[] = [];
    for (let t = 0; t <= flightTime + 0.01; t += 0.04)
      p.push(new THREE.Vector3(v0x * t * scale, (v0y * t - 0.5 * gravity * t * t) * scale, 0));
    return p;
  }, [v0x, v0y, gravity, scale, flightTime]);

  const lineGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(pts), [pts]);
  const peakX = range * 0.5 * scale, peakY = maxHeight * scale, totalX = range * scale;

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1) * speedScale * speed;
    elapsed.current += dt;
    const t = elapsed.current % (flightTime + 1.5);
    if (!ballRef.current) return;

    if (t <= flightTime) {
      const x = v0x * t * scale, y = (v0y * t - 0.5 * gravity * t * t) * scale;
      ballRef.current.position.set(x, y, 0);
      ballRef.current.visible = true;

      const vx = v0x, vy = v0y - gravity * t;
      const vMag = Math.sqrt(vx * vx + vy * vy);

      // Velocity vector
      if (vGroupRef.current) {
        vGroupRef.current.position.set(x, y, 0.01);
        vGroupRef.current.visible = true;
        vGroupRef.current.rotation.z = Math.atan2(vy, vx);
        vGroupRef.current.scale.set(Math.max(vMag * 0.04, 0.15), 1, 1);
      }

      // Position + velocity info following ball
      if (infoRef.current) {
        infoRef.current.position.set(x, y, 0);
        infoRef.current.visible = true;
      }
    } else {
      ballRef.current.visible = false;
      if (vGroupRef.current) vGroupRef.current.visible = false;
      if (infoRef.current) infoRef.current.visible = false;
      if (t > flightTime + 1.2) elapsed.current = 0;
    }
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[totalX * 0.5, -2, 0]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color="#d1d5db" />
      </mesh>

      {/* Coordinate axes */}
      <Line points={[[-0.5, 0, 0], [totalX + 0.8, 0, 0]]} color="#6b7280" lineWidth={1.5} />
      <mesh position={[totalX + 0.8, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.06, 0.16, 6]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
      <Html position={[totalX + 1.1, -0.2, 0]} center>
        <span style={axisLabelS}>x</span>
      </Html>
      <Line points={[[0, -0.5, 0], [0, peakY + 0.6, 0]]} color="#6b7280" lineWidth={1.5} />
      <mesh position={[0, peakY + 0.6, 0]}>
        <coneGeometry args={[0.06, 0.16, 6]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
      <Html position={[0.2, peakY + 0.8, 0]} center>
        <span style={axisLabelS}>y</span>
      </Html>
      <mesh position={[0, 0, 0.01]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      <Html position={[-0.18, -0.18, 0.01]} center>
        <span style={{ color: "#374151", fontSize: 11, fontWeight: 700 }}>O</span>
      </Html>

      {/* Trajectory + markers */}
      <Line points={pts as unknown as [number, number, number][]} color="#f59e0b" lineWidth={1.5} />
      <Line points={[[peakX, 0, 0], [peakX, peakY, 0]] as [number, number, number][]} color="#3b82f6" lineWidth={1} />
      <Html position={[peakX, peakY + 0.35, 0]} center>
        <span style={{ color: "#3b82f6", fontSize: 11, fontFamily: "monospace", textShadow: "0 0 4px #fff", fontWeight: 700, background: "rgba(255,255,255,0.8)", padding: "1px 4px", borderRadius: 3 }}>
          h<sub>max</sub>={maxHeight.toFixed(1)}m
        </span>
      </Html>

      {/* Ball */}
      <mesh ref={ballRef} castShadow>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial color="#ef4444" roughness={0.12} metalness={0.1} />
      </mesh>

      {/* Velocity vector following ball */}
      <group ref={vGroupRef}>
        <mesh position={[0.5, 0, 0]} renderOrder={1}>
          <boxGeometry args={[1, 0.05, 0.05]} />
          <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={0.3} depthTest={false} depthWrite={false} />
        </mesh>
        <mesh position={[1.05, 0, 0]} renderOrder={1}>
          <coneGeometry args={[0.1, 0.2, 8]} />
          <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={0.3} depthTest={false} depthWrite={false} />
        </mesh>
        <Html position={[0.6, 0.25, 0]} center style={{ pointerEvents: "none" }}>
          <span style={followLabelS("#facc15")}>v</span>
        </Html>
      </group>

      {/* Physics quantities following ball */}
      <group ref={infoRef}>
        <Html position={[0.35, 0.35, 0]} center style={{ pointerEvents: "none" }}>
          <span style={followLabelS("#f1f5f9")}>v⃗</span>
        </Html>
      </group>

      {/* Data panel */}
      <Html position={[0, peakY + 1.6, 1.5]}>
        <div style={panelStyle}>
          <div style={titleStyle}>抛物运动分析</div>
          <div>v₀ = {velocity} m/s &nbsp; θ = {launchAngle}° &nbsp; g = {gravity}</div>
          <div style={{color:"#3b82f6"}}>h<sub>max</sub> = v₀ᵧ²/(2g) = {maxHeight.toFixed(1)} m</div>
          <div style={{color:"#22c55e"}}>R = v₀ₓ·t<sub>飞</sub> = {range.toFixed(1)} m</div>
          <div style={{color:"#6b7280"}}>t<sub>飞</sub> = {flightTime.toFixed(2)} s</div>
        </div>
      </Html>

      <gridHelper args={[10, 20, "#e5e7eb", "#d1d5db"]} position={[totalX * 0.5, -1.99, 0]} />
    </group>
  );
}

const axisLabelS: React.CSSProperties = { color: "#374151", fontSize: 13, fontWeight: 700, fontFamily: "serif", textShadow: "0 0 4px #fff" };
const followLabelS = (color: string): React.CSSProperties => ({
  color, fontSize: 12, fontWeight: 800, fontFamily: "monospace",
  textShadow: "0 0 6px #fff, 0 0 10px #fff, 0 2px 3px rgba(0,0,0,0.3)",
  background: "rgba(255,255,255,0.88)", padding: "2px 6px", borderRadius: 4,
});
const panelStyle: React.CSSProperties = { background: "rgba(255,255,255,0.94)", border: "1px solid #d1d5db", borderRadius: 10, padding: "12px 16px", color: "#1e293b", fontSize: 12, fontFamily: "monospace", lineHeight: 1.7, whiteSpace: "nowrap", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" };
const titleStyle: React.CSSProperties = { color: "#d97706", fontWeight: 700, fontSize: 13, marginBottom: 6 };
