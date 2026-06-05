import { Injectable, signal } from '@angular/core';

export interface ChatToastItem {
  id: number;
  tipo: 'mensaje' | 'cita';
  titulo: string;
  cuerpo: string;
  conversacion_id: number;
}

function playSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Audio not available
  }
}

@Injectable({ providedIn: 'root' })
export class ChatToastService {
  toasts = signal<ChatToastItem[]>([]);
  private counter = 0;

  mostrar(toast: Omit<ChatToastItem, 'id'>) {
    const id = ++this.counter;
    this.toasts.update((t) => [...t, { ...toast, id }]);
    if (toast.tipo === 'cita') playSound();
    setTimeout(() => {
      this.toasts.update((t) => t.filter((x) => x.id !== id));
    }, 10000);
  }

  dismiss(id: number) {
    this.toasts.update((t) => t.filter((x) => x.id !== id));
  }
}
