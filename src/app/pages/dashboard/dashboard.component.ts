// dashboard.component.ts - CÓDIGO COMPLETO
import { Component, computed, OnInit, signal, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { mockUsers } from '../../lib/mock-data';
import { ModalComponent } from '../../shared/modal/modal.component';
import { ProjectService } from '../../services/project.service';
import { ToastrService } from 'ngx-toastr';
import { ProjectStatuses } from '../interfaces/project.data';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, NgClass, ReactiveFormsModule, ModalComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  query = signal('');
  statusFilter = signal<string>('all');
  categoryFilter = signal<string>('all');
  isAddProjectModalOpen = false;
  isEditProjectModalOpen = false;
  isDeleteProjectModalOpen = false;
  isFinalizeProjectModalOpen = false;
  openMenuId: string | null = null;
  selectedProject: any = null;
  projects = signal<any[]>([]);
  categories: any = [];
  users: any[] = [];
  currentUser: any;

  projectForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    categoryId: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    memberIds: this.fb.array([])
  });

  get memberIds(): FormArray {
    return this.projectForm.get('memberIds') as FormArray;
  }

  filtered = computed(() => {
    const q = this.query().toLowerCase();
    const statusF = this.statusFilter();
    const categoryF = this.categoryFilter();
    const projectsList = this.projects();
    
    return projectsList.filter((p: any) => {
      // Filtro de texto
      const matchesQuery = !q || 
        p.name.toLowerCase().includes(q) || 
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.category?.name && p.category.name.toLowerCase().includes(q)) ||
        (p.manager?.fullName && p.manager.fullName.toLowerCase().includes(q));

      // Filtro de status
      const normalizedStatus = this.getProjectStatus(p.status);
      const matchesStatus = statusF === 'all' || normalizedStatus === statusF;

      // Filtro de categoria
      const matchesCategory = categoryF === 'all' || 
        (p.categoryId && p.categoryId.toString() === categoryF);

      return matchesQuery && matchesStatus && matchesCategory;
    });
  });

  constructor(
    public data: DataService,
    private fb: FormBuilder,
    private projectService: ProjectService,
    private toastr: ToastrService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.getProjects();
    this.getCategories();
    this.userService.getUser().subscribe({
      next: (res) => {
        this.currentUser = res;
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  @HostListener('document:click')
  closeAllMenus() {
    this.openMenuId = null;
  }

  updateQuery(value: string) {
    this.query.set(value);
  }

  updateStatusFilter(value: string): void {
    this.statusFilter.set(value);
  }

  updateCategoryFilter(value: string): void {
    this.categoryFilter.set(value);
  }

  clearFilters(): void {
    this.query.set('');
    this.statusFilter.set('all');
    this.categoryFilter.set('all');
  }

  getUsers(type: 'create' | 'update'): void {
    this.userService.getUsers().subscribe({
      next: (res: any) => {
        let blockedIds: any;
        if (type == 'create') {
          blockedIds = [this.currentUser.id, 1];
        } else if (type == 'update'){
          blockedIds = [1];
        }
        
        if(this.currentUser.id === 1) {
          blockedIds = [];
        }

        this.users = res.filter((user: any) => 
          !blockedIds.includes(user.id)
        );
      },
      error: (err) => console.error('Erro ao buscar usuários', err),
    });
  }

  getCategories(): void {
    this.projectService.getProjectCategories().subscribe({
      next: (res) => {
        this.categories = res;
      },
    });
  }

  getProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (res) => {
        const projectsList = res.map((project: any) => ({
          ...project,
          startDate: this.formatDate(project?.startDate),
          endDate: this.formatDate(project?.endDate)
        }));

        this.projects.set(projectsList);

        console.log('projetos', this.projects());
      },
    });
  }

  private formatDate(date: string): string {
    return date?.split('T')[0];
  }

  reverseDate(date: string): string {
    return date?.split('-').reverse().join('-');
  }

  toggleProjectMenu(projectId: string, event: Event) {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === projectId ? null : projectId;
  }

  openAddProjectModal() {
    this.getCategories();
    this.getUsers('create');
    this.memberIds.clear();
    this.isAddProjectModalOpen = true;
  }

  closeAddProjectModal() {
    this.isAddProjectModalOpen = false;
    this.projectForm.reset();
    this.memberIds.clear();
  }

  checkIfIsManagerOrAdmin(project: any): boolean {
    return project.managerId === this.currentUser.id || this.currentUser.roles.includes('Administrator');
  }

  getProjectStatus(status: string): string {
    return status.toLowerCase();
  }

  showProjectStatus(status: string): string {
    const statuses: Record<string, string> = {
      'active': ProjectStatuses.active,
      'in_progress': ProjectStatuses.in_progress,
      'done': ProjectStatuses.finalized
    };
    return statuses[status];
  }

  createProject(): void {
    const payload = {
      ...this.projectForm.value,
      categoryId: Number(this.projectForm.value.categoryId),
      memberIds: this.memberIds.value
    };

    console.log('Payload para criar projeto:', payload);

    this.projectService.createProject(payload).subscribe({
      next: (res) => {
        this.toastr.success('Projeto criado com sucesso!', 'Sucesso!');
        this.closeAddProjectModal();
        this.getProjects();
      },
      error: (err) => {
        console.error('Erro ao criar projeto', err);
        this.toastr.error('Erro ao criar projeto', 'Erro!');
      },
    });
  }

  submitProject() {
    if (this.projectForm.invalid) {
      return;
    }
    this.createProject();
  }

  openEditProjectModal(project: any, event: Event) {
    event.stopPropagation();
    this.getCategories();
    this.getUsers('update');
    this.selectedProject = project;
    
    this.memberIds.clear();
    if (project.members && Array.isArray(project.members)) {
      project.members.forEach((member: any) => {
        if (member.user && member.user.id) {
          this.memberIds.push(this.fb.control(member.user.id));
        }
      });
    }
    
    this.projectForm.patchValue({
      name: project.name,
      description: project.description,
      categoryId: Number(project.categoryId) as any,
      startDate: project.startDate,
      endDate: project.endDate
    });
    
    this.isEditProjectModalOpen = true;
    this.openMenuId = null;
  }

  closeEditProjectModal() {
    this.isEditProjectModalOpen = false;
    this.selectedProject = null;
    this.projectForm.reset();
    this.memberIds.clear();
  }

  updateProject() {
    if (this.projectForm.invalid || !this.selectedProject) {
      return;
    }

    const payload = {
      ...this.projectForm.value,
      categoryId: Number(this.projectForm.value.categoryId),
      memberIds: this.memberIds.value
    };

    console.log('Payload para atualizar projeto:', payload);

    this.projectService.updateProject(this.selectedProject.id, payload).subscribe({
      next: (res) => {
        this.toastr.success('Projeto atualizado com sucesso!', 'Sucesso!');
        this.getProjects();
        this.closeEditProjectModal();
      },
      error: (err) => {
        console.error('Erro ao atualizar projeto', err);
        if (err.status == 403) {
          this.toastr.warning('Não é possível atualizar um projeto em que você não é responsável', 'Aviso!');
          this.closeEditProjectModal();
        } else {
          this.toastr.error('Erro ao atualizar projeto', 'Erro!');
        }
      }
    });
  }

  openDeleteProjectModal(project: any, event: Event) {
    event.stopPropagation();
    this.selectedProject = project;
    this.isDeleteProjectModalOpen = true;
    this.openMenuId = null;
  }

  closeDeleteProjectModal() {
    this.isDeleteProjectModalOpen = false;
    this.selectedProject = null;
  }

  confirmDeleteProject() {
    if (!this.selectedProject) return;

    this.projectService.deleteProject(this.selectedProject.id).subscribe({
      next: (res) => {
        this.toastr.success('Projeto excluído com sucesso!', 'Sucesso!');
        this.getProjects();
        this.closeDeleteProjectModal();
      },
      error: (err) => {
        console.error('Erro ao excluir projeto', err);
        if (err.status == 403) {
          this.toastr.warning('Não é possível excluir um projeto em que você não é responsável', 'Aviso!');
          this.closeDeleteProjectModal();
        } else {
          this.toastr.error('Erro ao excluir projeto', 'Erro!');
        }
      }
    });
  }

  openFinalizeProjectModal(project: any, event: Event) {
    event.stopPropagation();
    this.selectedProject = project;
    this.isFinalizeProjectModalOpen = true;
    this.openMenuId = null;
  }

  closeFinalizeProjectModal() {
    this.isFinalizeProjectModalOpen = false;
    this.selectedProject = null;
  }

  confirmFinalizeProject() {
    if (!this.selectedProject) return;

    const payload = {
      status: 'done'
    };

    this.projectService.updateProject(this.selectedProject.id, payload).subscribe({
      next: (res) => {
        this.toastr.success('Projeto finalizado com sucesso!', 'Sucesso!');
        this.getProjects();
        this.closeFinalizeProjectModal();
      },
      error: (err) => {
        console.error('Erro ao finalizar projeto', err);
        if (err.status == 403) {
          this.toastr.warning('Não é possível finalizar um projeto em que você não é responsável', 'Aviso!');
          this.closeFinalizeProjectModal();
        } else {
          this.toastr.error('Erro ao finalizar projeto', 'Erro!');
        }
      }
    });
  }

  isMemberSelected(userId: number): boolean {
    return this.memberIds.value.includes(userId);
  }

  toggleMemberSelection(userId: number): void {
    const index = this.memberIds.value.indexOf(userId);
    if (index > -1) {
      this.memberIds.removeAt(index);
    } else {
      this.memberIds.push(this.fb.control(userId));
    }
  }

  getSelectedMembers(): number[] {
    return this.memberIds.value;
  }

  getMemberName(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.fullName : '';
  }
}