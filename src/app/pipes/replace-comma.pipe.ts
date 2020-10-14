import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replaceComma'
})
export class ReplaceCommaPipe implements PipeTransform {

  transform(val: any) {
    return val.split(',').join(', ');
  }

}
