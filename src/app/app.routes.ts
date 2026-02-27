import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';
import { ClientComponent } from './layouts/client/client.component';
import { ShopClientComponent } from './layouts/shopclient/shopclient.component';
import { ClientHomeComponent } from './pages/client/home/home.component';
import { authGuard } from './guards/auth.guard';
import { ClientPromotionsComponent } from './pages/client/promotions/promotions.component';

export const routes: Routes = [
  {
    path: '',
    component: ClientComponent,
    children: [
      {
        path: '',
        component: ClientHomeComponent,
      },
      {
        path: 'shops/:id',
        loadComponent: () =>
          import('./pages/client/shop-details/shop-details.component').then(
            (m) => m.ClientShopDetailsComponent
          ),
      },
      {
        path: 'promotions',
        loadComponent: () =>
          import('./pages/client/promotions/promotions.component').then(
            (m) => m.ClientPromotionsComponent
          ),
      },
      {
        path: 'communications',
        loadComponent: () =>
          import('./pages/client/communications/communications.component').then(
            (m) => m.ClientCommunicationsComponent
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./pages/client/products/products.component').then(
            (m) => m.ClientProductsComponent
          ),
      },
    ],
  },
  {
    path: 'admin',
    component: FullComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: '/admin/dashboard', // Redirect to dashboard within admin
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./pages/pages.routes').then((m) => m.PagesRoutes),
      },
      {
        path: 'ui-components',
        loadChildren: () =>
          import('./pages/ui-components/ui-components.routes').then(
            (m) => m.UiComponentsRoutes
          ),
      },
      {
        path: 'extra',
        loadChildren: () =>
          import('./pages/extra/extra.routes').then((m) => m.ExtraRoutes),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/users/user-list/user-list.component').then(
            (m) => m.AppUserComponent
          ),
      },
      {
        path: 'shops',
        loadComponent: () =>
          import('./pages/shops/shop-list/shop-list.component').then(
            (m) => m.AppShopComponent
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./pages/products/product-list/product-list.component').then(
            (m) => m.AppProductComponent
          ),
      },
      {
        path: 'sales',
        loadComponent: () =>
          import('./pages/sales/sale-list/sale-list.component').then(
            (m) => m.AppSaleComponent
          ),
      },
      {
        path: 'reviews',
        loadComponent: () =>
          import('./pages/reviews/review-list/review-list.component').then(
            (m) => m.AppReviewComponent
          ),
      },
      {
        path: 'communications',
        loadComponent: () =>
          import('./pages/communications/communication-list/communication-list.component').then(
            (m) => m.AppCommunicationComponent
          ),
      },
    ],
  },
  {
    path: 'shop-admin',
    component: ShopClientComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/shopclient/pages-shops/pages-shops.component').then(
            (m) => m.AppPagesShopsComponent
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./pages/shopclient/products/products.component').then(
            (m) => m.AppShopAdminProductsComponent
          ),
      },
      {
        path: 'sales',
        loadComponent: () =>
          import('./pages/shopclient/sales/sales.component').then(
            (m) => m.AppShopAdminSalesComponent
          ),
      },
      {
        path: 'reviews',
        loadComponent: () =>
          import('./pages/shopclient/reviews/reviews.component').then(
            (m) => m.AppShopAdminReviewsComponent
          ),
      },
    ],
  },
  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: 'authentication',
        loadChildren: () =>
          import('./pages/authentication/authentication.routes').then(
            (m) => m.AuthenticationRoutes
          ),
      },
      {
        path: 'shopclient/authentication',
        loadChildren: () =>
          import('./pages/shopclient/authentication/authentication-shop.routes').then(
            (m) => m.AuthenticationRoutes
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'authentication/error',
  },
];

