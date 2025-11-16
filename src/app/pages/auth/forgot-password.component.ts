import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

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

  constructor(private fb: FormBuilder) {}

  get email() {
    return this.forgotPasswordForm.get('email');
  }

  sendResetLink() {
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.isLoading = true;

    // Simula envio de email
    setTimeout(() => {
      this.isLoading = false;
      this.emailSent = true;
    }, 1500);
  }

  backToForm() {
    this.emailSent = false;
    this.forgotPasswordForm.reset();
  }
}