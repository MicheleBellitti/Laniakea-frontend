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
import { ModelSummary } from '../../core/models';
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
    <div class="gallery-page">
      <!-- Header -->
      <header class="page-header animate-fade-in">
        <div class="header-top">
          @if (problemType()) {
            <button class="back-btn" (click)="goToProblems()">
              <i class="pi pi-arrow-left"></i>
              <span>All Problems</span>
            </button>
          }
        </div>

        <div class="header-content">
          <span class="header-badge">
            <i class="pi pi-box"></i>
            Neural Network Models
          </span>
          <h1>
            @if (problemType()) {
              {{ getProblemName() }} Models
            } @else {
              Model Gallery
            }
          </h1>
          <p>Select a pre-trained model to explore and run predictions</p>
        </div>
      </header>

      <!-- Filters -->
      <div class="filters-section animate-fade-in delay-1">
        <div class="search-wrapper">
          <i class="pi pi-search search-icon"></i>
          <input
            type="text"
            pInputText
            placeholder="Search models..."
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange($event)"
            class="search-input"
          />
        </div>

        <div class="sort-wrapper">
          <p-dropdown
            [options]="sortOptions"
            [(ngModel)]="selectedSort"
            optionLabel="label"
            optionValue="value"
            (ngModelChange)="onSortChange($event)"
            styleClass="sort-dropdown"
          />
        </div>
      </div>

      <!-- Stats Bar -->
      <div class="stats-bar animate-fade-in delay-2">
        <div class="stat-item">
          <span class="stat-icon">
            <i class="pi pi-box"></i>
          </span>
          <span class="stat-content">
            <span class="stat-value">{{ filteredModels().length }}</span>
            <span class="stat-label">Models</span>
          </span>
        </div>
        <div class="stat-item">
          <span class="stat-icon baseline">
            <i class="pi pi-star-fill"></i>
          </span>
          <span class="stat-content">
            <span class="stat-value">{{ baselineCount() }}</span>
            <span class="stat-label">Baseline</span>
          </span>
        </div>
      </div>

      <!-- Content -->
      @if (modelsService.loading()) {
        <div class="models-grid">
          @for (i of [1, 2, 3, 4]; track i) {
            <div class="skeleton-card animate-fade-in" [style.animation-delay.ms]="i * 100">
              <p-skeleton height="300px" styleClass="skeleton-content" />
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
          @for (model of filteredModels(); track model.id; let i = $index) {
            <app-model-card
              [model]="model"
              (select)="onSelectModel($event)"
              (viewDetails)="onViewDetails($event)"
              class="animate-fade-in"
              [style.animation-delay.ms]="i * 100"
            />
          } @empty {
            <div class="empty-state">
              <div class="empty-icon">
                <i class="pi pi-box"></i>
              </div>
              <h3>No models found</h3>
              <p>
                @if (problemType()) {
                  No models available for this problem yet.
                } @else {
                  Try adjusting your search criteria.
                }
              </p>
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
      [style]="{ width: '550px', maxWidth: '95vw' }"
      [draggable]="false"
      [resizable]="false"
      styleClass="model-dialog"
    >
      @if (selectedModel()) {
        <div class="dialog-content">
          <p class="model-description">{{ selectedModel()!.description }}</p>

          <div class="metrics-section">
            <h4>Training Metrics</h4>
            <div class="metrics-grid">
              <div class="metric-item">
                <span class="metric-icon total">
                  <i class="pi pi-chart-line"></i>
                </span>
                <div class="metric-content">
                  <span class="metric-value">{{ selectedModel()!.metrics.totalLoss | scientificNotation }}</span>
                  <span class="metric-label">Total Loss</span>
                </div>
              </div>
              <div class="metric-item">
                <span class="metric-icon physics">
                  <i class="pi pi-bolt"></i>
                </span>
                <div class="metric-content">
                  <span class="metric-value">{{ selectedModel()!.metrics.physicsLoss | scientificNotation }}</span>
                  <span class="metric-label">Physics Loss</span>
                </div>
              </div>
              <div class="metric-item">
                <span class="metric-icon data">
                  <i class="pi pi-database"></i>
                </span>
                <div class="metric-content">
                  <span class="metric-value">{{ selectedModel()!.metrics.dataLoss | scientificNotation }}</span>
                  <span class="metric-label">Data Loss</span>
                </div>
              </div>
              <div class="metric-item">
                <span class="metric-icon epochs">
                  <i class="pi pi-sync"></i>
                </span>
                <div class="metric-content">
                  <span class="metric-value">{{ formatNumber(selectedModel()!.metrics.epochs) }}</span>
                  <span class="metric-label">Epochs</span>
                </div>
              </div>
            </div>
          </div>

          <div class="dialog-actions">
            <p-button
              label="Use This Model"
              icon="pi pi-play"
              styleClass="p-button-primary use-model-btn"
              (onClick)="onSelectModel(selectedModel()!)"
            />
          </div>
        </div>
      }
    </p-dialog>
  `,
  styles: [`
    .gallery-page {
      min-height: 100vh;
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    // ============================================
    // HEADER
    // ============================================
    .page-header {
      padding: 2rem 0 3rem;
    }

    .header-top {
      margin-bottom: 1.5rem;
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: transparent;
      border: 1px solid #334155;
      border-radius: 8px;
      color: #94a3b8;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s ease;

      &:hover {
        border-color: #7c3aed;
        color: #a78bfa;
      }
    }

    .header-content {
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
    }

    .header-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: rgba(124, 58, 237, 0.1);
      border: 1px solid rgba(124, 58, 237, 0.2);
      border-radius: 9999px;
      font-size: 0.875rem;
      color: #a78bfa;
      margin-bottom: 1rem;
    }

    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
      background: linear-gradient(135deg, #f1f5f9, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    p {
      color: #64748b;
      font-size: 1.125rem;
    }

    // ============================================
    // FILTERS
    // ============================================
    .filters-section {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;

      @media (max-width: 640px) {
        flex-direction: column;
      }
    }

    .search-wrapper {
      position: relative;
      flex: 1;
      max-width: 400px;

      @media (max-width: 640px) {
        max-width: 100%;
      }
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #64748b;
    }

    .search-input {
      width: 100%;
      padding: 0.875rem 1rem 0.875rem 2.75rem;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid #334155;
      border-radius: 12px;
      color: #f1f5f9;
      font-size: 1rem;
      transition: all 0.2s ease;

      &::placeholder {
        color: #64748b;
      }

      &:focus {
        outline: none;
        border-color: #7c3aed;
        box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.2);
      }
    }

    :host ::ng-deep .sort-dropdown {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid #334155;
      border-radius: 12px;

      .p-dropdown-label {
        padding: 0.875rem 1rem;
      }
    }

    // ============================================
    // STATS BAR
    // ============================================
    .stats-bar {
      display: flex;
      gap: 1.5rem;
      padding: 1rem 1.25rem;
      background: rgba(30, 41, 59, 0.5);
      border-radius: 12px;
      margin-bottom: 2rem;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(124, 58, 237, 0.1);
      border-radius: 10px;
      color: #a78bfa;

      &.baseline {
        background: rgba(245, 158, 11, 0.1);
        color: #fbbf24;
      }
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: #f1f5f9;
      font-family: 'JetBrains Mono', monospace;
    }

    .stat-label {
      font-size: 0.75rem;
      color: #64748b;
    }

    // ============================================
    // MODELS GRID
    // ============================================
    .models-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .skeleton-card {
      border-radius: 16px;
      overflow: hidden;
    }

    // ============================================
    // EMPTY STATE
    // ============================================
    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 4rem 2rem;

      .empty-icon {
        width: 80px;
        height: 80px;
        margin: 0 auto 1.5rem;
        background: rgba(30, 41, 59, 0.6);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        i {
          font-size: 2rem;
          color: #475569;
        }
      }

      h3 {
        font-size: 1.25rem;
        color: #f1f5f9;
        margin-bottom: 0.5rem;
      }

      p {
        color: #64748b;
      }
    }

    // ============================================
    // DIALOG
    // ============================================
    :host ::ng-deep .model-dialog {
      .p-dialog-header {
        background: #1e293b;
        border-bottom: 1px solid #334155;
      }

      .p-dialog-content {
        background: #1e293b;
        padding: 1.5rem;
      }
    }

    .dialog-content {
      .model-description {
        color: #94a3b8;
        line-height: 1.6;
        margin-bottom: 1.5rem;
      }
    }

    .metrics-section {
      h4 {
        font-size: 0.875rem;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 1rem;
      }
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .metric-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem;
      background: rgba(15, 23, 42, 0.5);
      border-radius: 12px;
    }

    .metric-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;

      &.total {
        background: rgba(124, 58, 237, 0.15);
        color: #a78bfa;
      }

      &.physics {
        background: rgba(245, 158, 11, 0.15);
        color: #fbbf24;
      }

      &.data {
        background: rgba(59, 130, 246, 0.15);
        color: #60a5fa;
      }

      &.epochs {
        background: rgba(6, 182, 212, 0.15);
        color: #22d3ee;
      }
    }

    .metric-content {
      display: flex;
      flex-direction: column;
    }

    .metric-value {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.9rem;
      font-weight: 600;
      color: #f1f5f9;
    }

    .metric-label {
      font-size: 0.75rem;
      color: #64748b;
    }

    .dialog-actions {
      margin-top: 1.5rem;
      display: flex;
      justify-content: flex-end;
    }

    :host ::ng-deep .use-model-btn {
      padding: 0.75rem 1.5rem;
    }

    // ============================================
    // ANIMATIONS
    // ============================================
    .animate-fade-in {
      opacity: 0;
      animation: fadeInUp 0.5s ease forwards;
    }

    @for $i from 1 through 5 {
      .delay-#{$i} {
        animation-delay: #{$i * 100}ms;
      }
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
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

    if (search) {
      models = models.filter(m =>
        m.name.toLowerCase().includes(search) ||
        m.description.toLowerCase().includes(search)
      );
    }

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
    this.physicsService.loadProblems();
    this.loadModels();
  }

  loadModels(): void {
    const problemType = this.problemType();
    this.modelsService.loadModels(problemType || undefined);
  }

  getProblemName(): string {
    const problem = this.physicsService.getProblemById(this.problemType() || '');
    return problem?.name || this.problemType() || 'All';
  }

  onSearchChange(query: string): void {
    this.searchSignal.set(query);
  }

  onSortChange(sort: string): void {
    this.sortSignal.set(sort);
  }

  onSelectModel(model: ModelSummary): void {
    this.detailsDialogVisible = false;
    
    // Ensure problemType and id are defined
    const problemType = model?.problemType || this.problemType() || '';
    const modelId = model?.id || '';
    
    if (!problemType || !modelId) {
      console.error('Cannot navigate: Model missing required fields', { 
        model,
        hasModel: !!model,
        problemType: model?.problemType,
        modelId: model?.id,
        fallbackProblemType: this.problemType()
      });
      // Show user-friendly error
      alert('Unable to load model. Please try again.');
      return;
    }
    
    try {
      this.router.navigate(['/explore', problemType, modelId]);
    } catch (error) {
      console.error('Navigation error:', error);
      alert('Navigation failed. Please try again.');
    }
  }

  onViewDetails(model: ModelSummary): void {
    this.selectedModel.set(model);
    this.detailsDialogVisible = true;
  }

  goToProblems(): void {
    this.router.navigate(['/problems']);
  }

  formatNumber(num: number | undefined | null): string {
    if (num == null || isNaN(num)) return '0';
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
}

