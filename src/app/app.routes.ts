import { Routes } from '@angular/router';
import { authGuard, invitadoGuard } from './core/auth.guards';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'panel' },
  {
    path: 'login',
    canActivate: [invitadoGuard],
    title: 'Iniciar sesion | Banco Practica',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    canActivate: [invitadoGuard],
    title: 'Crear cuenta | Banco Practica',
    loadComponent: () => import('./pages/registro/registro').then((m) => m.Registro),
  },
  {
    path: 'panel',
    canActivate: [authGuard],
    title: 'Mis cuentas | Banco Practica',
    loadComponent: () => import('./pages/panel/panel').then((m) => m.Panel),
  },
  { path: '**', redirectTo: 'panel' },
];
