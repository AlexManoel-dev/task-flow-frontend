import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { ToastrService } from 'ngx-toastr';
import { IUser } from '../pages/interfaces/user.data';
import { BehaviorSubject, distinctUntilChanged, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private router: Router,
    private apiService: ApiService,
    private toastr: ToastrService,
    private http: HttpClient
  ) {}

  private isAdmin = new BehaviorSubject<boolean>(false);

  admin$ = this.isAdmin.asObservable().pipe(
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
  );

  setIsAdmin(value: boolean) {
    this.isAdmin.next(value);
  }

  getIsAdmin(): Observable<boolean> {
    return this.admin$;
  }

  private userSubject = new BehaviorSubject<IUser | null>(null);

  user$ = this.userSubject.asObservable().pipe(
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
  );

  setUser(user: IUser | null) {
    this.userSubject.next(user);
  }

  getUser(): Observable<IUser | null> {
    return this.user$;
  }

  getUsers(): Observable<IUser> {
    return this.apiService.get<IUser>({ url: 'users' });
  }

  getUsersAdmin(): Observable<IUser> {
    return this.apiService.get<IUser>({ url: 'users/all' });
  }

  getSession(): Observable<IUser> {
    return this.apiService.get<IUser>({ url: 'auth/session' });
  }

  updateUser(payload: Partial<IUser>): Observable<unknown> {
    return this.apiService.put<IUser, unknown>({
      url: 'users/me',
      payload: {
        fullName: payload.fullName,
        avatarUrl: payload.avatarUrl,
        position: payload.position
      } as IUser
    });
  }

  updateSpecificUser(userId: number, payload: Partial<IUser>): Observable<unknown> {
    return this.apiService.put<IUser, unknown>({
      url: `users/${userId}`,
      payload: {
        fullName: payload.fullName,
        avatarUrl: payload.avatarUrl,
        position: payload.position
      } as IUser
    });
  }

  activateUser(userId: number, payload: Partial<IUser>): Observable<unknown> {
    return this.apiService.post<IUser, unknown>({
      url: `users/${userId}/activate`,
      payload: {} as any
    });
  }

  deactivateUser(userId: number, payload: Partial<IUser>): Observable<unknown> {
    return this.apiService.post<IUser, unknown>({
      url: `users/${userId}/deactivate`,
      payload: {} as any
    });
  }

  toggleAdmin(userId: number, payload: Partial<IUser>): Observable<unknown> {
    return this.apiService.post<IUser, unknown>({
      url: `users/${userId}/toggle-admin`,
      payload: {} as any
    });
  }

  deleteUser(userId: number): Observable<unknown> {
    return this.apiService.delete<unknown>({
      url: `users/${userId}`
    });
  }

  changerUserPhoto(formData: FormData): Observable<any> {
    const url = `${environment.apiUrl}/users/me/avatar`;
    
    return this.http.post(url, formData, {
      withCredentials: true
    });
  }
}
