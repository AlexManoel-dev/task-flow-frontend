import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/auth/login.component';
import { RegisterComponent } from './pages/auth/register.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProjectDetailComponent } from './pages/project-detail/project-detail.component';
import { AdminComponent } from './pages/admin/admin.component';
import { authGuard } from './guards/auth.guard';
import { MainLayoutComponent } from './pages/layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './pages/layouts/auth-layout/auth-layout.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { UsersListComponent } from './pages/user-list/user-list.component';
import { adminGuard } from './guards/admin.guard';
import { ResetPasswordComponent } from './pages/auth/reset-password.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  // { path: '', component: LandingComponent },
  { path: '', pathMatch: 'full', redirectTo: 'welcome' },
  {
    path: 'welcome',
    component: LandingComponent
  },
  {
    path: 'auth/reset-password',
    component: ResetPasswordComponent
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivateChild: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
      { path: 'dashboard/projects/:id', component: ProjectDetailComponent, canActivate: [authGuard] },
      { path: 'profile', component: UserProfileComponent },
      { path: 'users', component: UsersListComponent, canActivate: [adminGuard] },
      // TODO: Needs AdminGuard
      { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
    ]
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
    ]
  },
  { path: '**', component: NotFoundComponent }
];
