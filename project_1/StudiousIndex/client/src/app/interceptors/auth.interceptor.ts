import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // Don't clear session or redirect when logging in or registering
      const isAuthRequest = req.url.includes('/api/Auth/login') || req.url.includes('/api/Auth/register');
      if (isAuthRequest) {
        return throwError(() => err);
      }

      // Expired or invalid token / unauthorized → clear storage and redirect to login
      if (err.status === 401 || err.status === 403) {
        authService.logout();
        router.navigate(['/login']);
      }

      return throwError(() => err);
    })
  );
};
