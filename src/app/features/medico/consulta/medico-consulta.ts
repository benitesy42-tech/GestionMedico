import { Component, inject, signal } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsultasService } from '../../../core/services/consultas.service';
import { CitasService } from '../../../core/services/citas.service';
import { AuthService } from '../../../core/services/auth.service';
import { CitaView } from '../../../core/models/cita';
import { ExamenesService } from '../../../core/services/examenes.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TIPOS_EXAMEN, ETIQUETAS_PREDEFINIDAS } from '../../../core/models/examen';

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
  private auth = inject(AuthService);
  private examenesSvc = inject(ExamenesService);
  private notif = inject(NotificationService);

  cita = signal<CitaView | null>(null);
  loading = signal(false);
  idCita = 0;
  readonly tiposExamen = TIPOS_EXAMEN;
  readonly etiquetasPredefinidas = ETIQUETAS_PREDEFINIDAS;

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

  examenForm = {
    archivo: null as File | null,
    preview: null as string | ArrayBuffer | null,
    previewType: '' as string,
    Tipo_Examen: 'Sangre',
    Etiquetas: [] as string[],
    customEtiqueta: '',
    Laboratorio: '',
    Fecha_Toma: new Date().toISOString().split('T')[0],
    Notas: '',
    Es_Sensible: false,
  };
  uploadLoading = signal(false);
  dragOver = signal(false);
  uploadSuccess = signal(false);
  uploadedExamenId = signal<number | null>(null);
  generandoResumen = signal(false);

  constructor() {
    this.idCita = Number(this.route.snapshot.paramMap.get('idCita'));
    const idMedico = this.auth.currentUser()?.idMedico;
    if (idMedico) {
      this.citasSvc.getByMedico(idMedico).subscribe((citas) => {
        const found = citas.find((c) => c.ID_Cita === this.idCita);
        this.cita.set(found || null);
      });
    }
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.dragOver.set(true);
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    this.dragOver.set(false);
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.dragOver.set(false);
    if (e.dataTransfer?.files.length) {
      this.handleFile(e.dataTransfer.files[0]);
    }
  }

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFile(input.files[0]);
    }
  }

  private autoDetectarDesdeArchivo(file: File): void {
    const nombre = file.name.toLowerCase();
    const detectTipo: Record<string, string> = {
      'hemograma': 'Sangre', 'sangre': 'Sangre', 'perfil': 'Sangre',
      'glucosa': 'Sangre', 'colesterol': 'Sangre', 'triglicerido': 'Sangre',
      'orina': 'Orina', 'urocultivo': 'Orina', 'uroanalisis': 'Orina',
      'rx': 'Imagen (RX)', 'radiografia': 'Imagen (RX)', 'rayos': 'Imagen (RX)',
      'eco': 'Imagen (Ecografía)', 'ecografia': 'Imagen (Ecografía)', 'ultrasonido': 'Imagen (Ecografía)',
      'tomografia': 'Imagen (Tomografía)', 'tac': 'Imagen (Tomografía)',
      'resonancia': 'Imagen (Resonancia)', 'rmn': 'Imagen (Resonancia)',
      'mamografia': 'Imagen (Mamografía)',
      'electro': 'Otros', 'ecg': 'Otros', 'eeg': 'Otros',
      'heces': 'Heces', 'copro': 'Heces', 'parasito': 'Heces',
      'biopsia': 'Anatomía Patológica', 'patologia': 'Anatomía Patológica',
      'pcr': 'Infectología', 'cultivo': 'Infectología', 'serologia': 'Infectología',
      'hormona': 'Hormonas', 'tiroides': 'Hormonas', 'tsh': 'Hormonas',
    };
    for (const [key, tipo] of Object.entries(detectTipo)) {
      if (nombre.includes(key)) {
        this.examenForm.Tipo_Examen = tipo;
        break;
      }
    }
    const autoEtiquetas: string[] = [];
    for (const [key, etq] of Object.entries({
      'hemograma': 'Hemograma', 'glucosa': 'Glucosa', 'colesterol': 'Colesterol',
      'orina': 'Orina', 'urocultivo': 'Urocultivo',
      'rx': 'Radiografía', 'eco': 'Ecografía', 'tac': 'Tomografía',
      'heces': 'Heces', 'biopsia': 'Biopsia', 'pcr': 'PCR',
      'hormona': 'Hormonas', 'tiroides': 'Tiroides',
    })) {
      if (nombre.includes(key) && !this.examenForm.Etiquetas.includes(etq)) {
        autoEtiquetas.push(etq);
      }
    }
    if (autoEtiquetas.length > 0) {
      this.examenForm.Etiquetas = [...this.examenForm.Etiquetas, ...autoEtiquetas];
    }
  }

  handleFile(file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext || '')) {
      this.notif.error('Formato no permitido. Solo PDF, JPG, PNG');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      this.notif.error('Archivo demasiado grande. Máximo 20MB');
      return;
    }
    this.examenForm.archivo = file;
    this.examenForm.previewType = ext === 'pdf' ? 'pdf' : 'img';
    this.autoDetectarDesdeArchivo(file);
    if (ext !== 'pdf') {
      const reader = new FileReader();
      reader.onload = (e) => { this.examenForm.preview = e.target?.result || null; };
      reader.readAsDataURL(file);
    } else {
      this.examenForm.preview = null;
    }
  }

  removeFile() {
    this.examenForm.archivo = null;
    this.examenForm.preview = null;
    this.examenForm.previewType = '';
  }

  toggleEtiqueta(etq: string) {
    const idx = this.examenForm.Etiquetas.indexOf(etq);
    if (idx >= 0) {
      this.examenForm.Etiquetas.splice(idx, 1);
    } else {
      this.examenForm.Etiquetas.push(etq);
    }
  }

  agregarCustomEtiqueta() {
    const etq = this.examenForm.customEtiqueta.trim();
    if (etq && !this.examenForm.Etiquetas.includes(etq)) {
      this.examenForm.Etiquetas.push(etq);
      this.examenForm.customEtiqueta = '';
    }
  }

  quitarEtiqueta(etq: string) {
    this.examenForm.Etiquetas = this.examenForm.Etiquetas.filter(e => e !== etq);
  }

  subirExamen() {
    const c = this.cita();
    if (!this.examenForm.archivo || !c) return;
    this.uploadLoading.set(true);
    const fd = new FormData();
    fd.append('archivo', this.examenForm.archivo);
    fd.append('ID_Paciente', String(c.ID_Paciente));
    fd.append('Tipo_Examen', this.examenForm.Tipo_Examen);
    fd.append('Etiquetas', JSON.stringify(this.examenForm.Etiquetas));
    fd.append('Laboratorio', this.examenForm.Laboratorio);
    fd.append('Fecha_Toma', this.examenForm.Fecha_Toma);
    fd.append('Es_Sensible', String(this.examenForm.Es_Sensible));
    if (this.examenForm.Notas) {
      fd.append('Notas', this.examenForm.Notas);
    }
    this.examenesSvc.upload(fd).subscribe({
      next: (res) => {
        this.notif.success('Examen subido correctamente');
        this.uploadLoading.set(false);
        this.uploadSuccess.set(true);
        const id = res.examen?.ID_Examen || null;
        this.uploadedExamenId.set(id);
        if (id) this.esperarOcrYActualizar(id);
      },
      error: (err) => {
        this.notif.error(err.error?.message || 'Error al subir examen');
        this.uploadLoading.set(false);
      },
    });
  }

  private esperarOcrYActualizar(id: number, intentos = 0): void {
    if (intentos > 45) return;
    this.examenesSvc.getById(id).subscribe({
      next: (examen) => {
        if (examen.Texto_OCR === 'ERROR') {
          this.notif.warning('OCR falló — puedes generar resumen manualmente después');
        } else if (examen.Texto_OCR) {
          this.examenForm.Tipo_Examen = examen.Tipo_Examen;
          this.examenForm.Etiquetas = examen.Etiquetas || [];
          this.notif.success('OCR completado — tipo y etiquetas actualizados');
        } else {
          setTimeout(() => this.esperarOcrYActualizar(id, intentos + 1), 2000);
        }
      },
      error: () => {
        setTimeout(() => this.esperarOcrYActualizar(id, intentos + 1), 2000);
      },
    });
  }

  generarResumenIA(): void {
    const id = this.uploadedExamenId();
    if (!id) return;
    this.generandoResumen.set(true);
    this.examenesSvc.generarResumen(id).subscribe({
      next: (res: any) => {
        this.notif.success('Resumen generado con IA');
        this.generandoResumen.set(false);
      },
      error: (err) => {
        this.notif.error(err.error?.message || 'Error al generar resumen');
        this.generandoResumen.set(false);
      },
    });
  }

  verEnHistorial(): void {
    const c = this.cita();
    if (c) {
      this.router.navigate(['/medico/historial/paciente', c.ID_Paciente]);
    }
  }

  subirOtroExamen(): void {
    this.uploadSuccess.set(false);
    this.uploadedExamenId.set(null);
    this.removeFile();
    this.examenForm.Tipo_Examen = 'Sangre';
    this.examenForm.Etiquetas = [];
    this.examenForm.Laboratorio = '';
    this.examenForm.Fecha_Toma = new Date().toISOString().split('T')[0];
    this.examenForm.Es_Sensible = false;
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
