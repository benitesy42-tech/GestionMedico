import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CitasService } from '../../../core/services/citas.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { CitaView } from '../../../core/models/cita';

@Component({
  selector: 'app-medico-dashboard',
  imports: [RouterLink, DatePipe],
  templateUrl: './medico-dashboard.html',
})
export default class MedicoDashboardComponent {
  private citasSvc = inject(CitasService);
  private dashSvc = inject(DashboardService);

  citasHoy = signal<CitaView[]>([]);
  stats = signal({ citasPendientes: 0, citasAtendidas: 0 });
  loading = signal(true);

  constructor() {
    this.citasSvc.getToday().subscribe((data) => {
      this.citasHoy.set(data);
      this.loading.set(false);
    });
    this.dashSvc.getStats().subscribe((data) =>
      this.stats.set(data),
    );
  }

  get enEspera() {
    return this.citasHoy().filter((c) => c.Estado === 'En Espera');
  }

  get atendidas() {
    return this.citasHoy().filter((c) => c.Estado === 'Atendida');
  }
}
