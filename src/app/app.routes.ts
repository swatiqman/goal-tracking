import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('@goal-tracking/goal').then((m) => m.GoalComponent),
  },
];
