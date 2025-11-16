import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { firstValueFrom, catchError, of } from 'rxjs';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const apiService = inject(ApiService);
  const authService = inject(AuthService);

  let isLogged = false;

  try {
    const user = await firstValueFrom(
      apiService.get<{ id: number; name: string }>({ url: 'auth/session' })
    );

    // se deu certo, usuário está logado
    // authService.setCurrentUser(user); // atualiza o BehaviorSubject
    isLogged = true;
    authService.setIsLogged(true);
  } catch (err) {
    // se deu erro (401 ou outro), usuário não está logado
    isLogged = false;
    authService.setIsLogged(false);
    console.error('Erro ao logar usuário', err);
  }

  // retorna boolean ou UrlTree
  return isLogged ? true : router.createUrlTree(['/login']);
};
