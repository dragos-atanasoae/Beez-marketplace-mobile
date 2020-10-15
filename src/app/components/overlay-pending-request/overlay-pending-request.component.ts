import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { trigger, transition, useAnimation } from '@angular/animations';
import { flipInX } from 'ng-animate';

@Component({
  selector: 'app-overlay-pending-request',
  templateUrl: './overlay-pending-request.component.html',
  styleUrls: ['./overlay-pending-request.component.scss'],
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
export class OverlayPendingRequestComponent implements OnInit {
  @Input() overlayContext: string;
  @Output() overlayIsActive = new EventEmitter<boolean>();

  translateIndex: string;

  constructor() {}

  ngOnInit() {
    console.log(this.overlayContext);
    this.switchTranslationByContext();
  }

  closeOverlay() {
    this.overlayIsActive.emit(false);
  }


  /**
   * @name switchTranslationByContext
   * @description Switch key of translation strings by context
   */
  switchTranslationByContext() {
    switch (this.overlayContext) {
      case 'orderProduct':
        this.translateIndex = 'contextOrderProduct';
        break;
      case 'payment':
        this.translateIndex = 'contextPayment';
        break;
      case 'revealCode':
        this.translateIndex = 'contextRevealCode';
        break;
    }
  }

}
