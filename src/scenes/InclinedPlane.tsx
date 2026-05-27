import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import * as THREE from "three";

interface Props { angle: number; mass: number; friction: number; speed: number; }

const COLORS = { mg: "#ef4444", N: "#3b82f6", f: "#f59e0b", mgP: "#22c55e" };

export function InclinedPlaneScene({ angle = 30, mass = 5, friction = 0.3, speed = 1 }: Props) {
  const blockRef = useRef<THREE.Mesh>(null);
  const arrowsRef = useRef<THREE.Group>(null);
  const rad = THREE.MathUtils.degToRad(angle);
  const sinA = Math.sin(rad);
  const cosA = Math.cos(rad);
  const g = 9.8;
  const mg = mass * g;
  const N = mg * cosA;
  const fForce = friction * N;
  const mgPar = mg * sinA;
  const accel = Math.max(0.1, g * (sinA - friction * cosA));
  const planeLen = 4;
  const half = planeLen / 2;
  const blockH = 0.45;
  const speedScale = 0.18;

  const blockState = useRef({ x: -half + 0.7, v: 0 });

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const s = blockState.current;
    s.v += accel * dt * speedScale * 20 * speed;
    s.x += s.v * dt;
    if (s.x >= half - 0.65) { s.x = -half + 0.7; s.v = 0; }
    const lx = s.x, ly = 0.06 + blockH / 2;
    if (blockRef.current) blockRef.current.position.set(lx, ly, 0);
    if (arrowsRef.current) arrowsRef.current.position.set(lx, ly, 0);
  });

  const reset = () => { blockState.current.x = -half + 0.7; blockState.current.v = 0; };

  const shaft = useMemo(() => new THREE.CylinderGeometry(0.03, 0.03, 1, 8), []);
  const head = useMemo(() => new THREE.ConeGeometry(0.08, 0.18, 8), []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.6, 0]} receiveShadow>
        <planeGeometry args={[22, 22]} />
        <meshStandardMaterial color="#d1d5db" />
      </mesh>

      <group rotation={[0, 0, rad]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[planeLen, 0.12, 1.4]} />
          <meshStandardMaterial color="#9ca3af" roughness={0.35} metalness={0.2} />
        </mesh>
        <mesh position={[half - 0.5, -0.55, 0]}>
          <boxGeometry args={[0.14, 1.0, 1.4]} />
          <meshStandardMaterial color="#9ca3af" roughness={0.35} />
        </mesh>
        <mesh ref={blockRef} castShadow>
          <boxGeometry args={[0.5, blockH, 0.5]} />
          <meshStandardMaterial color="#f97316" roughness={0.2} metalness={0.1} />
        </mesh>

        <CoordinateAxes />

        <group ref={arrowsRef}>
          <ForceArrow shaft={shaft} head={head} dir={[0, -1, 0]} len={0.9} color={COLORS.mg} label="mg" />
          <ForceArrow shaft={shaft} head={head} dir={[-sinA, cosA, 0]} len={0.75} color={COLORS.N} label="N" />
          <ForceArrow shaft={shaft} head={head} dir={[-cosA, -sinA, 0]} len={0.45} color={COLORS.f} label="f" />
          <ForceArrow shaft={shaft} head={head} dir={[cosA, -sinA, 0]} len={0.65} color={COLORS.mgP} label="mg||" />
        </group>
      </group>

      <Html position={[2.5, 2.0, 1.5]}>
        <div style={panelStyle}>
          <div style={titleStyle}>斜面受力分析</div>
          <div>θ={angle}° | m={mass}kg | μ={friction}</div>
          <div style={{color:COLORS.N}}>N = mg·cosθ = {N.toFixed(1)} N</div>
          <div style={{color:COLORS.f}}>f = μN = {fForce.toFixed(1)} N</div>
          <div style={{color:COLORS.mgP}}>mg∥ = mg·sinθ = {mgPar.toFixed(1)} N</div>
          <div style={{color:COLORS.mg,fontWeight:700}}>a = {accel.toFixed(2)} m/s²</div>
        </div>
      </Html>

      <Html position={[-2.8, 2.2, 1.5]}>
        <button onClick={reset} style={btnStyle}>重置滑块</button>
      </Html>

      <gridHelper args={[12, 24, "#e5e7eb", "#d1d5db"]} position={[0, -2.49, 0]} />
    </group>
  );
}

function CoordinateAxes() {
  const len = 2.2, gray = "#6b7280";
  return (
    <group>
      <mesh position={[0, 0.35, 0.76]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      <Line points={[[-0.3, 0.35, 0.76], [len, 0.35, 0.76]]} color={gray} lineWidth={1.5} />
      <mesh position={[len, 0.35, 0.76]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.07, 0.18, 6]} />
        <meshStandardMaterial color={gray} />
      </mesh>
      <Html position={[len + 0.3, 0.42, 0.76]} center>
        <span style={axisLabelStyle}>x'</span>
      </Html>
      <Line points={[[0, 0.35, 0.76], [0, 1.8, 0.76]]} color={gray} lineWidth={1.5} />
      <mesh position={[0, 1.8, 0.76]}>
        <coneGeometry args={[0.07, 0.18, 6]} />
        <meshStandardMaterial color={gray} />
      </mesh>
      <Html position={[0.15, 2.0, 0.76]} center>
        <span style={axisLabelStyle}>y'</span>
      </Html>
      <Html position={[0.18, 0.55, 0.76]} center>
        <span style={{ color: "#374151", fontSize: 11, fontWeight: 700 }}>O</span>
      </Html>
    </group>
  );
}

function ForceArrow({ shaft, head, dir, len, color, label }: {
  shaft: THREE.CylinderGeometry; head: THREE.ConeGeometry;
  dir: [number, number, number]; len: number; color: string; label: string;
}) {
  const d = new THREE.Vector3(...dir).normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
  return (
    <group>
      <mesh position={d.clone().multiplyScalar(len / 2)} quaternion={quat} renderOrder={1}>
        <primitive object={shaft.clone()} attach="geometry" />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} depthTest={false} depthWrite={false} />
      </mesh>
      <mesh position={d.clone().multiplyScalar(len - 0.08)} quaternion={quat} renderOrder={1}>
        <primitive object={head.clone()} attach="geometry" />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} depthTest={false} depthWrite={false} />
      </mesh>
      <Html position={d.clone().multiplyScalar(len + 0.15).add(new THREE.Vector3(0, 0, 0.55))} center style={{ pointerEvents: "none" }}>
        <span style={{ color, fontSize: 13, fontWeight: 800, fontFamily: "monospace", textShadow: "0 0 6px #fff, 0 0 10px #fff, 0 2px 4px rgba(0,0,0,0.3)", background: "rgba(255,255,255,0.85)", padding: "1px 5px", borderRadius: 3 }}>
          {label}
        </span>
      </Html>
    </group>
  );
}

const axisLabelStyle: React.CSSProperties = { color: "#374151", fontSize: 13, fontWeight: 700, fontFamily: "serif", textShadow: "0 0 4px #fff" };
const panelStyle: React.CSSProperties = { background: "rgba(255,255,255,0.94)", border: "1px solid #d1d5db", borderRadius: 10, padding: "12px 16px", color: "#1e293b", fontSize: 12, fontFamily: "monospace", lineHeight: 1.7, whiteSpace: "nowrap", minWidth: 220, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" };
const titleStyle: React.CSSProperties = { color: "#d97706", fontWeight: 700, fontSize: 13, marginBottom: 6 };
const btnStyle: React.CSSProperties = { background: "#e2e8f0", color: "#334155", border: "1px solid #d1d5db", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600 };
