import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';

export interface ParameterSpec {
  name: string;
  symbol: string;
  description?: string;
  min: number;
  max: number;
  default: number;
  step?: number;
  unit?: string;
}

@Component({
  selector: 'app-parameter-slider',
  standalone: true,
  imports: [CommonModule, FormsModule, SliderModule, InputNumberModule, TooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="parameter-slider">
      <div class="parameter-header">
        <label class="parameter-label" [pTooltip]="parameter.description" tooltipPosition="top">
          <span class="parameter-name">{{ parameter.name }}</span>
          <span class="parameter-symbol">{{ parameter.symbol }}</span>
        </label>
        <div class="parameter-value">
          <input
            type="number"
            class="value-input"
            [(ngModel)]="value"
            [min]="parameter.min"
            [max]="parameter.max"
            [step]="parameter.step || 0.1"
            (ngModelChange)="onInputChange($event)"
          />
          @if (parameter.unit) {
            <span class="parameter-unit">{{ parameter.unit }}</span>
          }
        </div>
      </div>

      <div class="slider-container">
        <p-slider
          [(ngModel)]="value"
          [min]="parameter.min"
          [max]="parameter.max"
          [step]="parameter.step || 0.01"
          (onChange)="onSliderChange($event)"
          styleClass="custom-slider"
        />
      </div>

      <div class="parameter-range">
        <span>{{ parameter.min }}</span>
        <span>{{ parameter.max }}</span>
      </div>
    </div>
  `,
  styles: [`
    .parameter-slider {
      padding: 1rem;
      background: rgba(15, 23, 42, 0.4);
      border: 1px solid rgba(51, 65, 85, 0.3);
      border-radius: 12px;
      transition: all 0.2s ease;

      &:hover {
        border-color: rgba(124, 58, 237, 0.3);
        background: rgba(15, 23, 42, 0.6);
      }
    }

    .parameter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .parameter-label {
      cursor: help;
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
    }

    .parameter-name {
      font-weight: 500;
      color: #f1f5f9;
      font-size: 0.9rem;
    }

    .parameter-symbol {
      font-family: 'JetBrains Mono', monospace;
      color: #a78bfa;
      font-size: 0.8rem;
    }

    .parameter-value {
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }

    .value-input {
      width: 80px;
      padding: 0.5rem 0.625rem;
      background: rgba(3, 7, 18, 0.6);
      border: 1px solid #334155;
      border-radius: 8px;
      color: #f1f5f9;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.875rem;
      text-align: right;
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

    .parameter-unit {
      font-size: 0.75rem;
      color: #64748b;
    }

    .slider-container {
      padding: 0.25rem 0;
    }

    :host ::ng-deep .custom-slider {
      width: 100%;
      background: #334155;
      height: 6px;
      border-radius: 9999px;

      .p-slider-range {
        background: linear-gradient(90deg, #7c3aed, #a855f7);
        border-radius: 9999px;
      }

      .p-slider-handle {
        width: 20px;
        height: 20px;
        background: #f1f5f9;
        border: 3px solid #7c3aed;
        border-radius: 50%;
        box-shadow: 0 0 10px rgba(124, 58, 237, 0.4);
        margin-top: -7px;
        margin-left: -10px;
        transition: all 0.15s ease;

        &:hover {
          transform: scale(1.15);
          box-shadow: 0 0 15px rgba(124, 58, 237, 0.6);
        }

        &:focus {
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.3), 0 0 15px rgba(124, 58, 237, 0.6);
        }
      }
    }

    .parameter-range {
      display: flex;
      justify-content: space-between;
      margin-top: 0.5rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      color: #64748b;
    }
  `]
})
export class ParameterSliderComponent {
  @Input({ required: true }) parameter!: ParameterSpec;
  @Input() value: number = 0;
  @Output() valueChange = new EventEmitter<number>();

  onSliderChange(event: any): void {
    if (event.value !== undefined && typeof event.value === 'number') {
      this.valueChange.emit(event.value);
    }
  }

  onInputChange(val: number): void {
    if (val !== null && val !== undefined && typeof val === 'number') {
      const clampedValue = Math.min(
        Math.max(val, this.parameter.min),
        this.parameter.max
      );
      this.value = clampedValue;
      this.valueChange.emit(clampedValue);
    }
  }
}
