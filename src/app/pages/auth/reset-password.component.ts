// reset-password.component.ts
import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  passwordReset = false;
  isLoading = false;
  token: string | null = null;
  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  resetPasswordForm = this.fb.group({
    // oldPassword: ['', [Validators.required, Validators.minLength(6)]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, {
    validators: this.passwordMatchValidator
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Capturar o token da URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        // Se não houver token, redirecionar para forgot-password
        this.router.navigate(['/forgot-password']);
      }
    });
  }

  // Validator customizado para verificar se as senhas coincidem
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (!newPassword || !confirmPassword) {
      return null;
    }

    return newPassword.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  get oldPassword() {
    return this.resetPasswordForm.get('oldPassword');
  }

  get newPassword() {
    return this.resetPasswordForm.get('newPassword');
  }

  get confirmPassword() {
    return this.resetPasswordForm.get('confirmPassword');
  }

  get passwordsMatch() {
    return !this.resetPasswordForm.hasError('passwordMismatch');
  }

  togglePasswordVisibility(field: 'old' | 'new' | 'confirm') {
    if (field === 'old') {
      this.showOldPassword = !this.showOldPassword;
    } else if (field === 'new') {
      this.showNewPassword = !this.showNewPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  resetPassword() {
    if (this.resetPasswordForm.invalid || !this.token) {
      return;
    }

    this.isLoading = true;

    const payload = {
      token: this.token,
      // oldPassword: this.resetPasswordForm.value.oldPassword as string,
      newPassword: this.resetPasswordForm.value.newPassword as string
    };

    this.authService.resetPassword(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.passwordReset = true;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Erro ao redefinir senha:', err);
        // Aqui você pode adicionar um toast/alert de erro
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}