import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { MockDataService } from './mock-data.service';
import { PhysicsMetadata, PhysicsProblemsResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class PhysicsService {
  private api = inject(ApiService);
  private mockData = inject(MockDataService);

  // Private writable signals
  private _problems = signal<PhysicsMetadata[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _selectedProblem = signal<PhysicsMetadata | null>(null);

  // Public read-only signals
  readonly problems = this._problems.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly selectedProblem = this._selectedProblem.asReadonly();

  // Computed signals
  readonly problemsByCategory = computed(() => {
    const problems = this._problems();
    return problems.reduce((acc, problem) => {
      const key = problem.category;
      acc[key] = [...(acc[key] || []), problem];
      return acc;
    }, {} as Record<string, PhysicsMetadata[]>);
  });

  readonly categories = computed(() =>
    [...new Set(this._problems().map(p => p.category))]
  );

  async loadProblems(): Promise<void> {
    if (this._problems().length > 0) return; // Already loaded

    this._loading.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(
        this.api.get<PhysicsProblemsResponse>('/physics/problems')
      );
      this._problems.set(response.problems);
    } catch (err) {
      // Use mock data when API is unavailable
      console.info('Using mock data for physics problems');
      this._problems.set(this.mockData.getProblems());
    } finally {
      this._loading.set(false);
    }
  }

  selectProblem(problemId: string): void {
    const problem = this._problems().find(p => p.id === problemId);
    this._selectedProblem.set(problem || null);
  }

  getProblemById(problemId: string): PhysicsMetadata | undefined {
    return this._problems().find(p => p.id === problemId);
  }

  clearSelection(): void {
    this._selectedProblem.set(null);
  }
}
