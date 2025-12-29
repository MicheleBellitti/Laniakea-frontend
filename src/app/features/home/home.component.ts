import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PhysicsService } from '../../core/services';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="home-page">
      <!-- Cosmic Background -->
      <div class="cosmic-background">
        <div class="stars"></div>
        <div class="nebula nebula-1"></div>
        <div class="nebula nebula-2"></div>
        <div class="nebula nebula-3"></div>
        <div class="orbital-ring ring-1"></div>
        <div class="orbital-ring ring-2"></div>
        <div class="orbital-ring ring-3"></div>
        <div class="central-star"></div>
      </div>

      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-content">
          <div class="hero-badge animate-fade-in">
            <span class="badge-icon">✦</span>
            <span>Physics-Informed Neural Networks</span>
          </div>

          <h1 class="hero-title animate-fade-in delay-1">
            <span class="title-line">Explore the</span>
            <span class="title-gradient">Laniakea</span>
            <span class="title-line">Universe</span>
          </h1>

          <p class="hero-description animate-fade-in delay-2">
            Harness the power of deep learning to solve fundamental physics equations.
            From stellar structure to quantum mechanics, visualize solutions in real-time.
          </p>

          <div class="hero-actions animate-fade-in delay-3">
            <p-button
              label="Start Exploring"
              icon="pi pi-arrow-right"
              iconPos="right"
              styleClass="p-button-lg p-button-primary"
              (onClick)="navigateToProblems()"
            />
            <p-button
              label="View Models"
              icon="pi pi-box"
              styleClass="p-button-lg p-button-secondary"
              (onClick)="navigateToGallery()"
            />
          </div>

          <div class="hero-stats animate-fade-in delay-4">
            <div class="stat">
              <span class="stat-value">{{ problemCount }}</span>
              <span class="stat-label">Physics Problems</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-value">10+</span>
              <span class="stat-label">Pre-trained Models</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-value">&lt;50ms</span>
              <span class="stat-label">Inference Time</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features">
        <h2 class="section-title animate-fade-in">
          <span class="title-accent">Powerful</span> Features
        </h2>

        <div class="features-grid">
          <div class="feature-card animate-fade-in delay-1" (click)="navigateToProblems()">
            <div class="feature-icon stellar">
              <i class="pi pi-star-fill"></i>
            </div>
            <h3>Physics Problems</h3>
            <p>Lane-Emden, Poisson, Schrödinger equations and more. Each with detailed mathematical context.</p>
            <span class="feature-link">
              Explore problems <i class="pi pi-arrow-right"></i>
            </span>
          </div>

          <div class="feature-card animate-fade-in delay-2" (click)="navigateToGallery()">
            <div class="feature-icon model">
              <i class="pi pi-box"></i>
            </div>
            <h3>Pre-trained Models</h3>
            <p>Access a gallery of optimized neural networks with training metrics and architecture details.</p>
            <span class="feature-link">
              Browse models <i class="pi pi-arrow-right"></i>
            </span>
          </div>

          <div class="feature-card animate-fade-in delay-3">
            <div class="feature-icon interactive">
              <i class="pi pi-sliders-h"></i>
            </div>
            <h3>Interactive Explorer</h3>
            <p>Configure parameters with intuitive sliders, run predictions, and see results instantly.</p>
            <span class="feature-link">
              Try it now <i class="pi pi-arrow-right"></i>
            </span>
          </div>

          <div class="feature-card animate-fade-in delay-4">
            <div class="feature-icon visualization">
              <i class="pi pi-chart-line"></i>
            </div>
            <h3>Dynamic Visualizations</h3>
            <p>Beautiful 2D plots with Plotly and immersive 3D surfaces with Three.js.</p>
            <span class="feature-link">
              See examples <i class="pi pi-arrow-right"></i>
            </span>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta animate-fade-in">
        <div class="cta-content">
          <h2>Ready to explore?</h2>
          <p>Start solving physics problems with neural networks today.</p>
          <p-button
            label="Get Started"
            icon="pi pi-arrow-right"
            iconPos="right"
            styleClass="p-button-lg p-button-primary"
            (onClick)="navigateToProblems()"
          />
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-page {
      min-height: 100vh;
      position: relative;
      overflow: hidden;
    }

    // ============================================
    // COSMIC BACKGROUND
    // ============================================
    .cosmic-background {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
    }

    .stars {
      position: absolute;
      inset: 0;
      background-image:
        radial-gradient(2px 2px at 20px 30px, rgba(255,255,255,0.3), transparent),
        radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.2), transparent),
        radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.4), transparent),
        radial-gradient(2px 2px at 160px 120px, rgba(255,255,255,0.3), transparent),
        radial-gradient(1px 1px at 230px 80px, rgba(255,255,255,0.2), transparent),
        radial-gradient(2px 2px at 300px 200px, rgba(255,255,255,0.3), transparent),
        radial-gradient(1px 1px at 400px 150px, rgba(255,255,255,0.4), transparent);
      background-size: 500px 400px;
      animation: stars-drift 60s linear infinite;
    }

    @keyframes stars-drift {
      from { transform: translateY(0); }
      to { transform: translateY(-400px); }
    }

    .nebula {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.4;
    }

    .nebula-1 {
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, #7c3aed 0%, transparent 70%);
      top: -200px;
      right: -200px;
      animation: float 15s ease-in-out infinite;
    }

    .nebula-2 {
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
      bottom: -100px;
      left: -100px;
      animation: float 20s ease-in-out infinite reverse;
    }

    .nebula-3 {
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, #06b6d4 0%, transparent 70%);
      top: 50%;
      left: 30%;
      animation: float 18s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(20px, -20px) scale(1.05); }
    }

    .orbital-ring {
      position: absolute;
      top: 50%;
      right: 15%;
      border: 1px solid rgba(124, 58, 237, 0.2);
      border-radius: 50%;
      transform: translate(50%, -50%) rotateX(70deg);
      animation: orbit 30s linear infinite;
    }

    .ring-1 {
      width: 400px;
      height: 400px;
    }

    .ring-2 {
      width: 300px;
      height: 300px;
      animation-duration: 25s;
      animation-direction: reverse;
      border-color: rgba(59, 130, 246, 0.2);
    }

    .ring-3 {
      width: 200px;
      height: 200px;
      animation-duration: 20s;
      border-color: rgba(6, 182, 212, 0.2);
    }

    @keyframes orbit {
      from { transform: translate(50%, -50%) rotateX(70deg) rotateZ(0deg); }
      to { transform: translate(50%, -50%) rotateX(70deg) rotateZ(360deg); }
    }

    .central-star {
      position: absolute;
      width: 20px;
      height: 20px;
      top: 50%;
      right: 15%;
      transform: translate(50%, -50%);
      background: radial-gradient(circle, #f59e0b, #f97316);
      border-radius: 50%;
      box-shadow: 0 0 60px #f59e0b, 0 0 100px rgba(245, 158, 11, 0.5);
      animation: pulse 3s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: translate(50%, -50%) scale(1); box-shadow: 0 0 60px #f59e0b, 0 0 100px rgba(245, 158, 11, 0.5); }
      50% { transform: translate(50%, -50%) scale(1.1); box-shadow: 0 0 80px #f59e0b, 0 0 120px rgba(245, 158, 11, 0.6); }
    }

    // ============================================
    // HERO SECTION
    // ============================================
    .hero {
      position: relative;
      z-index: 1;
      min-height: 100vh;
      display: flex;
      align-items: center;
      padding: 6rem 2rem;
      max-width: 800px;
      margin: 0 auto;

      @media (max-width: 768px) {
        padding: 4rem 1.5rem;
        text-align: center;
      }
    }

    .hero-content {
      width: 100%;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: rgba(124, 58, 237, 0.15);
      border: 1px solid rgba(124, 58, 237, 0.3);
      border-radius: 9999px;
      font-size: 0.875rem;
      color: #a78bfa;
      margin-bottom: 1.5rem;

      .badge-icon {
        animation: pulse 2s ease-in-out infinite;
      }
    }

    .hero-title {
      font-size: clamp(2.5rem, 8vw, 4.5rem);
      font-weight: 700;
      line-height: 1.1;
      margin-bottom: 1.5rem;

      .title-line {
        display: block;
        color: #f1f5f9;
      }

      .title-gradient {
        display: block;
        background: linear-gradient(135deg, #7c3aed, #a855f7, #3b82f6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }

    .hero-description {
      font-size: 1.25rem;
      color: #94a3b8;
      line-height: 1.7;
      margin-bottom: 2rem;
      max-width: 600px;

      @media (max-width: 768px) {
        font-size: 1.1rem;
        margin-left: auto;
        margin-right: auto;
      }
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      margin-bottom: 3rem;

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: center;
      }
    }

    .hero-stats {
      display: flex;
      align-items: center;
      gap: 2rem;

      @media (max-width: 768px) {
        justify-content: center;
        flex-wrap: wrap;
        gap: 1.5rem;
      }
    }

    .stat {
      text-align: center;
    }

    .stat-value {
      display: block;
      font-family: 'JetBrains Mono', monospace;
      font-size: 1.75rem;
      font-weight: 700;
      color: #7c3aed;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #64748b;
    }

    .stat-divider {
      width: 1px;
      height: 40px;
      background: linear-gradient(180deg, transparent, #334155, transparent);

      @media (max-width: 768px) {
        display: none;
      }
    }

    // ============================================
    // FEATURES SECTION
    // ============================================
    .features {
      position: relative;
      z-index: 1;
      padding: 6rem 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .section-title {
      text-align: center;
      font-size: 2.5rem;
      margin-bottom: 3rem;

      .title-accent {
        background: linear-gradient(135deg, #7c3aed, #3b82f6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .feature-card {
      background: rgba(30, 41, 59, 0.6);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(51, 65, 85, 0.5);
      border-radius: 16px;
      padding: 2rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        border-color: rgba(124, 58, 237, 0.5);
        transform: translateY(-8px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px rgba(124, 58, 237, 0.2);

        .feature-icon {
          transform: scale(1.1);
        }

        .feature-link {
          color: #a78bfa;

          i {
            transform: translateX(4px);
          }
        }
      }

      h3 {
        font-size: 1.25rem;
        margin-bottom: 0.75rem;
        color: #f1f5f9;
      }

      p {
        color: #94a3b8;
        font-size: 0.95rem;
        line-height: 1.6;
        margin-bottom: 1rem;
      }
    }

    .feature-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      margin-bottom: 1.25rem;
      transition: transform 0.3s ease;

      &.stellar {
        background: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
      }

      &.model {
        background: rgba(124, 58, 237, 0.15);
        color: #a78bfa;
      }

      &.interactive {
        background: rgba(59, 130, 246, 0.15);
        color: #60a5fa;
      }

      &.visualization {
        background: rgba(6, 182, 212, 0.15);
        color: #22d3ee;
      }
    }

    .feature-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #64748b;
      transition: color 0.3s ease;

      i {
        transition: transform 0.3s ease;
      }
    }

    // ============================================
    // CTA SECTION
    // ============================================
    .cta {
      position: relative;
      z-index: 1;
      padding: 6rem 2rem;
    }

    .cta-content {
      max-width: 600px;
      margin: 0 auto;
      text-align: center;
      padding: 3rem;
      background: rgba(30, 41, 59, 0.6);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(51, 65, 85, 0.5);
      border-radius: 24px;

      h2 {
        font-size: 2rem;
        margin-bottom: 0.75rem;
      }

      p {
        color: #94a3b8;
        margin-bottom: 1.5rem;
      }
    }

    // ============================================
    // ANIMATIONS
    // ============================================
    .animate-fade-in {
      opacity: 0;
      animation: fadeInUp 0.6s ease forwards;
    }

    @for $i from 1 through 5 {
      .delay-#{$i} {
        animation-delay: #{$i * 150}ms;
      }
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  physicsService = inject(PhysicsService);

  problemCount = 4;

  ngOnInit(): void {
    this.physicsService.loadProblems().then(() => {
      this.problemCount = this.physicsService.problems().length || 4;
    });
  }

  navigateToProblems(): void {
    this.router.navigate(['/problems']);
  }

  navigateToGallery(): void {
    this.router.navigate(['/gallery']);
  }
}
