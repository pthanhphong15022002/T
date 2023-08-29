import { Injectable } from '@angular/core';
import { ApiHttpService, NotificationsService } from 'codx-core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CodxWrService {
  listOrderUpdateSubject = new BehaviorSubject<any>(null);


  constructor(private api: ApiHttpService, private notification: NotificationsService) {}

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
}
