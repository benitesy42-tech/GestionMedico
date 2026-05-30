export interface Usuario {
  ID_Usuario: number;
  ID_Rol: number;
  Username_Correo: string;
  Password_Hash: string;
  Estado_Activo: boolean;
}

export interface LoginRequest {
  Username_Correo: string;
  Password: string;
}

export interface LoginResponse {
  usuario: Usuario;
  token: string;
  nombreCompleto: string;
  rol: string;
}
