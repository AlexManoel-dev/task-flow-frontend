import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  constructor(private apiService: ApiService) { }

  assignRoleToUser(userId: number, payload: { roleId: number }): Observable<any> {
    return this.apiService.post({
      url: `users/${userId}/roles`,
      payload: {
        roleId: payload.roleId
      }
    });
  }
}
