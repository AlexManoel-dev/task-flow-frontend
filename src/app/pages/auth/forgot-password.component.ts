import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  emailSent = false;
  isLoading = false;

  forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  get email() {
    return this.forgotPasswordForm.get('email');
  }

  sendResetLink() {
    console.log('sendResetLink');
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.isLoading = true;

    this.authService.forgotPassword(this.forgotPasswordForm.value.email as string).subscribe({
      next: (res) => {
        console.log('sendResetLink, deu bao');
        this.isLoading = false;
        this.emailSent = true;
      },
      error: (err) => {
        console.log('error', err);
      }
    });
  }

  backToForm() {
    this.emailSent = false;
    this.forgotPasswordForm.reset();
  }
}