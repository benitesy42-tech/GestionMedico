import { Component, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsultasService } from '../../../core/services/consultas.service';
import { PacientesService } from '../../../core/services/pacientes.service';
import { ExamenesService } from '../../../core/services/examenes.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConsultaMedica } from '../../../core/models/consulta';
import { Paciente } from '../../../core/models/paciente';
import { Examen, TIPOS_EXAMEN, ESTADOS_ALERTA } from '../../../core/models/examen';

@Component({
  selector: 'app-historial-clinico',
  imports: [FormsModule, DatePipe],
  templateUrl: './historial-clinico.html',
})
export default class HistorialClinicoComponent {
  private consultasSvc = inject(ConsultasService);
  private pacientesSvc = inject(PacientesService);
  private examenesSvc = inject(ExamenesService);
  private notif = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  searchTerm = signal('');
  searchResults = signal<Paciente[]>([]);
  selectedPaciente = signal<Paciente | null>(null);
  historial = signal<ConsultaMedica[]>([]);
  loading = signal(false);
  searching = signal(false);
  showFiltros = signal(false);
  activeTab = signal<'atenciones' | 'examenes'>('atenciones');

  filtroDesde = signal('');
  filtroHasta = signal('');
  filtroTexto = signal('');
  today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];

  examenes = signal<Examen[]>([]);
  examenesLoading = signal(false);
  examenSeleccionado = signal<Examen | null>(null);
  filtroExamenTipo = signal('');
  filtroExamenEstado = signal('');
  filtroExamenLab = signal('');
  filtroExamenQ = signal('');

  examenesFiltrados = computed(() => {
    const items = this.examenes();
    const tipo = this.filtroExamenTipo();
    const estado = this.filtroExamenEstado();
    const lab = this.filtroExamenLab().toLowerCase();
    const q = this.filtroExamenQ().toLowerCase();
    return items.filter(e => {
      if (tipo && e.Tipo_Examen !== tipo) return false;
      if (estado && e.Estado_Alerta !== estado) return false;
      if (lab && !e.Laboratorio?.toLowerCase().includes(lab)) return false;
      if (q && !e.Archivo_Nombre.toLowerCase().includes(q) && !e.Texto_OCR?.toLowerCase().includes(q)) return false;
      return true;
    });
  });

  readonly tiposExamen = TIPOS_EXAMEN;
  readonly estadosAlerta = ESTADOS_ALERTA;

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
      this.cargarExamenes(id);
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

  cargarExamenes(idPaciente: number): void {
    this.examenesLoading.set(true);
    this.examenesSvc.getByPaciente(idPaciente).subscribe({
      next: (data) => {
        this.examenes.set(data);
        this.examenesLoading.set(false);
      },
      error: () => {
        this.examenesLoading.set(false);
      },
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
    this.cargarPaciente(pac.ID_Paciente);
  }

  limpiarSeleccion(): void {
    this.selectedPaciente.set(null);
    this.searchTerm.set('');
    this.searchResults.set([]);
    this.historial.set([]);
    this.examenes.set([]);
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

  verExamen(examen: Examen): void {
    this.examenSeleccionado.set(examen);
  }

  cerrarExamen(): void {
    this.examenSeleccionado.set(null);
  }

  getArchivoUrl(id: number): string {
    return this.examenesSvc.getArchivoUrl(id);
  }

  getAlertClass(estado: string): string {
    switch (estado) {
      case 'critico': return 'bg-danger text-white';
      case 'borderline': return 'bg-warning text-dark';
      default: return 'bg-success text-white';
    }
  }

  getAlertIcon(estado: string): string {
    switch (estado) {
      case 'critico': return 'bi-exclamation-triangle-fill';
      case 'borderline': return 'bi-exclamation-circle-fill';
      default: return 'bi-check-circle-fill';
    }
  }

  volver(): void {
    this.router.navigate(['/medico']);
  }

  imprimir(): void {
    window.print();
  }
}
