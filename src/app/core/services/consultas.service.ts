import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ConsultaMedica } from '../models/consulta';

@Injectable({ providedIn: 'root' })
export class ConsultasService {
  constructor(private api: ApiService) {}

  getHistorialByPaciente(idPaciente: number, desde?: string, hasta?: string): Observable<ConsultaMedica[]> {
    let params = '';
    if (desde || hasta) {
      const q = new URLSearchParams();
      if (desde) q.set('desde', desde);
      if (hasta) q.set('hasta', hasta);
      params = '?' + q.toString();
    }
    return this.api.get<ConsultaMedica[]>(`/consultas/paciente/${idPaciente}${params}`);
  }

  create(data: ConsultaMedica): Observable<ConsultaMedica> {
    return this.api.post<ConsultaMedica>('/consultas', data);
  }
}
