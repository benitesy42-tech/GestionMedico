export interface Medico {
  ID_Medico: number;
  ID_Usuario: number;
  ID_Especialidad: number;
  Nombres: string;
  Apellidos: string;
  Numero_Colegiatura: string;
}

export interface MedicoDto {
  ID_Medico?: number;
  ID_Usuario?: number;
  ID_Especialidad: number;
  Nombres: string;
  Apellidos: string;
  Numero_Colegiatura: string;
  Username_Correo: string;
  Password?: string;
}
