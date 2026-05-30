import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/usuario';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
})
export default class LoginComponent {
  private auth = inject(AuthService);

  model: LoginRequest = { Username_Correo: '', Password: '' };
  loading = signal(false);
  error = signal('');

  onSubmit(): void {
    this.error.set('');
    this.loading.set(true);
    this.auth.login(this.model).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.auth.onLoginSuccess(res);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err.error?.message || 'Credenciales inválidas. Intente nuevamente.',
        );
      },
    });
  }
}
