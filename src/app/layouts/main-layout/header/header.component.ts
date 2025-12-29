import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="app-header">
      <div class="header-container">
        <!-- Logo -->
        <a routerLink="/" class="logo">
          <span class="logo-icon">◆</span>
          <span class="logo-text">Laniakea</span>
        </a>

        <!-- Navigation -->
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

        <!-- Actions -->
        <div class="header-actions">
          <a
            href="https://github.com"
            target="_blank"
            class="action-btn"
            title="View on GitHub"
          >
            <i class="pi pi-github"></i>
          </a>
        </div>

        <!-- Mobile Menu Button -->
        <button class="mobile-menu-btn" (click)="toggleMobileMenu()">
          <i class="pi pi-bars"></i>
        </button>
      </div>

      <!-- Mobile Navigation -->
      @if (mobileMenuOpen) {
        <nav class="mobile-nav">
          <a routerLink="/problems" routerLinkActive="active" class="mobile-nav-link" (click)="closeMobileMenu()">
            <i class="pi pi-book"></i>
            <span>Problems</span>
          </a>
          <a routerLink="/gallery" routerLinkActive="active" class="mobile-nav-link" (click)="closeMobileMenu()">
            <i class="pi pi-box"></i>
            <span>Models</span>
          </a>
        </nav>
      }
    </header>
  `,
  styles: [`
    .app-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(51, 65, 85, 0.5);
    }

    .header-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1600px;
      margin: 0 auto;
      padding: 0 1.5rem;
      height: 64px;
    }

    // ============================================
    // LOGO
    // ============================================
    .logo {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      text-decoration: none;
      color: #f1f5f9;
      font-weight: 700;
      font-size: 1.25rem;
      font-family: 'Space Grotesk', sans-serif;
      transition: all 0.2s ease;

      &:hover {
        color: #a78bfa;

        .logo-icon {
          transform: rotate(45deg) scale(1.1);
          text-shadow: 0 0 20px rgba(124, 58, 237, 0.8);
        }
      }
    }

    .logo-icon {
      font-size: 1.5rem;
      color: #7c3aed;
      transition: all 0.3s ease;
      text-shadow: 0 0 10px rgba(124, 58, 237, 0.5);
    }

    // ============================================
    // NAVIGATION
    // ============================================
    .header-nav {
      display: flex;
      gap: 0.25rem;

      @media (max-width: 768px) {
        display: none;
      }
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
      text-decoration: none;
      color: #94a3b8;
      font-size: 0.9rem;
      font-weight: 500;
      border-radius: 10px;
      transition: all 0.2s ease;

      i {
        font-size: 1rem;
      }

      &:hover {
        color: #f1f5f9;
        background: rgba(124, 58, 237, 0.1);
      }

      &.active {
        color: #a78bfa;
        background: rgba(124, 58, 237, 0.15);
      }
    }

    // ============================================
    // ACTIONS
    // ============================================
    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      @media (max-width: 768px) {
        display: none;
      }
    }

    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      color: #94a3b8;
      border-radius: 10px;
      transition: all 0.2s ease;

      &:hover {
        color: #f1f5f9;
        background: rgba(124, 58, 237, 0.1);
      }

      i {
        font-size: 1.25rem;
      }
    }

    // ============================================
    // MOBILE MENU
    // ============================================
    .mobile-menu-btn {
      display: none;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: transparent;
      border: none;
      color: #94a3b8;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;

      @media (max-width: 768px) {
        display: flex;
      }

      &:hover {
        color: #f1f5f9;
        background: rgba(124, 58, 237, 0.1);
      }

      i {
        font-size: 1.25rem;
      }
    }

    .mobile-nav {
      display: none;
      flex-direction: column;
      padding: 0.5rem 1rem 1rem;
      border-top: 1px solid rgba(51, 65, 85, 0.5);

      @media (max-width: 768px) {
        display: flex;
      }
    }

    .mobile-nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      text-decoration: none;
      color: #94a3b8;
      font-size: 1rem;
      border-radius: 10px;
      transition: all 0.2s ease;

      i {
        font-size: 1.125rem;
      }

      &:hover {
        color: #f1f5f9;
        background: rgba(124, 58, 237, 0.1);
      }

      &.active {
        color: #a78bfa;
        background: rgba(124, 58, 237, 0.15);
      }
    }
  `]
})
export class HeaderComponent {
  mobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
}
