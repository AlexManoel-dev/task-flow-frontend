import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

export const adminGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const apiService = inject(ApiService);

  let isAdmin = false;

  try {
    const user = await firstValueFrom(
      apiService.get({ url: 'auth/session' })
    );

    isAdmin = (user as any).roles.includes('Administrator');
  } catch (err) {
    isAdmin = false;
    console.error('Erro verificar permissão', err);
  }

  // retorna boolean ou UrlTree
  return isAdmin ? true : router.createUrlTree(['/dashboard']);
};
