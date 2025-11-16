import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UIButtonComponent } from '../../shared/ui-button.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, UIButtonComponent, NgIf],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  error = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  submit() {
    if (this.form.invalid) {
      this.error = 'Preencha todos os campos corretamente';
      return;
    }

    const { email, password } = this.form.value;
    const ok = this.auth.login({ email: email!, password: password! });

    if (ok) this.router.navigateByUrl('/dashboard');
    else this.error = 'Credenciais inválidas';
  }

  get email() {
    return this.form.get('email');
  }

  get password() {
    return this.form.get('password');
  }
}
