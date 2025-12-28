import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PhysicsService } from '../../core/services';
import { LoadingSpinnerComponent } from '../../shared/components';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, LoadingSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="home-container">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">
            <span class="gradient-text">Laniakea</span>
          </h1>
          <p class="hero-subtitle">
            Explore Physics-Informed Neural Network Simulations
          </p>
          <p class="hero-description">
            Interactive platform for exploring stellar structure, gravitational physics,
            and other fundamental physical phenomena through deep learning.
          </p>
          <div class="hero-actions">
            <p-button
              label="Explore Physics Problems"
              icon="pi pi-arrow-right"
              iconPos="right"
              styleClass="p-button-lg"
              (onClick)="navigateToProblems()"
            />
            <p-button
              label="View Models"
              icon="pi pi-box"
              styleClass="p-button-lg p-button-secondary"
              (onClick)="navigateToGallery()"
            />
          </div>
        </div>
        <div class="hero-visual">
          <div class="orbit-animation">
            <div class="orbit orbit-1"></div>
            <div class="orbit orbit-2"></div>
            <div class="orbit orbit-3"></div>
            <div class="center-star"></div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section">
        <h2>Key Features</h2>
        <div class="features-grid">
          <p-card styleClass="feature-card">
            <ng-template pTemplate="header">
              <div class="feature-icon stellar">
                <i class="pi pi-star"></i>
              </div>
            </ng-template>
            <h3>Physics Problems</h3>
            <p>
              Explore classic physics problems including Lane-Emden equations for stellar structure
              and Poisson equations for gravitational fields.
            </p>
          </p-card>

          <p-card styleClass="feature-card">
            <ng-template pTemplate="header">
              <div class="feature-icon model">
                <i class="pi pi-box"></i>
              </div>
            </ng-template>
            <h3>Pre-trained Models</h3>
            <p>
              Access a gallery of pre-trained neural network models with detailed metrics
              and architecture information.
            </p>
          </p-card>

          <p-card styleClass="feature-card">
            <ng-template pTemplate="header">
              <div class="feature-icon interactive">
                <i class="pi pi-sliders-h"></i>
              </div>
            </ng-template>
            <h3>Interactive Explorer</h3>
            <p>
              Configure parameters with intuitive sliders, run real-time predictions,
              and visualize results instantly.
            </p>
          </p-card>

          <p-card styleClass="feature-card">
            <ng-template pTemplate="header">
              <div class="feature-icon visualization">
                <i class="pi pi-chart-line"></i>
              </div>
            </ng-template>
            <h3>Dynamic Visualizations</h3>
            <p>
              View results with interactive 2D plots and immersive 3D surface visualizations
              powered by Plotly and Three.js.
            </p>
          </p-card>
        </div>
      </section>

      <!-- Quick Stats -->
      <section class="stats-section">
        <div class="stat-item">
          <span class="stat-value">{{ physicsService.problems().length || '3+' }}</span>
          <span class="stat-label">Physics Problems</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">10+</span>
          <span class="stat-label">Pre-trained Models</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">&lt;50ms</span>
          <span class="stat-label">Inference Time</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">Real-time</span>
          <span class="stat-label">Visualization</span>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      min-height: 100vh;
      padding: 2rem;
    }

    // Hero Section
    .hero-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
      padding: 4rem 0;
      max-width: 1200px;
      margin: 0 auto;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        text-align: center;
      }
    }

    .hero-title {
      font-size: 4rem;
      font-weight: 700;
      margin-bottom: 1rem;
      line-height: 1.1;

      @media (max-width: 768px) {
        font-size: 2.5rem;
      }
    }

    .gradient-text {
      background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-subtitle {
      font-size: 1.5rem;
      color: var(--text-color);
      margin-bottom: 1rem;
    }

    .hero-description {
      font-size: 1.1rem;
      color: var(--text-color-secondary);
      max-width: 500px;
      margin-bottom: 2rem;

      @media (max-width: 768px) {
        margin-left: auto;
        margin-right: auto;
      }
    }

    .hero-actions {
      display: flex;
      gap: 1rem;

      @media (max-width: 768px) {
        justify-content: center;
        flex-wrap: wrap;
      }
    }

    // Orbit Animation
    .hero-visual {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 400px;
    }

    .orbit-animation {
      position: relative;
      width: 300px;
      height: 300px;
    }

    .orbit {
      position: absolute;
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 50%;
      animation: orbit-rotate 20s linear infinite;

      &::after {
        content: '';
        position: absolute;
        width: 12px;
        height: 12px;
        background: #6366f1;
        border-radius: 50%;
        box-shadow: 0 0 20px #6366f1;
      }
    }

    .orbit-1 {
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;

      &::after {
        top: -6px;
        left: 50%;
        transform: translateX(-50%);
      }
    }

    .orbit-2 {
      width: 70%;
      height: 70%;
      top: 15%;
      left: 15%;
      animation-duration: 15s;
      animation-direction: reverse;

      &::after {
        top: 50%;
        right: -6px;
        transform: translateY(-50%);
        background: #8b5cf6;
        box-shadow: 0 0 20px #8b5cf6;
      }
    }

    .orbit-3 {
      width: 40%;
      height: 40%;
      top: 30%;
      left: 30%;
      animation-duration: 10s;

      &::after {
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
        background: #a855f7;
        box-shadow: 0 0 20px #a855f7;
      }
    }

    .center-star {
      position: absolute;
      width: 30px;
      height: 30px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: radial-gradient(circle, #f59e0b, #f97316);
      border-radius: 50%;
      box-shadow: 0 0 40px #f59e0b, 0 0 80px rgba(249, 115, 22, 0.5);
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes orbit-rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes pulse {
      0%, 100% { transform: translate(-50%, -50%) scale(1); }
      50% { transform: translate(-50%, -50%) scale(1.1); }
    }

    // Features Section
    .features-section {
      max-width: 1200px;
      margin: 4rem auto;

      h2 {
        text-align: center;
        margin-bottom: 2rem;
        font-size: 2rem;
      }
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    :host ::ng-deep .feature-card {
      text-align: center;

      .p-card-header {
        padding: 2rem 0 1rem;
        border: none;
      }

      h3 {
        margin: 0 0 0.5rem;
        color: var(--text-color);
      }

      p {
        color: var(--text-color-secondary);
        margin: 0;
        font-size: 0.9rem;
      }
    }

    .feature-icon {
      width: 60px;
      height: 60px;
      margin: 0 auto;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;

      &.stellar {
        background: rgba(245, 158, 11, 0.2);
        color: #f59e0b;
      }

      &.model {
        background: rgba(99, 102, 241, 0.2);
        color: #6366f1;
      }

      &.interactive {
        background: rgba(59, 130, 246, 0.2);
        color: #3b82f6;
      }

      &.visualization {
        background: rgba(139, 92, 246, 0.2);
        color: #8b5cf6;
      }
    }

    // Stats Section
    .stats-section {
      display: flex;
      justify-content: center;
      gap: 4rem;
      padding: 3rem;
      background: var(--surface-section);
      border-radius: 16px;
      max-width: 1000px;
      margin: 4rem auto;

      @media (max-width: 768px) {
        flex-wrap: wrap;
        gap: 2rem;
      }
    }

    .stat-item {
      text-align: center;
    }

    .stat-value {
      display: block;
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--primary-color);
      font-family: 'JetBrains Mono', monospace;
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--text-color-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  `]
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  physicsService = inject(PhysicsService);

  ngOnInit(): void {
    // Preload physics problems
    this.physicsService.loadProblems();
  }

  navigateToProblems(): void {
    this.router.navigate(['/problems']);
  }

  navigateToGallery(): void {
    this.router.navigate(['/gallery']);
  }
}
