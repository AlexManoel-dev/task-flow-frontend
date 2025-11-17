import { Component, OnInit, HostListener, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { mockUsers } from '../../lib/mock-data';
import { ModalComponent } from '../../shared/modal/modal.component';
import { TaskService } from '../../services/task.service';
import { ToastrService } from 'ngx-toastr';
import { ProjectService } from '../../services/project.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, ReactiveFormsModule, ModalComponent],
  templateUrl: './project-detail.component.html'
})
export class ProjectDetailComponent implements OnInit {
  projectId = this.route.snapshot.paramMap.get('id')!;
  project: any;
  tasks = signal<any[]>([]); // 👈 Agora é signal
  query = signal(''); // 👈 Signal para busca
  statusFilter = signal<string>('all'); // 👈 Signal para filtro de status
  priorityFilter = signal<string>('all'); // 👈 Signal para filtro de prioridade
  users: any = [];
  taskTypes = ['feature', 'fix', 'refactor', 'docs', 'test', 'others'];
  isAddTaskModalOpen = false;
  isEditTaskModalOpen = false;
  isDeleteTaskModalOpen = false;
  selectedTask: any = null;
  openStatusDropdown: string | null = null;
  currentUser: any;
  
  taskForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    status: [''],
    priority: [''],
    startDate: [''],
    dueDate: [''],
    taskType: [''],
    assigneeId: [2],
  });

  // 👇 Computed que filtra as tarefas
  filteredTasks = computed(() => {
    const q = this.query().toLowerCase();
    const statusF = this.statusFilter();
    const priorityF = this.priorityFilter();
    const tasksList = this.tasks();

    return tasksList.filter((task: any) => {
      // Filtro de texto
      const matchesQuery = !q || 
        task.title.toLowerCase().includes(q) ||
        (task.description && task.description.toLowerCase().includes(q)) ||
        (task.assignee?.fullName && task.assignee.fullName.toLowerCase().includes(q));

      // Filtro de status
      const matchesStatus = statusF === 'all' || task.normalizedStatus === statusF;

      // Filtro de prioridade
      const matchesPriority = priorityF === 'all' || task.priority === priorityF;

      return matchesQuery && matchesStatus && matchesPriority;
    });
  });

  constructor(
    private route: ActivatedRoute, 
    private data: DataService,
    private fb: FormBuilder,
    private taskService: TaskService,
    private toastr: ToastrService,
    private projectService: ProjectService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.findProject();
    this.getTasks();
    this.userService.getUser().subscribe({
      next: (res) => {
        this.currentUser = res;
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  updateQuery(value: string): void {
    this.query.set(value);
  }

  updateStatusFilter(value: string): void {
    this.statusFilter.set(value);
  }

  updatePriorityFilter(value: string): void {
    this.priorityFilter.set(value);
  }

  clearFilters(): void {
    this.query.set('');
    this.statusFilter.set('all');
    this.priorityFilter.set('all');
  }

  getOwnerName(ownerId: string): string {
    const owner = this.users.find((u: any) => u.id === ownerId);
    return owner ? owner.fullName : 'Não atribuído';
  }

  getAssigneeName(assigneeId?: number): string {
    if (!assigneeId) return 'Não atribuído';
    const assignee = this.users.find((u: any) => Number(u.id) === assigneeId);
    return assignee ? assignee.fullName : 'Não atribuído';
  }

  // Função para normalizar o status do backend para o formato do frontend
  normalizeStatus(status: string): 'todo' | 'in_progress' | 'done' {
    const statusMap: Record<string, 'todo' | 'in_progress' | 'done'> = {
      'A fazer': 'todo',
      'todo': 'todo',
      'Em progresso': 'in_progress',
      'in_progress': 'in_progress',
      'Concluída': 'done',
      'done': 'done'
    };
    return statusMap[status] || 'todo';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'todo': 'A fazer',
      'in_progress': 'Em progresso',
      'done': 'Concluída',
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
    this.getUsers();
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

  checkIfIsManagerOrAdmin(project: any): boolean {
    return project.managerId === this.currentUser.id || this.currentUser.roles.includes('Administrator');
  }

  checkIfIsResponsibleOrMember(task: any): boolean {
    const members = this.project.members.map((data: any) => data.userId);
    return task.assigneeId === this.currentUser.id && members.includes(this.currentUser.id) || this.checkIfIsManagerOrAdmin(this.project);
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

  getUsers(): void {
    this.projectService.getMembers(Number(this.projectId)).subscribe({
      next: (res) => {
        console.log('membros', res);
        this.users = res;
      },
      error: (err) => console.error('Erro ao buscar tarefas', err),
    });
  }

  getTasks(): void {
    this.taskService.getTasks(Number(this.projectId)).subscribe({
      next: (res) => {
        console.log('tasks', res);
        // Mapeia os dados do backend para incluir o status normalizado
        const tasksList = res.map((task: any) => ({
          ...task,
          normalizedStatus: this.normalizeStatus(task.status)
        }));
        this.tasks.set(tasksList); // 👈 Atualiza o signal
      },
      error: (err) => console.error('Erro ao buscar tarefas', err),
    });
  }

  createTask(): void {
    const payload = {
      ...this.taskForm.value,
      assigneeId: Number(this.taskForm.value.assigneeId),
      status: 'todo'
    };

    this.taskService.createTask(Number(this.projectId), payload).subscribe({
      next: (res) => {
        this.toastr.success('Tarefa criada com sucesso!', 'Sucesso!');
        this.closeAddTaskModal();
        this.getTasks();
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
  }

  toggleStatusDropdown(taskId: number | string): void {
    const id = String(taskId);
    this.openStatusDropdown = this.openStatusDropdown === id ? null : id;
    console.log('Dropdown aberto para:', id, 'Estado atual:', this.openStatusDropdown);
  }

  updateTaskStatus(taskId: number | string, newStatus: 'todo' | 'in_progress' | 'done'): void {
    // Converte o status para o formato do backend
    const statusMap: Record<string, string> = {
      'todo': 'A fazer',
      'in_progress': 'Em progresso',
      'done': 'Concluída'
    };
    
    const backendStatus = statusMap[newStatus];

    console.log('newStatus', newStatus);
    console.log('backendStatus', backendStatus);
    
    this.taskService.updateTaskStatus(Number(taskId), { status: newStatus }).subscribe({
      next: (res) => {
        console.log('res', res);
        this.openStatusDropdown = null;
        this.toastr.success('Status atualizado!', 'Sucesso!');
        this.getTasks();
      },
      error: (err) => {
        console.error('Erro ao atualizar status', err);
        this.toastr.error('Erro ao atualizar status', 'Erro!');
      }
    });
  }

  openEditTaskModal(task: any): void {
    this.getUsers();
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

    console.log('taskForm', this.taskForm.value);
    
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
    this.getUsers();
    if (this.taskForm.invalid || !this.selectedTask) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.taskForm.value,
      assigneeId: Number(this.taskForm.value.assigneeId)
    };

    this.taskService.updateTask(this.selectedTask.id, payload).subscribe({
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