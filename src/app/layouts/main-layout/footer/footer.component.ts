import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="app-footer">
      <div class="footer-container">
        <div class="footer-brand">
          <span class="brand-icon">◆</span>
          <span class="brand-name">Laniakea</span>
        </div>

        <nav class="footer-nav">
          <a routerLink="/problems">Problems</a>
          <a routerLink="/gallery">Models</a>
          <a href="https://github.com" target="_blank">GitHub</a>
        </nav>

        <div class="footer-info">
          <span>Physics-Informed Neural Networks</span>
          <span class="separator">•</span>
          <span>Built with Angular</span>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .app-footer {
      background: rgba(15, 23, 42, 0.6);
      border-top: 1px solid rgba(51, 65, 85, 0.5);
      padding: 2rem 1.5rem;
    }

    .footer-container {
      max-width: 1600px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;
    }

    .footer-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: #f1f5f9;
    }

    .brand-icon {
      color: #7c3aed;
      font-size: 1.25rem;
    }

    .brand-name {
      font-family: 'Space Grotesk', sans-serif;
    }

    .footer-nav {
      display: flex;
      gap: 1.5rem;

      a {
        color: #64748b;
        text-decoration: none;
        font-size: 0.875rem;
        transition: color 0.2s ease;

        &:hover {
          color: #a78bfa;
        }
      }
    }

    .footer-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      color: #475569;

      .separator {
        opacity: 0.5;
      }

      @media (max-width: 640px) {
        flex-direction: column;
        gap: 0.25rem;

        .separator {
          display: none;
        }
      }
    }
  `]
})
export class FooterComponent {}
