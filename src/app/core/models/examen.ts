export interface Examen {
  ID_Examen: number;
  ID_Paciente: number;
  ID_Consulta: number | null;
  Archivo_Nombre: string;
  Archivo_Ruta: string;
  Archivo_Tipo: string;
  Archivo_Tamanio: number;
  Texto_OCR: string | null;
  Notas_Clinicas: string | null;
  Resumen_Medico: string | null;
  Resumen_Paciente: string | null;
  Laboratorio: string | null;
  Fecha_Toma: string | null;
  Fecha_Subida: string;
  Tipo_Examen: string;
  Etiquetas: string[];
  Es_Sensible: boolean;
  Estado_Alerta: 'normal' | 'borderline' | 'critico';
  Subido_Por: number;
  Subido_Por_Nombre: string | null;
  Tiene_Valores: boolean;
  Valores?: ValorExamen[];
}

export interface ValorExamen {
  ID_Valor: number;
  ID_Examen: number;
  Nombre_Valor: string;
  Valor_Numerico: number | null;
  Valor_Texto: string | null;
  Unidad: string | null;
  Rango_Minimo: number | null;
  Rango_Maximo: number | null;
  Estado: 'normal' | 'alterado' | 'critico';
}

export interface RangoReferencia {
  ID_Rango: number;
  Nombre_Valor: string;
  Unidad: string | null;
  Rango_Minimo: number;
  Rango_Maximo: number;
  Limite_Critico_Inferior: number | null;
  Limite_Critico_Superior: number | null;
  Activo: boolean;
}

export const TIPOS_EXAMEN = [
  'Sangre', 'Orina', 'Imagen (RX)', 'Imagen (ECO)', 'Imagen (TAC)',
  'Imagen (RMN)', 'Microbiología', 'Histopatología', 'Función Renal',
  'Función Hepática', 'Perfil Lipídico', 'Hormonas', 'Otro',
] as const;

export const ETIQUETAS_PREDEFINIDAS = [
  'Sangre', 'Orina', 'RX', 'ECO', 'TAC', 'RMN',
  'Microbiología', 'Histopatología', 'Función Renal',
  'Función Hepática', 'Perfil Lipídico', 'Hormonas',
] as const;

export const ESTADOS_ALERTA = ['normal', 'borderline', 'critico'] as const;
