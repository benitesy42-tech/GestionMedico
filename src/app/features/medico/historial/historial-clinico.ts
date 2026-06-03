import { Component, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsultasService } from '../../../core/services/consultas.service';
import { PacientesService } from '../../../core/services/pacientes.service';
import { ConsultaMedica } from '../../../core/models/consulta';
import { Paciente } from '../../../core/models/paciente';

@Component({
  selector: 'app-historial-clinico',
  imports: [FormsModule, DatePipe],
  templateUrl: './historial-clinico.html',
})
export default class HistorialClinicoComponent {
  private consultasSvc = inject(ConsultasService);
  private pacientesSvc = inject(PacientesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  searchTerm = signal('');
  searchResults = signal<Paciente[]>([]);
  selectedPaciente = signal<Paciente | null>(null);
  historial = signal<ConsultaMedica[]>([]);
  loading = signal(false);
  searching = signal(false);
  showFiltros = signal(false);

  filtroDesde = signal('');
  filtroHasta = signal('');
  filtroTexto = signal('');
  today = new Date().toISOString().split('T')[0];

  historialFiltrado = computed(() => {
    const items = this.historial();
    const texto = this.filtroTexto().toLowerCase();
    if (!texto) return items;
    return items.filter((c) =>
      c.Motivo?.toLowerCase().includes(texto) ||
      c.Diagnostico_Notas?.toLowerCase().includes(texto) ||
      c.Medico_Nombre?.toLowerCase().includes(texto) ||
      c.Tratamiento?.toLowerCase().includes(texto)
    );
  });

  constructor() {
    const pacienteId = this.route.snapshot.paramMap.get('idPaciente');
    if (pacienteId) {
      this.cargarPaciente(Number(pacienteId));
    }
    this.listarTodos();
  }

  listarTodos(): void {
    this.pacientesSvc.getAll().subscribe((data) => {
      this.searchResults.set(data);
    });
  }

  cargarPaciente(id: number): void {
    this.loading.set(true);
    this.pacientesSvc.getById(id).subscribe((pac) => {
      this.selectedPaciente.set(pac);
      this.cargarHistorial(id);
    });
  }

  cargarHistorial(idPaciente: number): void {
    this.loading.set(true);
    const desde = this.filtroDesde() || undefined;
    const hasta = this.filtroHasta() || undefined;
    this.consultasSvc.getHistorialByPaciente(idPaciente, desde, hasta).subscribe((data) => {
      this.historial.set(data);
      this.loading.set(false);
    });
  }

  buscarPacientes(): void {
    const term = this.searchTerm().trim();
    if (!term || term.length < 2) {
      this.listarTodos();
      return;
    }
    this.searching.set(true);
    this.pacientesSvc.search(term).subscribe((data) => {
      this.searchResults.set(data);
      this.searching.set(false);
    });
  }

  seleccionarPaciente(pac: Paciente): void {
    this.selectedPaciente.set(pac);
    this.searchTerm.set(`${pac.Nombres} ${pac.Apellidos}`);
    this.router.navigate(['/medico/historial/paciente', pac.ID_Paciente]);
    this.cargarHistorial(pac.ID_Paciente);
  }

  limpiarSeleccion(): void {
    this.selectedPaciente.set(null);
    this.searchTerm.set('');
    this.searchResults.set([]);
    this.historial.set([]);
    this.router.navigate(['/medico/historial']);
  }

  aplicarFiltros(): void {
    if (this.filtroDesde() && this.filtroHasta() && this.filtroDesde() > this.filtroHasta()) {
      return;
    }
    const pac = this.selectedPaciente();
    if (pac) {
      this.cargarHistorial(pac.ID_Paciente);
    }
  }

  limpiarFiltros(): void {
    this.filtroDesde.set('');
    this.filtroHasta.set('');
    this.filtroTexto.set('');
    const pac = this.selectedPaciente();
    if (pac) {
      this.cargarHistorial(pac.ID_Paciente);
    }
  }

  volver(): void {
    this.router.navigate(['/medico']);
  }

  imprimir(): void {
    window.print();
  }
}
