import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab-orders',
        loadChildren: () => import('../tab-orders/tab-orders.module').then(m => m.TabOrdersPageModule)
      },
      {
        path: 'tab-marketplace',
        loadChildren: () => import('../tab-marketplace/tab-marketplace.module').then(m => m.TabMarketplacePageModule)
      },
      {
        path: 'tab-profile',
        loadChildren: () => import('../tab-profile/tab-profile.module').then(m => m.TabProfilePageModule)
      },
      {
        path: '',
        redirectTo: '/tabs/tab-marketplace',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/tab-marketplace',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
