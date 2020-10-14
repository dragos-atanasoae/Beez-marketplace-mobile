import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  noResult: boolean;

  public transform(value: any, keys: string, term: string): any {
     // if (!term) return value;
    // return (value || []).filter((market) => keys.split(',').some(key => market.hasOwnProperty(key) && new RegExp(term, 'gi').test(market[key])));
    if (!term) { return value; }
    const aux = (value || []).filter((market) => keys.split(',').some(key => market.hasOwnProperty(key) && new RegExp(term, 'gi').test(market[key])));
    if (aux.length < 0) {
      return this.noResult = true;
    } else {
      return aux;
    }
  }

}
