import { Component, computed, OnInit, signal, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { mockUsers } from '../../lib/mock-data';
import { ModalComponent } from '../../shared/modal/modal.component';
import { ProjectService } from '../../services/project.service';
import { ToastrService } from 'ngx-toastr';
import { ProjectStatuses } from '../interfaces/project.data';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, NgClass, ReactiveFormsModule, ModalComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  query = signal('');
  users = mockUsers;
  isAddProjectModalOpen = false;
  isEditProjectModalOpen = false;
  isDeleteProjectModalOpen = false;
  openMenuId: string | null = null;
  selectedProject: any = null;
  projects: any = [];

  projectForm = this.fb.group({
    name: ['', Validators.required],
    projectKey: ['', Validators.required],
    description: [''],
    category: ['', Validators.required],
    startDate: [''],
    endDate: [''],
  });

  constructor(
    public data: DataService,
    private fb: FormBuilder,
    private projectService: ProjectService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.getProjects();
  }

  @HostListener('document:click')
  closeAllMenus() {
    this.openMenuId = null;
  }

  getProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (res) => {
        const projects = res;
        this.projects = projects.map((project: any) => ({
          ...project,
          startDate: this.formatDate(project?.startDate),
          endDate: this.formatDate(project?.endDate)
        }));
      },
    });
  }

  private formatDate(date: string): string {
    return date?.split('T')[0];
  }

  reverseDate(date: string): string {
    return date?.split('-').reverse().join('-');
  }

  filtered = computed(() => {
    const q = this.query().toLowerCase();
    return this.data.projects$.value.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q)
    );
  });

  updateQuery(value: string) {
    this.query.set(value);
  }

  toggleProjectMenu(projectId: string, event: Event) {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === projectId ? null : projectId;
  }

  // Add Project
  openAddProjectModal() {
    this.isAddProjectModalOpen = true;
  }

  closeAddProjectModal() {
    this.isAddProjectModalOpen = false;
    this.projectForm.reset();
  }

  getProjectStatus(status: string): string {
    return status.toLowerCase();
  }

  // TODO: Mudar os status para ficar com lowCase
  showProjectStatus(status: string): string {
    const statuses: Record<string, string> = {
      'Active': ProjectStatuses.active,
      'In_Progress': ProjectStatuses.in_progress,
      'Finalized': ProjectStatuses.finalized
    };
    return statuses[status];
  }

  createProject(): void {
    this.projectService.createProject(this.projectForm.value).subscribe({
      next: (res) => {
        this.toastr.success('Projeto criado com sucesso!', 'Sucesso!');
        this.getProjects();
      },
      error: (err) => console.error('Erro ao criar projeto', err),
    });
  }

  submitProject() {
    if (this.projectForm.invalid) {
      return;
    }
    this.createProject();
    this.closeAddProjectModal();
  }

  // Edit Project
  openEditProjectModal(project: any, event: Event) {
    event.stopPropagation();
    this.selectedProject = project;
    this.projectForm.patchValue({
      name: project.name,
      projectKey: project.projectKey,
      description: project.description,
      category: project.category,
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
  }

  updateProject() {
    if (this.projectForm.invalid || !this.selectedProject) {
      return;
    }

    this.projectService.updateProject(this.selectedProject.id, this.projectForm.value).subscribe({
      next: (res) => {
        this.toastr.success('Projeto atualizado com sucesso!', 'Sucesso!');
        this.getProjects();
        this.closeEditProjectModal();
      },
      error: (err) => {
        console.error('Erro ao atualizar projeto', err);
        this.toastr.error('Erro ao atualizar projeto', 'Erro!');
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
        this.toastr.error('Erro ao excluir projeto', 'Erro!');
      }
    });
  }
}