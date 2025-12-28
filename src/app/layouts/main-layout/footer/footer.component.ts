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
      <div class="footer-content">
        <div class="footer-brand">
          <span class="logo-icon">◆</span>
          <span>Laniakea</span>
          <span class="version">v1.0.0</span>
        </div>

        <nav class="footer-links">
          <a routerLink="/problems">Problems</a>
          <a routerLink="/gallery">Models</a>
          <a href="https://github.com/laniakea-project" target="_blank">GitHub</a>
        </nav>

        <div class="footer-copyright">
          <p>&copy; {{ currentYear }} Laniakea Project. Built with Angular & PrimeNG.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .app-footer {
      background: var(--surface-section);
      border-top: 1px solid var(--surface-border);
      padding: 2rem;
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .footer-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: var(--text-color);

      .logo-icon {
        color: var(--primary-color);
        font-size: 1.25rem;
      }

      .version {
        font-size: 0.75rem;
        color: var(--text-color-secondary);
        padding: 0.125rem 0.5rem;
        background: var(--surface-overlay);
        border-radius: 4px;
      }
    }

    .footer-links {
      display: flex;
      gap: 1.5rem;

      a {
        color: var(--text-color-secondary);
        text-decoration: none;
        font-size: 0.875rem;
        transition: color 0.2s;

        &:hover {
          color: var(--primary-color);
        }
      }
    }

    .footer-copyright {
      p {
        margin: 0;
        font-size: 0.8rem;
        color: var(--text-color-secondary);
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
