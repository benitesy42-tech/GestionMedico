import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Paciente } from '../models/paciente';

@Injectable({ providedIn: 'root' })
export class PacientesService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Paciente[]> {
    return this.api.get<Paciente[]>('/pacientes');
  }

  getById(id: number): Observable<Paciente> {
    return this.api.get<Paciente>(`/pacientes/${id}`);
  }

  search(term: string): Observable<Paciente[]> {
    return this.api.get<Paciente[]>(`/pacientes/buscar/${term}`);
  }

  create(data: Paciente): Observable<Paciente> {
    return this.api.post<Paciente>('/pacientes', data);
  }

  update(id: number, data: Partial<Paciente>): Observable<Paciente> {
    return this.api.put<Paciente>(`/pacientes/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/pacientes/${id}`);
  }
}
