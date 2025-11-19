import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommentsAndAttachementsService {

  constructor(
    private apiService: ApiService,
    private http: HttpClient
  ) { }

  // COMMENTS
  getTaskComments(taskId: number): Observable<any> {
    return this.apiService.get({
      url: `tasks/${taskId}/comments`
    });
  }
  
  addCommentToTask(taskId: number, payload: { body: string; }): Observable<any> {
    return this.apiService.post({
      url: `tasks/${taskId}/comments`,
      payload: {
        body: payload.body
      }
    });
  }

  updateCommentToTask(commentId: number, payload: { body: string; }): Observable<any> {
    return this.apiService.put({
      url: `comments/${commentId}`,
      payload: {
        body: payload.body
      }
    });
  }

  deleteCommentToTask(commentId: number): Observable<any> {
    return this.apiService.delete({
      url: `comments/${commentId}`
    });
  }

  // ATTACHMENTS
  getTaskAttachments(taskId: number): Observable<any> {
    return this.apiService.get({
      url: `tasks/${taskId}/attachments`
    });
  }

  addAttachmentsToTask(taskId: number, formData: FormData): Observable<any> {
    // Use o HttpClient diretamente para ter controle sobre o envio do FormData
    const url = `${environment.apiUrl}/tasks/${taskId}/attachments`;
    
    // IMPORTANTE: NÃO defina o Content-Type manualmente
    // O navegador vai definir automaticamente como multipart/form-data com o boundary correto
    return this.http.post(url, formData, {
      withCredentials: true
    });
  }
  
  deleteAttachmentToTask(commentId: number): Observable<any> {
    return this.apiService.delete({
      url: `attachments/${commentId}`
    });
  }
}
