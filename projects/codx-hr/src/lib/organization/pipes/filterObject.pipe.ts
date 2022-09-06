import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  transform(
    items: any[],
    searchText: string,
    fieldName: string,
    searchText2: string,
    fieldName2: string
  ): any[] {
    // return empty array if array is falsy
    if (!items) {
      return [];
    }
    var d1 = items;
    // return the original array if search text is empty
    if (searchText) {
      // convert the searchText to lower case
      searchText = searchText.toLowerCase();

      // retrun the filtered array
      d1 = items.filter((item) => {
        if (item && item[fieldName]) {
          return item[fieldName].toLowerCase().includes(searchText);
        }
        return false;
      });
    }
    if (fieldName2 && fieldName2 != '') {
      if (searchText2) {
        // convert the searchText to lower case
        searchText2 = searchText2.toLowerCase();

        d1 = d1.filter((item) => {
          if (item && item[fieldName2]) {
            return item[fieldName2].toLowerCase().includes(searchText2);
          }
          return false;
        });
      }
    }
    return d1;
  }
}
