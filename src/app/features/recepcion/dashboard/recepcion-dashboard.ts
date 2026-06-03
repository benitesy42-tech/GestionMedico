import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CitasService } from '../../../core/services/citas.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { CitaView } from '../../../core/models/cita';

@Component({
  selector: 'app-recepcion-dashboard',
  imports: [FormsModule, RouterLink, DatePipe],
  templateUrl: './recepcion-dashboard.html',
})
export default class RecepcionDashboardComponent {
  private citasSvc = inject(CitasService);
  private dashSvc = inject(DashboardService);

  citas = signal<CitaView[]>([]);
  stats = signal({ citasHoy: 0, citasPendientes: 0, citasAtendidas: 0, ingresosHoy: 0 });
  loading = signal(true);
  fechaSeleccionada = signal(new Date().toISOString().split('T')[0]);

  constructor() {
    this.cargarCitas();
    this.dashSvc.getStats().subscribe((data) =>
      this.stats.set(data),
    );
  }

  cargarCitas(): void {
    this.loading.set(true);
    this.citasSvc.getByDate(this.fechaSeleccionada()).subscribe((data) => {
      this.citas.set(data);
      this.loading.set(false);
    });
  }

  cambiarFecha(fecha: string): void {
    this.fechaSeleccionada.set(fecha);
    this.cargarCitas();
  }

  marcarEnEspera(id: number): void {
    this.citasSvc.updateEstado(id, 'En Espera').subscribe(() =>
      this.cargarCitas(),
    );
  }

  getBadgeClass(estado: string): string {
    const map: Record<string, string> = {
      Pendiente: 'bg-secondary bg-opacity-10 text-secondary',
      'En Espera': 'bg-warning bg-opacity-10 text-warning',
      Atendida: 'bg-success bg-opacity-10 text-success',
      Cancelada: 'bg-danger bg-opacity-10 text-danger',
      Reprogramada: 'bg-info bg-opacity-10 text-info',
    };
    return map[estado] || 'bg-secondary bg-opacity-10 text-secondary';
  }
}
