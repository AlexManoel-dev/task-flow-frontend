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
        projectKey: payload.projectKey.toUpperCase(),
        description: payload.description,
        category: payload.category,
        startDate: payload.startDate,
        endDate: payload.endDate
      }
    });
  }

  updateProject(projectId: number, payload: any): Observable<any> {
    return this.apiService.put({
      url: `projects/${projectId}`,
      payload: {
        name: payload.name,
        projectKey: payload.projectKey.toUpperCase(),
        description: payload.description,
        category: payload.category,
        startDate: payload.startDate,
        endDate: payload.endDate
      }
    });
  }
  
  deleteProject(projectId: number): Observable<any> {
    return this.apiService.delete({
      url: `projects/${projectId}`
    });
  }
}
