import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule, CardModule, TooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="metric-card" [pTooltip]="tooltip" tooltipPosition="top">
      <div class="metric-icon" [style.color]="iconColor">
        <i [class]="icon"></i>
      </div>
      <div class="metric-content">
        <span class="metric-label">{{ label }}</span>
        <span class="metric-value" [class.mono]="monospace">
          {{ formattedValue }}
          @if (unit) {
            <span class="metric-unit">{{ unit }}</span>
          }
        </span>
      </div>
      @if (trend) {
        <div class="metric-trend" [class]="'trend-' + trend">
          <i [class]="getTrendIcon()"></i>
        </div>
      }
    </div>
  `,
  styles: [`
    .metric-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: var(--surface-section);
      border-radius: 8px;
      border: 1px solid var(--surface-border);
      transition: border-color 0.2s, box-shadow 0.2s;

      &:hover {
        border-color: var(--primary-color);
        box-shadow: 0 0 10px rgba(99, 102, 241, 0.1);
      }
    }

    .metric-icon {
      font-size: 1.5rem;
      opacity: 0.8;
    }

    .metric-content {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .metric-label {
      font-size: 0.75rem;
      color: var(--text-color-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .metric-value {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-color);

      &.mono {
        font-family: 'JetBrains Mono', monospace;
      }
    }

    .metric-unit {
      font-size: 0.875rem;
      font-weight: 400;
      color: var(--text-color-secondary);
      margin-left: 0.25rem;
    }

    .metric-trend {
      font-size: 1rem;
      padding: 0.25rem;
      border-radius: 4px;

      &.trend-up {
        color: #10b981;
        background: rgba(16, 185, 129, 0.1);
      }

      &.trend-down {
        color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
      }

      &.trend-stable {
        color: #6b7280;
        background: rgba(107, 114, 128, 0.1);
      }
    }
  `]
})
export class MetricCardComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: number | string;
  @Input() icon = 'pi pi-chart-bar';
  @Input() iconColor = 'var(--primary-color)';
  @Input() unit?: string;
  @Input() tooltip?: string;
  @Input() monospace = true;
  @Input() trend?: 'up' | 'down' | 'stable';
  @Input() scientificNotation = false;

  get formattedValue(): string {
    if (typeof this.value === 'string') {
      return this.value;
    }

    if (this.scientificNotation) {
      return this.value.toExponential(2);
    }

    if (this.value >= 1000000) {
      return (this.value / 1000000).toFixed(1) + 'M';
    }

    if (this.value >= 1000) {
      return (this.value / 1000).toFixed(1) + 'K';
    }

    if (Number.isInteger(this.value)) {
      return this.value.toString();
    }

    return this.value.toFixed(2);
  }

  getTrendIcon(): string {
    switch (this.trend) {
      case 'up': return 'pi pi-arrow-up';
      case 'down': return 'pi pi-arrow-down';
      case 'stable': return 'pi pi-minus';
      default: return '';
    }
  }
}
