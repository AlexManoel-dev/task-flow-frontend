import { Component, HostListener, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ModalComponent } from '../../shared/modal/modal.component';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, ModalComponent],
  templateUrl: './user-list.component.html'
})
export class UsersListComponent implements OnInit {
  // { id: '1', fullName: 'Carlos Silva', email: 'carlos.silva@empresa.com', role: 'admin', isActive: true },
  users: any[] = [];

  filteredUsers = [...this.users];
  searchTerm = '';
  openMenuId: string | null = null;
  
  // Modals
  isAddUserModalOpen = false;
  isEditUserModalOpen = false;
  isDeleteUserModalOpen = false;
  isDeactivateUserModalOpen = false;
  isReactivateUserModalOpen = false;
  
  selectedUser: any = null;

  userForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['member', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.getUsers();
  }

  @HostListener('document:click')
  closeAllMenus() {
    this.openMenuId = null;
  }

  getUsers(): void {
    this.userService.getUsers().subscribe({
      next: (res) => {
        console.log('response', res);
        this.users = res as any;
        this.filteredUsers = res as any;
      },
      error: (err) => {
        console.log('error', err);
      }
    })
  }

  toggleUserMenu(userId: string, event: Event) {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === userId ? null : userId;
  }

  filterUsers(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value.toLowerCase();
    this.filteredUsers = this.users.filter(user => 
      user.fullName.toLowerCase().includes(this.searchTerm) ||
      user.email.toLowerCase().includes(this.searchTerm) ||
      user.roles[0].toLowerCase().includes(this.searchTerm)
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

  // ========== ADD USER ==========
  openAddUserModal() {
    this.isAddUserModalOpen = true;
  }

  closeAddUserModal() {
    this.isAddUserModalOpen = false;
    this.userForm.reset({ role: 'member' });
  }

  submitUser() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const newUser = {
      id: (this.users.length + 1).toString(),
      ...this.userForm.value,
      isActive: true
    };

    this.users.push(newUser as any);
    this.filteredUsers = [...this.users];
    this.closeAddUserModal();
    
    console.log('Usuário criado:', newUser);
  }

  // ========== EDIT USER ==========
  openEditUserModal(user: any) {
    this.selectedUser = user;
    this.userForm.patchValue({
      fullName: user.fullName,
      email: user.email,
      role: user.role
    });
    this.isEditUserModalOpen = true;
    this.openMenuId = null;
  }

  closeEditUserModal() {
    this.isEditUserModalOpen = false;
    this.selectedUser = null;
    this.userForm.reset({ role: 'member' });
  }

  updateUser() {
    if (this.userForm.invalid || !this.selectedUser) {
      this.userForm.markAllAsTouched();
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

    console.log('Usuário atualizado:', this.users[index]);
    this.closeEditUserModal();
  }

  // ========== DELETE USER ==========
  openDeleteUserModal(user: any) {
    this.selectedUser = user;
    this.isDeleteUserModalOpen = true;
    this.openMenuId = null;
  }

  closeDeleteUserModal() {
    this.isDeleteUserModalOpen = false;
    this.selectedUser = null;
  }

  confirmDeleteUser() {
    if (!this.selectedUser) return;

    const index = this.users.findIndex(u => u.id === this.selectedUser.id);
    if (index !== -1) {
      this.users.splice(index, 1);
      this.filteredUsers = [...this.users];
    }

    console.log('Usuário excluído:', this.selectedUser);
    this.closeDeleteUserModal();
  }

  // ========== DEACTIVATE USER ==========
  openDeactivateUserModal(user: any) {
    this.selectedUser = user;
    this.isDeactivateUserModalOpen = true;
    this.openMenuId = null;
  }

  closeDeactivateUserModal() {
    this.isDeactivateUserModalOpen = false;
    this.selectedUser = null;
  }

  confirmDeactivateUser() {
    if (!this.selectedUser) return;

    const index = this.users.findIndex(u => u.id === this.selectedUser.id);
    if (index !== -1) {
      this.users[index].isActive = false;
      this.filteredUsers = [...this.users];
    }

    console.log('Usuário desativado:', this.users[index]);
    this.closeDeactivateUserModal();
  }

  // ========== REACTIVATE USER ==========
  openReactivateUserModal(user: any) {
    this.selectedUser = user;
    this.isReactivateUserModalOpen = true;
    this.openMenuId = null;
  }

  closeReactivateUserModal() {
    this.isReactivateUserModalOpen = false;
    this.selectedUser = null;
  }

  confirmReactivateUser() {
    if (!this.selectedUser) return;

    const index = this.users.findIndex(u => u.id === this.selectedUser.id);
    if (index !== -1) {
      this.users[index].isActive = true;
      this.filteredUsers = [...this.users];
    }

    console.log('Usuário reativado:', this.users[index]);
    this.closeReactivateUserModal();
  }
}