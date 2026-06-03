import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Cita, CitaDto, CitaView } from '../models/cita';

@Injectable({ providedIn: 'root' })
export class CitasService {
  constructor(private api: ApiService) {}

  getAll(): Observable<CitaView[]> {
    return this.api.get<CitaView[]>('/citas');
  }

  getByMedico(idMedico: number): Observable<CitaView[]> {
    return this.api.get<CitaView[]>(`/citas/medico/${idMedico}`);
  }

  getByPaciente(idPaciente: number): Observable<CitaView[]> {
    return this.api.get<CitaView[]>(`/citas/paciente/${idPaciente}`);
  }

  getByDate(fecha: string): Observable<CitaView[]> {
    return this.api.get<CitaView[]>(`/citas/fecha/${fecha}`);
  }

  getToday(): Observable<CitaView[]> {
    return this.api.get<CitaView[]>('/citas/hoy');
  }

  create(data: CitaDto): Observable<Cita> {
    return this.api.post<Cita>('/citas', data);
  }

  updateEstado(id: number, estado: string): Observable<Cita> {
    return this.api.put<Cita>(`/citas/${id}`, { Estado: estado });
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/citas/${id}`);
  }
}
