import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ImageViewerPageRoutingModule } from './image-viewer-routing.module';

import { ImageViewerPage } from './image-viewer.page';
import { PipesModule } from 'src/app/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    ImageViewerPageRoutingModule
  ],
  declarations: [ImageViewerPage]
})
export class ImageViewerPageModule {}
