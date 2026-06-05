import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EspecialidadesService } from '../../../core/services/especialidades.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Especialidad } from '../../../core/models/especialidad';

@Component({
  selector: 'app-admin-especialidades',
  imports: [FormsModule],
  templateUrl: './admin-especialidades.html',
})
export default class AdminEspecialidadesComponent {
  private espSvc = inject(EspecialidadesService);
  private notif = inject(NotificationService);

  especialidades = signal<Especialidad[]>([]);
  showForm = signal(false);
  editing = signal(false);
  selectedId = signal<number | null>(null);
  loading = signal(false);
  nombre = signal('');

  constructor() {
    this.espSvc.getAll().subscribe((data) => this.especialidades.set(data));
  }

  openNew(): void {
    this.nombre.set('');
    this.editing.set(false);
    this.selectedId.set(null);
    this.showForm.set(true);
  }

  openEdit(e: Especialidad): void {
    this.nombre.set(e.Nombre_Especialidad);
    this.editing.set(true);
    this.selectedId.set(e.ID_Especialidad);
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
  }

  save(): void {
    this.loading.set(true);
    if (this.editing() && this.selectedId()) {
      this.espSvc.update(this.selectedId()!, { Nombre_Especialidad: this.nombre() }).subscribe(() => {
        this.loading.set(false);
        this.showForm.set(false);
        this.espSvc.getAll().subscribe((data) => this.especialidades.set(data));
      });
    } else {
      this.espSvc.create({ Nombre_Especialidad: this.nombre() } as Especialidad).subscribe(() => {
        this.loading.set(false);
        this.showForm.set(false);
        this.espSvc.getAll().subscribe((data) => this.especialidades.set(data));
      });
    }
  }

  delete(id: number): void {
    if (confirm('¿Está seguro de eliminar esta especialidad?')) {
      this.espSvc.delete(id).subscribe({
        next: () => {
          this.espSvc.getAll().subscribe((data) => this.especialidades.set(data));
          this.notif.success('Especialidad eliminada');
        },
        error: () => this.notif.error('No se puede eliminar: tiene médicos asociados'),
      });
    }
  }
}
