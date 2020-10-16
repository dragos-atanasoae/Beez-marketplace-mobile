import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ImageViewerOptionsModel } from 'src/app/models/imageViewerOptions.model';
import { ModalController } from '@ionic/angular';
import { trigger, transition, useAnimation } from '@angular/animations';
import { slideInDown, zoomOut, zoomIn, slideOutDown } from 'ng-animate';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.page.html',
  styleUrls: ['./image-viewer.page.scss'],
  animations: [
    trigger('zoomIn', [
      transition(':enter', useAnimation(zoomIn), {
        params: { timing: 0.3, delay: 0 }
      }),
      transition(':leave', useAnimation(zoomOut), {
        params: { timing: 0.3, delay: 0 }
      }),
    ]),
    trigger('slideIn', [
      transition(':enter', useAnimation(slideInDown), {
        params: { timing: 0.3, delay: 0 }
      }),
      transition(':leave', useAnimation(slideOutDown), {
        params: { timing: 0.4, delay: 0 }
      }),
    ]),
  ]
})
export class ImageViewerPage implements OnInit {

  @Input() image: string; // the url or the path of the image
  @Input() options: ImageViewerOptionsModel;
  @ViewChild('imageSlide', { read: ElementRef }) imageSlide: ElementRef;

  defaultSlideOptions = {
    centeredSlides: true,
    passiveListeners: false,
    zoom: {
      maxRatio: 5,
      minRatio: 1,
    }
  };

  isZoomSelected = false;
  showImage = false;

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.showImage = true;
    }, 100);
  }

  zoomIn(zoom: boolean) {
    if (zoom) {
      this.imageSlide.nativeElement.swiper.zoom.in();
      this.isZoomSelected = true;
    } else {
      this.imageSlide.nativeElement.swiper.zoom.out();
      this.isZoomSelected = false;
    }
  }

  closeModal() {
    this.showImage = false;
    setTimeout(() => {
      this.modalCtrl.dismiss();
    }, 350);
  }
}
