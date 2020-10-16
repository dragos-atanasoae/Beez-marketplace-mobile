import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'orders',
        loadChildren: () => import('./orders/orders.module').then( m => m.OrdersPageModule)
      },
      {
        path: 'marketplace',
        loadChildren: () => import('./marketplace/marketplace.module').then( m => m.MarketplacePageModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
      },
      {
        path: '',
        redirectTo: '/tabs/marketplace',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/marketplace',
    pathMatch: 'full'
  },
  // {
  //   path: 'orders',
  //   loadChildren: () => import('./orders/orders.module').then( m => m.OrdersPageModule)
  // },
  // {
  //   path: 'marketplace',
  //   loadChildren: () => import('./marketplace/marketplace.module').then( m => m.MarketplacePageModule)
  // },
  // {
  //   path: 'profile',
  //   loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
