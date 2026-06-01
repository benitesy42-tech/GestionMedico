export interface SignosVitales {
  ID_Signo?: number;
  Presion_Arterial: string;
  Frecuencia_Cardiaca: number | null;
  Temperatura: number | null;
  Peso: number | null;
  Estatura: number | null;
  Frecuencia_Respiratoria: number | null;
  Saturacion_Oxigeno: number | null;
}

export interface RecetaMedicamento {
  ID_Receta?: number;
  Medicamento: string;
  Dosis: string;
  Frecuencia: string;
  Duracion: string;
}

export interface ConsultaMedica {
  ID_Consulta: number;
  ID_Cita: number;
  Motivo: string;
  Sintomas: string;
  Diagnostico_Notas: string;
  Tratamiento?: string;
  Observaciones?: string;
  Fecha_Registro: string;
  Fecha_Hora?: string;
  Medico_Nombre?: string;
  Especialidad?: string;
  Paciente_Nombre?: string;
  Paciente_DNI?: string;
  Signos_Vitales?: any;
  Recetas?: RecetaMedicamento[] | null;
}
