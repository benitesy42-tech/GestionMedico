import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { SidebarLayout } from './shared/layouts/sidebar-layout';
import { NavItem } from './shared/layouts/sidebar-layout';

const adminNav: NavItem[] = [
  { label: 'Dashboard', route: '/admin', icon: 'bi-speedometer2' },
  { label: 'Médicos', route: '/admin/medicos', icon: 'bi-person-badge' },
  { label: 'Pacientes', route: '/admin/pacientes', icon: 'bi-people' },
  { label: 'Especialidades', route: '/admin/especialidades', icon: 'bi-building' },
  { label: 'Reportes', route: '/admin/reportes', icon: 'bi-graph-up-arrow' },
];

const recepcionNav: NavItem[] = [
  { label: 'Dashboard', route: '/recepcion', icon: 'bi-speedometer2' },
  { label: 'Pacientes', route: '/recepcion/pacientes', icon: 'bi-people' },
  { label: 'Citas', route: '/recepcion/citas', icon: 'bi-calendar-check' },
  { label: 'Pagos', route: '/recepcion/pagos', icon: 'bi-currency-dollar' },
];

const medicoNav: NavItem[] = [
  { label: 'Mi Agenda', route: '/medico', icon: 'bi-calendar-week' },
  { label: 'Historial Clínico', route: '/medico/historial', icon: 'bi-journal-text' },
];

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login'),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    component: SidebarLayout,
    data: { navItems: adminNav, title: 'Admin SGCM', roleName: 'Administrador' },
    children: [
      { path: '', loadComponent: () => import('./features/admin/dashboard/admin-dashboard') },
      { path: 'medicos', loadComponent: () => import('./features/admin/medicos/admin-medicos') },
      { path: 'pacientes', loadComponent: () => import('./features/admin/pacientes/admin-pacientes') },
      { path: 'especialidades', loadComponent: () => import('./features/admin/especialidades/admin-especialidades') },
      { path: 'reportes', loadComponent: () => import('./features/admin/reportes/admin-reportes') },
    ],
  },
  {
    path: 'recepcion',
    canActivate: [authGuard],
    component: SidebarLayout,
    data: { navItems: recepcionNav, title: 'Recepción SGCM', roleName: 'Recepcionista' },
    children: [
      { path: '', loadComponent: () => import('./features/recepcion/dashboard/recepcion-dashboard') },
      { path: 'pacientes', loadComponent: () => import('./features/recepcion/pacientes/recepcion-pacientes') },
      { path: 'citas', loadComponent: () => import('./features/recepcion/citas/recepcion-citas') },
      { path: 'pagos', loadComponent: () => import('./features/recepcion/pagos/recepcion-pagos') },
    ],
  },
  {
    path: 'medico',
    canActivate: [authGuard],
    component: SidebarLayout,
    data: { navItems: medicoNav, title: 'Médico SGCM', roleName: 'Médico' },
    children: [
      { path: '', loadComponent: () => import('./features/medico/dashboard/medico-dashboard') },
      { path: 'consulta/:idCita', loadComponent: () => import('./features/medico/consulta/medico-consulta') },
      { path: 'historial', loadComponent: () => import('./features/medico/historial/historial-clinico') },
      { path: 'historial/paciente/:idPaciente', loadComponent: () => import('./features/medico/historial/historial-clinico') },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
