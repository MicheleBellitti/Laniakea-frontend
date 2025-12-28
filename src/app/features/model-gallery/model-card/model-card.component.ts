import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ModelSummary } from '../../../core/models';
import { ScientificNotationPipe } from '../../../shared/pipes';

@Component({
  selector: 'app-model-card',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TagModule, TooltipModule, ScientificNotationPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-card styleClass="model-card" [class.baseline]="model.isBaseline">
      <ng-template pTemplate="header">
        <div class="card-header">
          @if (model.isBaseline) {
            <p-tag value="Baseline" styleClass="baseline-tag" icon="pi pi-star" />
          }
          <span class="model-type">{{ model.problemType }}</span>
        </div>
      </ng-template>

      <div class="card-content">
        <h3 class="model-name">{{ model.name }}</h3>
        <p class="model-description">{{ model.description }}</p>

        <div class="metrics-grid">
          <div class="metric" pTooltip="Total training loss">
            <span class="metric-label">Loss</span>
            <span class="metric-value">{{ model.metrics.totalLoss | scientificNotation }}</span>
          </div>
          <div class="metric" pTooltip="Physics-informed loss component">
            <span class="metric-label">Physics</span>
            <span class="metric-value">{{ model.metrics.physicsLoss | scientificNotation }}</span>
          </div>
          <div class="metric" pTooltip="Training epochs">
            <span class="metric-label">Epochs</span>
            <span class="metric-value">{{ formatNumber(model.metrics.epochs) }}</span>
          </div>
          <div class="metric" pTooltip="Training time">
            <span class="metric-label">Time</span>
            <span class="metric-value">{{ formatTime(model.metrics.trainingTime) }}</span>
          </div>
        </div>

        <div class="trained-info">
          <i class="pi pi-calendar"></i>
          <span>Trained {{ formatDate(model.trainedAt) }}</span>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="card-footer">
          <p-button
            label="Details"
            icon="pi pi-info-circle"
            styleClass="p-button-text p-button-sm"
            (onClick)="viewDetails.emit(model)"
          />
          <p-button
            label="Use Model"
            icon="pi pi-play"
            styleClass="p-button-sm"
            (onClick)="select.emit(model)"
          />
        </div>
      </ng-template>
    </p-card>
  `,
  styles: [`
    :host {
      display: block;
    }

    :host ::ng-deep .model-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-4px);
      }

      &.baseline {
        border: 1px solid rgba(245, 158, 11, 0.3);

        &:hover {
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.2);
        }
      }

      .p-card-body {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .p-card-content {
        flex: 1;
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
    }

    :host ::ng-deep .baseline-tag {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
    }

    .model-type {
      font-size: 0.75rem;
      color: var(--text-color-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .card-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .model-name {
      margin: 0;
      font-size: 1.1rem;
      color: var(--text-color);
    }

    .model-description {
      margin: 0;
      color: var(--text-color-secondary);
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    .metric {
      background: var(--surface-overlay);
      padding: 0.5rem;
      border-radius: 6px;
      cursor: help;
    }

    .metric-label {
      display: block;
      font-size: 0.7rem;
      color: var(--text-color-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .metric-value {
      font-size: 0.9rem;
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
      color: var(--primary-color);
    }

    .trained-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      color: var(--text-color-secondary);

      i {
        font-size: 0.9rem;
      }
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      gap: 0.5rem;
    }
  `]
})
export class ModelCardComponent {
  @Input({ required: true }) model!: ModelSummary;
  @Output() select = new EventEmitter<ModelSummary>();
  @Output() viewDetails = new EventEmitter<ModelSummary>();

  formatNumber(num: number): string {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  formatTime(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${(seconds / 3600).toFixed(1)}h`;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  }
}
