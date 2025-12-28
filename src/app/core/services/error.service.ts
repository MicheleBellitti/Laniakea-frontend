import { Injectable, signal } from '@angular/core';

export interface AppError {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: Date;
  dismissed: boolean;
}

@Injectable({ providedIn: 'root' })
export class ErrorService {
  private _errors = signal<AppError[]>([]);

  readonly errors = this._errors.asReadonly();

  addError(message: string, type: AppError['type'] = 'error'): string {
    const id = crypto.randomUUID();
    const error: AppError = {
      id,
      message,
      type,
      timestamp: new Date(),
      dismissed: false,
    };

    this._errors.update(errors => [...errors, error]);

    // Auto-dismiss after 5 seconds for non-errors
    if (type !== 'error') {
      setTimeout(() => this.dismiss(id), 5000);
    }

    return id;
  }

  dismiss(id: string): void {
    this._errors.update(errors =>
      errors.map(e => e.id === id ? { ...e, dismissed: true } : e)
    );

    // Clean up after animation
    setTimeout(() => {
      this._errors.update(errors => errors.filter(e => e.id !== id));
    }, 300);
  }

  dismissAll(): void {
    this._errors.set([]);
  }

  getActiveErrors(): AppError[] {
    return this._errors().filter(e => !e.dismissed);
  }
}
