import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  isLoading = false;
  loading = null;

  constructor(private loadingCtrl: LoadingController,
              private translate: TranslateService) {}

  async initializeLoading(infinite?: boolean) {
    console.log('INITIALIZE LOADING');
    this.loading = await this.loadingCtrl.create({
      spinner: 'bubbles',
      message: this.translate.instant('loadingMessage'),
      duration: infinite ? 60000 : 6000,
      cssClass: 'loading_controller'
    });
    this.loading.onDidDismiss().then(() => {
      this.isLoading = false;
      this.loading = null;
    });
  }

  async presentLoading(infinite?: boolean) {
    if (!this.isLoading) {
      if (this.loading === null) {
        this.initializeLoading(infinite).then(() => {
          // console.log('PESENT NEW LOADING');
          this.loading.present().then(() => this.isLoading = true);
        });
      } else {
        // console.log('PRESENT LOADING');
        this.loading.present().then(() => this.isLoading = true);
      }
    } else {
      // console.log('ABORT LOADING');
    }
  }

  async dismissLoading() {
    console.log('DISMISS LOADING');
    this.isLoading = false;
    if (this.loading) {
      return await this.loadingCtrl.dismiss().then(() => {
        this.loading = null;
      });
    }
  }
}
