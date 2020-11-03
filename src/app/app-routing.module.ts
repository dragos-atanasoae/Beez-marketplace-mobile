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
    path: 'edit-delivery-address',
    loadChildren: () => import('./pages/edit-delivery-address/edit-delivery-address.module').then( m => m.EditDeliveryAddressPageModule)
  },
  {
    path: 'marketplace-categories',
    loadChildren: () => import('./pages/marketplace-categories/marketplace-categories.module').then( m => m.MarketplaceCategoriesPageModule)
  },
  {
    path: 'marketplace-locations',
    loadChildren: () => import('./pages/marketplace-locations/marketplace-locations.module').then( m => m.MarketplaceLocationsPageModule)
  },
  {
    path: 'marketplace-products',
    loadChildren: () => import('./pages/marketplace-products/marketplace-products.module').then( m => m.MarketplaceProductsPageModule)
  },
  {
    path: 'marketplace-product-details',
    loadChildren: () => import('./pages/marketplace-product-details/marketplace-product-details.module').then( m => m.MarketplaceProductDetailsPageModule)
  },
  {
    path: 'missing-products',
    loadChildren: () => import('./pages/missing-products/missing-products.module').then( m => m.MissingProductsPageModule)
  },
  {
    path: 'order-details',
    loadChildren: () => import('./pages/order-details/order-details.module').then( m => m.OrderDetailsPageModule)
  },
  {
    path: 'shopping-cart',
    loadChildren: () => import('./pages/shopping-cart/shopping-cart.module').then( m => m.ShoppingCartPageModule)
  },
  {
    path: 'payment',
    loadChildren: () => import('./pages/payment/payment.module').then( m => m.PaymentPageModule)
  },
  {
    path: 'account-settings',
    loadChildren: () => import('./pages/profile/account-settings/account-settings.module').then( m => m.AccountSettingsPageModule)
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
    path: 'notifications-center',
    loadChildren: () => import('./pages/profile/notifications-center/notifications-center.module').then( m => m.NotificationsCenterPageModule)
  },
  {
    path: 'notifications-settings',
    loadChildren: () => import('./pages/profile/notifications-settings/notifications-settings.module').then( m => m.NotificationsSettingsPageModule)
  },
  {
    path: 'welcome',
    loadChildren: () => import('./pages/welcome/welcome.module').then( m => m.WelcomePageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'reset-password',
    loadChildren: () => import('./pages/reset-password/reset-password.module').then( m => m.ResetPasswordPageModule)
  },
  {
    path: 'image-viewer',
    loadChildren: () => import('./pages/image-viewer/image-viewer.module').then( m => m.ImageViewerPageModule)
  },
  {
    path: 'vip-subscription',
    loadChildren: () => import('./pages/profile/vip-subscription/vip-subscription.module').then( m => m.VipSubscriptionPageModule)
  },
  {
    path: 'transactions-list',
    loadChildren: () => import('./pages/transactions-list/transactions-list.module').then( m => m.TransactionsListPageModule)
  },
  {
    path: 'help',
    loadChildren: () => import('./pages/profile/help/help.module').then( m => m.HelpPageModule)
  },
  {
    path: 'guest-mode',
    loadChildren: () => import('./pages/guest-mode/guest-mode.module').then( m => m.GuestModePageModule)
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
