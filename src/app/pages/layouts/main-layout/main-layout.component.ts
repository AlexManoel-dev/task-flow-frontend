import { NgClass, NgIf } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { UIButtonComponent } from '../../../shared/ui-button.component';
import { AuthService } from '../../../services/auth.service';
import { initFlowbite } from 'flowbite';
import { UserService } from '../../../services/user.service';
import { IUser } from '../../interfaces/user.data';
import { skip, take } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgClass, UIButtonComponent, NgIf],
  templateUrl: './main-layout.component.html'
})
export class MainLayoutComponent implements OnInit {
  isSidebarOpen = false;
  isUserMenuOpen = false;
  isEcommerceOpen = false;

  userData!: IUser;

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.getSession();

    this.userService.getUser().pipe(skip(1)).subscribe({
      next: (res) => {
        this.getSession();
      }});
  }

  getSession(): void {
    this.userService.getSession().pipe(take(1)).subscribe({
      next: res => {
        this.userData = res;
        this.userService.setUser(res);
        console.log('res', res);
      },
      error: err => console.error('Erro ao recuperar sessão', err),
    });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebarOnMobile() {
    if (window.innerWidth < 1024) {
      this.isSidebarOpen = false;
    }
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  toggleEcommerce() {
    this.isEcommerceOpen = !this.isEcommerceOpen;
  }

  logout() {
    this.authService.logout();
  }
}
