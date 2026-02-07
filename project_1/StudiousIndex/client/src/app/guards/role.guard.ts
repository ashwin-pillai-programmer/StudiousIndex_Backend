import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const expectedRole = route.data['role'];

  if (authService.isLoggedIn() && authService.getUserRole() === expectedRole) {
    return true;
  }
  
  // If logged in but wrong role, maybe go home?
  // If not logged in, go to login.
  if (!authService.isLoggedIn()) {
      router.navigate(['/login']);
  } else {
      router.navigate(['/']); // Or access denied page
  }
  return false;
};
