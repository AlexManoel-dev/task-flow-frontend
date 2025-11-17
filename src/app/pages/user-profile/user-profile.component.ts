import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { IUser } from '../interfaces/user.data';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule],
  templateUrl: './user-profile.component.html'
})
export class UserProfileComponent implements OnInit {
  currentUser: IUser | null = null;
  isEditing = false;
  updateSuccess = false;

  profileForm = this.fb.group({
    fullName: ['', Validators.required],
    position: ['']
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userService.getUser().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.loadUserDataToForm();
        console.log('currentUser', this.currentUser);
      },
      error: (err) => {
        console.error('Erro ao recuperar perfil', err);
      }
    });
  }

  private loadUserDataToForm(): void {
    if (!this.currentUser) return;

    this.profileForm.patchValue({
      fullName: this.currentUser.fullName || '',
      position: this.currentUser.position || ''
    });
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      'admin': 'Administrador',
      'manager': 'Gerente',
      'Team Member': 'Membro'
    };
    return labels[role] || role;
  }

  getRoleBadgeClass(role: string): string {
    const classes: Record<string, string> = {
      'admin': 'bg-purple-100 text-purple-700 border-purple-200',
      'manager': 'bg-blue-100 text-blue-700 border-blue-200',
      'Team Member': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return classes[role] || 'bg-gray-100 text-gray-700 border-gray-200';
  }

  enableEdit(): void {
    this.isEditing = true;
    this.updateSuccess = false;
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.loadUserDataToForm();
  }

  saveProfile(): void {
    if (this.profileForm.invalid || !this.currentUser) {
      return;
    }

    const formValue = this.profileForm.value;

    this.currentUser = {
      ...this.currentUser,
      fullName: formValue.fullName || this.currentUser.fullName,
      position: formValue.position || this.currentUser.position
    };

    this.userService.updateUser(this.currentUser).subscribe({
      next: (res) => {
        this.isEditing = false;
        this.updateSuccess = true;
        setTimeout(() => {
          this.updateSuccess = false;
        }, 3000);
        this.userService.setUser(this.currentUser);
      },
      error: (err) => {
        console.log('Erro ao atualizar usuário', err);
      }
    })
  }
}