import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Especialidad } from '../models/especialidad';

@Injectable({ providedIn: 'root' })
export class EspecialidadesService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Especialidad[]> {
    return this.api.get<Especialidad[]>('/especialidades');
  }

  create(data: Especialidad): Observable<Especialidad> {
    return this.api.post<Especialidad>('/especialidades', data);
  }

  update(id: number, data: Partial<Especialidad>): Observable<Especialidad> {
    return this.api.put<Especialidad>(`/especialidades/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/especialidades/${id}`);
  }
}
