import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ApiHttpService, AuthStore, CacheService, CodxService, FormModel, NotificationsService } from 'codx-core';

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

  //#region TrackLog
  addBGTrackLog(
    objectID,
    comment,
    objectType,
    actionType,
    createdBy,
    Bussiness
  ) {
    return this.api.execSv<any>(
      'PR',
      'PR',
      Bussiness,
      'ReceiveToAddBGTrackLog',
      [objectID, comment, objectType, actionType, createdBy]
    );
  }
    //#endregion

  //#endregion
  getFormModel(functionID): Promise<FormModel> {
    return new Promise<FormModel>((resolve, rejects) => {
      this.cache.functionList(functionID).subscribe((funcList) => {
        var formModel = new FormModel();
        if (funcList) {
          formModel.entityName = funcList?.entityName;
          formModel.formName = funcList?.formName;
          formModel.gridViewName = funcList?.gridViewName;
          formModel.funcID = funcList?.functionID;
          formModel.entityPer = funcList?.entityPer;

          this.cache.gridView(formModel.gridViewName).subscribe((gridView) => {
            this.cache.setGridView(formModel.gridViewName, gridView);
            this.cache
              .gridViewSetup(formModel.formName, formModel.gridViewName)
              .subscribe((gridViewSetup) => {
                this.cache.setGridViewSetup(
                  formModel.formName,
                  formModel.gridViewName,
                  gridViewSetup
                );
                resolve(formModel);
              });
          });
        }
      });
    });
  }

}
