import { Injectable, signal } from '@angular/core';

export interface ChatToastItem {
  id: number;
  tipo: 'mensaje' | 'cita';
  titulo: string;
  cuerpo: string;
  conversacion_id: number;
}

@Injectable({ providedIn: 'root' })
export class ChatToastService {
  toasts = signal<ChatToastItem[]>([]);
  private counter = 0;

  mostrar(toast: Omit<ChatToastItem, 'id'>) {
    const id = ++this.counter;
    this.toasts.update((t) => [...t, { ...toast, id }]);
    setTimeout(() => {
      this.toasts.update((t) => t.filter((x) => x.id !== id));
    }, 4000);
  }

  dismiss(id: number) {
    this.toasts.update((t) => t.filter((x) => x.id !== id));
  }
}
