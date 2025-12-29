import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ModelSummary } from '../../../core/models';
import { ScientificNotationPipe } from '../../../shared/pipes';

@Component({
  selector: 'app-model-card',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule, ScientificNotationPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="model-card" [class.baseline]="model.isBaseline" (click)="select.emit(model)">
      <!-- Header -->
      <div class="card-header">
        @if (model.isBaseline) {
          <span class="baseline-badge">
            <i class="pi pi-star-fill"></i>
            Baseline
          </span>
        }
        <span class="problem-type">{{ model.problemType }}</span>
      </div>

      <!-- Content -->
      <div class="card-content">
        <h3 class="model-name">{{ model.name }}</h3>
        <p class="model-description">{{ model.description }}</p>

        <!-- Metrics -->
        <div class="metrics-grid">
          <div class="metric" pTooltip="Total training loss" tooltipPosition="top">
            <span class="metric-label">Loss</span>
            <span class="metric-value">{{ model.metrics.totalLoss | scientificNotation }}</span>
          </div>
          <div class="metric" pTooltip="Physics-informed loss" tooltipPosition="top">
            <span class="metric-label">Physics</span>
            <span class="metric-value">{{ model.metrics.physicsLoss | scientificNotation }}</span>
          </div>
          <div class="metric" pTooltip="Training epochs" tooltipPosition="top">
            <span class="metric-label">Epochs</span>
            <span class="metric-value">{{ formatNumber(model.metrics.epochs) }}</span>
          </div>
          <div class="metric" pTooltip="Training time" tooltipPosition="top">
            <span class="metric-label">Time</span>
            <span class="metric-value">{{ formatTime(model.metrics.trainingTime) }}</span>
          </div>
        </div>

        <!-- Trained date -->
        <div class="trained-info">
          <i class="pi pi-clock"></i>
          <span>Trained {{ formatDate(model.trainedAt) }}</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="card-footer">
        <button class="details-btn" (click)="$event.stopPropagation(); viewDetails.emit(model)">
          <i class="pi pi-info-circle"></i>
          Details
        </button>
        <p-button
          label="Use Model"
          icon="pi pi-play"
          styleClass="use-btn"
          (onClick)="$event.stopPropagation(); select.emit(model)"
        />
      </div>

      <!-- Glow effect for baseline -->
      @if (model.isBaseline) {
        <div class="baseline-glow"></div>
      }
    </div>
  `,
  styles: [`
    .model-card {
      position: relative;
      background: rgba(30, 41, 59, 0.6);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(51, 65, 85, 0.5);
      border-radius: 20px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      height: 100%;

      &:hover {
        border-color: rgba(124, 58, 237, 0.5);
        transform: translateY(-8px);
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3), 0 0 30px rgba(124, 58, 237, 0.15);
      }

      &.baseline {
        border-color: rgba(245, 158, 11, 0.3);

        &:hover {
          border-color: rgba(245, 158, 11, 0.6);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3), 0 0 30px rgba(245, 158, 11, 0.2);
        }
      }
    }

    .baseline-glow {
      position: absolute;
      top: -100px;
      right: -100px;
      width: 250px;
      height: 250px;
      background: radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%);
      pointer-events: none;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
    }

    .baseline-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem;
      background: rgba(245, 158, 11, 0.15);
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #fbbf24;

      i {
        font-size: 0.625rem;
      }
    }

    .problem-type {
      font-size: 0.7rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .card-content {
      flex: 1;
      padding: 0 1.5rem 1.5rem;
    }

    .model-name {
      font-size: 1.25rem;
      font-weight: 600;
      color: #f1f5f9;
      margin-bottom: 0.625rem;
      line-height: 1.3;
    }

    .model-description {
      font-size: 0.875rem;
      color: #94a3b8;
      line-height: 1.5;
      margin-bottom: 1.25rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .metric {
      padding: 0.625rem 0.75rem;
      background: rgba(15, 23, 42, 0.5);
      border-radius: 10px;
      cursor: help;
    }

    .metric-label {
      display: block;
      font-size: 0.625rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.25rem;
    }

    .metric-value {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.875rem;
      font-weight: 600;
      color: #a78bfa;
    }

    .trained-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      color: #64748b;

      i {
        font-size: 0.875rem;
      }
    }

    .card-footer {
      display: flex;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid rgba(51, 65, 85, 0.3);
    }

    .details-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
      background: transparent;
      border: 1px solid #334155;
      border-radius: 10px;
      color: #94a3b8;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        border-color: #475569;
        color: #f1f5f9;
        background: rgba(51, 65, 85, 0.3);
      }
    }

    :host ::ng-deep .use-btn {
      flex: 1;
      justify-content: center;
      background: rgba(124, 58, 237, 0.2) !important;
      border: 1px solid rgba(124, 58, 237, 0.3) !important;
      color: #a78bfa !important;
      border-radius: 10px !important;
      transition: all 0.2s ease !important;

      &:hover {
        background: #7c3aed !important;
        border-color: #7c3aed !important;
        color: #fff !important;
      }
    }
  `]
})
export class ModelCardComponent {
  @Input({ required: true }) model!: ModelSummary;
  @Output() select = new EventEmitter<ModelSummary>();
  @Output() viewDetails = new EventEmitter<ModelSummary>();

  formatNumber(num: number | undefined | null): string {
    if (num == null || isNaN(num)) return '0';
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  formatTime(seconds: number | undefined | null): string {
    if (seconds == null || isNaN(seconds)) return '0s';
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
