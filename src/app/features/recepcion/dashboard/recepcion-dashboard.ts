import { Component, inject, signal, computed } from '@angular/core';
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
  fechaSeleccionada = signal(new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]);

  tituloFecha = computed(() => {
    const hoy = new Date();
    const seleccionada = new Date(this.fechaSeleccionada() + 'T12:00:00');
    const diff = Math.round((seleccionada.getTime() - hoy.getTime()) / 86400000);
    if (diff === 0) return 'hoy';
    if (diff === 1) return 'mañana';
    if (diff === -1) return 'ayer';
    return seleccionada.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
  });

  constructor() {
    this.cargarTodo();
  }

  cargarTodo(): void {
    this.loading.set(true);
    const fecha = this.fechaSeleccionada();
    this.dashSvc.getStats(fecha).subscribe((data) => {
      this.stats.set(data);
    });
    this.citasSvc.getByDate(fecha).subscribe((data) => {
      this.citas.set(data);
      this.loading.set(false);
    });
  }

  cambiarFecha(fecha: string): void {
    this.fechaSeleccionada.set(fecha);
    this.cargarTodo();
  }

  marcarEnEspera(id: number): void {
    this.citasSvc.updateEstado(id, 'En Espera').subscribe(() =>
      this.cargarTodo(),
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
