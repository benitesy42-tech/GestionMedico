import { Component, inject, signal, HostListener, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ChatService } from '../../features/chat/chat.service';
import { ListaConversaciones } from '../../features/chat/lista-conversaciones';
import { VentanaChat } from '../../features/chat/ventana-chat';

export interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ListaConversaciones, VentanaChat],
  templateUrl: './sidebar-layout.html',
})
export class SidebarLayout implements OnInit, OnDestroy {
  protected auth = inject(AuthService);
  protected chat = inject(ChatService);
  private route = inject(ActivatedRoute);

  sidebarOpen = signal(false);

  get navItems(): NavItem[] {
    return this.route.snapshot.data['navItems'] || [];
  }

  get title(): string {
    return this.route.snapshot.data['title'] || 'SGCM';
  }

  get roleName(): string {
    return this.route.snapshot.data['roleName'] || '';
  }

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token && this.auth.isAuthenticated()) {
      this.chat.conectar(token);
    }
  }

  ngOnDestroy() {
    this.chat.desconectar();
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  logout(): void {
    this.chat.desconectar();
    this.auth.logout();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 767) {
      this.sidebarOpen.set(false);
    }
  }
}
