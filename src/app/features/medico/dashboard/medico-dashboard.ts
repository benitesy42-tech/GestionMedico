import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CitasService } from '../../../core/services/citas.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { AuthService } from '../../../core/services/auth.service';
import { CitaView } from '../../../core/models/cita';

@Component({
  selector: 'app-medico-dashboard',
  imports: [DatePipe],
  templateUrl: './medico-dashboard.html',
})
export default class MedicoDashboardComponent {
  private citasSvc = inject(CitasService);
  private dashSvc = inject(DashboardService);
  private router = inject(Router);
  private auth = inject(AuthService);

  citasHoy = signal<CitaView[]>([]);
  stats = signal({ citasPendientes: 0, citasAtendidas: 0 });
  loading = signal(true);
  updating = signal<number | null>(null);

  agenda = computed(() => {
    const order: Record<string, number> = { Pendiente: 0, 'En Espera': 1, Atendida: 2, Cancelada: 3 };
    return [...this.citasHoy()].sort((a, b) => {
      const timeA = new Date(a.Fecha_Hora).getTime();
      const timeB = new Date(b.Fecha_Hora).getTime();
      if (timeA !== timeB) return timeA - timeB;
      return (order[a.Estado] || 0) - (order[b.Estado] || 0);
    });
  });

  get enEspera() {
    return this.citasHoy().filter((c) => c.Estado === 'En Espera');
  }

  get atendidas() {
    return this.citasHoy().filter((c) => c.Estado === 'Atendida');
  }

  constructor() {
    this.loadData();
    this.dashSvc.getStats().subscribe((data) =>
      this.stats.set(data),
    );
  }

  loadData(): void {
    this.loading.set(true);
    const idMedico = this.auth.currentUser()?.idMedico;
    if (!idMedico) return;
    this.citasSvc.getByMedico(idMedico).subscribe((data) => {
      const hoy = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
      this.citasHoy.set(data.filter(c => c.Fecha_Hora.startsWith(hoy)));
      this.loading.set(false);
    });
  }

  cambiarEstado(id: number, estado: string): void {
    this.updating.set(id);
    this.citasSvc.updateEstado(id, estado).subscribe(() => {
      this.updating.set(null);
      this.loadData();
    });
  }

  irAconsulta(id: number): void {
    this.router.navigate(['/medico/consulta', id]);
  }
}
