import { Routes } from '@angular/router';

export const INFERENCE_EXPLORER_ROUTES: Routes = [
  {
    path: ':problemType/:modelId',
    loadComponent: () =>
      import('./inference-explorer.component').then(m => m.InferenceExplorerComponent),
  },
];
