import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SkeletonModule } from 'primeng/skeleton';
import { PhysicsService } from '../../core/services';
import { PhysicsMetadata } from '../../core/models';
import { ProblemCardComponent } from './problem-card/problem-card.component';
import { ErrorDisplayComponent, LoadingSpinnerComponent } from '../../shared/components';

@Component({
  selector: 'app-problem-selection',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    SelectButtonModule,
    SkeletonModule,
    ProblemCardComponent,
    ErrorDisplayComponent,
    LoadingSpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="problems-page">
      <!-- Header -->
      <header class="page-header animate-fade-in">
        <div class="header-content">
          <span class="header-badge">
            <i class="pi pi-book"></i>
            Physics Library
          </span>
          <h1>Explore Physics Problems</h1>
          <p>Select a fundamental physics equation to solve with neural networks</p>
        </div>
      </header>

      <!-- Filters -->
      <div class="filters-section animate-fade-in delay-1">
        <div class="search-wrapper">
          <i class="pi pi-search search-icon"></i>
          <input
            type="text"
            pInputText
            placeholder="Search problems..."
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange($event)"
            class="search-input"
          />
        </div>

        <div class="category-filters">
          @for (cat of categoryOptions; track cat.value) {
            <button
              class="category-btn"
              [class.active]="selectedCategory === cat.value"
              [class]="'category-' + cat.value"
              (click)="onCategoryChange(cat.value)"
            >
              <i [class]="cat.icon"></i>
              <span>{{ cat.label }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Results count -->
      <div class="results-info animate-fade-in delay-2">
        <span class="count">{{ filteredProblems().length }} problems</span>
        @if (selectedCategory !== 'all') {
          <span class="filter-tag">
            {{ getCategoryLabel(selectedCategory) }}
            <button class="clear-filter" (click)="onCategoryChange('all')">
              <i class="pi pi-times"></i>
            </button>
          </span>
        }
      </div>

      <!-- Content -->
      @if (physicsService.loading()) {
        <div class="problems-grid">
          @for (i of [1, 2, 3, 4]; track i) {
            <div class="skeleton-card animate-fade-in" [style.animation-delay.ms]="i * 100">
              <p-skeleton height="320px" styleClass="skeleton-content" />
            </div>
          }
        </div>
      } @else if (physicsService.error()) {
        <app-error-display
          [message]="physicsService.error()!"
          title="Failed to load problems"
          [retryable]="true"
          (retry)="loadProblems()"
        />
      } @else {
        <div class="problems-grid">
          @for (problem of filteredProblems(); track problem.id; let i = $index) {
            <app-problem-card
              [problem]="problem"
              (explore)="onExplore($event)"
              class="animate-fade-in"
              [style.animation-delay.ms]="i * 100"
            />
          } @empty {
            <div class="empty-state">
              <div class="empty-icon">
                <i class="pi pi-search"></i>
              </div>
              <h3>No problems found</h3>
              <p>Try adjusting your search or filter criteria</p>
              <button class="reset-btn" (click)="resetFilters()">
                Clear filters
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .problems-page {
      min-height: 100vh;
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    // ============================================
    // HEADER
    // ============================================
    .page-header {
      text-align: center;
      padding: 3rem 0;
    }

    .header-content {
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

      i {
        font-size: 0.875rem;
      }
    }

    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
      background: linear-gradient(135deg, #f1f5f9, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;

      @media (max-width: 768px) {
        font-size: 2rem;
      }
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
      flex-direction: column;
      gap: 1.5rem;
      margin-bottom: 2rem;

      @media (min-width: 768px) {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }

    .search-wrapper {
      position: relative;
      flex: 1;
      max-width: 400px;

      @media (max-width: 768px) {
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

    .category-filters {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;

      @media (max-width: 768px) {
        justify-content: center;
      }
    }

    .category-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid #334155;
      border-radius: 9999px;
      color: #94a3b8;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;

      i {
        font-size: 0.875rem;
      }

      &:hover {
        background: rgba(30, 41, 59, 0.8);
        border-color: #475569;
      }

      &.active {
        background: rgba(124, 58, 237, 0.2);
        border-color: #7c3aed;
        color: #a78bfa;
      }

      &.category-stellar.active {
        background: rgba(245, 158, 11, 0.15);
        border-color: #f59e0b;
        color: #fbbf24;
      }

      &.category-gravity.active {
        background: rgba(59, 130, 246, 0.15);
        border-color: #3b82f6;
        color: #60a5fa;
      }

      &.category-quantum.active {
        background: rgba(236, 72, 153, 0.15);
        border-color: #ec4899;
        color: #f472b6;
      }

      &.category-thermodynamics.active {
        background: rgba(239, 68, 68, 0.15);
        border-color: #ef4444;
        color: #f87171;
      }
    }

    // ============================================
    // RESULTS INFO
    // ============================================
    .results-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .count {
      font-size: 0.875rem;
      color: #64748b;
    }

    .filter-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      background: rgba(124, 58, 237, 0.15);
      border-radius: 9999px;
      font-size: 0.75rem;
      color: #a78bfa;
    }

    .clear-filter {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      background: none;
      border: none;
      color: #a78bfa;
      cursor: pointer;
      padding: 0;

      &:hover {
        color: #f1f5f9;
      }

      i {
        font-size: 0.625rem;
      }
    }

    // ============================================
    // PROBLEMS GRID
    // ============================================
    .problems-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 1.5rem;

      @media (max-width: 400px) {
        grid-template-columns: 1fr;
      }
    }

    .skeleton-card {
      border-radius: 16px;
      overflow: hidden;

      :host ::ng-deep .skeleton-content {
        border-radius: 16px;
      }
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
        margin-bottom: 1.5rem;
      }
    }

    .reset-btn {
      padding: 0.75rem 1.5rem;
      background: transparent;
      border: 1px solid #334155;
      border-radius: 8px;
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        border-color: #7c3aed;
        color: #a78bfa;
      }
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
export class ProblemSelectionComponent implements OnInit {
  private router = inject(Router);
  physicsService = inject(PhysicsService);

  searchQuery = '';
  selectedCategory = 'all';

  categoryOptions = [
    { label: 'All', value: 'all', icon: 'pi pi-th-large' },
    { label: 'Stellar', value: 'stellar', icon: 'pi pi-star' },
    { label: 'Gravity', value: 'gravity', icon: 'pi pi-globe' },
    { label: 'Quantum', value: 'quantum', icon: 'pi pi-bolt' },
    { label: 'Thermo', value: 'thermodynamics', icon: 'pi pi-sun' },
  ];

  private searchSignal = signal('');
  private categorySignal = signal('all');

  filteredProblems = computed(() => {
    let problems = this.physicsService.problems();
    const search = this.searchSignal().toLowerCase();
    const category = this.categorySignal();

    if (category !== 'all') {
      problems = problems.filter(p => p.category === category);
    }

    if (search) {
      problems = problems.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
      );
    }

    return problems;
  });

  ngOnInit(): void {
    this.loadProblems();
  }

  loadProblems(): void {
    this.physicsService.loadProblems();
  }

  onSearchChange(query: string): void {
    this.searchSignal.set(query);
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.categorySignal.set(category);
  }

  getCategoryLabel(value: string): string {
    return this.categoryOptions.find(c => c.value === value)?.label || value;
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.searchSignal.set('');
    this.categorySignal.set('all');
  }

  onExplore(problem: PhysicsMetadata): void {
    this.physicsService.selectProblem(problem.id);
    this.router.navigate(['/gallery', problem.id]);
  }
}
