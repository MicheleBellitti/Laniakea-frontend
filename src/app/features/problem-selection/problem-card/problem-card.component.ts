import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { PhysicsMetadata } from '../../../core/models';
import { EquationDisplayComponent } from '../../../shared/components';

@Component({
  selector: 'app-problem-card',
  standalone: true,
  imports: [CommonModule, ButtonModule, EquationDisplayComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="problem-card" [class]="'category-' + problem.category" (click)="explore.emit(problem)">
      <!-- Category Badge -->
      <div class="card-header">
        <span class="category-badge" [class]="problem.category">
          <i [class]="getCategoryIcon()"></i>
          {{ getCategoryLabel() }}
        </span>
      </div>

      <!-- Content -->
      <div class="card-content">
        <h3 class="problem-name">{{ problem.name }}</h3>
        <p class="problem-description">{{ problem.description }}</p>

        <!-- Equation -->
        <div class="equation-wrapper">
          <app-equation-display
            [latex]="problem.governingEquation"
            displayMode="block"
          />
        </div>

        <!-- Parameters -->
        @if (problem.parameters.length > 0) {
          <div class="parameters-section">
            <span class="section-label">Parameters</span>
            <div class="params-list">
              @for (param of problem.parameters.slice(0, 3); track param.name) {
                <span class="param-tag">
                  <span class="param-symbol">{{ param.symbol }}</span>
                  {{ param.name }}
                </span>
              }
              @if (problem.parameters.length > 3) {
                <span class="param-tag more">+{{ problem.parameters.length - 3 }}</span>
              }
            </div>
          </div>
        }
      </div>

      <!-- Footer -->
      <div class="card-footer">
        <p-button
          label="Explore"
          icon="pi pi-arrow-right"
          iconPos="right"
          styleClass="explore-btn"
          (onClick)="$event.stopPropagation(); explore.emit(problem)"
        />
      </div>

      <!-- Hover Glow Effect -->
      <div class="glow-effect"></div>
    </div>
  `,
  styles: [`
    .problem-card {
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
        border-color: var(--category-color, rgba(124, 58, 237, 0.5));
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);

        .glow-effect {
          opacity: 1;
        }

        .explore-btn {
          background: var(--category-color, #7c3aed) !important;
        }
      }

      // Category color variables
      &.category-stellar {
        --category-color: #f59e0b;
        --category-bg: rgba(245, 158, 11, 0.1);
      }

      &.category-gravity {
        --category-color: #3b82f6;
        --category-bg: rgba(59, 130, 246, 0.1);
      }

      &.category-quantum {
        --category-color: #ec4899;
        --category-bg: rgba(236, 72, 153, 0.1);
      }

      &.category-thermodynamics {
        --category-color: #ef4444;
        --category-bg: rgba(239, 68, 68, 0.1);
      }
    }

    .glow-effect {
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle at center, var(--category-color, #7c3aed) 0%, transparent 70%);
      opacity: 0;
      transition: opacity 0.4s ease;
      pointer-events: none;
      filter: blur(60px);
      z-index: 0;
    }

    .card-header {
      padding: 1.25rem 1.5rem;
      position: relative;
      z-index: 1;
    }

    .category-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.875rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;

      i {
        font-size: 0.75rem;
      }

      &.stellar {
        background: rgba(245, 158, 11, 0.15);
        color: #fbbf24;
      }

      &.gravity {
        background: rgba(59, 130, 246, 0.15);
        color: #60a5fa;
      }

      &.quantum {
        background: rgba(236, 72, 153, 0.15);
        color: #f472b6;
      }

      &.thermodynamics {
        background: rgba(239, 68, 68, 0.15);
        color: #f87171;
      }
    }

    .card-content {
      flex: 1;
      padding: 0 1.5rem 1.5rem;
      position: relative;
      z-index: 1;
    }

    .problem-name {
      font-size: 1.375rem;
      font-weight: 600;
      color: #f1f5f9;
      margin-bottom: 0.75rem;
      line-height: 1.3;
    }

    .problem-description {
      font-size: 0.9rem;
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 1.25rem;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .equation-wrapper {
      padding: 1rem;
      background: rgba(3, 7, 18, 0.5);
      border-radius: 12px;
      margin-bottom: 1.25rem;
      overflow-x: auto;

      :host ::ng-deep .equation-container {
        margin: 0;
        padding: 0;
        background: transparent;
      }

      :host ::ng-deep .katex {
        font-size: 1em;
      }
    }

    .parameters-section {
      margin-top: auto;
    }

    .section-label {
      display: block;
      font-size: 0.7rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }

    .params-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .param-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.625rem;
      background: rgba(51, 65, 85, 0.5);
      border-radius: 6px;
      font-size: 0.75rem;
      color: #94a3b8;

      .param-symbol {
        font-family: 'JetBrains Mono', monospace;
        color: var(--category-color, #a78bfa);
        font-weight: 500;
      }

      &.more {
        background: rgba(51, 65, 85, 0.3);
        font-style: italic;
      }
    }

    .card-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid rgba(51, 65, 85, 0.3);
      display: flex;
      justify-content: flex-end;
      position: relative;
      z-index: 1;
    }

    :host ::ng-deep .explore-btn {
      background: rgba(124, 58, 237, 0.2) !important;
      border: 1px solid rgba(124, 58, 237, 0.3) !important;
      color: #a78bfa !important;
      font-weight: 600;
      transition: all 0.3s ease !important;

      &:hover {
        transform: translateX(4px);
      }

      .p-button-icon {
        transition: transform 0.3s ease;
      }

      &:hover .p-button-icon {
        transform: translateX(4px);
      }
    }
  `]
})
export class ProblemCardComponent {
  @Input({ required: true }) problem!: PhysicsMetadata;
  @Output() explore = new EventEmitter<PhysicsMetadata>();

  getCategoryIcon(): string {
    const icons: Record<string, string> = {
      stellar: 'pi pi-star-fill',
      gravity: 'pi pi-globe',
      quantum: 'pi pi-bolt',
      thermodynamics: 'pi pi-sun',
    };
    return icons[this.problem.category] || 'pi pi-box';
  }

  getCategoryLabel(): string {
    const labels: Record<string, string> = {
      stellar: 'Stellar Physics',
      gravity: 'Gravitational',
      quantum: 'Quantum',
      thermodynamics: 'Thermodynamics',
    };
    return labels[this.problem.category] || this.problem.category;
  }
}
