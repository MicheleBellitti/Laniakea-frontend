import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { MockDataService } from './mock-data.service';
import { PredictRequest, PredictionResult, RangeSpec } from '../models';

@Injectable({ providedIn: 'root' })
export class InferenceService {
  private api = inject(ApiService);
  private mockData = inject(MockDataService);

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
      // Use mock prediction when API is unavailable
      console.info('Using mock prediction');
      
      const inputSpec = request.inputs?.['x'] as RangeSpec | number[];
      let range: { min: number; max: number; steps: number };
      
      if (Array.isArray(inputSpec)) {
        range = { min: inputSpec[0], max: inputSpec[inputSpec.length - 1], steps: inputSpec.length };
      } else if (inputSpec && typeof inputSpec === 'object') {
        range = { min: inputSpec.min, max: inputSpec.max, steps: inputSpec.steps };
      } else {
        range = { min: 0, max: 10, steps: 100 };
      }
      
      const result = this.mockData.generatePrediction(
        request.modelId,
        range,
        request.parameters || {}
      );
      
      this._lastResult.set(result);
      return result;
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
