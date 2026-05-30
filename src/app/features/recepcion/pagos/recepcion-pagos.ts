import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PagosService } from '../../../core/services/pagos.service';
import { Pago } from '../../../core/models/pago';

@Component({
  selector: 'app-recepcion-pagos',
  imports: [FormsModule],
  templateUrl: './recepcion-pagos.html',
})
export default class RecepcionPagosComponent {
  private pagosSvc = inject(PagosService);

  pagos = signal<Pago[]>([]);
  showForm = signal(false);
  loading = signal(false);

  form = { ID_Consulta: 0, Monto: 0 };

  constructor() {
    this.pagosSvc.getAll().subscribe((data) => this.pagos.set(data));
  }

  formatMonto(monto: number | string): string {
    return Number(monto).toFixed(2);
  }

  openNew(): void {
    this.form = { ID_Consulta: 0, Monto: 0 };
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
  }

  save(): void {
    this.loading.set(true);
    this.pagosSvc.create(this.form as Pago).subscribe(() => {
      this.loading.set(false);
      this.showForm.set(false);
      this.pagosSvc.getAll().subscribe((data) => this.pagos.set(data));
    });
  }

  anular(id: number): void {
    if (confirm('¿Anular este pago?')) {
      this.pagosSvc.anular(id).subscribe(() =>
        this.pagosSvc.getAll().subscribe((data) => this.pagos.set(data)),
      );
    }
  }
}
