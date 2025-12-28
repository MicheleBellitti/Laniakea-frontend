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
    <div class="problem-selection-container">
      <header class="page-header">
        <h1>Physics Problems</h1>
        <p>Select a physics problem to explore with neural network models</p>
      </header>

      <!-- Filters -->
      <div class="filters-section">
        <div class="search-box">
          <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <input
              type="text"
              pInputText
              placeholder="Search problems..."
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange($event)"
            />
          </span>
        </div>

        <p-selectButton
          [options]="categoryOptions"
          [(ngModel)]="selectedCategory"
          optionLabel="label"
          optionValue="value"
          (ngModelChange)="onCategoryChange($event)"
        />
      </div>

      <!-- Content -->
      @if (physicsService.loading()) {
        <div class="problems-grid">
          @for (i of [1, 2, 3]; track i) {
            <div class="skeleton-card">
              <p-skeleton height="300px" />
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
          @for (problem of filteredProblems(); track problem.id) {
            <app-problem-card
              [problem]="problem"
              (explore)="onExplore($event)"
              class="fade-in"
            />
          } @empty {
            <div class="empty-state">
              <i class="pi pi-inbox"></i>
              <h3>No problems found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .problem-selection-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      text-align: center;
      margin-bottom: 2rem;

      h1 {
        margin: 0 0 0.5rem;
        font-size: 2.5rem;
      }

      p {
        margin: 0;
        color: var(--text-color-secondary);
        font-size: 1.1rem;
      }
    }

    .filters-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
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

    .problems-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;

      @media (max-width: 400px) {
        grid-template-columns: 1fr;
      }
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
  `]
})
export class ProblemSelectionComponent implements OnInit {
  private router = inject(Router);
  physicsService = inject(PhysicsService);

  searchQuery = '';
  selectedCategory = 'all';

  categoryOptions = [
    { label: 'All', value: 'all' },
    { label: 'Stellar', value: 'stellar' },
    { label: 'Gravity', value: 'gravity' },
    { label: 'Quantum', value: 'quantum' },
    { label: 'Thermo', value: 'thermodynamics' },
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
    this.categorySignal.set(category);
  }

  onExplore(problem: PhysicsMetadata): void {
    this.physicsService.selectProblem(problem.id);
    this.router.navigate(['/gallery', problem.id]);
  }
}
