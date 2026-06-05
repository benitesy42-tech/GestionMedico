import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiBaseUrl;
  private cache = new Map<string, Observable<unknown>>();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }

  get<T>(path: string, params?: HttpParams, useCache = false): Observable<T> {
    const cacheKey = useCache ? `GET:${path}${params?.toString() || ''}` : '';
    if (useCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as Observable<T>;
    }
    const req = this.http.get<T>(`${this.baseUrl}${path}`, {
      headers: this.getHeaders(),
      params,
    }).pipe(shareReplay(1));
    if (useCache) {
      this.cache.set(cacheKey, req);
    }
    return req;
  }

  invalidateCache(pathPrefix?: string): void {
    if (pathPrefix) {
      for (const key of this.cache.keys()) {
        if (key.includes(pathPrefix)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  post<T>(path: string, body: unknown): Observable<T> {
    this.invalidateCache(path);
    return this.http.post<T>(`${this.baseUrl}${path}`, body, {
      headers: this.getHeaders(),
    });
  }

  put<T>(path: string, body: unknown): Observable<T> {
    this.invalidateCache(path);
    return this.http.put<T>(`${this.baseUrl}${path}`, body, {
      headers: this.getHeaders(),
    });
  }

  delete<T>(path: string): Observable<T> {
    this.invalidateCache(path);
    return this.http.delete<T>(`${this.baseUrl}${path}`, {
      headers: this.getHeaders(),
    });
  }
}
