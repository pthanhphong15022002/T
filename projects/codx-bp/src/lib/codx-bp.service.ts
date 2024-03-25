import { Injectable } from '@angular/core';
import { APICONSTANT } from '@shared/constant/api-const';
import { ApiHttpService, NotificationsService } from 'codx-core';
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
  constructor(
    private api: ApiHttpService,
    private notiSv: NotificationsService
  ) {}
  getFlowChartNew = new BehaviorSubject<any>(null);
  crrFlowChart = this.getFlowChartNew.asObservable();

  funcIDParent = new BehaviorSubject<any>(null);

  createAutoNumber(str, lst = [], type) {
    let format = this.formatText(str);
    let lstFormat = [];

    lstFormat = lst.filter((x) =>
      x.fieldName?.toLowerCase().startsWith(format?.toLowerCase())
    );
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
      APICONSTANT.SERVICES.SYS,
      APICONSTANT.ASSEMBLY.AD,
      'AutoNumbersBusiness',
      'GenAutoNumberAsync',
      [funcID, entityName, key]
    );
  }
  createTaskOnSaveInstance(recID) {
    return this.api.execSv<any>(
      "BP",
      "ERM.Business.BP",
      'ProcessTasksBusiness',
      'CreateTaskOnSaveInstanceAsync',
      [recID]
    );
  }
  startInstance(recID) {
    return this.api.execSv<any>(
      "BP",
      "ERM.Business.BP",
      'ProcessesBusiness',
      'StartInstanceAsync',
      [recID]
    );
  }
  authorityTask(recID,approver:any) {
    return this.api.execSv<any>(
      "BP",
      "ERM.Business.BP",
      'ProcessesBusiness',
      'AuthorityAsync',
      [recID,approver]
    );
  }

  checkValidate(gridViewSetup, data, count = 0) {
    var countValidate = count;
    var keygrid = Object.keys(gridViewSetup);
    var keymodel = Object.keys(data);
    let str = '';
    for (let index = 0; index < keygrid.length; index++) {
      if (gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              data[keymodel[i]] == null ||
              String(data[keymodel[i]]).match(/^ *$/) !== null
            ) {
              str =
                str?.trim() != ''
                  ? str + ';' + gridViewSetup[keygrid[index]].headerText
                  : gridViewSetup[keygrid[index]].headerText;
              countValidate++;
            }
          }
        }
      }
    }
    if (countValidate > 0) {
      this.notiSv.notifyCode('SYS009', 0, '"' + str + '"');
    }
    return countValidate;
  }

  getPositionsByUserID(userID) {
    return this.api.execSv<any>(
      APICONSTANT.SERVICES.SYS,
      APICONSTANT.ASSEMBLY.AD,
      'UsersBusiness',
      'GetUserByIDAsync',
      [userID]
    );
  }

  getEndDate(
    startDate: Date,
    interval: String,
    duration: any,
    lstDayShift,
    lstCalendarDates
  ) {
    return this.api.execSv<any>(
      APICONSTANT.SERVICES.BP,
      APICONSTANT.ASSEMBLY.BP,
      'ProcessesBusiness',
      'SettingEndDateAsync',
      [startDate, interval, duration, lstDayShift, lstCalendarDates]
    );
  }


  getFilesByListIDs(lstIDs) {
    return this.api.execSv<any>(
      'DM',
      'ERM.Business.DM',
      'FileBussiness',
      'GetFilesByListIDsAsync',
      [lstIDs]
    );
  }
}
