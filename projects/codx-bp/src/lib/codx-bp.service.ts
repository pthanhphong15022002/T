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

  createAutoNumber(str) {
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
    let autoNumber = 'fieldName';
    if (format) {
      autoNumber = format;
    }
    const currentDateTime = new Date();
    const randomSuffix = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    const formattedTimestamp = `${currentDateTime
      .getFullYear()
      .toString()
      .slice(-2)}${(currentDateTime.getMonth() + 1)
      .toString()
      .padStart(2, '0')}${currentDateTime
      .getDate()
      .toString()
      .padStart(2, '0')}${currentDateTime
      .getHours()
      .toString()
      .padStart(2, '0')}${currentDateTime
      .getMinutes()
      .toString()
      .padStart(2, '0')}${currentDateTime
      .getSeconds()
      .toString()
      .padStart(2, '0')}${currentDateTime
      .getMilliseconds()
      .toString()
      .padStart(3, '0')}${randomSuffix}`;
    console.log('Mã tự động: ', autoNumber + formattedTimestamp);
    return autoNumber + '_' + formattedTimestamp;
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
