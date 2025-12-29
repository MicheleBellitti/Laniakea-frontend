import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _activeRequests = signal(0);

  readonly loading = computed(() => this._activeRequests() > 0);
  readonly requestCount = this._activeRequests.asReadonly();

  show(): void {
    this._activeRequests.update(count => count + 1);
  }

  hide(): void {
    this._activeRequests.update(count => Math.max(0, count - 1));
  }

  reset(): void {
    this._activeRequests.set(0);
  }
}
