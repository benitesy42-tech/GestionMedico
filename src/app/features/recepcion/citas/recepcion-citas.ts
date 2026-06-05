import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitasService } from '../../../core/services/citas.service';
import { MedicosService } from '../../../core/services/medicos.service';
import { PacientesService } from '../../../core/services/pacientes.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CitaView, CitaDto } from '../../../core/models/cita';
import { Medico } from '../../../core/models/medico';
import { Paciente } from '../../../core/models/paciente';

@Component({
  selector: 'app-recepcion-citas',
  imports: [FormsModule, DatePipe],
  templateUrl: './recepcion-citas.html',
})
export default class RecepcionCitasComponent {
  private citasSvc = inject(CitasService);
  private medicosSvc = inject(MedicosService);
  private pacientesSvc = inject(PacientesService);
  private notif = inject(NotificationService);

  citas = signal<CitaView[]>([]);
  medicos = signal<Medico[]>([]);
  pacientes = signal<Paciente[]>([]);
  showForm = signal(false);
  loading = signal(false);

  filterDate = signal('');
  searchPaciente = signal('');
  pacientesFull = signal<Paciente[]>([]);

  form: CitaDto = {
    ID_Paciente: 0,
    ID_Medico: 0,
    Fecha_Hora: '',
  };

  minDateTime = '';

  constructor() {
    const ahora = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
    this.minDateTime = ahora.toISOString().slice(0, 16);
    this.loadCitas();
    this.medicosSvc.getAll().subscribe((data) => this.medicos.set(data));
    this.pacientesSvc.getAll().subscribe((data) => {
      this.pacientes.set(data);
      this.pacientesFull.set(data);
    });
  }

  private loadCitas(): void {
    this.citasSvc.getAll().subscribe((data) => this.citas.set(data));
  }

  get filteredCitas() {
    const date = this.filterDate();
    if (!date) return this.citas();
    return this.citas().filter((c) => c.Fecha_Hora.startsWith(date));
  }

  get filteredPacientes() {
    const term = this.searchPaciente().toLowerCase();
    if (!term) return this.pacientesFull();
    return this.pacientesFull().filter(
      (p) =>
        p.Nombres.toLowerCase().includes(term) ||
        p.Apellidos.toLowerCase().includes(term) ||
        p.DNI.includes(term),
    );
  }

  openNew(): void {
    this.form = { ID_Paciente: 0, ID_Medico: 0, Fecha_Hora: '' };
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
  }

  errorMsg = signal('');

  save(): void {
    if (new Date(this.form.Fecha_Hora) < new Date()) {
      this.errorMsg.set('No se puede agendar una cita en el pasado');
      return;
    }
    this.loading.set(true);
    this.errorMsg.set('');
    this.citasSvc.create(this.form).subscribe({
      next: () => {
        this.loading.set(false);
        this.showForm.set(false);
        this.loadCitas();
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message || 'Error al crear la cita');
      },
    });
  }

  updateEstado(id: number, estado: string): void {
    this.citasSvc.updateEstado(id, estado).subscribe(() => this.loadCitas());
  }

  delete(id: number): void {
    if (confirm('¿Cancelar esta cita?')) {
      this.citasSvc.delete(id).subscribe(() => { this.loadCitas(); this.notif.success('Cita cancelada'); });
    }
  }
}
