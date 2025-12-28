import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-error-display',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="error-container" [class]="'severity-' + severity">
      <div class="error-icon">
        <i [class]="getIconClass()"></i>
      </div>
      <div class="error-content">
        @if (title) {
          <h4 class="error-title">{{ title }}</h4>
        }
        <p class="error-message">{{ message }}</p>
      </div>
      <div class="error-actions">
        @if (dismissible) {
          <p-button
            icon="pi pi-times"
            styleClass="p-button-text p-button-sm"
            (onClick)="dismiss.emit()"
          />
        }
        @if (retryable) {
          <p-button
            label="Retry"
            icon="pi pi-refresh"
            styleClass="p-button-sm"
            (onClick)="retry.emit()"
          />
        }
      </div>
    </div>
  `,
  styles: [`
    .error-container {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      border-radius: 8px;
      background: var(--surface-section);
      border-left: 4px solid;

      &.severity-error {
        border-color: #ef4444;
        background: rgba(239, 68, 68, 0.1);

        .error-icon { color: #ef4444; }
      }

      &.severity-warning {
        border-color: #f59e0b;
        background: rgba(245, 158, 11, 0.1);

        .error-icon { color: #f59e0b; }
      }

      &.severity-info {
        border-color: #3b82f6;
        background: rgba(59, 130, 246, 0.1);

        .error-icon { color: #3b82f6; }
      }
    }

    .error-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .error-content {
      flex: 1;
    }

    .error-title {
      margin: 0 0 0.25rem 0;
      color: var(--text-color);
      font-size: 1rem;
    }

    .error-message {
      margin: 0;
      color: var(--text-color-secondary);
      font-size: 0.875rem;
    }

    .error-actions {
      display: flex;
      gap: 0.5rem;
      flex-shrink: 0;
    }
  `]
})
export class ErrorDisplayComponent {
  @Input({ required: true }) message!: string;
  @Input() title?: string;
  @Input() severity: 'error' | 'warning' | 'info' = 'error';
  @Input() dismissible = true;
  @Input() retryable = false;

  @Output() dismiss = new EventEmitter<void>();
  @Output() retry = new EventEmitter<void>();

  getIconClass(): string {
    switch (this.severity) {
      case 'error': return 'pi pi-times-circle';
      case 'warning': return 'pi pi-exclamation-triangle';
      case 'info': return 'pi pi-info-circle';
      default: return 'pi pi-info-circle';
    }
  }
}
