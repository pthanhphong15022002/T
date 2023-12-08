import { Injectable } from '@angular/core';
import { ApiHttpService, AuthStore, NotificationsService } from 'codx-core';
import { BehaviorSubject, Observable, finalize, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CodxWrService {
  // listOrderPartsSubject = new BehaviorSubject<any>(null);
  listOrderUpdateSubject = new BehaviorSubject<any>(null);
  language = '';

  constructor(
    private api: ApiHttpService,
    private notification: NotificationsService,
    private auth: AuthStore,

  ) {
    this.language = this.auth?.get()?.language?.toLowerCase();

  }

  getOneCustomer(recID) {
    return this.api.exec<any>('CM', 'CustomersBusiness', 'GetOneAsync', [
      recID,
    ]);
  }

  getOneContact(objectID) {
    return this.api.exec<any>('CM', 'ContactsBusiness', 'GetOneAsync', [
      objectID,
    ]);
  }

  getOneServiceTag(key) {
    return this.api.exec<any>('WR', 'ServiceTagsBusiness', 'GetOneAsync', [
      key,
    ]);
  }

  formatDate(date) {
    let language = this.language == 'vn' ? 'vi' : 'en-US';
    const currentDate = date;
    const weekdayDate = new Intl.DateTimeFormat(language, {
      weekday: 'long',
    }).format(currentDate);
    const dayDate = new Intl.DateTimeFormat(language, {
      day: 'numeric',
    }).format(currentDate);
    const monthDate = new Intl.DateTimeFormat(language, {
      month: 'long',
    }).format(currentDate);
    const yearDate = new Intl.DateTimeFormat(language, {
      year: 'numeric',
    }).format(currentDate);
    return weekdayDate + ', ' + dayDate + ' ' + monthDate + ' ' + yearDate;
  }

  checkValidate(gridViewSetup, data, count = 0) {
    var countValidate = count;
    var keygrid = Object.keys(gridViewSetup);
    var keymodel = Object.keys(data);
    for (let index = 0; index < keygrid.length; index++) {
      if (gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              data[keymodel[i]] == null ||
              String(data[keymodel[i]]).match(/^ *$/) !== null
            ) {
              this.notification.notifyCode(
                'SYS009',
                0,
                '"' + gridViewSetup[keygrid[index]].headerText + '"'
              );
              countValidate++;
              return countValidate;
            }
          }
        }
      }
    }
    return countValidate;
  }

  fetch(service, assemblyName, className, method, request): Observable<any[]> {
    return this.api
      .execSv<Array<any>>(
        service,
        assemblyName,
        className,
        method,
        request
      )
      .pipe(
        finalize(() => {
          /*  this.onScrolling = this.loading = false;
          this.loaded = true; */
        }),
        map((response: any) => {
          return response ? response[0] : [];
        })
      );
  }

  getDefault(service, funcID, entityName) {
    return this.api.execSv<any>(
      service,
      'Core',
      'DataBusiness',
      'GetDefaultAsync',
      [funcID, entityName]
    );
  }
}
