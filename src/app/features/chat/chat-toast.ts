import { Component, inject } from '@angular/core';
import { ChatToastService } from './chat-toast.service';
import { ChatService } from './chat.service';

@Component({
  selector: 'app-chat-toast',
  template: `
    <div class="chat-toast-container">
      @for (t of toastService.toasts(); track t.id) {
        <div class="chat-toast animate-slide-in-right" (click)="onClick(t)">
          <div class="chat-toast-icon">{{ t.tipo === 'mensaje' ? '💬' : '📅' }}</div>
          <div class="chat-toast-content">
            <div class="chat-toast-title">{{ t.titulo }}</div>
            <div class="chat-toast-body">{{ t.cuerpo }}</div>
          </div>
          <button class="chat-toast-close" (click)="dismiss(t.id); $event.stopPropagation()">&times;</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .chat-toast-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
    }
    .chat-toast {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: #1e293b;
      color: #fff;
      padding: 14px 18px;
      border-radius: 14px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.25);
      cursor: pointer;
      pointer-events: auto;
      max-width: 440px;
      width: 100%;
      transition: opacity 0.3s ease, transform 0.3s ease;
      animation: fadeInUp 0.35s cubic-bezier(0.16,1,0.3,1) both;
    }
    .chat-toast-icon {
      font-size: 1.4rem;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .chat-toast-content {
      flex: 1;
      min-width: 0;
    }
    .chat-toast-title {
      font-weight: 600;
      font-size: 0.9rem;
      margin-bottom: 4px;
    }
    .chat-toast-body {
      font-size: 0.82rem;
      opacity: 0.85;
      line-height: 1.3;
      word-wrap: break-word;
    }
    .chat-toast-close {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 1.1rem;
      padding: 0 0 0 6px;
      cursor: pointer;
      flex-shrink: 0;
      line-height: 1;
    }
    .chat-toast-close:hover { color: #fff; }
  `],
})
export class ChatToastComponent {
  toastService = inject(ChatToastService);
  chat = inject(ChatService);

  onClick(t: { id: number; conversacion_id: number }) {
    if (!this.chat.panelAbierto()) {
      this.chat.togglePanel();
    }
    const conv = this.chat.conversaciones().find((c) => c.id === t.conversacion_id);
    if (conv) {
      this.chat.abrirConversacion(conv);
    }
    this.toastService.dismiss(t.id);
  }

  dismiss(id: number) {
    this.toastService.dismiss(id);
  }
}
