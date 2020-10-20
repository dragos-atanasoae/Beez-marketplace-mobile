import { LoadingService } from 'src/app/services/loading.service';
import { NavParams, AlertController, ModalController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { trigger, transition, useAnimation } from '@angular/animations';
import { bounceIn, fadeOut } from 'ng-animate';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  animations: [
    trigger('beeAnimation', [
      transition(':enter', useAnimation(bounceIn), {
        params: { timing: 1, delay: 0.3 }
      }),
      transition(':leave', useAnimation(fadeOut), {
        params: { timing: 0.3, delay: 0 }
      })
    ])
  ]
})
export class ResetPasswordPage implements OnInit {

  email: any;
  resetPasswordForm: FormGroup;
  resetPasswordResponse: any;

  constructor(
    private formBuilder: FormBuilder,
    private navParams: NavParams,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private loadingService: LoadingService,
    private translate: TranslateService,
    private authenticationService: AuthenticationService,
    ) {
      this.email = this.navParams.get('email');
   }

  get formControls() { return this.resetPasswordForm.controls; }

  ngOnInit() {
    this.resetPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+[.]+[a-zA-Z0-9- .]+$')]]
    });
    this.resetPasswordForm.get('email').setValue(this.email);
  }

  /**
   * *** Reset Password ***
   * ======================
   * @Param email
   */
  resetPassword(country: string, email: string) {
    this.loadingService.presentLoading();
    this.authenticationService.recoverPassword(country, email).subscribe(res => {
      console.log(res);
      this.resetPasswordResponse = res;
      setTimeout(() => {
        if (this.resetPasswordResponse.status === 'success') {
          this.modalCtrl.dismiss();
        }
        this.loadingService.dismissLoading();
      }, 600);
    }, () => this.loadingService.dismissLoading());
  }

  async selectAccountCountry() {
    const promptForCountry = await this.alertCtrl.create({
      header: this.translate.instant('pages.resetPassword.titleAlertChooseCountry'),
      inputs: [
        {
          type: 'radio',
          label: 'United Kingdom',
          value: 'uk'
        },
        {
          type: 'radio',
          label: 'Romania',
          value: 'ro'
        }
      ],
      buttons: [
        {
          text: this.translate.instant('buttons.buttonCancel'),
          role: 'cancel',
          cssClass: 'alert_btn_cancel'
        },
        {
          text: this.translate.instant('buttons.buttonContinue'),
          handler: data => {
            if (data !== undefined) {
              console.log('Selected country: ', data);
              localStorage.setItem('country', data);
              this.resetPassword(data, this.resetPasswordForm.value.email);
            } else {
              this.selectAccountCountry();
            }
          },
          cssClass: 'alert_btn_action'
        }
      ],
      cssClass: 'custom_alert'
    });
    promptForCountry.present();
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }
}
