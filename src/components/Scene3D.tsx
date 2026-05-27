import { Component, Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { InclinedPlaneScene } from "../scenes/InclinedPlane";
import { ProjectileScene } from "../scenes/ProjectileMotion";
import { PendulumScene } from "../scenes/Pendulum";
import type { SceneParams, SolvedProblem } from "../types";

interface Props { params: SceneParams; solved: SolvedProblem | null; }

class CanvasErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; msg: string }> {
  state = { hasError: false, msg: "" };
  static getDerivedStateFromError(e: Error) { return { hasError: true, msg: e.message }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#6b7280", fontSize: 13, gap: 10 }}>
          <span style={{ fontSize: 40 }}>!</span>
          <p>3D 加载失败，请刷新页面</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function SceneContent({ params, speed }: { params: SceneParams; speed: number }) {
  switch (params.topic) {
    case "inclined_plane":
      return <InclinedPlaneScene angle={params.angle ?? 30} mass={params.mass ?? 5} friction={params.friction ?? 0.3} speed={speed} />;
    case "projectile":
      return <ProjectileScene velocity={params.velocity ?? 20} launchAngle={params.launchAngle ?? 45} gravity={params.gravity ?? 9.8} speed={speed} />;
    case "pendulum":
      return <PendulumScene length={params.length ?? 1.5} mass={params.mass ?? 0.5} speed={speed} />;
    default:
      return null;
  }
}

export function Scene3D({ params, solved }: Props) {
  const [speed, setSpeed] = useState(1);

  return (
    <div className="panel-right">
      {/* Speed controls */}
      <div style={{ position: "absolute", top: 12, right: 16, zIndex: 10, display: "flex", gap: 4, alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "#6b7280", marginRight: 4 }}>速度</span>
        {[0.5, 1, 1.5, 2].map((s) => (
          <button key={s} onClick={() => setSpeed(s)} style={{
            padding: "3px 10px", borderRadius: 4, border: speed === s ? "1px solid #3b82f6" : "1px solid #d1d5db",
            background: speed === s ? "#3b82f6" : "#fff", color: speed === s ? "#fff" : "#6b7280",
            fontSize: 11, cursor: "pointer", fontWeight: speed === s ? 600 : 400,
            transition: "all .15s"
          }}>{s}x</button>
        ))}
      </div>

      <CanvasErrorBoundary>
        <Canvas key={params.topic} camera={{ position: [6, 4, 8], fov: 45 }} shadows style={{ background: "#f8fafc" }}>
          <color attach="background" args={["#f8fafc"]} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 15, 10]} intensity={1.0} />
          <Suspense fallback={null}>
            <SceneContent params={params} speed={speed} />
          </Suspense>
          <OrbitControls target={[0, 0.5, 0]} enablePan enableZoom enableRotate />
        </Canvas>
      </CanvasErrorBoundary>
      <div className="scene-hint">拖拽旋转 | 滚轮缩放 | 右键平移</div>
    </div>
  );
}
