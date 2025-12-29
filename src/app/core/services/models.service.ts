import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { MockDataService } from './mock-data.service';
import { ModelSummary, ModelDetail, ModelsResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class ModelsService {
  private api = inject(ApiService);
  private mockData = inject(MockDataService);

  // Private writable signals
  private _models = signal<ModelSummary[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _selectedModel = signal<ModelDetail | null>(null);

  // Public read-only signals
  readonly models = this._models.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly selectedModel = this._selectedModel.asReadonly();

  // Computed signals
  readonly baselineModels = computed(() =>
    this._models().filter(m => m.isBaseline)
  );

  readonly modelsByProblem = computed(() => {
    const models = this._models();
    return models.reduce((acc, model) => {
      const key = model.problemType;
      acc[key] = [...(acc[key] || []), model];
      return acc;
    }, {} as Record<string, ModelSummary[]>);
  });

  readonly modelCount = computed(() => this._models().length);

  async loadModels(problemType?: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const params: Record<string, string> = {};
      if (problemType) {
        params['problem_type'] = problemType;
      }
      const response = await firstValueFrom(
        this.api.get<ModelsResponse>('/models', params)
      );
      this._models.set(response.models);
    } catch (err) {
      // Use mock data when API is unavailable
      console.info('Using mock data for models');
      this._models.set(this.mockData.getModels(problemType));
    } finally {
      this._loading.set(false);
    }
  }

  async selectModel(modelId: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const model = await firstValueFrom(
        this.api.get<ModelDetail>(`/models/${modelId}`)
      );
      this._selectedModel.set(model);
    } catch (err) {
      // Use mock data when API is unavailable
      console.info('Using mock data for model details');
      const model = this.mockData.getModelDetail(modelId);
      this._selectedModel.set(model);
    } finally {
      this._loading.set(false);
    }
  }

  getModelById(modelId: string): ModelSummary | undefined {
    return this._models().find(m => m.id === modelId);
  }

  clearSelection(): void {
    this._selectedModel.set(null);
  }

  clearModels(): void {
    this._models.set([]);
  }
}
