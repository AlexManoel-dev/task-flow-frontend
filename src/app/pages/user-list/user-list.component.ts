import { Component, HostListener, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ModalComponent } from '../../shared/modal/modal.component';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, ModalComponent],
  templateUrl: './user-list.component.html'
})
export class UsersListComponent implements OnInit {
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

  // Formulário para CRIAR usuário (com senha)
  createUserForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
    // role: ['member', Validators.required],
    position: ['']
  });

  // Formulário para EDITAR usuário (sem senha)
  editUserForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    position: ['']
  });

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private roleService: RoleService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.getUsers();
  }

  @HostListener('document:click')
  closeAllMenus() {
    this.openMenuId = null;
  }

  getUsers(): void {
    this.userService.getUsersAdmin().subscribe({
      next: (res) => {
        console.log('response', res);
        this.users = res as any;
        this.filteredUsers = res as any;
      },
      error: (err) => {
        console.log('error', err);
        this.toastr.error('Erro ao carregar usuários', 'Erro!');
      }
    });
  }

  passwordsMatch(): boolean {
    const password = this.createUserForm.get('password')?.value;
    const confirmPassword = this.createUserForm.get('confirmPassword')?.value;
    return password === confirmPassword;
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
      this.getRoleLabel(user.roles[0]?.role?.name || '').toLowerCase().includes(this.searchTerm)
    );
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      'Administrator': 'Administrador',
      'Manager': 'Gerente',
      'Member': 'Membro',
      'admin': 'Administrador',
      'manager': 'Gerente',
      'member': 'Membro'
    };
    return labels[role] || role;
  }

  getRoleBadgeClass(role: string): string {
    const normalizedRole = role.toLowerCase();
    const classes: Record<string, string> = {
      'administrator': 'bg-purple-100 text-purple-700 border-purple-200',
      'admin': 'bg-purple-100 text-purple-700 border-purple-200',
      'manager': 'bg-blue-100 text-blue-700 border-blue-200',
      'member': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return classes[normalizedRole] || 'bg-gray-100 text-gray-700 border-gray-200';
  }

  // Verifica se o usuário é Admin
  isUserAdmin(user: any): boolean {
    return user.roles?.some((r: any) => 
      r.role?.name?.toLowerCase() === 'administrator' || 
      r.role?.name?.toLowerCase() === 'admin'
    ) || false;
  }

  // Toggle Admin Status
  toggleAdminStatus(user: any, event: Event): void {
    event.stopPropagation();
    
    const isCurrentlyAdmin = this.isUserAdmin(user);
    const newRole = isCurrentlyAdmin ? 'Member' : 'Administrator';
    
    console.log(`Alterando role de ${user.fullName} para ${newRole}`);

    // Chama a rota do backend para atualizar o role
    this.userService.toggleAdmin(user.id, {}).subscribe({
      next: (res) => {
        console.log('Role atualizado:', res);
        this.toastr.success(
          `${user.fullName} ${isCurrentlyAdmin ? 'não é mais' : 'agora é'} administrador`,
          'Sucesso!'
        );
        this.getUsers(); // Recarrega a lista
      },
      error: (err) => {
        console.error('Erro ao atualizar role:', err);
        this.toastr.error('Erro ao atualizar permissões', 'Erro!');
      }
    });
  }

  // ========== ADD USER ==========
  openAddUserModal() {
    this.createUserForm.reset({
      fullName: '',
      email: '',
      password: '',
      // role: 'member',
      position: ''
    });
    this.isAddUserModalOpen = true;
  }

  closeAddUserModal() {
    this.isAddUserModalOpen = false;
    // this.createUserForm.reset({ role: 'member' });
  }

  submitUser() {
    if (this.createUserForm.invalid) {
      this.createUserForm.markAllAsTouched();
      return;
    }

    if (!this.passwordsMatch()) {
      this.toastr.error('As senhas não coincidem', 'Erro!');
      return;
    }

    const payload = this.createUserForm.value;

    this.authService.registerToAdmin(payload as any).subscribe({
      next: (res) => {
        console.log('Usuário criado:', res);
        this.toastr.success('Usuário criado com sucesso!', 'Sucesso!');
        this.getUsers();
        this.closeAddUserModal();
      },
      error: (err) => {
        console.error('Erro ao criar usuário:', err);
        this.toastr.error('Erro ao criar usuário', 'Erro!');
      }
    });
  }

  // ========== EDIT USER ==========
  openEditUserModal(user: any) {
    this.selectedUser = user;
    this.editUserForm.patchValue({
      fullName: user.fullName,
      email: user.email,
      position: user.position
    });
    this.isEditUserModalOpen = true;
    this.openMenuId = null;
  }

  closeEditUserModal() {
    this.isEditUserModalOpen = false;
    this.selectedUser = null;
    this.editUserForm.reset();
  }

  updateUser() {
    if (this.editUserForm.invalid || !this.selectedUser) {
      this.editUserForm.markAllAsTouched();
      return;
    }

    const payload = this.editUserForm.value;

    this.userService.updateSpecificUser(this.selectedUser.id, payload as any).subscribe({
      next: (res) => {
        console.log('Usuário atualizado:', res);
        this.toastr.success('Usuário atualizado com sucesso!', 'Sucesso!');
        this.getUsers();
        this.closeEditUserModal();
      },
      error: (err) => {
        console.error('Erro ao atualizar usuário:', err);
        this.toastr.error('Erro ao atualizar usuário', 'Erro!');
      }
    });
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

    this.userService.deleteUser(this.selectedUser.id).subscribe({
      next: () => {
        console.log('Usuário excluído:', this.selectedUser);
        this.toastr.success('Usuário excluído com sucesso!', 'Sucesso!');
        this.getUsers();
        this.closeDeleteUserModal();
      },
      error: (err) => {
        console.error('Erro ao excluir usuário:', err);
        this.toastr.error('Erro ao excluir usuário', 'Erro!');
      }
    });
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

    this.userService.deactivateUser(this.selectedUser.id, {}).subscribe({
      next: () => {
        console.log('Usuário desativado:', this.selectedUser);
        this.toastr.success('Usuário desativado com sucesso!', 'Sucesso!');
        this.getUsers();
        this.closeDeactivateUserModal();
      },
      error: (err) => {
        console.error('Erro ao desativar usuário:', err);
        this.toastr.error('Erro ao desativar usuário', 'Erro!');
      }
    });
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

    this.userService.activateUser(this.selectedUser.id, {}).subscribe({
      next: () => {
        console.log('Usuário desativado:', this.selectedUser);
        this.toastr.success('Usuário desativado com sucesso!', 'Sucesso!');
        this.getUsers();
        this.closeReactivateUserModal();
      },
      error: (err) => {
        console.error('Erro ao desativar usuário:', err);
        this.toastr.error('Erro ao desativar usuário', 'Erro!');
      }
    });
  }
}