import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PhysicsInterpretation {
  title: string;
  description: string;
  outputMeaning: string;
  physicalInsight: string;
  icon: string;
}

@Component({
  selector: 'app-physics-interpretation',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="interpretation-panel" *ngIf="interpretation">
      <div class="panel-header">
        <div class="header-icon">
          <i [class]="'pi ' + interpretation.icon"></i>
        </div>
        <div class="header-text">
          <h3>{{ interpretation.title }}</h3>
          <p>{{ interpretation.description }}</p>
        </div>
      </div>

      <div class="interpretation-content">
        <div class="insight-card output">
          <div class="card-label">
            <i class="pi pi-chart-line"></i>
            Output Variable
          </div>
          <p>{{ interpretation.outputMeaning }}</p>
        </div>

        <div class="insight-card physics">
          <div class="card-label">
            <i class="pi pi-info-circle"></i>
            Physical Insight
          </div>
          <p>{{ interpretation.physicalInsight }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .interpretation-panel {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(51, 65, 85, 0.5);
      border-radius: 12px;
      overflow: hidden;
    }

    .panel-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background: rgba(124, 58, 237, 0.08);
      border-bottom: 1px solid rgba(51, 65, 85, 0.3);
    }

    .header-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(124, 58, 237, 0.2);
      border-radius: 10px;
      flex-shrink: 0;

      i {
        font-size: 1.25rem;
        color: #a78bfa;
      }
    }

    .header-text {
      h3 {
        font-size: 0.95rem;
        font-weight: 600;
        color: #f1f5f9;
        margin: 0 0 0.25rem;
      }

      p {
        font-size: 0.8rem;
        color: #94a3b8;
        margin: 0;
        line-height: 1.4;
      }
    }

    .interpretation-content {
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .insight-card {
      padding: 0.875rem 1rem;
      border-radius: 8px;

      &.output {
        background: rgba(124, 58, 237, 0.1);
        border-left: 3px solid #7c3aed;
      }

      &.physics {
        background: rgba(59, 130, 246, 0.1);
        border-left: 3px solid #3b82f6;
      }
    }

    .card-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.7rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;

      i {
        font-size: 0.75rem;
      }
    }

    .insight-card p {
      font-size: 0.85rem;
      color: #e2e8f0;
      line-height: 1.5;
      margin: 0;
    }
  `]
})
export class PhysicsInterpretationComponent {
  @Input() problemType: string = '';
  @Input() outputKeys: string[] = [];

  private interpretations: Record<string, PhysicsInterpretation> = {
    'lane_emden': {
      title: 'Stellar Structure Solution',
      description: 'Lane-Emden equation describes the internal structure of self-gravitating polytropic spheres',
      outputMeaning: 'θ(ξ) represents the dimensionless density profile. At ξ=0 (star center), θ=1 (maximum density). As ξ increases toward the surface, θ decreases to 0.',
      physicalInsight: 'This solution shows how matter is distributed inside a star. The shape depends on the polytropic index n - higher n means more centrally concentrated mass, relevant for white dwarfs and neutron stars.',
      icon: 'pi-sun'
    },
    'poisson_gravity': {
      title: 'Gravitational Potential Field',
      description: 'Poisson equation relates the gravitational potential to mass distribution',
      outputMeaning: 'φ(x,y) is the gravitational potential. More negative values indicate deeper gravitational wells where objects would need more energy to escape.',
      physicalInsight: 'The 3D surface shows the "gravitational landscape" - imagine placing a ball on this surface; it would roll toward the deepest point (highest mass concentration). This is fundamental for understanding galactic dynamics.',
      icon: 'pi-globe'
    },
    'schrodinger': {
      title: 'Quantum Wave Function',
      description: 'Schrödinger equation describes quantum particle behavior in potential wells',
      outputMeaning: 'ψ(x) is the wave function. Its square |ψ|² gives the probability of finding the particle at position x.',
      physicalInsight: 'Unlike classical particles, quantum objects exist as probability distributions. The wave function peaks show where the particle is most likely to be found.',
      icon: 'pi-bolt'
    },
    'heat': {
      title: 'Temperature Distribution',
      description: 'Heat equation models thermal diffusion through materials',
      outputMeaning: 'T(x,t) represents temperature at position x and time t. The solution shows how heat spreads from hot to cold regions.',
      physicalInsight: 'Heat naturally flows from high to low temperature. This diffusion process is fundamental to thermal engineering, from cooling electronics to understanding planetary temperature evolution.',
      icon: 'pi-sun'
    }
  };

  get interpretation(): PhysicsInterpretation | null {
    if (!this.problemType) return null;

    // Find matching interpretation
    for (const [key, value] of Object.entries(this.interpretations)) {
      if (this.problemType.includes(key) ||
          this.problemType.replace('-', '_').includes(key) ||
          this.problemType.replace('_', '-').includes(key)) {
        return value;
      }
    }

    return null;
  }
}
