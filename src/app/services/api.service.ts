import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

interface IRequest {
  url: string;
  body?: unknown;
  params?: unknown;
}

export interface IRequestWithPayload<T> extends IRequest {
  payload: T;
}

interface IHttpOptions {
  headers: HttpHeaders;
  params?: HttpParams;
}

// condition
const defaultUrl = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private httpClient: HttpClient) {}

  post<In,Out>(options: IRequestWithPayload<In>): Observable<Out> {
    return this.proxyRequest<In, Out>((req, httpOptions: IHttpOptions) => this.httpClient.post(`${defaultUrl}/${req.url}`, (req as IRequestWithPayload<In>).payload, httpOptions), options);
  }

  get<Out>(options: IRequest): Observable<Out> {
    return this.proxyRequest<never, Out>((req: IRequest, httpOptions: IHttpOptions) => this.httpClient.get(`${defaultUrl}/${req.url}`, httpOptions), options);
  }

  patch<In,Out>(options: IRequestWithPayload<In>): Observable<Out> {
    return this.proxyRequest<In,Out>((req, httpOptions: IHttpOptions) => this.httpClient.patch(`${defaultUrl}/${req.url}`, (req as IRequestWithPayload<In>).payload, httpOptions), options);
  }

  put<In,Out>(options: IRequestWithPayload<In>): Observable<Out> {
    return this.proxyRequest<In,Out>((req, httpOptions: IHttpOptions) => this.httpClient.put(`${defaultUrl}/${req.url}`, (req as IRequestWithPayload<In>).payload, httpOptions), options);
  }

  delete<Out>(options: IRequest): Observable<Out> {
    return this.proxyRequest<never, Out>((req: IRequest, httpOptions: IHttpOptions) => this.httpClient.delete(`${defaultUrl}/${req.url}`, httpOptions), options);
  }

  private proxyRequest<In,Out>(request: (options: IRequest | IRequestWithPayload<In>, httpOptions: IHttpOptions) => Observable<any>, params: IRequest | IRequestWithPayload<In>): Observable<Out> {
    let httpOptions: any = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      withCredentials: true
    };

    if (params.params) {
      let httpParams = new HttpParams();
      for (const [key, value] of Object.entries(params.params)) {
        httpParams = httpParams.append(key, value);
      }
      httpOptions.params = httpParams;
    }

    return request(params, httpOptions);
  }
}
