import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import type { User } from '../lib/mock-data';
import { mockUsers } from '../lib/mock-data';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from './api.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private router: Router,
    private apiService: ApiService,
    private toastr: ToastrService
  ) {}

  private isLogged = new BehaviorSubject<boolean>(false);

  get isLogged$(): Observable<boolean> {
    return this.isLogged.asObservable();
  }

  setIsLogged(value: boolean) {
    this.isLogged.next(value);
  }

  register(user: User) {
    return this.apiService
    .post({ url: 'auth/register', payload: user })
    .subscribe({
      next: res => {
        this.toastr.success('Usuário cadastrado com sucesso!', 'Sucesso!')
      },
      error: err => console.error('Erro ao registrar usuário', err),
    });
  }
  
  login(user: { email: string; password: string; }) {
    return this.apiService
    .post({ url: 'auth/login', payload: user })
    .subscribe({
      next: res => {
        this.setIsLogged(true);
        this.router.navigateByUrl('/dashboard');
      },
      error: err => console.error('Erro ao logar usuário', err),
    });
  }

  logout() {
    return this.apiService.post({ url: 'auth/logout', payload: {} })
    .subscribe({
      next: res => {
        this.setIsLogged(false);
        this.router.navigate(['/login']);
      },
      error: err => console.error('Erro ao deslogar usuário', err),
    });
  }

}
