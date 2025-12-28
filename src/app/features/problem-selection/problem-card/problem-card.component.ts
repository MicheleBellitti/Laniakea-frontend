import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { PhysicsMetadata } from '../../../core/models';
import { EquationDisplayComponent } from '../../../shared/components';

@Component({
  selector: 'app-problem-card',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TagModule, EquationDisplayComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-card styleClass="problem-card" [class]="'category-' + problem.category">
      <ng-template pTemplate="header">
        <div class="card-header">
          <p-tag
            [value]="getCategoryLabel()"
            [styleClass]="'category-tag ' + problem.category"
          />
        </div>
      </ng-template>

      <div class="card-content">
        <h3 class="problem-name">{{ problem.name }}</h3>
        <p class="problem-description">{{ problem.description }}</p>

        <div class="equation-section">
          <span class="section-label">Governing Equation</span>
          <app-equation-display
            [latex]="problem.governingEquation"
            displayMode="block"
          />
        </div>

        <div class="parameters-section">
          <span class="section-label">Parameters ({{ problem.parameters.length }})</span>
          <div class="parameters-list">
            @for (param of problem.parameters.slice(0, 3); track param.name) {
              <div class="param-chip">
                <span class="param-symbol">{{ param.symbol }}</span>
                <span class="param-name">{{ param.name }}</span>
              </div>
            }
            @if (problem.parameters.length > 3) {
              <div class="param-chip more">
                +{{ problem.parameters.length - 3 }} more
              </div>
            }
          </div>
        </div>

        <div class="outputs-section">
          <span class="section-label">Outputs</span>
          <div class="outputs-list">
            @for (output of problem.outputVariables; track output.name) {
              <span class="output-item">
                {{ output.symbol }}: {{ output.name }}
              </span>
            }
          </div>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="card-footer">
          <p-button
            label="Explore"
            icon="pi pi-arrow-right"
            iconPos="right"
            (onClick)="explore.emit(problem)"
          />
        </div>
      </ng-template>
    </p-card>
  `,
  styles: [`
    :host {
      display: block;
    }

    :host ::ng-deep .problem-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-4px);
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
      padding: 1rem;
    }

    :host ::ng-deep .category-tag {
      font-size: 0.75rem;
      font-weight: 500;

      &.stellar {
        background: rgba(245, 158, 11, 0.2);
        color: #f59e0b;
      }

      &.gravity {
        background: rgba(59, 130, 246, 0.2);
        color: #3b82f6;
      }

      &.quantum {
        background: rgba(236, 72, 153, 0.2);
        color: #ec4899;
      }

      &.thermodynamics {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
      }
    }

    .card-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .problem-name {
      margin: 0;
      font-size: 1.25rem;
      color: var(--text-color);
    }

    .problem-description {
      margin: 0;
      color: var(--text-color-secondary);
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .section-label {
      display: block;
      font-size: 0.75rem;
      color: var(--text-color-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }

    .equation-section {
      :host ::ng-deep .equation-container.block {
        padding: 0.75rem;
        margin: 0;
      }
    }

    .parameters-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .param-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      background: var(--surface-overlay);
      border-radius: 4px;
      font-size: 0.8rem;

      &.more {
        color: var(--text-color-secondary);
        font-style: italic;
      }
    }

    .param-symbol {
      color: var(--primary-color);
      font-family: 'JetBrains Mono', monospace;
    }

    .param-name {
      color: var(--text-color-secondary);
    }

    .outputs-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .output-item {
      font-size: 0.8rem;
      color: var(--text-color-secondary);

      &::after {
        content: ',';
      }

      &:last-child::after {
        content: '';
      }
    }

    .card-footer {
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class ProblemCardComponent {
  @Input({ required: true }) problem!: PhysicsMetadata;
  @Output() explore = new EventEmitter<PhysicsMetadata>();

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
