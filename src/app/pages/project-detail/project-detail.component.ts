import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { mockUsers } from '../../lib/mock-data';
import { ModalComponent } from '../../shared/modal/modal.component';
import { TaskService } from '../../services/task.service';
import { ToastrService } from 'ngx-toastr';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, ReactiveFormsModule, ModalComponent],
  templateUrl: './project-detail.component.html'
})
export class ProjectDetailComponent implements OnInit {
  projectId = this.route.snapshot.paramMap.get('id')!;
  project: any;
  tasks: any[] = [];
  users = mockUsers;
  taskTypes = ['feature', 'fix', 'refactor', 'docs', 'test', 'others'];
  isAddTaskModalOpen = false;
  isEditTaskModalOpen = false;
  isDeleteTaskModalOpen = false;
  selectedTask: any = null;
  openStatusDropdown: string | null = null;
  
  taskForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    status: ['Em progresso'],
    priority: ['medium'],
    startDate: [''],
    dueDate: [''],
    taskType: [''],
    assigneeId: [2],
  });

  constructor(
    private route: ActivatedRoute, 
    private data: DataService,
    private fb: FormBuilder,
    private taskService: TaskService,
    private toastr: ToastrService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.findProject();
    this.getTasks();
  }

  getOwnerName(ownerId: string): string {
    const owner = this.users.find(u => u.id === ownerId);
    return owner ? owner.fullName : 'Não atribuído';
  }

  getAssigneeName(assigneeId?: number): string {
    if (!assigneeId) return 'Não atribuído';
    const assignee = this.users.find(u => Number(u.id) === assigneeId);
    return assignee ? assignee.fullName : 'Não atribuído';
  }

  // Função para normalizar o status do backend para o formato do frontend
  normalizeStatus(status: string): 'todo' | 'in-progress' | 'completed' {
    const statusMap: Record<string, 'todo' | 'in-progress' | 'completed'> = {
      'A fazer': 'todo',
      'todo': 'todo',
      'Em progresso': 'in-progress',
      'in-progress': 'in-progress',
      'Concluída': 'completed',
      'completed': 'completed'
    };
    return statusMap[status] || 'todo';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'todo': 'A fazer',
      'in-progress': 'Em progresso',
      'completed': 'Concluída',
      'A fazer': 'A fazer',
      'Em progresso': 'Em progresso',
      'Concluída': 'Concluída'
    };
    return labels[status] || status;
  }

  // Traduz o tipo de prioridade
  getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      'low': 'Baixa',
      'medium': 'Média',
      'high': 'Alta'
    };
    return labels[priority] || priority;
  }

  private formatDate(date: string): string {
    return date?.split('T')[0];
  }

  reverseDate(date: string): string {
    return date?.split('-').reverse().join('-');
  }

  openAddTaskModal(): void {
    this.isAddTaskModalOpen = true;
  }

  closeAddTaskModal(): void {
    this.isAddTaskModalOpen = false;
    this.taskForm.reset({ 
      priority: 'medium',
      status: 'A fazer',
      assigneeId: 2
    });
  }

  getProjectStatus(status: string): string {
    return status.toLowerCase();
  }

  findProject(): void {
    this.projectService.findProject(Number(this.projectId)).subscribe({
      next: (res) => {
        console.log('project', res);
        const response = res;
        this.project = {
          ...response,
          startDate: this.formatDate(response.startDate),
          endDate: this.formatDate(response.endDate)
        };
      },
      error: (err) => {
        console.error('Erro ao criar tarefa', err);
      },
    });
  }

  getTasks(): void {
    this.taskService.getTasks(Number(this.projectId)).subscribe({
      next: (res) => {
        console.log('tasks', res);
        // Mapeia os dados do backend para incluir o status normalizado
        this.tasks = res.map((task: any) => ({
          ...task,
          normalizedStatus: this.normalizeStatus(task.status)
        }));
      },
      error: (err) => console.error('Erro ao buscar tarefas', err),
    });
  }

  createTask(): void {
    this.taskService.createTask(Number(this.projectId), this.taskForm.value).subscribe({
      next: (res) => {
        this.toastr.success('Tarefa criada com sucesso!', 'Sucesso!');
        this.getTasks(); // Recarrega as tarefas
      },
      error: (err) => {
        console.error('Erro ao criar tarefa', err);
        this.toastr.error('Erro ao criar tarefa', 'Erro!');
      },
    });
  }

  submitTask(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }
    this.createTask();
    this.closeAddTaskModal();
  }

  toggleStatusDropdown(taskId: number | string): void {
    const id = String(taskId);
    this.openStatusDropdown = this.openStatusDropdown === id ? null : id;
    console.log('Dropdown aberto para:', id, 'Estado atual:', this.openStatusDropdown);
  }

  updateTaskStatus(taskId: number | string, newStatus: 'todo' | 'in-progress' | 'completed'): void {
    // Converte o status para o formato do backend
    const statusMap: Record<string, string> = {
      'todo': 'A fazer',
      'in-progress': 'Em progresso',
      'completed': 'Concluída'
    };
    
    const backendStatus = statusMap[newStatus];
    
    // Chama a API para atualizar o status
    // this.taskService.updateTaskStatus(Number(taskId), backendStatus).subscribe({
    //   next: () => {
    //     // Atualiza localmente
    //     this.tasks = this.tasks.map(task => 
    //       task.id === taskId 
    //         ? { ...task, status: backendStatus, normalizedStatus: newStatus } 
    //         : task
    //     );
        
    //     this.openStatusDropdown = null;
    //     this.toastr.success('Status atualizado!', 'Sucesso!');
    //   },
    //   error: (err) => {
    //     console.error('Erro ao atualizar status', err);
    //     this.toastr.error('Erro ao atualizar status', 'Erro!');
    //   }
    // });
  }

  openEditTaskModal(task: any): void {
    console.log('Abrindo modal de edição para:', task);
    this.selectedTask = task;
    
    // Formata as datas para o formato do input date (YYYY-MM-DD)
    const formatDateForInput = (dateString: string | null) => {
      if (!dateString) return '';
      return dateString.split('T')[0];
    };
    
    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      startDate: formatDateForInput(task.startDate),
      dueDate: formatDateForInput(task.dueDate),
      taskType: task.taskType,
      assigneeId: task.assigneeId,
    });
    
    this.isEditTaskModalOpen = true;
  }

  closeEditTaskModal(): void {
    this.isEditTaskModalOpen = false;
    this.selectedTask = null;
    this.taskForm.reset({ 
      priority: 'medium',
      status: 'A fazer',
      assigneeId: 2
    });
  }

  updateTask(): void {
    if (this.taskForm.invalid || !this.selectedTask) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.taskService.updateTask(this.selectedTask.id, this.taskForm.value).subscribe({
      next: () => {
        this.toastr.success('Tarefa atualizada com sucesso!', 'Sucesso!');
        this.getTasks();
        this.closeEditTaskModal();
      },
      error: (err) => {
        console.error('Erro ao atualizar tarefa', err);
        this.toastr.error('Erro ao atualizar tarefa', 'Erro!');
      }
    });
  }

  openDeleteTaskModal(task: any): void {
    console.log('Abrindo modal de exclusão para:', task);
    this.selectedTask = task;
    this.isDeleteTaskModalOpen = true;
  }

  closeDeleteTaskModal(): void {
    this.isDeleteTaskModalOpen = false;
    this.selectedTask = null;
  }

  deleteTask(): void {
    if (!this.selectedTask) return;

    this.taskService.deleteTask(this.selectedTask.id).subscribe({
      next: () => {
        this.toastr.success('Tarefa excluída com sucesso!', 'Sucesso!');
        this.getTasks();
        this.closeDeleteTaskModal();
      },
      error: (err) => {
        console.error('Erro ao excluir tarefa', err);
        this.toastr.error('Erro ao excluir tarefa', 'Erro!');
      }
    });
  }
}