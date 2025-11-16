import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import type { Project, Task } from '../lib/mock-data';
import { mockProjects as seedProjects, mockTasks as seedTasks, categories as seedCategories } from '../lib/mock-data';

@Injectable({ providedIn: 'root' })
export class DataService {
  projects$ = new BehaviorSubject<Project[]>([...seedProjects]);
  tasks$ = new BehaviorSubject<Task[]>([...seedTasks]);
  categories: string[] = [...seedCategories] as any;

  getProject(id: string) {
    return this.projects$.value.find(p => p.id === id) || null;
  }
  getTasksForProject(id: string) {
    return this.tasks$.value.filter(t => t.projectId === id);
  }
  updateProjectProgress(id: string, progress: number) {
    const arr = this.projects$.value.map(p => p.id === id ? { ...p, progress } : p);
    this.projects$.next(arr);
  }
}
