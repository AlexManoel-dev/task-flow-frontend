import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ModalComponent } from '../../shared/modal/modal.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, ModalComponent],
  templateUrl: './user-list.component.html'
})
export class UsersListComponent {
  users = [
    { id: '1', fullName: 'Carlos Silva', email: 'carlos.silva@empresa.com', role: 'admin' },
    { id: '2', fullName: 'Ana Santos', email: 'ana.santos@empresa.com', role: 'manager' },
    { id: '3', fullName: 'Pedro Oliveira', email: 'pedro.oliveira@empresa.com', role: 'member' },
    { id: '4', fullName: 'Mariana Costa', email: 'mariana.costa@empresa.com', role: 'member' },
    { id: '5', fullName: 'Roberto Lima', email: 'roberto.lima@empresa.com', role: 'manager' },
    { id: '6', fullName: 'Juliana Ferreira', email: 'juliana.ferreira@empresa.com', role: 'member' },
    { id: '7', fullName: 'Fernando Alves', email: 'fernando.alves@empresa.com', role: 'admin' },
    { id: '8', fullName: 'Camila Rodrigues', email: 'camila.rodrigues@empresa.com', role: 'member' }
  ];

  filteredUsers = [...this.users];
  searchTerm = '';
  isAddUserModalOpen = false;
  isEditUserModalOpen = false;
  selectedUser: any = null;

  userForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['member', Validators.required]
  });

  constructor(private fb: FormBuilder) {}

  filterUsers(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value.toLowerCase();
    
    this.filteredUsers = this.users.filter(user => 
      user.fullName.toLowerCase().includes(this.searchTerm) ||
      user.email.toLowerCase().includes(this.searchTerm) ||
      user.role.toLowerCase().includes(this.searchTerm)
    );
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      'admin': 'Administrador',
      'manager': 'Gerente',
      'member': 'Membro'
    };
    return labels[role] || role;
  }

  getRoleBadgeClass(role: string): string {
    const classes: Record<string, string> = {
      'admin': 'bg-purple-100 text-purple-700 border-purple-200',
      'manager': 'bg-blue-100 text-blue-700 border-blue-200',
      'member': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return classes[role] || 'bg-gray-100 text-gray-700 border-gray-200';
  }

  openAddUserModal() {
    this.isAddUserModalOpen = true;
  }

  closeAddUserModal() {
    this.isAddUserModalOpen = false;
    this.userForm.reset({ role: 'member' });
  }

  submitUser() {
    if (this.userForm.invalid) {
      return;
    }

    const newUser = {
      id: (this.users.length + 1).toString(),
      ...this.userForm.value
    };

    this.users.push(newUser as any);
    this.filteredUsers = [...this.users];
    this.closeAddUserModal();
  }

  openEditUserModal(user: any) {
    this.selectedUser = user;
    this.userForm.patchValue({
      fullName: user.fullName,
      email: user.email,
      role: user.role
    });
    this.isEditUserModalOpen = true;
  }

  closeEditUserModal() {
    this.isEditUserModalOpen = false;
    this.selectedUser = null;
    this.userForm.reset({ role: 'member' });
  }

  updateUser() {
    if (this.userForm.invalid || !this.selectedUser) {
      return;
    }

    const index = this.users.findIndex(u => u.id === this.selectedUser.id);
    if (index !== -1) {
      this.users[index] = {
        ...this.users[index],
        ...this.userForm.value
      } as any;
      this.filteredUsers = [...this.users];
    }
    
    this.closeEditUserModal();
  }
}