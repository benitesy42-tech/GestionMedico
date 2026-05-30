export interface Pago {
  ID_Pago: number;
  ID_Consulta: number;
  Monto: number;
  Fecha_Pago: string;
  Estado_Pago: 'Pendiente' | 'Completado' | 'Anulado';
}
