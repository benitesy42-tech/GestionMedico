import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MedicosService } from '../../../core/services/medicos.service';
import { EspecialidadesService } from '../../../core/services/especialidades.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Medico, MedicoDto } from '../../../core/models/medico';
import { Especialidad } from '../../../core/models/especialidad';

@Component({
  selector: 'app-admin-medicos',
  imports: [FormsModule],
  templateUrl: './admin-medicos.html',
})
export default class AdminMedicosComponent {
  private medicosSvc = inject(MedicosService);
  private espSvc = inject(EspecialidadesService);
  private notif = inject(NotificationService);

  medicos = signal<Medico[]>([]);
  especialidades = signal<Especialidad[]>([]);
  showForm = signal(false);
  editing = signal(false);
  selectedId = signal<number | null>(null);
  loading = signal(false);

  form: MedicoDto = {
    ID_Especialidad: 0,
    Nombres: '',
    Apellidos: '',
    Numero_Colegiatura: '',
    Username_Correo: '',
    Password: '',
  };

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    this.medicosSvc.getAll().subscribe((data) => this.medicos.set(data));
    this.espSvc.getAll().subscribe((data) => this.especialidades.set(data));
  }

  openNew(): void {
    this.form = {
      ID_Especialidad: 0,
      Nombres: '',
      Apellidos: '',
      Numero_Colegiatura: '',
      Username_Correo: '',
      Password: '',
    };
    this.editing.set(false);
    this.selectedId.set(null);
    this.showForm.set(true);
  }

  openEdit(m: Medico): void {
    this.form = {
      ID_Especialidad: m.ID_Especialidad,
      Nombres: m.Nombres,
      Apellidos: m.Apellidos,
      Numero_Colegiatura: m.Numero_Colegiatura,
      Username_Correo: '',
    };
    this.editing.set(true);
    this.selectedId.set(m.ID_Medico);
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
  }

  save(): void {
    this.loading.set(true);
    if (this.editing() && this.selectedId()) {
      this.medicosSvc.update(this.selectedId()!, {
        ID_Especialidad: this.form.ID_Especialidad,
        Nombres: this.form.Nombres,
        Apellidos: this.form.Apellidos,
        Numero_Colegiatura: this.form.Numero_Colegiatura,
      }).subscribe({
        next: () => {
          this.loading.set(false);
          this.showForm.set(false);
          this.loadData();
        },
        error: () => {
          this.loading.set(false);
          this.notif.error('Error al actualizar médico');
        },
      });
    } else {
      this.medicosSvc.create(this.form).subscribe({
        next: () => {
          this.loading.set(false);
          this.showForm.set(false);
          this.loadData();
        },
        error: () => {
          this.loading.set(false);
          this.notif.error('Error al crear médico. Verifica que el usuario o colegiatura no estén duplicados.');
        },
      });
    }
  }

  delete(id: number): void {
    if (confirm('¿Está seguro de eliminar este médico?')) {
      this.medicosSvc.delete(id).subscribe({
        next: () => { this.loadData(); this.notif.success('Médico eliminado'); },
        error: () => this.notif.error('Error al eliminar médico'),
      });
    }
  }
}
