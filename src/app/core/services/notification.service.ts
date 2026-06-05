import { Injectable, signal } from '@angular/core';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  id: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  notifications = signal<Notification[]>([]);
  private counter = 0;

  show(message: string, type: Notification['type'] = 'info', duration = 3000): void {
    const id = ++this.counter;
    this.notifications.update((n) => [...n, { message, type, id }]);
    setTimeout(() => {
      this.notifications.update((n) => n.filter((x) => x.id !== id));
    }, duration);
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error', 5000);
  }

  warning(message: string): void {
    this.show(message, 'warning');
  }
}
