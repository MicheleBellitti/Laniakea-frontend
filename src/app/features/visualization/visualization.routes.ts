import { Routes } from '@angular/router';

export const VISUALIZATION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./visualization.component').then(m => m.VisualizationComponent),
  },
];
