import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  const isAuthRequest = req.url.includes('/api/Auth/login') || req.url.includes('/api/Auth/register');

  if (token) {
    // Only log for non-auth requests to reduce noise
    if (!isAuthRequest) {
      console.log(`[AuthInterceptor] Attaching token to: ${req.url}`);
    }
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  } else if (!isAuthRequest) {
    // Only warn if it's NOT a login/register request but token is missing
    console.warn(`[AuthInterceptor] No token found for protected resource: ${req.url}`);
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
