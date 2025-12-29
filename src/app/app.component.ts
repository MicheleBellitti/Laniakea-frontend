import { Component, inject, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ErrorService } from './core/services/error.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule],
  providers: [MessageService],
  template: `
    <!-- Global Toast Notifications -->
    <p-toast position="top-right" />

    <!-- Cosmic Background -->
    <div class="cosmic-bg" aria-hidden="true">
      <div class="stars"></div>
    </div>

    <!-- Router Content -->
    <router-outlet />
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      position: relative;
    }

    .cosmic-bg {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: -1;
      overflow: hidden;
      background: linear-gradient(180deg, #030712, #0f172a);
    }

    .stars {
      position: absolute;
      inset: 0;
      background-image:
        radial-gradient(2px 2px at 20px 30px, rgba(255,255,255,0.25), transparent),
        radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.15), transparent),
        radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.3), transparent),
        radial-gradient(2px 2px at 160px 120px, rgba(255,255,255,0.2), transparent),
        radial-gradient(1px 1px at 230px 80px, rgba(255,255,255,0.15), transparent),
        radial-gradient(2px 2px at 300px 200px, rgba(255,255,255,0.25), transparent),
        radial-gradient(1px 1px at 400px 150px, rgba(255,255,255,0.3), transparent),
        radial-gradient(2px 2px at 500px 250px, rgba(255,255,255,0.2), transparent),
        radial-gradient(1px 1px at 600px 100px, rgba(255,255,255,0.25), transparent);
      background-size: 650px 500px;
      animation: stars-drift 120s linear infinite;
    }

    @keyframes stars-drift {
      from { transform: translateY(0); }
      to { transform: translateY(-500px); }
    }
  `]
})
export class AppComponent {
  title = 'Laniakea';

  private errorService = inject(ErrorService);
  private messageService = inject(MessageService);

  constructor() {
    effect(() => {
      const errors = this.errorService.errors();
      const activeErrors = errors.filter(e => !e.dismissed);

      activeErrors.forEach(error => {
        this.messageService.add({
          severity: error.type === 'error' ? 'error' : error.type === 'warning' ? 'warn' : 'info',
          summary: error.type === 'error' ? 'Error' : error.type === 'warning' ? 'Warning' : 'Info',
          detail: error.message,
          life: 5000,
          key: error.id
        });
        this.errorService.dismiss(error.id);
      });
    }, { allowSignalWrites: true });
  }
}
