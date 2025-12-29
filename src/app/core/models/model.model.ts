export interface ModelSummary {
  id: string;
  name: string;
  problemType: string;
  description: string;
  isBaseline: boolean;
  trainedAt: string;
  metrics: ModelMetrics;
}

export interface ModelMetrics {
  totalLoss: number;
  physicsLoss: number;
  dataLoss: number;
  epochs: number;
  trainingTime: number;
}

export interface ModelDetail extends ModelSummary {
  architecture: ModelArchitecture;
  problemParams: ParameterConfig[];
  inputDomain: InputDomain;
  trainingConfig: TrainingConfig;
}

export interface ModelArchitecture {
  type: string;
  layers: number[];
  activation: string;
  inputDim: number;
  outputDim: number;
}

export interface ParameterConfig {
  name: string;
  symbol: string;
  description: string;
  min: number;
  max: number;
  default: number;
  step: number;
  trainedValue?: number;
}

export interface InputDomain {
  variables: DomainVariable[];
}

export interface DomainVariable {
  name: string;
  symbol: string;
  min: number;
  max: number;
  description: string;
}

export interface TrainingConfig {
  epochs: number;
  learningRate: number;
  optimizer: string;
  batchSize: number;
}

export interface ModelsResponse {
  models: ModelSummary[];
  count: number;
}
