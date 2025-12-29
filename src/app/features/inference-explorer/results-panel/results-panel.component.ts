import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PredictionResult } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components';

@Component({
  selector: 'app-results-panel',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="results-panel">
      <!-- Header -->
      <div class="panel-header">
        <div class="header-title">
          <i class="pi pi-chart-line"></i>
          <span>Results</span>
        </div>
        @if (result) {
          <span class="status-badge ready">
            <i class="pi pi-check-circle"></i>
            Ready
          </span>
        }
      </div>

      <!-- Content -->
      <div class="panel-content">
        @if (loading) {
          <div class="loading-state">
            <app-loading-spinner message="Running prediction..." />
          </div>
        } @else if (result) {
          <!-- Metrics Bar -->
          <div class="metrics-bar">
            <div class="metric-item">
              <div class="metric-icon time">
                <i class="pi pi-clock"></i>
              </div>
              <div class="metric-info">
                <span class="metric-value">{{ result.computationTime }}ms</span>
                <span class="metric-label">Computation Time</span>
              </div>
            </div>
            <div class="metric-item">
              <div class="metric-icon points">
                <i class="pi pi-table"></i>
              </div>
              <div class="metric-info">
                <span class="metric-value">{{ getOutputSize() }}</span>
                <span class="metric-label">Output Points</span>
              </div>
            </div>
          </div>

          <!-- Chart Container (content projection) -->
          <div class="chart-container">
            <ng-content></ng-content>
          </div>

          <!-- Output Summary -->
          @if (getOutputKeys().length > 0) {
            <div class="output-summary">
              <h4>Output Variables</h4>
              <div class="output-list">
                @for (key of getOutputKeys(); track key) {
                  <div class="output-item">
                    <span class="output-name">{{ key }}</span>
                    <span class="output-range">{{ getOutputRange(key) }}</span>
                  </div>
                }
              </div>
            </div>
          }
        } @else {
          <!-- Empty state - content projection for custom empty state -->
          <ng-content></ng-content>
        }
      </div>
    </div>
  `,
  styles: [`
    .results-panel {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: rgba(30, 41, 59, 0.6);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(51, 65, 85, 0.5);
      border-radius: 20px;
      overflow: hidden;
    }

    // ============================================
    // HEADER
    // ============================================
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid rgba(51, 65, 85, 0.5);
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      font-size: 1rem;
      font-weight: 600;
      color: #f1f5f9;

      i {
        color: #7c3aed;
      }
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;

      &.ready {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
      }

      i {
        font-size: 0.75rem;
      }
    }

    // ============================================
    // CONTENT
    // ============================================
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
      padding: 2rem;
    }

    // ============================================
    // METRICS BAR
    // ============================================
    .metrics-bar {
      display: flex;
      gap: 1rem;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid rgba(51, 65, 85, 0.3);

      @media (max-width: 640px) {
        flex-direction: column;
      }
    }

    .metric-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
      padding: 0.875rem 1rem;
      background: rgba(15, 23, 42, 0.5);
      border-radius: 12px;
    }

    .metric-icon {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      font-size: 1.25rem;

      &.time {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
      }

      &.points {
        background: rgba(59, 130, 246, 0.15);
        color: #60a5fa;
      }
    }

    .metric-info {
      display: flex;
      flex-direction: column;
    }

    .metric-value {
      font-family: 'JetBrains Mono', monospace;
      font-size: 1.125rem;
      font-weight: 700;
      color: #f1f5f9;
    }

    .metric-label {
      font-size: 0.75rem;
      color: #64748b;
    }

    // ============================================
    // CHART CONTAINER
    // ============================================
    .chart-container {
      flex: 1;
      min-height: 350px;
      padding: 1rem 1.5rem;
    }

    // ============================================
    // OUTPUT SUMMARY
    // ============================================
    .output-summary {
      padding: 1rem 1.5rem;
      border-top: 1px solid rgba(51, 65, 85, 0.3);

      h4 {
        font-size: 0.75rem;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0 0 0.75rem;
      }
    }

    .output-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .output-item {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.875rem;
      background: rgba(15, 23, 42, 0.5);
      border-radius: 8px;
    }

    .output-name {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.875rem;
      font-weight: 600;
      color: #a78bfa;
    }

    .output-range {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      color: #64748b;
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
