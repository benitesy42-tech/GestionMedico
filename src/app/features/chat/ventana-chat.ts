import { Component, inject, AfterViewChecked, ElementRef, viewChild, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from './chat.service';

@Component({
  selector: 'app-ventana-chat',
  imports: [DatePipe, FormsModule],
  template: `
    <div class="chat-ventana">
      <div class="chat-panel-header">
        <button class="btn p-0 border-0 me-2" (click)="chat.cerrarConversacion()" style="background:none;font-size:1.1rem;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        @if (conv) {
          <div class="d-flex align-items-center gap-2 flex-grow-1 min-w-0">
            <div class="position-relative">
              <span class="rounded-circle d-inline-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0" style="width:32px;height:32px;background:linear-gradient(135deg,#38bdf8,#818cf8);font-size:0.75rem;">
                {{ conv.otro_usuario.inicial }}
              </span>
              <span class="position-absolute rounded-circle border border-2 border-white" style="width:9px;height:9px;bottom:-1px;right:-1px;background:{{ chat.estaEnLinea(conv.otro_usuario.id) ? '#22c55e' : '#9ca3af' }};"></span>
            </div>
            <div class="min-w-0">
              <div class="fw-semibold small text-truncate">{{ conv.otro_usuario.nombre }}</div>
              <div class="text-muted" style="font-size:0.6rem;">{{ conv.otro_usuario.rol }} {{ chat.estaEnLinea(conv.otro_usuario.id) ? '• En línea' : '' }}</div>
            </div>
          </div>
        }
      </div>

      <div class="chat-mensajes" #chatMensajes>
        @for (msg of chat.mensajes(); track msg.id) {
          @if (msg.tipo === 'sistema') {
            <div class="mensaje-sistema">{{ msg.contenido }}</div>
          } @else {
            @if (mostrarAvatar(msg)) {
              <div class="d-flex align-items-start gap-2 mb-1 mt-2" [class.flex-row-reverse]="esPropio(msg)">
                <span class="rounded-circle d-inline-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0" style="width:28px;height:28px;background:#0c4a6e;font-size:0.65rem;">
                  {{ obtenerInicial(msg) }}
                </span>
                <div>
                  <div class="d-flex align-items-center gap-2 mb-1" [class.flex-row-reverse]="esPropio(msg)">
                    <span class="fw-semibold" style="font-size:0.7rem;">{{ msg.remitente_nombre || 'Usuario' }}</span>
                    <span class="text-muted" style="font-size:0.6rem;">{{ msg.creado_en | date:'HH:mm' }}</span>
                  </div>
                  <div class="chat-burbuja" [class.propio]="esPropio(msg)" [class.ajeno]="!esPropio(msg)">
                    {{ msg.contenido }}
                    @if (esPropio(msg)) {
                      <span style="font-size:0.6rem;margin-left:4px;color:{{ msg.leido ? '#60a5fa' : '#9ca3af' }};">
                        {{ msg.leido ? '✓✓' : '✓' }}
                      </span>
                    }
                  </div>
                </div>
              </div>
            } @else {
              <div class="d-flex mb-1" [class.flex-row-reverse]="esPropio(msg)">
                <div class="chat-burbuja" [class.propio]="esPropio(msg)" [class.ajeno]="!esPropio(msg)" style="margin-left:36px;">
                  {{ msg.contenido }}
                  @if (esPropio(msg)) {
                    <span style="font-size:0.6rem;margin-left:4px;color:{{ msg.leido ? '#60a5fa' : '#9ca3af' }};">
                      {{ msg.leido ? '✓✓' : '✓' }}
                    </span>
                  }
                </div>
              </div>
            }
          }
        } @empty {
          <div class="text-center text-muted p-4" style="font-size:0.8rem;">No hay mensajes aún</div>
        }
      </div>

      <div class="chat-input">
        <input
          #inputMsg
          type="text"
          class="form-control form-control-sm"
          placeholder="Escribe un mensaje..."
          (keydown.enter)="enviar()"
          [(ngModel)]="nuevoMensaje"
        />
        <button class="btn btn-primary btn-sm ms-2 flex-shrink-0" (click)="enviar()" [disabled]="!nuevoMensaje.trim()" style="border-radius:20px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .chat-ventana { display:flex;flex-direction:column;height:100%; }
    .chat-panel-header { display:flex;align-items:center;padding:10px 12px;border-bottom:1px solid #e5e7eb; }
    .chat-mensajes { flex:1;overflow-y:auto;padding:12px;background:#f8fafc; }
    .chat-burbuja { max-width:80%;padding:8px 12px;border-radius:14px;font-size:0.8rem;word-wrap:break-word; }
    .chat-burbuja.propio { background:#0c4a6e;color:white;border-bottom-right-radius:4px; }
    .chat-burbuja.ajeno { background:white;color:inherit;border:1px solid #e5e7eb;border-bottom-left-radius:4px; }
    .chat-input { display:flex;align-items:center;padding:10px 12px;border-top:1px solid #e5e7eb;background:white; }
    .mensaje-sistema { text-align:center;font-size:0.7rem;color:#718096;background:#edf2f7;border-radius:12px;padding:4px 12px;margin:8px auto;max-width:80%; }
  `],
})
export class VentanaChat implements AfterViewChecked {
  chat = inject(ChatService);
  nuevoMensaje = '';
  chatMensajes = viewChild<ElementRef>('chatMensajes');

  get conv() { return this.chat.conversacionActiva(); }
  private userId: number | null = null;

  constructor() {
    const raw = localStorage.getItem('currentUser');
    if (raw) {
      try {
        const u = JSON.parse(raw);
        this.userId = u.usuario?.ID_Usuario ?? null;
      } catch { /* ignore */ }
    }
  }

  ngAfterViewChecked() {
    const el = this.chatMensajes()?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }

  esPropio(msg: { remitente_id: number | null }): boolean {
    return msg.remitente_id !== null && msg.remitente_id === this.userId;
  }

  mostrarAvatar(msg: { remitente_id: number | null; tipo?: string }, idx?: number): boolean {
    if (msg.tipo === 'sistema' || msg.remitente_id === null) return false;
    const msgs = this.chat.mensajes();
    const i = idx ?? msgs.indexOf(msg as any);
    if (i <= 0) return true;
    return msgs[i - 1].remitente_id !== msg.remitente_id || msgs[i - 1].tipo === 'sistema';
  }

  obtenerInicial(msg: { remitente_nombre?: string | null }): string {
    return (msg.remitente_nombre || 'U')[0].toUpperCase();
  }

  enviar() {
    const conv = this.chat.conversacionActiva();
    if (!conv || !this.nuevoMensaje.trim()) return;
    this.chat.enviarMensaje(conv.id, this.nuevoMensaje);
    this.nuevoMensaje = '';
  }
}
