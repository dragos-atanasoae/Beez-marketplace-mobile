import { Component, OnInit, Input } from '@angular/core';
import { trigger, transition, useAnimation } from '@angular/animations';
import { bounceIn } from 'ng-animate';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-custom-alert',
  templateUrl: './custom-alert.component.html',
  styleUrls: ['./custom-alert.component.scss'],
  animations: [
    trigger('bounceIn', [
      transition(':enter', useAnimation(bounceIn), {
        params: { timing: 1.2, delay: 0 }
      }),
    ]),
  ]
})
export class CustomAlertComponent implements OnInit {
  @Input() isVip: boolean;
  @Input() header: string;
  @Input() subHeader: string;
  @Input() message: string;
  @Input() btnOk: string = null;
  @Input() btnCancel: string = null;
  @Input() image: string;

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit(): void { }

  closeModal(response: string) {
    this.modalCtrl.dismiss(response);
  }

}
