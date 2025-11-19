import { Component, OnInit, HostListener, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { mockUsers } from '../../lib/mock-data';
import { ModalComponent } from '../../shared/modal/modal.component';
import { TaskService } from '../../services/task.service';
import { ToastrService } from 'ngx-toastr';
import { ProjectService } from '../../services/project.service';
import { UserService } from '../../services/user.service';
import { CommentsAndAttachementsService } from '../../services/comments-and-attachements.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, ReactiveFormsModule, FormsModule, ModalComponent],
  templateUrl: './project-detail.component.html'
})
export class ProjectDetailComponent implements OnInit {
  projectId = this.route.snapshot.paramMap.get('id')!;
  project: any;
  tasks = signal<any[]>([]);
  query = signal('');
  statusFilter = signal<string>('all');
  priorityFilter = signal<string>('all');
  users: any = [];
  taskTypes = ['feature', 'fix', 'refactor', 'docs', 'test', 'others'];
  isAddTaskModalOpen = false;
  isEditTaskModalOpen = false;
  isDeleteTaskModalOpen = false;
  isTaskDetailModalOpen = false;
  selectedTask: any = null;
  openStatusDropdown: string | null = null;
  currentUser: any;
  activeTab: 'comments' | 'attachments' = 'comments'; // Nova propriedade
  
  // Comentários e Anexos
  comments = signal<any[]>([]);
  attachments = signal<any[]>([]);
  newComment = '';
  selectedFiles: File[] = [];
  
  taskForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    status: [''],
    priority: ['', Validators.required],
    startDate: ['', Validators.required],
    dueDate: ['', Validators.required],
    taskType: ['', Validators.required],
    assigneeId: [null, Validators.required],
  });

  filteredTasks = computed(() => {
    const q = this.query().toLowerCase();
    const statusF = this.statusFilter();
    const priorityF = this.priorityFilter();
    const tasksList = this.tasks();

    return tasksList.filter((task: any) => {
      const matchesQuery = !q || 
        task.title.toLowerCase().includes(q) ||
        (task.description && task.description.toLowerCase().includes(q)) ||
        (task.assignee?.fullName && task.assignee.fullName.toLowerCase().includes(q));

      const matchesStatus = statusF === 'all' || task.normalizedStatus === statusF;
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
    private userService: UserService,
    private commentsAndAttachementsService: CommentsAndAttachementsService
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

  formatDateTime(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  openAddTaskModal(): void {
  this.getUsers();
  // Reseta o form com valores vazios/default
  this.taskForm.reset({
    title: '',
    description: '',
    status: '',
    priority: '',
    startDate: '',
    dueDate: '',
    taskType: '',
    assigneeId: null
  });
  this.isAddTaskModalOpen = true;
}

  closeAddTaskModal(): void {
    this.isAddTaskModalOpen = false;
    this.taskForm.reset({ 
      priority: 'medium',
      status: 'todo',
      assigneeId: null
    });
  }

  getProjectStatus(status: string): string {
    return status.toLowerCase();
  }

  getProjectStatusBasedOnObject(status: string): string {
    const statusMap: Record<string, string> = {
      'active': 'Ativo',
      'in_progress': 'Em progresso',
      'done': 'Finalizado'
    };

    return statusMap[status];
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
        const tasksList = res.map((task: any) => ({
          ...task,
          normalizedStatus: this.normalizeStatus(task.status)
        }));
        this.tasks.set(tasksList);
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
        this.findProject();
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
        this.findProject();
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
      assigneeId: null
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
        this.closeDeleteTaskModal();
        this.getTasks();
        this.findProject();
      },
      error: (err) => {
        console.error('Erro ao excluir tarefa', err);
        this.toastr.error('Erro ao excluir tarefa', 'Erro!');
      }
    });
  }

  // ========== MODAL DE DETALHES DA TAREFA ==========
  openTaskDetailModal(task: any): void {
    this.selectedTask = task;
    this.activeTab = 'comments'; // Reset para tab de comentários
    this.isTaskDetailModalOpen = true;
    this.loadTaskComments(task.id);
    this.loadTaskAttachments(task.id);
  }

  closeTaskDetailModal(): void {
    this.isTaskDetailModalOpen = false;
    this.selectedTask = null;
    this.newComment = '';
    this.selectedFiles = [];
    this.comments.set([]);
    this.attachments.set([]);
    this.activeTab = 'comments';
  }

  // ========== COMENTÁRIOS ==========
  loadTaskComments(taskId: number): void {
    this.commentsAndAttachementsService.getTaskComments(taskId).subscribe({
      next: (res) => {
        console.log('comments', res);
        this.comments.set(res);
      },
      error: (err) => {
        console.error('Erro ao buscar comentários', err);
      }
    });
  }

  addComment(): void {
    if (!this.newComment.trim() || !this.selectedTask) return;

    const payload = {
      content: this.newComment,
      taskId: this.selectedTask.id,
      userId: this.currentUser.id
    };

    this.commentsAndAttachementsService.addCommentToTask(this.selectedTask.id, { body: payload.content }).subscribe({
      next: (res) => {
        this.toastr.success('Comentário adicionado!', 'Sucesso!');
        this.newComment = '';
        this.loadTaskComments(this.selectedTask.id);
      },
      error: (err) => {
        console.error('Erro ao adicionar comentário', err);
        this.toastr.error('Erro ao adicionar comentário', 'Erro!');
      }
    });
  }

  deleteComment(commentId: number): void {
    this.commentsAndAttachementsService.deleteCommentToTask(commentId).subscribe({
      next: () => {
        this.toastr.success('Comentário excluído!', 'Sucesso!');
        this.loadTaskComments(this.selectedTask.id);
      },
      error: (err) => {
        console.error('Erro ao excluir comentário', err);
        this.toastr.error('Erro ao excluir comentário', 'Erro!');
      }
    });
  }

  // ========== ANEXOS ==========
  loadTaskAttachments(taskId: number): void {
    this.commentsAndAttachementsService.getTaskAttachments(taskId).subscribe({
      next: (res) => {
        console.log('attachments', res);
        this.attachments.set(res);
      },
      error: (err) => {
        console.error('Erro ao buscar anexos', err);
      }
    });
  }

  onFileSelect(event: any): void {
    const files = event.target.files;
    if (files) {
      this.selectedFiles = Array.from(files);
    }
  }

  uploadAttachments(): void {
    if (this.selectedFiles.length === 0 || !this.selectedTask) return;

    const formData = new FormData();
    this.selectedFiles.forEach(file => {
      formData.append('file', file);
    });

    this.commentsAndAttachementsService.addAttachmentsToTask(this.selectedTask.id, formData).subscribe({
      next: (res) => {
        this.toastr.success('Anexos enviados!', 'Sucesso!');
        this.selectedFiles = [];
        this.loadTaskAttachments(this.selectedTask.id);
      },
      error: (err) => {
        console.error('Erro ao enviar anexos', err);
        this.toastr.error('Erro ao enviar anexos', 'Erro!');
      }
    });
  }

  deleteAttachment(attachmentId: number): void {
    this.commentsAndAttachementsService.deleteAttachmentToTask(attachmentId).subscribe({
      next: () => {
        this.toastr.success('Anexo excluído!', 'Sucesso!');
        this.loadTaskAttachments(this.selectedTask.id);
      },
      error: (err) => {
        console.error('Erro ao excluir anexo', err);
        this.toastr.error('Erro ao excluir anexo', 'Erro!');
      }
    });
  }

  downloadAttachment(attachment: any): void {
    const url = `${environment.baseUrl}${attachment.fileUrl}`;
    
    console.log('URL completa:', url); // Debug
    window.open(url, '_blank');
  }

  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    const iconMap: Record<string, string> = {
      'pdf': 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
      'doc': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'docx': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'xls': 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
      'xlsx': 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
      'jpg': 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
      'jpeg': 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
      'png': 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
      'zip': 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4'
    };

    return iconMap[extension || ''] || 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
  }
}