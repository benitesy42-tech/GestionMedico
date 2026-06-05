import { Injectable, inject, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { ChatToastService } from './chat-toast.service';
import { SOCKET_URL, Conversacion, Mensaje } from './types';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private api = inject(ApiService);
  private toast = inject(ChatToastService);
  private socket: Socket | null = null;

  conversaciones = signal<Conversacion[]>([]);
  mensajes = signal<Mensaje[]>([]);
  conversacionActiva = signal<Conversacion | null>(null);
  noLeidos = signal(0);
  panelAbierto = signal(false);
  usuariosDisponibles = signal<{ id: number; nombre: string; rol: string; inicial: string }[]>([]);

  private _estados = signal<Map<number, boolean>>(new Map());
  private _userId: number | null = null;

  conectar(token: string) {
    if (this.socket?.connected) return;

    const raw = localStorage.getItem('currentUser');
    if (raw) {
      try {
        const u = JSON.parse(raw);
        this._userId = u.usuario?.ID_Usuario ?? null;
      } catch { /* ignore */ }
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      this.cargarConversaciones().subscribe();
    });

    this.socket.on('mensaje:nuevo', (msg: Mensaje) => {
      const convActual = this.conversacionActiva();
      const esConvActiva = convActual && msg.conversacion_id === convActual.id;

      if (esConvActiva) {
        this.mensajes.update((m) => [...m, msg]);
        if (msg.remitente_id !== null) {
          this.socket?.emit('conversacion:abrir', { conversacion_id: convActual.id });
        }
      } else {
        this.noLeidos.update((n) => n + 1);
        if (msg.remitente_id !== null && msg.remitente_id !== this._userId) {
          const conv = this.conversaciones().find((c) => c.id === msg.conversacion_id);
          if (conv) {
            this.toast.mostrar({
              tipo: 'mensaje',
              titulo: conv.otro_usuario.nombre,
              cuerpo: msg.contenido,
              conversacion_id: msg.conversacion_id,
            });
          }
        } else if (msg.tipo === 'sistema') {
          this.toast.mostrar({
            tipo: 'cita',
            titulo: 'Notificación del sistema',
            cuerpo: msg.contenido,
            conversacion_id: msg.conversacion_id,
          });
        }
      }
      this.cargarConversaciones().subscribe();
    });

    this.socket.on('mensaje:leido', (data: { conversacion_id: number; leido_por: number }) => {
      this.mensajes.update((msgs) =>
        msgs.map((m) =>
          m.remitente_id !== null && m.remitente_id !== data.leido_por
            ? { ...m, leido: true }
            : m,
        ),
      );
    });

    this.socket.on('usuario:estado', (data: { usuario_id: number; en_linea: boolean }) => {
      this._estados.update((map) => {
        map.set(data.usuario_id, data.en_linea);
        return new Map(map);
      });
    });

    this.socket.on('conversacion:nueva', () => {
      this.cargarConversaciones().subscribe();
    });
  }

  desconectar() {
    this.socket?.disconnect();
    this.socket = null;
    this.conversaciones.set([]);
    this.mensajes.set([]);
    this.conversacionActiva.set(null);
    this.noLeidos.set(0);
    this._estados.set(new Map());
    this._userId = null;
  }

  cargarConversaciones(): Observable<Conversacion[]> {
    return this.api.get<Conversacion[]>('/chat/conversaciones').pipe(
      tap((convs) => {
        this.conversaciones.set(convs);
        this.noLeidos.set(convs.reduce((s, c) => s + (c.no_leidos || 0), 0));
      }),
    );
  }

  abrirConversacion(conv: Conversacion) {
    this.conversacionActiva.set(conv);
    this.api.get<Mensaje[]>(`/chat/conversaciones/${conv.id}/mensajes`).subscribe((msgs) => {
      this.mensajes.set(msgs);
      this.socket?.emit('conversacion:abrir', { conversacion_id: conv.id });
      this.cargarConversaciones().subscribe();
    });
  }

  cerrarConversacion() {
    const conv = this.conversacionActiva();
    if (conv) this.socket?.emit('conversacion:salir', { conversacion_id: conv.id });
    this.conversacionActiva.set(null);
    this.mensajes.set([]);
  }

  enviarMensaje(conversacionId: number, contenido: string) {
    if (!contenido.trim()) return;
    this.socket?.emit('mensaje:enviar', { conversacion_id: conversacionId, contenido: contenido.trim() });
  }

  crearConversacion(usuarioId: number) {
    return this.api.post<any>('/chat/conversaciones', { usuario_id: usuarioId });
  }

  cargarUsuarios() {
    this.api.get<{ id: number; nombre: string; rol: string; inicial: string }[]>('/chat/usuarios').subscribe({
      next: (users) => this.usuariosDisponibles.set(users),
    });
  }

  togglePanel() {
    this.panelAbierto.update((v) => !v);
    if (this.panelAbierto()) {
      this.cargarConversaciones().subscribe();
      this.cargarUsuarios();
    } else {
      this.cerrarConversacion();
    }
  }

  estaEnLinea(usuarioId: number): boolean {
    return this._estados().get(usuarioId) ?? false;
  }
}
