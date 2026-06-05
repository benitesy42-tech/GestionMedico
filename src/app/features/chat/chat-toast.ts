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
      gap: 10px;
      background: #1e293b;
      color: #fff;
      padding: 12px 14px;
      border-radius: 12px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.25);
      cursor: pointer;
      pointer-events: auto;
      max-width: 360px;
      transition: opacity 0.3s ease, transform 0.3s ease;
      animation: fadeInUp 0.35s cubic-bezier(0.16,1,0.3,1) both;
    }
    .chat-toast-icon {
      font-size: 1.2rem;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .chat-toast-content {
      flex: 1;
      min-width: 0;
    }
    .chat-toast-title {
      font-weight: 600;
      font-size: 0.8rem;
      margin-bottom: 2px;
    }
    .chat-toast-body {
      font-size: 0.75rem;
      opacity: 0.8;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .chat-toast-close {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 1rem;
      padding: 0 0 0 4px;
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
