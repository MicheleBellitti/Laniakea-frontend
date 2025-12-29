import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { PredictRequest, PredictionResult, RangeSpec } from '../models';

@Injectable({ providedIn: 'root' })
export class InferenceService {
  private api = inject(ApiService);

  // Private writable signals
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _lastResult = signal<PredictionResult | null>(null);

  // Public read-only signals
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly lastResult = this._lastResult.asReadonly();

  async predict(request: PredictRequest): Promise<PredictionResult> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const result = await firstValueFrom(
        this.api.post<PredictionResult>('/predict', {
          model_id: request.modelId,
          inputs: request.inputs,
          parameters: request.parameters,
        })
      );
      this._lastResult.set(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Prediction failed';
      this._error.set(errorMessage);
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  buildRangeInputs(min: number, max: number, steps: number): RangeSpec {
    return { min, max, steps };
  }

  generateLinspace(min: number, max: number, steps: number): number[] {
    const arr: number[] = [];
    const step = (max - min) / (steps - 1);
    for (let i = 0; i < steps; i++) {
      arr.push(min + step * i);
    }
    return arr;
  }

  clearResult(): void {
    this._lastResult.set(null);
    this._error.set(null);
  }
}
