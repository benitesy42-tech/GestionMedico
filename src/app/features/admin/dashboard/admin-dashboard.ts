import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardService, DashboardStats } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink],
  templateUrl: './admin-dashboard.html',
})
export default class AdminDashboardComponent {
  private dashSvc = inject(DashboardService);

  stats = signal<DashboardStats | null>(null);
  loading = signal(true);
  error = signal(false);

  constructor() {
    this.dashSvc.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }
}
