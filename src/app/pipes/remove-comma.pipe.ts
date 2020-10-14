import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeComma'
})
export class RemoveCommaPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    value = value.replace(/,/g, '');
    return value;
  }

}
