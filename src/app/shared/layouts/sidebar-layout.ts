import { Component, inject, signal, HostListener } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

export interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './sidebar-layout.html',
})
export class SidebarLayout {
  protected auth = inject(AuthService);
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

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 767) {
      this.sidebarOpen.set(false);
    }
  }
}
