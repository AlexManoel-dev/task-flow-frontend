import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(private apiService: ApiService) { }

  getProjects(): Observable<any> {
    return this.apiService.get({ url: 'projects' });
  }

  findProject(projectId: number): Observable<any> {
    return this.apiService.get({ url: `projects/${projectId}` });
  }

  createProject(payload: any): Observable<any> {
    return this.apiService.post({
      url: 'projects',
      payload: {
        name: payload.name,
        description: payload.description,
        status: 'active',
        categoryId: payload.categoryId,
        startDate: payload.startDate,
        endDate: payload.endDate,
        memberIds: payload.memberIds
      }
    });
  }

  updateProject(projectId: number, payload: any): Observable<any> {
    return this.apiService.put({
      url: `projects/${projectId}`,
      payload: {
        name: payload.name,
        description: payload.description,
        status: 'active',
        categoryId: payload.categoryId,
        startDate: payload.startDate,
        endDate: payload.endDate,
        memberIds: payload.memberIds
      }
    });
  }
  
  deleteProject(projectId: number): Observable<any> {
    return this.apiService.delete({
      url: `projects/${projectId}`
    });
  }

  getProjectCategories(): Observable<any> {
    return this.apiService.get({ url: 'projects/categories' });
  }

  getMembers(projectId: number): Observable<any> {
    return this.apiService.get({ url: `projects/${projectId}/members` });
  }
}
