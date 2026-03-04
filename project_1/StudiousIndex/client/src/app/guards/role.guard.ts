import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  return authService.isLoggedIn();
};
