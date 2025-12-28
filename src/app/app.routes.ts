import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/home/home.routes').then(m => m.HOME_ROUTES),
      },
      {
        path: 'problems',
        loadChildren: () =>
          import('./features/problem-selection/problem-selection.routes').then(
            m => m.PROBLEM_SELECTION_ROUTES
          ),
      },
      {
        path: 'gallery',
        loadChildren: () =>
          import('./features/model-gallery/model-gallery.routes').then(
            m => m.MODEL_GALLERY_ROUTES
          ),
      },
      {
        path: 'explore',
        loadChildren: () =>
          import('./features/inference-explorer/inference-explorer.routes').then(
            m => m.INFERENCE_EXPLORER_ROUTES
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
