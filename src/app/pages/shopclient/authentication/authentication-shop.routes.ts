import { Routes } from '@angular/router';

import { AppSideLoginShopComponent } from './side-login/side-login-shop.component';

export const AuthenticationRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'login',
        component: AppSideLoginShopComponent,
      },

    ],
  },
];
