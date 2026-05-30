import { Component, inject } from '@angular/core';
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

  get navItems(): NavItem[] {
    return this.route.snapshot.data['navItems'] || [];
  }

  get title(): string {
    return this.route.snapshot.data['title'] || 'SGCM';
  }

  get roleName(): string {
    return this.route.snapshot.data['roleName'] || '';
  }

  logout(): void {
    this.auth.logout();
  }
}
