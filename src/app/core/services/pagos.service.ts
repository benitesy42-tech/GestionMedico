import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Pago } from '../models/pago';

@Injectable({ providedIn: 'root' })
export class PagosService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Pago[]> {
    return this.api.get<Pago[]>('/pagos');
  }

  getReporte(fechaInicio: string, fechaFin: string): Observable<Pago[]> {
    return this.api.get<Pago[]>(`/pagos/reporte?inicio=${fechaInicio}&fin=${fechaFin}`);
  }

  create(data: Pago): Observable<Pago> {
    return this.api.post<Pago>('/pagos', data);
  }

  anular(id: number): Observable<Pago> {
    return this.api.put<Pago>(`/pagos/${id}`, { Estado_Pago: 'Anulado' });
  }
}
