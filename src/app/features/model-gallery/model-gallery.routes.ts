import { Routes } from '@angular/router';

export const MODEL_GALLERY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./model-gallery.component').then(m => m.ModelGalleryComponent),
  },
  {
    path: ':problemId',
    loadComponent: () =>
      import('./model-gallery.component').then(m => m.ModelGalleryComponent),
  },
];
