import { Routes } from '@angular/router';

export const PROBLEM_SELECTION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./problem-selection.component').then(m => m.ProblemSelectionComponent),
  },
];
