import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Medico, MedicoDto } from '../models/medico';

@Injectable({ providedIn: 'root' })
export class MedicosService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Medico[]> {
    return this.api.get<Medico[]>('/medicos');
  }

  getById(id: number): Observable<Medico> {
    return this.api.get<Medico>(`/medicos/${id}`);
  }

  create(data: MedicoDto): Observable<Medico> {
    return this.api.post<Medico>('/medicos', data);
  }

  update(id: number, data: Partial<MedicoDto>): Observable<Medico> {
    return this.api.put<Medico>(`/medicos/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/medicos/${id}`);
  }
}
