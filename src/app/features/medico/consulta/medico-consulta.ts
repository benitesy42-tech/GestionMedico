import { Component, inject, input, signal } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConsultasService } from '../../../core/services/consultas.service';
import { CitasService } from '../../../core/services/citas.service';
import { CitaView } from '../../../core/models/cita';

@Component({
  selector: 'app-medico-consulta',
  imports: [FormsModule, DatePipe],
  templateUrl: './medico-consulta.html',
})
export default class MedicoConsultaComponent {
  private consultasSvc = inject(ConsultasService);
  private citasSvc = inject(CitasService);
  private router = inject(Router);
  private location = inject(Location);

  readonly idCita = input.required<number>({ alias: 'idCita' });

  cita = signal<CitaView | null>(null);
  loading = signal(false);

  form = {
    Motivo: '',
    Sintomas: '',
    Diagnostico_Notas: '',
  };

  constructor() {
    this.citasSvc.getAll().subscribe((citas) => {
      const found = citas.find((c) => c.ID_Cita === Number(this.idCita()));
      this.cita.set(found || null);
    });
  }

  goBack(): void {
    this.location.back();
  }

  finalizar(): void {
    if (!this.form.Motivo || !this.form.Diagnostico_Notas) return;
    this.loading.set(true);
    this.consultasSvc
      .create({
        ID_Consulta: 0,
        ID_Cita: Number(this.idCita()),
        Motivo: this.form.Motivo,
        Sintomas: this.form.Sintomas,
        Diagnostico_Notas: this.form.Diagnostico_Notas,
        Fecha_Registro: new Date().toISOString(),
      })
      .subscribe(() => {
        this.citasSvc.updateEstado(Number(this.idCita()), 'Atendida').subscribe(() => {
          this.loading.set(false);
          this.router.navigate(['/medico']);
        });
      });
  }
}
