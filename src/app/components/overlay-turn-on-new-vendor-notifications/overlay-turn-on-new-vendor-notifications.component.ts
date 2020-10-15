import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MarketplaceService } from 'src/app/services/marketplace.service';
import { LoadingService } from 'src/app/services/loading.service';
import { trigger, transition, useAnimation } from '@angular/animations';
import { bounceIn } from 'ng-animate';

@Component({
  selector: 'app-overlay-turn-on-new-vendor-notifications',
  templateUrl: './overlay-turn-on-new-vendor-notifications.component.html',
  styleUrls: ['./overlay-turn-on-new-vendor-notifications.component.scss'],
  animations: [
    trigger('bounceIn', [
      transition(':enter', useAnimation(bounceIn), {
        params: { timing: 1.2, delay: 0 }
      }),
    ]),
  ]
})
export class OverlayTurnOnNewVendorNotificationsComponent implements OnInit {
  @Input() city: any;

  constructor(
    private modalCtrl: ModalController,
    private marketplaceService: MarketplaceService,
    private loadingService: LoadingService
  ) { }

  ngOnInit() { }


  updateStatusOfNewVendorNotifications() {
    this.marketplaceService.postNewVendorNotificationsStatus(this.city.Id, true).subscribe((res: any) => {
      if (res.status === 'success') {
        this.modalCtrl.dismiss('success');
      }
    });
  }

  closeModal() {
    this.modalCtrl.dismiss('cancel');
  }

}
