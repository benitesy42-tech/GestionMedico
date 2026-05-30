import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ConsultaMedica } from '../models/consulta';

@Injectable({ providedIn: 'root' })
export class ConsultasService {
  constructor(private api: ApiService) {}

  getHistorialByPaciente(idPaciente: number): Observable<ConsultaMedica[]> {
    return this.api.get<ConsultaMedica[]>(`/consultas/paciente/${idPaciente}`);
  }

  create(data: ConsultaMedica): Observable<ConsultaMedica> {
    return this.api.post<ConsultaMedica>('/consultas', data);
  }
}
