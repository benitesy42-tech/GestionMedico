export interface Cita {
  ID_Cita: number;
  ID_Paciente: number;
  ID_Medico: number;
  Fecha_Hora: string;
  Estado: 'Pendiente' | 'En Espera' | 'Cancelada' | 'Reprogramada' | 'Atendida';
}

export interface CitaDto {
  ID_Cita?: number;
  ID_Paciente: number;
  ID_Medico: number;
  Fecha_Hora: string;
}

export interface CitaView extends Cita {
  PacienteNombre: string;
  MedicoNombre: string;
  Especialidad: string;
}
