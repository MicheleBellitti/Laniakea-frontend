import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ParameterSliderComponent, ParameterSpec } from '../../../shared/components';

export interface ParameterValues {
  [key: string]: number;
}

export interface RangeConfig {
  min: number;
  max: number;
  steps: number;
}

@Component({
  selector: 'app-parameter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, ParameterSliderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="parameter-panel">
      <!-- Header -->
      <div class="panel-header">
        <div class="header-title">
          <i class="pi pi-sliders-h"></i>
          <span>Parameters</span>
        </div>
        <button class="reset-btn" (click)="resetToDefaults()" title="Reset to defaults">
          <i class="pi pi-refresh"></i>
        </button>
      </div>

      <!-- Content -->
      <div class="panel-content">
        <!-- Input Range Section -->
        <div class="section">
          <div class="section-header">
            <h4>Input Range</h4>
          </div>
          <div class="range-inputs">
            <div class="range-field">
              <label>Min</label>
              <input
                type="number"
                class="range-input"
                [(ngModel)]="rangeConfig.min"
                (ngModelChange)="onRangeChange()"
              />
            </div>
            <div class="range-field">
              <label>Max</label>
              <input
                type="number"
                class="range-input"
                [(ngModel)]="rangeConfig.max"
                (ngModelChange)="onRangeChange()"
              />
            </div>
            <div class="range-field">
              <label>Points</label>
              <input
                type="number"
                class="range-input"
                [(ngModel)]="rangeConfig.steps"
                [min]="10"
                [max]="1000"
                (ngModelChange)="onRangeChange()"
              />
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="divider"></div>

        <!-- Physics Parameters Section -->
        @if (parameters.length > 0) {
          <div class="section">
            <div class="section-header">
              <h4>Physics Parameters</h4>
              <span class="param-count">{{ parameters.length }}</span>
            </div>
            <div class="parameters-list">
              @for (param of parameters; track param.name) {
                <app-parameter-slider
                  [parameter]="param"
                  [value]="parameterValues[param.name]"
                  (valueChange)="onParameterChange(param.name, $event)"
                />
              }
            </div>
          </div>
        } @else {
          <div class="no-params">
            <i class="pi pi-info-circle"></i>
            <span>No configurable parameters</span>
          </div>
        }
      </div>

      <!-- Footer -->
      <div class="panel-footer">
        <p-button
          label="Run Prediction"
          icon="pi pi-play"
          [loading]="loading"
          [disabled]="loading"
          (onClick)="runPrediction.emit()"
          styleClass="run-button"
        />
      </div>
    </div>
  `,
  styles: [`
    .parameter-panel {
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

    .reset-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: transparent;
      border: 1px solid #334155;
      border-radius: 10px;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        border-color: #7c3aed;
        color: #a78bfa;
        background: rgba(124, 58, 237, 0.1);
      }
    }

    // ============================================
    // CONTENT
    // ============================================
    .panel-content {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
    }

    .section {
      margin-bottom: 1.5rem;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;

      h4 {
        font-size: 0.75rem;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0;
      }
    }

    .param-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      background: rgba(124, 58, 237, 0.2);
      border-radius: 9999px;
      font-size: 0.7rem;
      font-weight: 600;
      color: #a78bfa;
    }

    .range-inputs {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
    }

    .range-field {
      label {
        display: block;
        font-size: 0.7rem;
        color: #64748b;
        margin-bottom: 0.375rem;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
    }

    .range-input {
      width: 100%;
      padding: 0.625rem 0.75rem;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid #334155;
      border-radius: 10px;
      color: #f1f5f9;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.875rem;
      transition: all 0.2s ease;

      &:focus {
        outline: none;
        border-color: #7c3aed;
        box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.2);
      }

      &::-webkit-inner-spin-button,
      &::-webkit-outer-spin-button {
        opacity: 1;
      }
    }

    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #334155, transparent);
      margin: 1.5rem 0;
    }

    .parameters-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .no-params {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 2rem;
      color: #64748b;
      font-size: 0.875rem;

      i {
        opacity: 0.6;
      }
    }

    // ============================================
    // FOOTER
    // ============================================
    .panel-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid rgba(51, 65, 85, 0.5);
    }

    :host ::ng-deep .run-button {
      width: 100%;
      justify-content: center;
      background: linear-gradient(135deg, #7c3aed, #a855f7) !important;
      border: none !important;
      padding: 0.875rem 1.5rem !important;
      font-weight: 600 !important;
      border-radius: 12px !important;
      transition: all 0.2s ease !important;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(124, 58, 237, 0.4);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }
    }
  `]
})
export class ParameterPanelComponent {
  @Input() parameters: ParameterSpec[] = [];
  @Input() parameterValues: ParameterValues = {};
  @Input() loading = false;
  @Input() rangeConfig: RangeConfig = { min: 0, max: 10, steps: 100 };

  @Output() parameterChange = new EventEmitter<ParameterValues>();
  @Output() rangeChange = new EventEmitter<RangeConfig>();
  @Output() runPrediction = new EventEmitter<void>();

  onParameterChange(name: string, value: number): void {
    const newValues = { ...this.parameterValues, [name]: value };
    this.parameterChange.emit(newValues);
  }

  onRangeChange(): void {
    this.rangeChange.emit({ ...this.rangeConfig });
  }

  resetToDefaults(): void {
    const defaults: ParameterValues = {};
    this.parameters.forEach(p => {
      defaults[p.name] = p.default;
    });
    this.parameterChange.emit(defaults);
  }
}
