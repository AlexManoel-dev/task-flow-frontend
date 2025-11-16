import { NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { UIButtonComponent } from '../../../shared/ui-button.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgClass, UIButtonComponent, NgIf],
  templateUrl: './auth-layout.component.html'
})
export class AuthLayoutComponent implements OnInit {
  isLogged!: boolean;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.isLogged$.subscribe((isLogged) => {
      console.log("isLogged", isLogged);
      this.isLogged = isLogged;
    });
  }

  isAuthPage(): boolean {
    return ['/login', '/register'].includes(this.router.url);
  }

  login(): void {
    this.router.navigateByUrl('/login');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

}
