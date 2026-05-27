import { useState, useCallback, useRef } from "react";
import { ProblemPanel } from "./components/ProblemPanel";
import { Scene3D } from "./components/Scene3D";
import type { SolvedProblem, SceneParams, PhysicsTopic } from "./types";

const demos: { label: string; topic: PhysicsTopic; params: SceneParams; problem: string; solution: SolvedProblem }[] = [
  {
    label: "斜面受力",
    topic: "inclined_plane",
    problem:
      "一个质量为 5kg 的物体放在倾角为 30° 的斜面上，物体与斜面间的动摩擦因数为 0.3。求物体沿斜面下滑的加速度。(g = 10 m/s²)",
    params: { topic: "inclined_plane", angle: 30, mass: 5, friction: 0.3 },
    solution: {
      problem: { rawText: "", topic: "inclined_plane", gradeLevel: "high_1" },
      steps: [
        { order: 1, title: "受力分析", content: "物体受重力 mg、斜面支持力 N、摩擦力 f。重力分解为沿斜面向下的 mgsinθ 和垂直斜面的 mgcosθ。", formula: "mg_\\parallel = mg\\sin\\theta,\\quad mg_\\perp = mg\\cos\\theta" },
        { order: 2, title: "计算支持力", content: "垂直斜面方向受力平衡：N = mgcosθ = 5 × 10 × cos30° = 43.3 N", formula: "N = mg\\cos\\theta = 50 \\times 0.866 = 43.3\\text{ N}" },
        { order: 3, title: "计算摩擦力", content: "动摩擦力 f = μN = 0.3 × 43.3 = 12.99 N", formula: "f = \\mu N = 0.3 \\times 43.3 = 12.99\\text{ N}" },
        { order: 4, title: "牛顿第二定律", content: "沿斜面方向：mgsinθ - f = ma。代入数据：50×0.5 - 12.99 = 5a，得 a = 2.4 m/s²", formula: "a = \\frac{mg\\sin\\theta - f}{m} = \\frac{25 - 13}{5} = 2.4\\text{ m/s}^2" },
      ],
      finalAnswer: "物体沿斜面下滑的加速度为 2.4 m/s²",
      sceneParams: { topic: "inclined_plane", angle: 30, mass: 5, friction: 0.3 },
    },
  },
  {
    label: "抛物运动",
    topic: "projectile",
    problem:
      "一个球以 20 m/s 的初速度、45° 角从地面抛出。求最大高度、水平射程和飞行时间。(g = 9.8 m/s²)",
    params: { topic: "projectile", velocity: 20, launchAngle: 45, gravity: 9.8 },
    solution: {
      problem: { rawText: "", topic: "projectile", gradeLevel: "high_1" },
      steps: [
        { order: 1, title: "分解初速度", content: "水平分量 v₀ₓ = v₀cosθ = 20×cos45° = 14.14 m/s，竖直分量 v₀ᵧ = v₀sinθ = 20×sin45° = 14.14 m/s", formula: "v_{0x} = v_0\\cos\\theta = 14.14,\\;v_{0y} = v_0\\sin\\theta = 14.14" },
        { order: 2, title: "飞行时间", content: "竖直方向：y = v₀ᵧt - ½gt²。落地时 y=0，得 t = 2v₀ᵧ/g = 2×14.14/9.8 = 2.88 s", formula: "t_f = \\frac{2v_{0y}}{g} = \\frac{28.28}{9.8} = 2.88\\text{ s}" },
        { order: 3, title: "最大高度", content: "最高点 v_y=0：v_y² = v₀ᵧ² - 2gh，h = v₀ᵧ²/(2g) = 200/(19.6) = 10.2 m", formula: "h_{max} = \\frac{v_{0y}^2}{2g} = \\frac{200}{19.6} = 10.2\\text{ m}" },
        { order: 4, title: "水平射程", content: "水平匀速：R = v₀ₓ × t_f = 14.14 × 2.88 = 40.8 m", formula: "R = v_{0x}\\cdot t_f = 14.14 \\times 2.88 = 40.8\\text{ m}" },
      ],
      finalAnswer: "最大高度 10.2 m，射程 40.8 m，飞行时间 2.88 s",
      sceneParams: { topic: "projectile", velocity: 20, launchAngle: 45, gravity: 9.8 },
    },
  },
  {
    label: "单摆运动",
    topic: "pendulum",
    problem:
      "一个长度为 1.5m 的单摆，摆球质量为 0.5kg，从偏离平衡位置 20° 处释放。求周期和最大速度。(g = 9.8 m/s²)",
    params: { topic: "pendulum", length: 1.5, mass: 0.5, angle: 20 },
    solution: {
      problem: { rawText: "", topic: "pendulum", gradeLevel: "high_2" },
      steps: [
        { order: 1, title: "周期公式", content: "小角度摆动时周期 T = 2π√(L/g) = 2π√(1.5/9.8) = 2.46 s", formula: "T = 2\\pi\\sqrt{\\frac{L}{g}} = 2\\pi\\sqrt{\\frac{1.5}{9.8}} = 2.46\\text{ s}" },
        { order: 2, title: "角频率", content: "ω = 2π/T = √(g/L) = √(9.8/1.5) = 2.56 rad/s", formula: "\\omega = \\sqrt{\\frac{g}{L}} = 2.56\\text{ rad/s}" },
        { order: 3, title: "最大速度", content: "由能量守恒：½mv²_max = mgL(1-cosθ₀)，v_max = √(2gL(1-cos20°)) = √(2×9.8×1.5×0.0603) = 1.33 m/s", formula: "v_{max} = \\sqrt{2gL(1-\\cos\\theta_0)} = 1.33\\text{ m/s}" },
        { order: 4, title: "最大高度", content: "h = L(1-cosθ₀) = 1.5 × (1-0.9397) = 0.09 m", formula: "h = L(1-\\cos\\theta_0) = 0.09\\text{ m}" },
      ],
      finalAnswer: "周期 2.46 s，最大速度 1.33 m/s",
      sceneParams: { topic: "pendulum", length: 1.5, mass: 0.5 },
    },
  },
];

export default function App() {
  const [solved, setSolved] = useState<SolvedProblem | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState<PhysicsTopic>("inclined_plane");
  const [sceneParams, setSceneParams] = useState<SceneParams>(demos[0].params);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setSolved(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSolve = useCallback(async () => {
    if (!image) return;
    setLoading(true);
    // Simulate LLM recognition — replace with real API call
    await new Promise((r) => setTimeout(r, 1200));
    const demo = demos.find((d) => d.topic === activeDemo) || demos[0];
    setSolved(demo.solution);
    setSceneParams(demo.params);
    setLoading(false);
  }, [image, activeDemo]);

  const handleDemo = useCallback((d: (typeof demos)[0]) => {
    setActiveDemo(d.topic);
    setImage(null);
    setSolved(d.solution);
    setSceneParams(d.params);
  }, []);

  return (
    <div className="app">
      <ProblemPanel
        image={image}
        solved={solved}
        loading={loading}
        demos={demos}
        activeDemo={activeDemo}
        fileRef={fileRef}
        onUpload={handleImageUpload}
        onSolve={handleSolve}
        onSelectDemo={handleDemo}
      />
      <Scene3D params={sceneParams} solved={solved} />
    </div>
  );
}
