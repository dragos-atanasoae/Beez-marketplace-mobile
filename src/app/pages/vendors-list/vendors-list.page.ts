import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LocaleDataModel } from 'src/app/models/localeData.model';
import { InternationalizationService } from 'src/app/services/internationalization.service';
import { LoadingService } from 'src/app/services/loading.service';
import { MarketplaceService } from 'src/app/services/marketplace.service';
import { MarketplaceProductsPage } from '../marketplace-products/marketplace-products.page';

@Component({
  selector: 'app-vendors-list',
  templateUrl: './vendors-list.page.html',
  styleUrls: ['./vendors-list.page.scss'],
})
export class VendorsListPage implements OnInit {
  @Input() vendorsList: any = [];
  @Input() metacategory: string = null;
  localeData = new LocaleDataModel();
  city: any = JSON.parse(localStorage.getItem('city'));
  county: any = JSON.parse(localStorage.getItem('county'));
  categories = [];


  constructor(
    private internationalizationService: InternationalizationService,
    private loadingService: LoadingService,
    private modalCtrl: ModalController,
    private marketplaceService: MarketplaceService,
  ) {
    // Initialize locale context
    this.internationalizationService.initializeCountry().subscribe(res => {
      this.localeData = res;
    });
  }

  ngOnInit() {
  }


  async selectVendor(vendor: any) {
    const modal = await this.modalCtrl.create({
      component: MarketplaceProductsPage,
      componentProps: {}
    });

    this.loadingService.presentLoading();
    this.marketplaceService.getCategories(vendor.id, this.city.Id).subscribe((res: any) => {
      if (res.requestStatus === 'Success') {
        this.categories = res.requestData;
        modal.componentProps = {
          context: null,
          products: null,
          allCategories: res.requestData,
          selectedCategory: res.requestData[0],
          vendor,
          county: this.county,
          city: this.city
        };
        modal.present().then(() => this.loadingService.dismissLoading());
      }
    });
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

}
