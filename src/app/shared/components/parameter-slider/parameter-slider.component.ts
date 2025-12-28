import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';

export interface ParameterSpec {
  name: string;
  symbol: string;
  description: string;
  min: number;
  max: number;
  default: number;
  step: number;
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
          <span class="parameter-symbol">({{ parameter.symbol }})</span>
        </label>
        <div class="parameter-value">
          <p-inputNumber
            [(ngModel)]="value"
            [min]="parameter.min"
            [max]="parameter.max"
            [step]="parameter.step"
            [minFractionDigits]="getDecimalPlaces()"
            [maxFractionDigits]="getDecimalPlaces()"
            [showButtons]="false"
            inputStyleClass="value-input"
            (onInput)="onInputChange($event)"
          />
          @if (parameter.unit) {
            <span class="parameter-unit">{{ parameter.unit }}</span>
          }
        </div>
      </div>
      <p-slider
        [(ngModel)]="value"
        [min]="parameter.min"
        [max]="parameter.max"
        [step]="parameter.step"
        (onChange)="onSliderChange($event)"
        styleClass="custom-slider"
      />
      <div class="parameter-range">
        <span>{{ parameter.min }}</span>
        <span>{{ parameter.max }}</span>
      </div>
    </div>
  `,
  styles: [`
    .parameter-slider {
      margin-bottom: 1.5rem;
    }

    .parameter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .parameter-label {
      cursor: help;
    }

    .parameter-name {
      font-weight: 500;
      color: var(--text-color);
    }

    .parameter-symbol {
      color: var(--primary-color);
      font-family: 'JetBrains Mono', monospace;
      margin-left: 0.25rem;
    }

    .parameter-value {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    :host ::ng-deep .value-input {
      width: 80px;
      text-align: right;
      font-family: 'JetBrains Mono', monospace;
    }

    .parameter-unit {
      color: var(--text-color-secondary);
      font-size: 0.875rem;
    }

    .parameter-range {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--text-color-secondary);
      margin-top: 0.25rem;
    }

    :host ::ng-deep .custom-slider {
      width: 100%;

      .p-slider-range {
        background: var(--primary-color);
      }

      .p-slider-handle {
        background: var(--primary-color);
        border-color: var(--primary-color);
      }
    }
  `]
})
export class ParameterSliderComponent {
  @Input({ required: true }) parameter!: ParameterSpec;
  @Input() value: number = 0;
  @Output() valueChange = new EventEmitter<number>();

  getDecimalPlaces(): number {
    const stepStr = this.parameter.step.toString();
    const decimalIndex = stepStr.indexOf('.');
    return decimalIndex === -1 ? 0 : stepStr.length - decimalIndex - 1;
  }

  onSliderChange(event: { value: number }): void {
    this.valueChange.emit(event.value);
  }

  onInputChange(event: { value: number }): void {
    const clampedValue = Math.min(
      Math.max(event.value, this.parameter.min),
      this.parameter.max
    );
    this.value = clampedValue;
    this.valueChange.emit(clampedValue);
  }
}
