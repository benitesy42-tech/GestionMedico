import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { PagosService } from '../../../core/services/pagos.service';
import { Pago } from '../../../core/models/pago';

@Component({
  selector: 'app-recepcion-pagos',
  imports: [FormsModule, DatePipe],
  templateUrl: './recepcion-pagos.html',
})
export default class RecepcionPagosComponent {
  private pagosSvc = inject(PagosService);

  pagos = signal<Pago[]>([]);
  showForm = signal(false);
  loading = signal(false);
  errorMsg = signal('');

  form = { ID_Consulta: 0, Monto: 0 };

  constructor() {
    this.loadPagos();
  }

  private loadPagos(): void {
    this.pagosSvc.getAll().subscribe((data) => this.pagos.set(data));
  }

  formatMonto(monto: number | string): string {
    return Number(monto).toFixed(2);
  }

  openNew(): void {
    this.errorMsg.set('');
    this.form = { ID_Consulta: 0, Monto: 0 };
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.errorMsg.set('');
    this.showForm.set(false);
  }

  save(): void {
    this.errorMsg.set('');
    if (this.form.ID_Consulta <= 0) {
      this.errorMsg.set('El ID de consulta debe ser un número positivo');
      return;
    }
    if (this.form.Monto <= 0) {
      this.errorMsg.set('El monto debe ser mayor que cero');
      return;
    }
    this.loading.set(true);
    this.pagosSvc.create(this.form as Pago).subscribe({
      next: () => {
        this.loading.set(false);
        this.showForm.set(false);
        this.loadPagos();
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message || 'Error al registrar el pago. Verifique que la consulta exista.');
      },
    });
  }

  anular(id: number): void {
    if (confirm('¿Anular este pago?')) {
      this.pagosSvc.anular(id).subscribe(() => this.loadPagos());
    }
  }
}
