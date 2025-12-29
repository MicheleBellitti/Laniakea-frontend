import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="loading-container" [class.overlay]="overlay" [class.fullscreen]="fullscreen">
      <div class="spinner-wrapper">
        <p-progressSpinner
          [strokeWidth]="strokeWidth"
          [animationDuration]="animationDuration"
          styleClass="custom-spinner"
        />
        @if (message) {
          <p class="loading-message">{{ message }}</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;

      &.overlay {
        position: absolute;
        inset: 0;
        background: rgba(17, 24, 39, 0.8);
        backdrop-filter: blur(4px);
        z-index: 100;
      }

      &.fullscreen {
        position: fixed;
        inset: 0;
        background: rgba(17, 24, 39, 0.9);
        backdrop-filter: blur(4px);
        z-index: 1000;
      }
    }

    .spinner-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .loading-message {
      color: var(--text-color-secondary);
      font-size: 0.875rem;
      margin: 0;
    }

    :host ::ng-deep .custom-spinner {
      .p-progress-spinner-circle {
        stroke: var(--primary-color);
        animation: spinner-dash 1.5s ease-in-out infinite,
                   spinner-color 6s ease-in-out infinite;
      }
    }

    @keyframes spinner-color {
      0%, 100% { stroke: #6366f1; }
      25% { stroke: #8b5cf6; }
      50% { stroke: #3b82f6; }
      75% { stroke: #a855f7; }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() message?: string;
  @Input() overlay = false;
  @Input() fullscreen = false;
  @Input() strokeWidth = '4';
  @Input() animationDuration = '1s';
}
