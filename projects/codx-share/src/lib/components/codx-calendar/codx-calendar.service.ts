import { Injectable } from '@angular/core';
import { ApiHttpService } from 'codx-core';
import { APICONSTANT } from '@shared/constant/api-const';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class CodxCalendarService {
  dateChange = new BehaviorSubject<any>(null);
  dataResourceModel = new BehaviorSubject<any>(null);

  constructor(private api: ApiHttpService) {}

  getParams(formName, fieldName) {
    return this.api.exec<any>(
      APICONSTANT.ASSEMBLY.SYS,
      'SettingValuesBusiness',
      'GetOneField',
      [formName, null, fieldName]
    );
  }
}
