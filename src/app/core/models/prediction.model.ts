export interface PredictRequest {
  modelId: string;
  inputs: Record<string, number[] | RangeSpec>;
  parameters?: Record<string, number>;
}

export interface RangeSpec {
  min: number;
  max: number;
  steps: number;
}

export interface PredictionResult {
  modelId: string;
  inputs: Record<string, number[]>;
  outputs: Record<string, number[] | number[][]>;
  computationTime: number;
  metadata: PredictionMetadata;
}

export interface PredictionMetadata {
  inputShape: number[];
  outputShape: number[];
  timestamp: string;
}

export interface PredictionError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
