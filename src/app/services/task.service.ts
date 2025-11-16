import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

interface ITaskPayload {
  title: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  dueDate: string;
  taskType: string;
  assigneeId: number;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private apiService: ApiService) { }

  getTasks(projectId: number): Observable<any> {
    return this.apiService.get({ url: `projects/${projectId}/tasks` });
  }

  createTask(projectId: number, payload: any): Observable<any> {
    return this.apiService.post({
      url: `projects/${projectId}/tasks`,
      payload: {
        title: payload.title,
        description: payload.description,
        status: payload.status,
        priority: payload.priority,
        startDate: payload.startDate,
        dueDate: payload.dueDate,
        taskType: payload.taskType,
        assigneeId: payload.assigneeId
      }
    });
  }

  updateTask(taskId: number, payload: any): Observable<any> {
    return this.apiService.put({
      url: `tasks/${taskId}`,
      payload: {
        title: payload.title,
        description: payload.description,
        status: payload.status,
        priority: payload.priority,
        startDate: payload.startDate,
        dueDate: payload.dueDate,
        taskType: payload.taskType,
        assigneeId: payload.assigneeId
      }
    });
  }

  deleteTask(taskId: number): Observable<any> {
    return this.apiService.delete({
      url: `tasks/${taskId}`
    });
  }
}
