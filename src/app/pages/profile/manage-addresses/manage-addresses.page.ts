import { Component, OnInit, Input } from '@angular/core';
import { LoadingService } from 'src/app/services/loading.service';
import { TranslateService } from '@ngx-translate/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';
import { DeliveryAddressService } from 'src/app/services/delivery-address.service';
import { EditDeliveryAddressPage } from '../../edit-delivery-address/edit-delivery-address.page';

@Component({
  selector: 'app-manage-addresses',
  templateUrl: './manage-addresses.page.html',
  styleUrls: ['./manage-addresses.page.scss'],
})
export class ManageAddressesPage implements OnInit {
  @Input() profileInfo: any;
  listOfDeliveryAddresses: any = [];
  contactAddress = null;
  action = '';

  constructor(
    private loadingService: LoadingService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    public userService: UserService,
    private deliveryAddressService: DeliveryAddressService,
    public translate: TranslateService,
    private modalCtrl: ModalController) { }

  ngOnInit() {
    // if profileInfo === 0 then come form shops page carousel
    if (this.profileInfo === null) {
      this.getProfileInfo();
    } else {
      this.listOfDeliveryAddresses = this.profileInfo.DeliveryInvoicingAddresses.reverse();
      this.contactAddress = this.profileInfo.ContactAddress;
    }
    console.log(this.listOfDeliveryAddresses);

  }

  getProfileInfo() {
    this.loadingService.presentLoading();
    this.userService.getProfileInfo()
      .subscribe((response: any) => {
        console.log(response);
        if (response.status === 'succes') {
          this.listOfDeliveryAddresses = response.data.DeliveryInvoicingAddresses.reverse();
          this.contactAddress = response.data.ContactAddress;
        }
        this.loadingService.dismissLoading();
      }, () => this.loadingService.dismissLoading());
  }

  /**
   * @description Open modal ADD/EDIT Delivery address.
   * * to ADD address send context "add"
   * * to EDIT selected address send context "edit"
   * @param action
   * @param selectedAddress
   */
  async openModalAddEditAddress(action: string, selectedAddress?: any) {
    const modal = await this.modalCtrl.create({
      component: EditDeliveryAddressPage,
      componentProps: {
        selectedAddress,
        context: action
      }
    });
    await modal.present();
    modal.onDidDismiss().then((data) => {
      console.log(data);
      if (data.data === 'add' || data.data === 'edit') {
        this.action = data.data;
        this.getProfileInfo();
      }
    });
  }

  /**
   * @name deleteDeliveryAddress
   * @description Delete the selected delivery address from database
   * @param id
   */
  async deleteDeliveryAddress(id: number) {
    const alert = await this.alertCtrl.create({
      subHeader: this.translate.instant('pages.manageAddresses.alertDeleteAddress.message'),
      buttons: [
        {
          text: this.translate.instant('buttons.buttonCancel'),
          role: 'cancel',
          cssClass: 'alert_btn_cancel'
        },
        {
          text: this.translate.instant('buttons.buttonDelete'),
          handler: () => {
            const data = {
              Tag: localStorage.getItem('userName'),
              Id: id
            };
            this.loadingService.presentLoading();
            this.deliveryAddressService.deleteDeliveryAddress(data).subscribe((res: any) => {
              console.log(res);
              if (res.status === 'success') {
                this.presentToast(this.translate.instant('pages.manageAddresses.toastMessages.onDeleteSuccess'));
                this.getProfileInfo();
              } else {
                this.presentToast(this.translate.instant('pages.manageAddresses.toastMessages.onDeleteError'));
              }
              this.loadingService.dismissLoading();
            }, () => this.loadingService.dismissLoading());
          },
          cssClass: 'alert_btn_action'
        }
      ],
      cssClass: 'alert_remove_item'
    });
    alert.present();
  }

  async presentToast(msg: string) {
    this.toastCtrl.dismiss();
    const toast = await this.toastCtrl.create({
      message: msg,
      buttons: [{
        text: 'OK',
        role: 'cancel',
        handler: () => this.toastCtrl.dismiss()
      }],
      position: 'bottom',
      cssClass: 'custom_toast'
    });
    toast.present();
  }

  closeModal() {
    this.modalCtrl.dismiss(this.action);
  }

}
