import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { trigger, transition, useAnimation } from '@angular/animations';
import { flipOutX, flipInX } from 'ng-animate';

@Component({
  selector: 'app-overlay-payment-success',
  templateUrl: './overlay-payment-success.component.html',
  styleUrls: ['./overlay-payment-success.component.scss'],
  animations: [
    trigger('animationFlipX', [
      transition(':enter', useAnimation(flipInX), {
        params: { timing: 0.8, delay: 0.3 }
      }),
      // transition(':leave', useAnimation(flipOutX), {
      //   params: { timing: 0.3, delay: 0 }
      // })
    ]),
  ]
})
export class OverlayPaymentSuccessComponent implements OnInit {

  @Output() hideOverlayComponent = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {}

  closeOverlay() {
    this.hideOverlayComponent.emit(false);
  }

}
