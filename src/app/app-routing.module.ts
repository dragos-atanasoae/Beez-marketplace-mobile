import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './services/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuardService],
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'welcome',
    loadChildren: () => import('./pages/welcome/welcome.module').then( m => m.WelcomePageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'payment',
    loadChildren: () => import('./pages/payment/payment.module').then( m => m.PaymentPageModule)
  },
  {
    path: 'edit-delivery-address',
    loadChildren: () => import('./pages/edit-delivery-address/edit-delivery-address.module').then( m => m.EditDeliveryAddressPageModule)
  },
  {
    path: 'image-viewer',
    loadChildren: () => import('./pages/image-viewer/image-viewer.module').then( m => m.ImageViewerPageModule)
  },
  {
    path: 'reset-password',
    loadChildren: () => import('./pages/reset-password/reset-password.module').then( m => m.ResetPasswordPageModule)
  },
  {
    path: 'marketplace-categories',
    loadChildren: () => import('./pages/marketplace-categories/marketplace-categories.module').then( m => m.MarketplaceCategoriesPageModule)
  },
  {
    path: 'marketplace-products',
    loadChildren: () => import('./pages/marketplace-products/marketplace-products.module').then( m => m.MarketplaceProductsPageModule)
  },
  {
    path: 'marketplace-locations',
    loadChildren: () => import('./pages/marketplace-locations/marketplace-locations.module').then( m => m.MarketplaceLocationsPageModule)
  },
  {
    path: 'manage-addresses',
    loadChildren: () => import('./pages/profile/manage-addresses/manage-addresses.module').then( m => m.ManageAddressesPageModule)
  },
  {
    path: 'manage-stripe-cards',
    loadChildren: () => import('./pages/profile/manage-stripe-cards/manage-stripe-cards.module').then( m => m.ManageStripeCardsPageModule)
  },
  {
    path: 'vip-subscription',
    loadChildren: () => import('./pages/profile/vip-subscription/vip-subscription.module').then( m => m.VipSubscriptionPageModule)
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
