import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from './chat.service';

@Component({
  selector: 'app-lista-conversaciones',
  imports: [DatePipe, FormsModule],
  template: `
    <div class="chat-conversaciones">
      <div class="chat-panel-header">
        <h6 class="mb-0 fw-bold">Chat</h6>
        <button class="btn p-1 text-secondary border-0" (click)="toggleCrear()" title="Nueva conversación" style="background:none;font-size:1.1rem;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>

      @if (mostrarCrear) {
        <div class="p-2 border-bottom">
          <input
            type="text"
            class="form-control form-control-sm"
            placeholder="Buscar usuario..."
            [(ngModel)]="terminoBusqueda"
            (input)="onBuscar()"
          />
          <div class="mt-1" style="max-height:200px;overflow-y:auto;">
            @for (u of usuariosFiltrados; track u.id) {
              <button class="btn btn-light btn-sm w-100 text-start d-flex align-items-center gap-2 mt-1" (click)="iniciarConversacion(u.id)" style="border-radius:8px;">
                <span class="rounded-circle d-inline-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0" style="width:28px;height:28px;background:#0c4a6e;font-size:0.7rem;">{{ u.inicial }}</span>
                <span class="small">{{ u.nombre }}</span>
                <span class="badge bg-light text-muted ms-auto" style="font-size:0.6rem;">{{ u.rol }}</span>
              </button>
            }
            @empty {
              <div class="text-muted small text-center py-2">Sin resultados</div>
            }
          </div>
        </div>
      }

      <div class="chat-lista">
        @for (conv of chat.conversaciones(); track conv.id) {
          <button
            class="btn d-flex align-items-center gap-2 w-100 text-start border-0 chat-conv-item"
            [class.active]="chat.conversacionActiva()?.id === conv.id"
            (click)="chat.abrirConversacion(conv)"
          >
            <div class="position-relative flex-shrink-0">
              <span class="rounded-circle d-inline-flex align-items-center justify-content-center text-white fw-bold" style="width:38px;height:38px;background:linear-gradient(135deg,#38bdf8,#818cf8);font-size:0.85rem;">
                {{ conv.otro_usuario.inicial }}
              </span>
              <span
                class="position-absolute rounded-circle border border-2 border-white"
                style="width:10px;height:10px;bottom:-1px;right:-1px;background:{{ chat.estaEnLinea(conv.otro_usuario.id) ? '#22c55e' : '#9ca3af' }};"
              ></span>
            </div>
            <div class="flex-grow-1 min-w-0">
              <div class="d-flex justify-content-between align-items-center">
                <span class="fw-semibold small text-truncate">{{ conv.otro_usuario.nombre }}</span>
                @if (conv.ultimo_mensaje_hora) {
                  <span class="text-muted flex-shrink-0" style="font-size:0.6rem;">{{ conv.ultimo_mensaje_hora | date:'HH:mm' }}</span>
                }
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <span class="text-muted text-truncate d-block" style="font-size:0.75rem;">{{ conv.ultimo_mensaje || 'Sin mensajes' }}</span>
                @if (conv.no_leidos > 0) {
                  <span class="badge rounded-pill" style="background:#ef4444;font-size:0.6rem;min-width:18px;">{{ conv.no_leidos }}</span>
                }
              </div>
            </div>
          </button>
        } @empty {
          <div class="text-center text-muted p-4" style="font-size:0.85rem;">
            <p class="mb-1">No hay conversaciones</p>
            <small>Presiona + para iniciar una</small>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .chat-conversaciones { display:flex;flex-direction:column;height:100%; }
    .chat-panel-header { display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #e5e7eb; }
    .chat-lista { flex:1;overflow-y:auto; }
    .chat-conv-item { padding:10px 16px;border-radius:0 !important;transition:background 0.15s; }
    .chat-conv-item:hover { background:#f8f9ff; }
    .chat-conv-item.active { background:#eef2ff; }
  `],
})
export class ListaConversaciones {
  chat = inject(ChatService);
  mostrarCrear = false;
  terminoBusqueda = '';
  usuariosFiltrados: { id: number; nombre: string; rol: string; inicial: string }[] = [];

  toggleCrear() {
    this.mostrarCrear = !this.mostrarCrear;
    if (this.mostrarCrear) {
      this.usuariosFiltrados = this.chat.usuariosDisponibles();
      this.terminoBusqueda = '';
    }
  }

  onBuscar() {
    const t = this.terminoBusqueda.toLowerCase();
    this.usuariosFiltrados = this.chat.usuariosDisponibles().filter(
      (u) => u.nombre.toLowerCase().includes(t) || u.rol.toLowerCase().includes(t),
    );
  }

  iniciarConversacion(usuarioId: number) {
    this.chat.crearConversacion(usuarioId).subscribe(() => {
      this.mostrarCrear = false;
      this.chat.cargarConversaciones().subscribe((convs) => {
        const conv = convs.find((c) => c.otro_usuario.id === usuarioId);
        if (conv) this.chat.abrirConversacion(conv);
      });
    });
  }
}
