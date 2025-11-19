import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UIButtonComponent } from '../../shared/ui-button.component';
import { NgIf } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, UIButtonComponent, NgIf],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private apiService: ApiService
  ) {
    // Criamos o form reativo com os campos e suas validações
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      position: ['user']
    }, { validators: this.passwordMatchValidator });
  }

  // Validador customizado para verificar se as senhas coincidem
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  get strengthScore(): number {
    const pwd = this.password?.value ?? "";

    let score = 0;

    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    const longEnoughMedium = pwd.length >= 6;
    const longEnoughStrong = pwd.length >= 10;

    // Começa fraca se tiver qualquer conteúdo
    if (pwd.length > 0) score = 1;

    // Média: 6+ chars, maiúscula, minúscula e número
    if (hasLower && hasUpper && hasNumber && longEnoughMedium) {
      score = 2;
    }

    // Forte: 10+ chars + todos os requisitos
    if (hasLower && hasUpper && hasNumber && hasSpecial && longEnoughStrong) {
      score = 3;
    }

    return score;
  }


  submit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const userData = this.registerForm.value;
    this.auth.register(userData);
    this.router.navigateByUrl('/login');
  }

  // Getters para facilitar uso no HTML (mostrar erros)
  get fullName() { return this.registerForm.get('fullName'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
}