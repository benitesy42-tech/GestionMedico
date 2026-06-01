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
  Paciente_Nombre: string;
  Medico_Nombre: string;
  Especialidad: string;
}
