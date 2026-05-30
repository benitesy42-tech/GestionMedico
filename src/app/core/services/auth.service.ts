import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { LoginRequest, LoginResponse } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'currentUser';

  currentUser = signal<LoginResponse | null>(null);
  isAuthenticated = signal(false);
  userRole = signal<string | null>(null);
  userNombre = signal<string | null>(null);

  constructor(
    private api: ApiService,
    private router: Router,
  ) {
    this.loadSession();
  }

  private loadSession(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const user = localStorage.getItem(this.USER_KEY);
    if (token && user) {
      try {
        const parsed = JSON.parse(user) as LoginResponse;
        this.currentUser.set(parsed);
        this.isAuthenticated.set(true);
        this.userRole.set(parsed.rol);
        this.userNombre.set(parsed.nombreCompleto);
      } catch {
        this.logout();
      }
    }
  }

  login(credentials: LoginRequest) {
    return this.api.post<LoginResponse>('/auth/login', credentials);
  }

  onLoginSuccess(response: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response));
    this.currentUser.set(response);
    this.isAuthenticated.set(true);
    this.userRole.set(response.rol);
    this.userNombre.set(response.nombreCompleto);
    this.redirectByRole(response.rol);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.userRole.set(null);
    this.userNombre.set(null);
    this.router.navigate(['/login']);
  }

  private redirectByRole(rol: string): void {
    switch (rol.toLowerCase()) {
      case 'administrador':
        this.router.navigate(['/admin']);
        break;
      case 'recepcionista':
        this.router.navigate(['/recepcion']);
        break;
      case 'medico':
        this.router.navigate(['/medico']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}
