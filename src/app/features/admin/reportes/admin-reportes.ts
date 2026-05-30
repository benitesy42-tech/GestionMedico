import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PagosService } from '../../../core/services/pagos.service';
import { Pago } from '../../../core/models/pago';

@Component({
  selector: 'app-admin-reportes',
  imports: [FormsModule, DatePipe],
  templateUrl: './admin-reportes.html',
})
export default class AdminReportesComponent {
  private pagosSvc = inject(PagosService);

  pagos = signal<Pago[]>([]);
  fechaInicio = signal('');
  fechaFin = signal('');
  total = signal(0);
  loading = signal(false);
  showReporte = signal(false);

  formatMonto(monto: number | string): string {
    return Number(monto).toFixed(2);
  }

  generateReporte(): void {
    if (!this.fechaInicio() || !this.fechaFin()) return;
    this.loading.set(true);
    this.pagosSvc.getReporte(this.fechaInicio(), this.fechaFin()).subscribe((data) => {
      this.pagos.set(data);
      this.total.set(data.reduce((acc, p) => acc + Number(p.Monto), 0));
      this.showReporte.set(true);
      this.loading.set(false);
    });
  }
}
