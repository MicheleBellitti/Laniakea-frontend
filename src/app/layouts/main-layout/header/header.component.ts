import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, MenuModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="app-header">
      <div class="header-left">
        <a routerLink="/" class="logo">
          <span class="logo-icon">◆</span>
          <span class="logo-text">Laniakea</span>
        </a>
      </div>

      <nav class="header-nav">
        <a routerLink="/problems" routerLinkActive="active" class="nav-link">
          <i class="pi pi-book"></i>
          <span>Problems</span>
        </a>
        <a routerLink="/gallery" routerLinkActive="active" class="nav-link">
          <i class="pi pi-box"></i>
          <span>Models</span>
        </a>
      </nav>

      <div class="header-right">
        <p-button
          icon="pi pi-github"
          styleClass="p-button-text p-button-rounded"
          (onClick)="openGitHub()"
          pTooltip="View on GitHub"
        />
        <p-button
          icon="pi pi-question-circle"
          styleClass="p-button-text p-button-rounded"
          pTooltip="Help"
        />
      </div>

      <!-- Mobile menu button -->
      <p-button
        icon="pi pi-bars"
        styleClass="p-button-text mobile-menu-btn"
        (onClick)="toggleMobileMenu()"
      />
    </header>
  `,
  styles: [`
    .app-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      height: 64px;
      background: var(--surface-section);
      border-bottom: 1px solid var(--surface-border);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-left {
      display: flex;
      align-items: center;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: var(--text-color);
      font-weight: 600;
      font-size: 1.25rem;

      &:hover {
        color: var(--primary-color);
      }
    }

    .logo-icon {
      color: var(--primary-color);
      font-size: 1.5rem;
    }

    .header-nav {
      display: flex;
      gap: 0.5rem;

      @media (max-width: 768px) {
        display: none;
      }
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      text-decoration: none;
      color: var(--text-color-secondary);
      border-radius: 8px;
      transition: all 0.2s;

      i {
        font-size: 1rem;
      }

      &:hover {
        color: var(--text-color);
        background: var(--surface-hover);
      }

      &.active {
        color: var(--primary-color);
        background: rgba(99, 102, 241, 0.1);
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 0.25rem;

      @media (max-width: 768px) {
        display: none;
      }
    }

    :host ::ng-deep .mobile-menu-btn {
      display: none;

      @media (max-width: 768px) {
        display: inline-flex;
      }
    }
  `]
})
export class HeaderComponent {
  menuItems: MenuItem[] = [
    { label: 'Problems', icon: 'pi pi-book', routerLink: '/problems' },
    { label: 'Models', icon: 'pi pi-box', routerLink: '/gallery' },
    { separator: true },
    { label: 'GitHub', icon: 'pi pi-github', command: () => this.openGitHub() },
  ];

  openGitHub(): void {
    window.open('https://github.com/laniakea-project', '_blank');
  }

  toggleMobileMenu(): void {
    // Could emit event or use a service for mobile menu
  }
}
