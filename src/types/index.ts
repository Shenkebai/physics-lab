export type PhysicsTopic = "inclined_plane" | "projectile" | "pendulum" | "circular" | "spring";

export interface ProblemData {
  rawText: string;
  topic: PhysicsTopic;
  gradeLevel: string;
}

export interface SolutionStep {
  order: number;
  title: string;
  content: string;
  formula?: string;
}

export interface SceneParams {
  topic: PhysicsTopic;
  speed?: number;
  // inclined plane
  angle?: number;
  mass?: number;
  friction?: number;
  // projectile
  velocity?: number;
  launchAngle?: number;
  gravity?: number;
  // pendulum
  length?: number;
  // circular
  radius?: number;
  angularVelocity?: number;
  // spring
  springConstant?: number;
  amplitude?: number;
}

export interface SolvedProblem {
  problem: ProblemData;
  steps: SolutionStep[];
  finalAnswer: string;
  sceneParams: SceneParams;
}
