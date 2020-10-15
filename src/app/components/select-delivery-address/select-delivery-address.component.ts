import { LoadingService } from 'src/app/services/loading.service';
import { Component, OnInit, Output, EventEmitter, Input, NgZone } from '@angular/core';
import { DeliveryAddressService } from 'src/app/services/delivery-address.service';
import { ModalController } from '@ionic/angular';
import { EditDeliveryAddressPage } from 'src/app/pages/edit-delivery-address/edit-delivery-address.page';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-select-delivery-address',
  templateUrl: './select-delivery-address.component.html',
  styleUrls: ['./select-delivery-address.component.scss'],
})
export class SelectDeliveryAddressComponent implements OnInit {
  @Input() isMarketplace = false;
  @Input() county: any;
  @Input() city: any;
  @Input() vendorId: any;

  @Output() selectAddress = new EventEmitter<object>();
  @Output() hideDeliveryAddressComponent = new EventEmitter<boolean>();
  @Output() eventAddProductToBeezPay = new EventEmitter<number>();
  @Input() isVoucher = false;

  language: string;
  listOfDeliveryAddresses = null;
  selectedAddress: any;
  selectedId: number;

  constructor(
    private deliveryAddressService: DeliveryAddressService,
    private modalCtrl: ModalController,
    private loadingService: LoadingService,
    public translate: TranslateService,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    this.getListOfDeliveryAddresses('onInit');
    console.log(this.county);
    console.log(this.city);
  }

  sendSelectedAddress() {
    console.log(this.selectAddress);
    this.selectAddress.emit(this.selectedAddress);
  }

  sendEventHideAddressComponent() {
    this.hideDeliveryAddressComponent.emit(true);
  }

  sendEventAddProductToBeezPay() {
    this.eventAddProductToBeezPay.emit(this.selectedAddress);
  }

  /**
   * @description Get list of delivery addresses and select the delivery address.
   * * If the context is onInit(from ngOnInit) select the first address from array
   * * If the context is onUpdate(when the edit address modal did dismiss) keep the previous selected address
   * @param context
   */
  getListOfDeliveryAddresses(context: string) {
    // this.loadingService.presentLoading();
    this.deliveryAddressService.getListOfDeliveryAddresses(this.isMarketplace,
      this.city !== undefined ? this.city.Id : null,
      this.vendorId !== undefined ? this.vendorId : null)
      .subscribe((response: any) => {
        console.log(response);
        // this.loadingService.dismissLoading();
        if (response.status === 'success') {
          console.log(this.listOfDeliveryAddresses);
          this.ngZone.run(() => this.selectDeliveryAddress(context, response.deliveryAddresses));
        }
      });
  }

  selectDeliveryAddress(context: string, listOfAddresses: any) {
    this.listOfDeliveryAddresses = listOfAddresses.reverse();
    switch (context) {
      case 'onInit':
        if (listOfAddresses.length > 0) {
          this.selectedAddress = this.listOfDeliveryAddresses[0];
          this.selectedId = this.selectedAddress.Id;
          this.sendSelectedAddress();
          console.log('onInit', this.listOfDeliveryAddresses);
        } else if (!this.isMarketplace) {
          this.openModalAddEditDeliveryAddress('add');
        }
        break;
      case 'onUpdate':
        if (listOfAddresses.length > 0) {
          this.selectedAddress = this.listOfDeliveryAddresses.find(x => x.Id === this.selectedId);
          this.sendSelectedAddress();
          console.log('onUpdate', this.selectedAddress);
        }
        break;
      case 'onAdd':
        if (listOfAddresses.length > 0) {
          this.selectedAddress = this.listOfDeliveryAddresses[0];
          this.selectedId = this.selectedAddress.Id;
          this.sendSelectedAddress();
          console.log('onAdd', this.selectedAddress);
        }
        break;
    }
    console.log(this.listOfDeliveryAddresses);
  }

  /**
   * @description Open modal ADD/EDIT Delivery address.
   * * to ADD address send context "add"
   * * to EDIT selected address send context "edit"
   * @param action
   */
  async openModalAddEditDeliveryAddress(action: string) {
    let address = {};
    if (action === 'edit') {
      address = this.selectedAddress;
    }
    const modal = await this.modalCtrl.create({
      component: EditDeliveryAddressPage,
      componentProps: {
        selectedAddress: address,
        context: action,
        isMarketplace: this.isMarketplace,
        county: this.county,
        city: this.city,
      }
    });
    modal.present();
    modal.onDidDismiss().then(() => {
      if (action === 'add') {
        this.getListOfDeliveryAddresses('onAdd');
      } else {
        this.getListOfDeliveryAddresses('onUpdate');
      }
    });
  }

}
