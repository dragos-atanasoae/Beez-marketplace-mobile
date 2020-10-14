import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'correctHttpToHttps'
})
export class CorrectHttpToHttpsPipe implements PipeTransform {

  transform(value: string, character: string): string {
    return value.replace(character, 'https:');
  }

}
