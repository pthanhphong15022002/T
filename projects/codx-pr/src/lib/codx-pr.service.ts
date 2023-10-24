import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ApiHttpService, AuthStore, CacheService, CodxService, NotificationsService } from 'codx-core';

@Injectable({
  providedIn: 'root'
})
export class CodxPrService {

  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private codxService: CodxService,
    private auth: AuthStore,
    private fb: FormBuilder,
    private notiService: NotificationsService
  ) {}

  //#region TimeKeepingRequest

  //#region validate status
  validateBeforeReleaseTimeKeepingRequest(recID: string) {
    return this.api.execSv(
      'PR',
      'ERM.Business.PR',
      'TimeKeepingRequestBusiness',
      'ValidateBeforeReleaseAsync',
      recID
    );
  }
  //#endregion

  //#region update status
  UpdateStatus(data) {
    return this.api.execSv<any>(
      'PR',
      'PR',
      'TimeKeepingRequestBusiness',
      'UpdateStatusAsync',
      data
    );
  }
  //#endregion
  //#endregion

}
