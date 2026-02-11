import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // On vérifie si le token existe
  if (authService.getToken()) {
    return true; // Accès autorisé
  } else {
    // Si pas de token, on redirige vers le login
    router.navigate(['/authentication/login']);
    return false; // Accès refusé
  }
};