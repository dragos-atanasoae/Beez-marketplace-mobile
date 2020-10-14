import { Pipe, PipeTransform } from '@angular/core';
import * as momentTimezone from 'moment-timezone';

@Pipe({
  name: 'convertToLocaleTime'
})
/**
 * Convert UTC timestamp to local date
 */
export class ConvertToLocaleTimePipe implements PipeTransform {

  // format example 'YYYY-MM-DD hh:mm:ss A'
  transform(value: string, format: string): string {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // console.log('Timezone: ', timezone, 'Received date: ', value);
    if (value) {
      const convertedDate = momentTimezone.utc(value, null).tz(timezone).format(format);
      // console.log('Converted date: ', convertedDate);
      return convertedDate;
    }
  }

}
