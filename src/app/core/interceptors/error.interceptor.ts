import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorService } from '../services/error.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private errorService = inject(ErrorService);

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let message = 'An unexpected error occurred';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          message = error.error.message;
        } else if (error.status === 0) {
          // Network error
          message = 'Unable to connect to the server. Please check your connection.';
        } else if (error.status === 404) {
          message = 'The requested resource was not found.';
        } else if (error.status === 500) {
          message = 'Server error. Please try again later.';
        } else if (error.error?.detail) {
          message = error.error.detail;
        } else if (error.error?.message) {
          message = error.error.message;
        }

        this.errorService.addError(message);

        return throwError(() => error);
      })
    );
  }
}
