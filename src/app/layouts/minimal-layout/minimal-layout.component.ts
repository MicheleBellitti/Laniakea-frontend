import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-minimal-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="minimal-layout">
      <main class="minimal-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .minimal-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .minimal-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
  `]
})
export class MinimalLayoutComponent {}
