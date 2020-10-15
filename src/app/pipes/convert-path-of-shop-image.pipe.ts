import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'convertPathOfShopImage'
})
/**
 * @description Corect all images url - removing begining og the url and replace it with custom url
 */
export class ConvertPathOfShopImagePipe implements PipeTransform {

  transform(value: string, character: string): string {
    return value.replace(character, '/');
  }
}
