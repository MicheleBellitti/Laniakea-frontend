import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { PredictionResult } from '../../../core/models';
import { MetricCardComponent, LoadingSpinnerComponent } from '../../../shared/components';
import { ScientificNotationPipe } from '../../../shared/pipes';

@Component({
  selector: 'app-results-panel',
  standalone: true,
  imports: [
    CommonModule,
    TagModule,
    SkeletonModule,
    MetricCardComponent,
    LoadingSpinnerComponent,
    ScientificNotationPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="results-panel">
      <div class="panel-header">
        <h3>
          <i class="pi pi-chart-line"></i>
          Results
        </h3>
        @if (result) {
          <p-tag
            value="Ready"
            severity="success"
            icon="pi pi-check"
          />
        }
      </div>

      <div class="panel-content">
        @if (loading) {
          <div class="loading-state">
            <app-loading-spinner message="Running prediction..." />
          </div>
        } @else if (result) {
          <!-- Metrics Bar -->
          <div class="metrics-bar">
            <app-metric-card
              label="Computation Time"
              [value]="result.computationTime"
              unit="ms"
              icon="pi pi-clock"
              iconColor="#10b981"
            />
            <app-metric-card
              label="Output Points"
              [value]="getOutputSize()"
              icon="pi pi-table"
              iconColor="#3b82f6"
            />
          </div>

          <!-- Chart Container (content projection) -->
          <div class="chart-container">
            <ng-content></ng-content>
          </div>

          <!-- Output Summary -->
          <div class="output-summary">
            <h4>Output Variables</h4>
            <div class="output-list">
              @for (key of getOutputKeys(); track key) {
                <div class="output-item">
                  <span class="output-name">{{ key }}</span>
                  <span class="output-range">
                    {{ getOutputRange(key) }}
                  </span>
                </div>
              }
            </div>
          </div>
        } @else {
          <div class="empty-state">
            <i class="pi pi-chart-bar"></i>
            <h4>No Results Yet</h4>
            <p>Configure parameters and run a prediction to see results</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .results-panel {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--surface-section);
      border-radius: 12px;
      overflow: hidden;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid var(--surface-border);

      h3 {
        margin: 0;
        font-size: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;

        i {
          color: var(--primary-color);
        }
      }
    }

    .panel-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .loading-state {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .metrics-bar {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid var(--surface-border);

      @media (max-width: 768px) {
        flex-direction: column;
      }

      app-metric-card {
        flex: 1;
      }
    }

    .chart-container {
      flex: 1;
      min-height: 300px;
      padding: 1rem;
      overflow: hidden;
    }

    .output-summary {
      padding: 1rem;
      border-top: 1px solid var(--surface-border);

      h4 {
        margin: 0 0 0.75rem;
        font-size: 0.875rem;
        color: var(--text-color-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    }

    .output-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .output-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: var(--surface-overlay);
      border-radius: 6px;
      font-size: 0.875rem;
    }

    .output-name {
      color: var(--primary-color);
      font-family: 'JetBrains Mono', monospace;
    }

    .output-range {
      color: var(--text-color-secondary);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
    }

    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--text-color-secondary);
      padding: 2rem;

      i {
        font-size: 4rem;
        margin-bottom: 1rem;
        opacity: 0.3;
      }

      h4 {
        margin: 0 0 0.5rem;
        color: var(--text-color);
      }

      p {
        margin: 0;
        text-align: center;
      }
    }
  `]
})
export class ResultsPanelComponent {
  @Input() result: PredictionResult | null = null;
  @Input() loading = false;

  getOutputKeys(): string[] {
    if (!this.result?.outputs) return [];
    return Object.keys(this.result.outputs);
  }

  getOutputSize(): number {
    if (!this.result?.outputs) return 0;
    const firstKey = Object.keys(this.result.outputs)[0];
    if (!firstKey) return 0;
    const output = this.result.outputs[firstKey];
    if (Array.isArray(output)) {
      if (Array.isArray(output[0])) {
        return (output as number[][]).reduce((sum, row) => sum + row.length, 0);
      }
      return output.length;
    }
    return 0;
  }

  getOutputRange(key: string): string {
    if (!this.result?.outputs) return '';
    const output = this.result.outputs[key];
    if (!Array.isArray(output)) return '';

    let values: number[];
    if (Array.isArray(output[0])) {
      values = (output as number[][]).flat();
    } else {
      values = output as number[];
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    return `[${min.toExponential(2)}, ${max.toExponential(2)}]`;
  }
}
