export interface ParameterSpec {
  name: string;
  symbol: string;
  description?: string;
  min: number;
  max: number;
  default: number;
  step?: number;
  unit?: string;
}

export interface PhysicsMetadata {
  id: string;
  name: string;
  description: string;
  category: 'stellar' | 'gravity' | 'quantum' | 'thermodynamics' | string;
  governingEquation: string;
  boundaryConditions?: string[];
  parameters: ParameterSpec[];
  outputVariables?: OutputVariable[];
  physicsContext?: string;
  variables?: { name: string; description: string; min: number; max: number }[];
  applications?: string[];
}

export interface OutputVariable {
  name: string;
  symbol: string;
  description: string;
  unit?: string;
}

export interface PhysicsProblemsResponse {
  problems: PhysicsMetadata[];
  count: number;
}
