import type { SolvedProblem, PhysicsTopic } from "../types";

interface DemoDef {
  label: string;
  topic: PhysicsTopic;
  problem: string;
}

interface Props {
  image: string | null;
  solved: SolvedProblem | null;
  loading: boolean;
  demos: DemoDef[];
  activeDemo: PhysicsTopic;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSolve: () => void;
  onSelectDemo: (d: DemoDef) => void;
}

export function ProblemPanel({ image, solved, loading, demos, activeDemo, fileRef, onUpload, onSolve, onSelectDemo }: Props) {
  return (
    <div className="panel-left">
      <div className="panel-header">
        <h1>物理实验室</h1>
        <p>拍照上传题目 → AI 解题 → 3D 互动演示</p>
      </div>

      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onUpload} hidden />

      <div className={`upload-zone ${image ? "has-image" : ""}`} onClick={() => fileRef.current?.click()}>
        {image ? (
          <img src={image} alt="题目照片" />
        ) : (
          <>
            <div className="upload-icon">📷</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>点击拍照或选择题目图片</div>
            <div className="upload-hint">支持拍照上传，自动识别题目</div>
          </>
        )}
      </div>

      <div className="btn-row">
        <button className="btn btn-primary" disabled={!image || loading} onClick={onSolve}>
          {loading ? "识别中..." : "🔍 识别并解题"}
        </button>
      </div>

      <div style={{ padding: "8px 24px", fontSize: 12, color: "#64748b" }}>或选择演示题目：</div>
      <div className="demo-tags">
        {demos.map((d) => (
          <button key={d.topic} className={`demo-tag ${d.topic === activeDemo ? "active" : ""}`} onClick={() => onSelectDemo(d)}>
            {d.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="loading-spinner">
          <div className="spinner" />
          AI 正在识别题目并生成解题步骤...
        </div>
      )}

      {solved && (
        <div className="solution-section">
          <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 12 }}>{solved.problem.rawText || demos.find((d) => d.topic === solved.sceneParams.topic)?.problem || ""}</div>

          {solved.steps.map((step, i) => (
            <div key={i} className="step-card">
              <div className="step-header">
                <span className="step-num">{step.order}</span>
                <span className="step-title">{step.title}</span>
              </div>
              <div className="step-content">{step.content}</div>
              {step.formula && <div className="step-formula">{step.formula}</div>}
            </div>
          ))}

          <div className="final-answer">
            <div className="label">答案</div>
            <div className="answer">{solved.finalAnswer}</div>
          </div>
        </div>
      )}
    </div>
  );
}
