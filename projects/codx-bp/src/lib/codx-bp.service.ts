import { Injectable } from '@angular/core';
import { ApiHttpService } from 'codx-core';
import { DataRequest } from 'codx-core/public-api';
import {
  BehaviorSubject,
  catchError,
  finalize,
  map,
  Observable,
  of,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CodxBpService {
  viewProcesses = new BehaviorSubject<any>(null);
  constructor(private api: ApiHttpService) {}
  getFlowChartNew = new BehaviorSubject<any>(null);
  crrFlowChart = this.getFlowChartNew.asObservable();

  funcIDParent = new BehaviorSubject<any>(null);

  createAutoNumber(str, lst = [], type) {
    let format = this.formatText(str);
    let lstFormat = [];

    lstFormat = lst.filter((x) => x.fieldName?.toLowerCase().startsWith(format?.toLowerCase()));
    let count = 0;
    if (lstFormat?.length > 0) {
      count = this.getMaxNumberFromStrings(lstFormat.map((x) => x.fieldName));
    }
    let returnStr = '';
    if (type == 'title') {
      returnStr = str + (count > 0 ? ' ' + count : '');
    } else {
      returnStr = format + (count > 0 ? '_' + count : '');
    }
    console.log('Số tự động: ', returnStr);
    return returnStr;
  }

  formatText(str) {
    let format = str
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
    format = format.replaceAll(' ', '_');
    while (format.includes('__')) {
      format = format.replaceAll('__', '_');
    }
    return format;
  }

  extractNumbers(str: string): number[] {
    return str.match(/\d+/g)?.map(Number) || [];
  }

  getMaxNumberFromStrings(strings: string[]): number {
    const allNumbers = strings.map((str) => this.extractNumbers(str)).flat();
    if (allNumbers.length === 0) {
      return 1;
    }
    return Math.max(...allNumbers) + 1;
  }

  genAutoNumber(funcID: any, entityName: string, key: any) {
    return this.api.execSv<any>(
      'SYS',
      'AD',
      'AutoNumbersBusiness',
      'GenAutoNumberAsync',
      [funcID, entityName, key]
    );
  }
}
