import { environment } from '../../../environments/environment';

export const SOCKET_URL = environment.apiBaseUrl.replace('/api', '');

export interface ChatUser {
  id: number;
  nombre: string;
  rol: string;
  inicial: string;
}

export interface Conversacion {
  id: number;
  usuario_1_id: number;
  usuario_2_id: number;
  otro_usuario: ChatUser;
  ultimo_mensaje: string;
  ultimo_mensaje_hora: string | null;
  no_leidos: number;
}

export interface Mensaje {
  id: number;
  conversacion_id: number;
  remitente_id: number | null;
  contenido: string;
  tipo: 'texto' | 'sistema';
  leido: boolean;
  creado_en: string;
  remitente_nombre?: string | null;
}
