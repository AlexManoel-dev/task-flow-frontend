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
  isAddProjectModalOpen = false;
  isEditProjectModalOpen = false;
  isDeleteProjectModalOpen = false;
  openMenuId: string | null = null;
  selectedProject: any = null;
  projects = signal<any[]>([]); // 👈 Agora é um signal
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

  // 👇 Computed que reage aos signals
  filtered = computed(() => {
    const q = this.query().toLowerCase();
    const projectsList = this.projects();
    
    if (!q) return projectsList; // Se não tiver busca, retorna todos
    
    return projectsList.filter((p: any) => 
      p.name.toLowerCase().includes(q) || 
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.category?.name && p.category.name.toLowerCase().includes(q))
    );
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

  getUsers(type: 'create' | 'update'): void {
    this.userService.getUsers().subscribe({
      next: (res: any) => {
        let blockedIds;
        if (type == 'create') {
          blockedIds = [this.currentUser.id, 1];
        } else {
          blockedIds = [1];
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

        this.projects.set(projectsList); // 👈 Atualiza o signal

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

  updateQuery(value: string) {
    this.query.set(value);
  }

  toggleProjectMenu(projectId: string, event: Event) {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === projectId ? null : projectId;
  }

  // Add Project
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

  // TODO: Mudar os status para ficar com lowCase
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

  // Edit Project
  openEditProjectModal(project: any, event: Event) {
    event.stopPropagation();
    this.getCategories();
    this.getUsers('update');
    this.selectedProject = project;
    
    // Limpa o FormArray e adiciona os usuários do projeto
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

  // Delete Project
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

  // User Selection Methods
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