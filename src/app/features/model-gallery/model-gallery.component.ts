import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ModelsService, PhysicsService } from '../../core/services';
import { ModelSummary, ModelDetail } from '../../core/models';
import { ModelCardComponent } from './model-card/model-card.component';
import { ErrorDisplayComponent, LoadingSpinnerComponent, MetricCardComponent } from '../../shared/components';
import { ScientificNotationPipe } from '../../shared/pipes';

@Component({
  selector: 'app-model-gallery',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    DropdownModule,
    SkeletonModule,
    DialogModule,
    ButtonModule,
    ModelCardComponent,
    ErrorDisplayComponent,
    LoadingSpinnerComponent,
    MetricCardComponent,
    ScientificNotationPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="gallery-container">
      <header class="page-header">
        <div class="header-content">
          <h1>Model Gallery</h1>
          @if (problemType()) {
            <p>Models for <strong>{{ getProblemName() }}</strong></p>
          } @else {
            <p>Explore pre-trained neural network models</p>
          }
        </div>
        @if (problemType()) {
          <p-button
            label="All Problems"
            icon="pi pi-arrow-left"
            styleClass="p-button-text"
            (onClick)="goToProblems()"
          />
        }
      </header>

      <!-- Filters -->
      <div class="filters-section">
        <div class="search-box">
          <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <input
              type="text"
              pInputText
              placeholder="Search models..."
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange($event)"
            />
          </span>
        </div>

        <p-dropdown
          [options]="sortOptions"
          [(ngModel)]="selectedSort"
          optionLabel="label"
          optionValue="value"
          (ngModelChange)="onSortChange($event)"
        />
      </div>

      <!-- Stats -->
      <div class="stats-bar">
        <span class="stat">
          <strong>{{ filteredModels().length }}</strong> models
        </span>
        <span class="stat">
          <strong>{{ baselineCount() }}</strong> baseline
        </span>
      </div>

      <!-- Content -->
      @if (modelsService.loading()) {
        <div class="models-grid">
          @for (i of [1, 2, 3, 4]; track i) {
            <div class="skeleton-card">
              <p-skeleton height="280px" />
            </div>
          }
        </div>
      } @else if (modelsService.error()) {
        <app-error-display
          [message]="modelsService.error()!"
          title="Failed to load models"
          [retryable]="true"
          (retry)="loadModels()"
        />
      } @else {
        <div class="models-grid">
          @for (model of filteredModels(); track model.id) {
            <app-model-card
              [model]="model"
              (select)="onSelectModel($event)"
              (viewDetails)="onViewDetails($event)"
              class="fade-in"
            />
          } @empty {
            <div class="empty-state">
              <i class="pi pi-box"></i>
              <h3>No models found</h3>
              <p>Try adjusting your search criteria</p>
            </div>
          }
        </div>
      }
    </div>

    <!-- Model Details Dialog -->
    <p-dialog
      [(visible)]="detailsDialogVisible"
      [header]="selectedModel()?.name || 'Model Details'"
      [modal]="true"
      [style]="{ width: '600px' }"
      styleClass="model-details-dialog"
    >
      @if (selectedModel()) {
        <div class="details-content">
          <p class="model-description">{{ selectedModel()!.description }}</p>

          <div class="details-section">
            <h4>Training Metrics</h4>
            <div class="metrics-grid">
              <app-metric-card
                label="Total Loss"
                [value]="selectedModel()!.metrics.totalLoss"
                icon="pi pi-chart-line"
                [scientificNotation]="true"
              />
              <app-metric-card
                label="Physics Loss"
                [value]="selectedModel()!.metrics.physicsLoss"
                icon="pi pi-bolt"
                iconColor="#f59e0b"
                [scientificNotation]="true"
              />
              <app-metric-card
                label="Data Loss"
                [value]="selectedModel()!.metrics.dataLoss"
                icon="pi pi-database"
                iconColor="#3b82f6"
                [scientificNotation]="true"
              />
              <app-metric-card
                label="Epochs"
                [value]="selectedModel()!.metrics.epochs"
                icon="pi pi-refresh"
                iconColor="#8b5cf6"
              />
            </div>
          </div>

          <div class="details-actions">
            <p-button
              label="Use This Model"
              icon="pi pi-play"
              (onClick)="onSelectModel(selectedModel()!)"
            />
          </div>
        </div>
      }
    </p-dialog>
  `,
  styles: [`
    .gallery-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;

      @media (max-width: 768px) {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }
    }

    .header-content {
      h1 {
        margin: 0 0 0.5rem;
        font-size: 2rem;
      }

      p {
        margin: 0;
        color: var(--text-color-secondary);

        strong {
          color: var(--primary-color);
        }
      }
    }

    .filters-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
      }
    }

    .search-box {
      flex: 1;
      max-width: 400px;

      input {
        width: 100%;
      }

      @media (max-width: 768px) {
        max-width: 100%;
      }
    }

    .stats-bar {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
      padding: 0.75rem 1rem;
      background: var(--surface-section);
      border-radius: 8px;
    }

    .stat {
      font-size: 0.875rem;
      color: var(--text-color-secondary);

      strong {
        color: var(--text-color);
      }
    }

    .models-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .skeleton-card {
      border-radius: 12px;
      overflow: hidden;
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 4rem 2rem;
      color: var(--text-color-secondary);

      i {
        font-size: 4rem;
        margin-bottom: 1rem;
        opacity: 0.5;
      }

      h3 {
        margin: 0 0 0.5rem;
        color: var(--text-color);
      }

      p {
        margin: 0;
      }
    }

    // Dialog styles
    .details-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .model-description {
      color: var(--text-color-secondary);
      line-height: 1.6;
      margin: 0;
    }

    .details-section {
      h4 {
        margin: 0 0 1rem;
        font-size: 1rem;
        color: var(--text-color);
      }
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .details-actions {
      display: flex;
      justify-content: flex-end;
      padding-top: 1rem;
      border-top: 1px solid var(--surface-border);
    }
  `]
})
export class ModelGalleryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  modelsService = inject(ModelsService);
  private physicsService = inject(PhysicsService);

  searchQuery = '';
  selectedSort = 'loss';
  detailsDialogVisible = false;

  problemType = signal<string | null>(null);
  selectedModel = signal<ModelSummary | null>(null);

  sortOptions = [
    { label: 'Best Loss', value: 'loss' },
    { label: 'Most Recent', value: 'recent' },
    { label: 'Most Epochs', value: 'epochs' },
    { label: 'Baseline First', value: 'baseline' },
  ];

  private searchSignal = signal('');
  private sortSignal = signal('loss');

  filteredModels = computed(() => {
    let models = [...this.modelsService.models()];
    const search = this.searchSignal().toLowerCase();

    // Filter by search
    if (search) {
      models = models.filter(m =>
        m.name.toLowerCase().includes(search) ||
        m.description.toLowerCase().includes(search)
      );
    }

    // Sort
    switch (this.sortSignal()) {
      case 'loss':
        models.sort((a, b) => a.metrics.totalLoss - b.metrics.totalLoss);
        break;
      case 'recent':
        models.sort((a, b) => new Date(b.trainedAt).getTime() - new Date(a.trainedAt).getTime());
        break;
      case 'epochs':
        models.sort((a, b) => b.metrics.epochs - a.metrics.epochs);
        break;
      case 'baseline':
        models.sort((a, b) => (b.isBaseline ? 1 : 0) - (a.isBaseline ? 1 : 0));
        break;
    }

    return models;
  });

  baselineCount = computed(() =>
    this.modelsService.models().filter(m => m.isBaseline).length
  );

  ngOnInit(): void {
    const problemId = this.route.snapshot.paramMap.get('problemId');
    this.problemType.set(problemId);
    this.loadModels();
  }

  loadModels(): void {
    const problemType = this.problemType();
    this.modelsService.loadModels(problemType || undefined);
  }

  getProblemName(): string {
    const problem = this.physicsService.getProblemById(this.problemType() || '');
    return problem?.name || this.problemType() || '';
  }

  onSearchChange(query: string): void {
    this.searchSignal.set(query);
  }

  onSortChange(sort: string): void {
    this.sortSignal.set(sort);
  }

  onSelectModel(model: ModelSummary): void {
    this.detailsDialogVisible = false;
    this.router.navigate(['/explore', model.problemType, model.id]);
  }

  onViewDetails(model: ModelSummary): void {
    this.selectedModel.set(model);
    this.detailsDialogVisible = true;
  }

  goToProblems(): void {
    this.router.navigate(['/problems']);
  }
}
