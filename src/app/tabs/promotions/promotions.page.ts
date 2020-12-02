import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AnalyticsService } from 'src/app/services/analytics.service';
import { LoadingService } from 'src/app/services/loading.service';
import { MarketplaceService } from 'src/app/services/marketplace.service';
import { RedirectDeeplinkService } from 'src/app/services/redirect-deeplink.service';

@Component({
  selector: 'app-promotions',
  templateUrl: './promotions.page.html',
  styleUrls: ['./promotions.page.scss'],
})
export class PromotionsPage implements OnInit {

  promotionsList: any = null;
  seeMore = true;
  eventContext = 'Promotions Page';
  selectedPromotion = null;

  constructor(
    private analyticsService: AnalyticsService,
    private loadingService: LoadingService,
    private marketplaceService: MarketplaceService,
    private modalCtrl: ModalController,
    private redirectDeeplinkService: RedirectDeeplinkService,
  ) { }

  ngOnInit() {
    this.getPromotionsList();
  }

  ionViewWillEnter() {
    this.selectedPromotion = null;
  }

  getPromotionsList() {
    // this.loadingService.presentLoading();
    this.marketplaceService.getPromotionsList().subscribe((response: any) => {
      if (response) {
        // this.promotionsList = response;
        this.promotionsList = response.filter((item: any) => item.promotionType === 'Vendor');
        console.log('Promotions:', this.promotionsList);
      }
      this.loadingService.dismissLoading();
    }, () => {
      this.loadingService.dismissLoading();
      if (this.promotionsList === undefined) {
        this.promotionsList = [];
      }
    });

  }

  /**
   * @descriptiom Pull to Refresh page
   * @param refresher
   */
  doRefresh(refresher) {
    this.selectedPromotion = null;
    setTimeout(() => {
      this.getPromotionsList();
      refresher.target.complete();
    }, 1000);
  }

  /**
   * @name openPromotionDetails
   * @description Open selected promotion details in a new modal
   */
  openPromotionVendor(promotion: any) {
      this.loadingService.presentLoading();
      const path = promotion.promotionLink.split('https://test.use-beez.com/')[1];
      // const path = promotion.promotionLink.split('https://use-beez.com/')[1];
      this.redirectDeeplinkService.managePathRedirect(path);
  }
}
