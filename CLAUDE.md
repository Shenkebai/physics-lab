# 物理实验室 — Physics Lab

交互式物理教学工具：老师拍照上传物理题目 → AI 识别生成解题步骤 → 3D 互动模型演示。
画面左侧为分步解题，右侧为 3D 物理模拟场景，学生和老师可拖拽旋转/缩放 3D 模型。

## 技术栈
- Vite + React 18 + TypeScript
- Three.js + @react-three/fiber + @react-three/drei
- 不用 Rapier（WASM 加载有问题），物手动用 useFrame + 物理公式计算

## 项目结构
```
src/
  App.tsx              — 主状态、演示题数据、图片上传逻辑
  index.css            — 浅色主题样式
  components/
    ProblemPanel.tsx   — 左面板：拍照上传 + 分步解题展示
    Scene3D.tsx        — 右面板：3D Canvas + 调速按钮 + 场景路由
    ErrorBoundary.tsx  — Canvas 崩溃保护
  scenes/
    InclinedPlane.tsx  — 斜面受力：滑块 + 力矢量(mg/N/f/mg∥) + 坐标系
    ProjectileMotion.tsx — 抛物运动：轨迹 + 速度矢量跟随 + 坐标系
    Pendulum.tsx       — 单摆运动：mg/T 力矢量跟随 + 坐标系
  types/index.ts       — TypeScript 类型定义
```

## 已实现功能
- [x] 三个物理场景（斜面/抛物/单摆），通过演示题标签切换
- [x] Rapier 物理引擎→已移除，改用手动 useFrame 物理计算（因为 WASM 加载失败）
- [x] 浅色主题背景 + 实体地面（无虚空）
- [x] 十字坐标系（O 原点 + 箭头标注的 x/y 轴）
- [x] 力矢量/速度矢量实时跟随物体移动
- [x] 标注可穿透物体（depthTest: false），白底醒目文字
- [x] 调速按钮（0.5x/1x/1.5x/2x），Canvas key 隔离防止场景交叉污染
- [x] 拍照上传 UI（识别功能用演示数据模拟）
- [x] git 仓库：https://github.com/Shenkebai/physics-lab

## 待实现
- [ ] 真实 LLM API 接入（图片识别 → 解题步骤生成 → 3D 场景参数）
- [ ] 数学和化学场景接入
- [ ] 更多物理场景（弹簧振动、圆周运动）
- [ ] 学生/老师互动（拖拽调节参数如角度、质量等）

## 关键教训
- `@react-three/rapier` 的 WASM 在 Vite 开发模式下加载失败，不要用它
- `React.lazy()` 在 R3F Canvas 内部不兼容，用直接 import
- drei 的 `Text` 组件依赖 Troika 字体加载容易崩溃，用 `Html` 代替文本标注
- Unicode 下标/上标字符不能出现在 JSX `{}` 表达式内部（Babel 解析错误）
- 力矢量/标注用 `depthTest: false` + `depthWrite: false` 防止被 3D 物体遮挡
- Canvas 加 `key={topic}` 确保切换场景时彻底重建
