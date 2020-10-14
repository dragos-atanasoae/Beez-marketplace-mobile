import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByMetacategory'
})
export class FilterByMetacategoryPipe implements PipeTransform {

  transform(items: any[], filter: any): any {
    console.log(items, filter);
    if (!items || !filter) {
      return items;
    }
    // filter items array, items which match and return true will be
    // kept, false will be filtered out
    return items.filter((item) => {
      const filteredCategories: any = item.vendorMetaCategories.filter((category: any) => category.id === filter.id);
      if (filteredCategories.length > 0) {
        return filteredCategories;
      }
    });
  }

}
