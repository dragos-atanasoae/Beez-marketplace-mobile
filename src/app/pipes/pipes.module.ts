import { ReplaceCommaPipe } from './replace-comma.pipe';
import { NgModule } from '@angular/core';
import { SearchPipe } from './search.pipe';
import { CorrectHttpToHttpsPipe } from './correct-http-to-https.pipe';
import { RemoveCommaPipe } from './remove-comma.pipe';
import { ReverseArrayPipe } from './reverse-array.pipe';
import { SafeHTMLPipe } from './safe-html.pipe';
import { FilterByMetacategoryPipe } from './filter-by-metacategory.pipe';
import { ConvertToLocaleTimePipe } from './convert-to-locale-time.pipe';
import { ConvertPathOfShopImagePipe } from './convert-path-of-shop-image.pipe';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    SearchPipe,
    CorrectHttpToHttpsPipe,
    RemoveCommaPipe,
    ReverseArrayPipe,
    SafeHTMLPipe,
    ReplaceCommaPipe,
    FilterByMetacategoryPipe,
    ConvertToLocaleTimePipe,
    ConvertPathOfShopImagePipe,
  ],
  imports: [
    TranslateModule
  ],
  exports: [
    SearchPipe,
    CorrectHttpToHttpsPipe,
    RemoveCommaPipe,
    ReverseArrayPipe,
    SafeHTMLPipe,
    ReplaceCommaPipe,
    FilterByMetacategoryPipe,
    ConvertToLocaleTimePipe,
    ConvertPathOfShopImagePipe,
  ]
})
export class PipesModule {}
