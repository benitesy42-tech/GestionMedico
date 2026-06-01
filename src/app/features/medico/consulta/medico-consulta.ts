import { Component, inject, signal } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  cita = signal<CitaView | null>(null);
  loading = signal(false);
  idCita = 0;

  form = {
    Motivo: '',
    Sintomas: '',
    Diagnostico_Notas: '',
    Tratamiento: '',
    Observaciones: '',
    Signos_Vitales: {
      Presion_Arterial: '',
      Frecuencia_Cardiaca: null as number | null,
      Temperatura: null as number | null,
      Peso: null as number | null,
      Estatura: null as number | null,
      Frecuencia_Respiratoria: null as number | null,
      Saturacion_Oxigeno: null as number | null,
    },
    Recetas: [] as { Medicamento: string; Dosis: string; Frecuencia: string; Duracion: string }[],
  };

  constructor() {
    this.idCita = Number(this.route.snapshot.paramMap.get('idCita'));
    this.citasSvc.getAll().subscribe((citas) => {
      const found = citas.find((c) => c.ID_Cita === this.idCita);
      this.cita.set(found || null);
    });
  }

  agregarReceta(): void {
    this.form.Recetas.push({ Medicamento: '', Dosis: '', Frecuencia: '', Duracion: '' });
  }

  eliminarReceta(i: number): void {
    this.form.Recetas.splice(i, 1);
  }

  goBack(): void {
    this.location.back();
  }

  verHistorial(): void {
    const c = this.cita();
    if (c) {
      this.router.navigate(['/medico/historial/paciente', c.ID_Paciente]);
    }
  }

  finalizar(): void {
    if (!this.form.Motivo || !this.form.Diagnostico_Notas) return;
    this.loading.set(true);
    this.consultasSvc
      .create({
        ID_Consulta: 0,
        ID_Cita: this.idCita,
        Motivo: this.form.Motivo,
        Sintomas: this.form.Sintomas,
        Diagnostico_Notas: this.form.Diagnostico_Notas,
        Tratamiento: this.form.Tratamiento,
        Observaciones: this.form.Observaciones,
        Signos_Vitales: this.form.Signos_Vitales,
        Recetas: this.form.Recetas,
        Fecha_Registro: new Date().toISOString(),
      })
      .subscribe(() => {
        this.citasSvc.updateEstado(this.idCita, 'Atendida').subscribe(() => {
          this.loading.set(false);
          this.router.navigate(['/medico']);
        });
      });
  }
}
