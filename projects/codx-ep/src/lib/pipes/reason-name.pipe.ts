import { CodxEpService } from './../codx-ep.service';
import { Pipe, PipeTransform } from '@angular/core';
import { CacheService } from 'codx-core';
import * as moment from 'moment';
import 'moment/src/locale/vi';

@Pipe({
  name: 'ReasonName',
})
export class DatetimePipe implements PipeTransform {
  constructor(private CodxEpService: CodxEpService) {}
  transform(value: string) {
    return this;
  }
}
