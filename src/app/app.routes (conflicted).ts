import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/main/main.component').then(m => m.MainComponent) },
  { path: 'advanced', loadComponent: () => import('./pages/advanced/advanced.component').then(m => m.AdvancedComponent) },
  { path: 'mood', loadComponent: () => import('./pages/mood/mood.component').then(m => m.MoodComponent) },
  { path: 'details/:id', loadComponent: () => import('./component/common/details/details.component').then(m => m.DetailsComponent) },
  { path: 'mia', loadComponent: () => import('./pages/mia/mia.component').then(m => m.MiaComponent) }
];
