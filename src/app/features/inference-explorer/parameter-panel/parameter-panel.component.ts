import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
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
  imports: [CommonModule, FormsModule, ButtonModule, DividerModule, ParameterSliderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="parameter-panel">
      <div class="panel-header">
        <h3>
          <i class="pi pi-sliders-h"></i>
          Parameters
        </h3>
        <p-button
          icon="pi pi-refresh"
          styleClass="p-button-text p-button-sm"
          pTooltip="Reset to defaults"
          (onClick)="resetToDefaults()"
        />
      </div>

      <div class="panel-content">
        <!-- Input Range Section -->
        <div class="section">
          <h4>Input Range</h4>
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

        <p-divider />

        <!-- Physics Parameters Section -->
        @if (parameters.length > 0) {
          <div class="section">
            <h4>Physics Parameters</h4>
            @for (param of parameters; track param.name) {
              <app-parameter-slider
                [parameter]="param"
                [value]="parameterValues[param.name]"
                (valueChange)="onParameterChange(param.name, $event)"
              />
            }
          </div>
        }
      </div>

      <div class="panel-footer">
        <p-button
          label="Run Prediction"
          icon="pi pi-play"
          [loading]="loading"
          [disabled]="loading"
          (onClick)="runPrediction.emit()"
          styleClass="p-button-primary run-button"
        />
      </div>
    </div>
  `,
  styles: [`
    .parameter-panel {
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
      overflow-y: auto;
      padding: 1rem;
    }

    .section {
      h4 {
        margin: 0 0 1rem;
        font-size: 0.875rem;
        color: var(--text-color-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    }

    .range-inputs {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
    }

    .range-field {
      label {
        display: block;
        font-size: 0.75rem;
        color: var(--text-color-secondary);
        margin-bottom: 0.25rem;
      }
    }

    .range-input {
      width: 100%;
      padding: 0.5rem;
      background: var(--surface-ground);
      border: 1px solid var(--surface-border);
      border-radius: 6px;
      color: var(--text-color);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.875rem;

      &:focus {
        outline: none;
        border-color: var(--primary-color);
      }
    }

    .panel-footer {
      padding: 1rem;
      border-top: 1px solid var(--surface-border);
    }

    :host ::ng-deep .run-button {
      width: 100%;
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
