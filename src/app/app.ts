import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationService } from './core/services/notification.service';
import { ChatToastComponent } from './features/chat/chat-toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ChatToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected notif = inject(NotificationService);
}
