import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PacientesService } from '../../../core/services/pacientes.service';
import { Paciente } from '../../../core/models/paciente';

@Component({
  selector: 'app-admin-pacientes',
  imports: [FormsModule],
  templateUrl: './admin-pacientes.html',
})
export default class AdminPacientesComponent {
  private pacientesSvc = inject(PacientesService);

  pacientes = signal<Paciente[]>([]);
  searchTerm = signal('');
  showForm = signal(false);
  editing = signal(false);
  selectedId = signal<number | null>(null);
  loading = signal(false);
  today = new Date().toISOString().split('T')[0];

  form: Paciente = {
    ID_Paciente: 0,
    ID_Usuario: 0,
    DNI: '',
    Nombres: '',
    Apellidos: '',
    Telefono: '',
    Fecha_Nacimiento: '',
  };

  constructor() {
    this.loadPacientes();
  }

  private loadPacientes(): void {
    this.pacientesSvc.getAll().subscribe((data) => this.pacientes.set(data));
  }

  search(): void {
    const term = this.searchTerm().trim();
    if (term) {
      this.pacientesSvc.search(term).subscribe((data) => this.pacientes.set(data));
    } else {
      this.loadPacientes();
    }
  }

  openNew(): void {
    this.form = { ID_Paciente: 0, ID_Usuario: 0, DNI: '', Nombres: '', Apellidos: '', Telefono: '', Fecha_Nacimiento: '' };
    this.editing.set(false);
    this.selectedId.set(null);
    this.showForm.set(true);
  }

  openEdit(p: Paciente): void {
    this.form = { ...p };
    this.editing.set(true);
    this.selectedId.set(p.ID_Paciente);
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
  }

  save(): void {
    this.loading.set(true);
    const obs = this.editing() && this.selectedId()
      ? this.pacientesSvc.update(this.selectedId()!, this.form)
      : this.pacientesSvc.create(this.form);
    obs.subscribe({
      next: () => {
        this.loading.set(false);
        this.showForm.set(false);
        this.loadPacientes();
      },
      error: (err) => {
        this.loading.set(false);
        alert(err.error?.message || 'Error al guardar paciente');
      },
    });
  }

  delete(id: number): void {
    if (confirm('¿Está seguro de eliminar este paciente?')) {
      this.pacientesSvc.delete(id).subscribe(() => this.loadPacientes());
    }
  }
}
