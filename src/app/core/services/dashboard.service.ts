import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface DashboardStats {
  medicos: number;
  pacientes: number;
  especialidades: number;
  citasHoy: number;
  citasPendientes: number;
  citasAtendidas: number;
  ingresosHoy: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private api: ApiService) {}

  getStats(): Observable<DashboardStats> {
    return this.api.get<DashboardStats>('/dashboard/stats');
  }
}
