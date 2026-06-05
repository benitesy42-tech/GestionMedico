import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Examen, RangoReferencia } from '../models/examen';

@Injectable({ providedIn: 'root' })
export class ExamenesService {
  private api = inject(ApiService);

  getByPaciente(idPaciente: number, filters?: {
    tipo?: string; laboratorio?: string; estado?: string;
    desde?: string; hasta?: string; q?: string;
  }): Observable<Examen[]> {
    let params = new HttpParams();
    if (filters) {
      for (const [key, val] of Object.entries(filters)) {
        if (val) { params = params.set(key, val); }
      }
    }
    return this.api.get<Examen[]>(`/examenes/paciente/${idPaciente}`, params);
  }

  getById(id: number): Observable<Examen> {
    return this.api.get<Examen>(`/examenes/${id}`);
  }

  upload(formData: FormData): Observable<{ message: string; examen: Examen }> {
    return this.api.post<{ message: string; examen: Examen }>('/examenes/upload', formData);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/examenes/${id}`);
  }

  generarResumen(id: number): Observable<{ message: string; resumen?: { Resumen_Medico: string | null; Resumen_Paciente: string | null } }> {
    return this.api.post<{ message: string; resumen?: { Resumen_Medico: string | null; Resumen_Paciente: string | null } }>(`/examenes/${id}/generar-resumen`, {});
  }

  actualizarValores(id: number, valores: any[]): Observable<{ message: string; estadoAlerta: string }> {
    return this.api.put<{ message: string; estadoAlerta: string }>(`/examenes/${id}/valores`, { valores });
  }

  getArchivoUrl(id: number): string {
    const token = localStorage.getItem('token');
    return `${this.api['baseUrl']}/examenes/${id}/archivo?token=${token}`;
  }

  getRangos(): Observable<RangoReferencia[]> {
    return this.api.get<RangoReferencia[]>('/examenes/rangos');
  }

  actualizarRango(id: number, data: Partial<RangoReferencia>): Observable<{ message: string }> {
    return this.api.put<{ message: string }>(`/examenes/rangos/${id}`, data);
  }
}
