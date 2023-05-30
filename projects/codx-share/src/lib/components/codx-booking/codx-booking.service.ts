
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiHttpService, FormModel, NotificationsService, CacheService, AuthStore } from 'codx-core';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CodxBookingService {
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private auth: AuthStore,
    private fb: FormBuilder,
    private notificationsService: NotificationsService

    ) {}

  getResourceEquipments(resourceID: any) {
    return this.api.execSv(
      'EP',
      'ERM.Business.EP',
      'ResourcesBusiness',
      'GetResourceEquipmentsAsync',
      resourceID
    );
  }
  getProcessByCategoryID(categoryID: string) {
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'CategoriesBusiness',
      'GetProcessByCategoryIDAsync',
      [categoryID]
    );
  }
  getCardTranInfo(recID: string) {
    return this.api.execSv(
      'EP',
      'ERM.Business.EP',
      'ResourceTransBusiness',
      'GetCardTranInfoAsync',
      [recID]
    );
  }
  addEditBooking(data: any, isAdd:boolean, listAttendees:any, listStationery:any) {
    return this.api.execSv(
      'EP',
      'ERM.Business.EP',
      'BookingsBusiness',
      'SaveAsync',
      [data,isAdd,listAttendees,listStationery]
    );
  }

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
        }
        resolve(formModel);
      });
    });
  }

  // getModelPage(functionID): Promise<ModelPage> {
  //   return new Promise<ModelPage>((resolve, rejects) => {
  //     this.cache.functionList(functionID).subscribe((funcList) => {
  //       var modelPage = new ModelPage();
  //       if (funcList) {
  //         modelPage.entity = funcList?.entityName;
  //         modelPage.formName = funcList?.formName;
  //         modelPage.gridViewName = funcList?.gridViewName;
  //         modelPage.functionID = funcList?.functionID;
  //       }
  //       resolve(modelPage);
  //     });
  //   });
  // }

  getFormGroup(formName, gridView): Promise<FormGroup> {
    return new Promise<FormGroup>((resolve, reject) => {
      this.cache.gridViewSetup(formName, gridView).subscribe((gv: any) => {
        var model = {};
        model['write'] = [];
        model['delete'] = [];
        model['assign'] = [];
        model['share'] = [];
        if (gv) {
          const user = this.auth.get();
          for (const key in gv) {
            const element = gv[key];
            element.fieldName =
              element.fieldName.charAt(0).toLowerCase() +
              element.fieldName.slice(1);
            model[element.fieldName] = [];
            if (element.fieldName == 'owner') {
              model[element.fieldName].push(user.userID);
            } else if (element.fieldName == 'bUID') {
              model[element.fieldName].push(user['buid']);
            } else if (element.fieldName == 'createdOn') {
              model[element.fieldName].push(new Date());
            } else if (element.fieldName == 'stop') {
              model[element.fieldName].push(false);
            } else if (element.fieldName == 'orgUnitID') {
              model[element.fieldName].push(user['buid']);
            } else if (
              element.dataType == 'Decimal' ||
              element.dataType == 'Int'
            ) {
              model[element.fieldName].push(0);
            } else if (
              element.dataType == 'Bool' ||
              element.dataType == 'Boolean'
            )
              model[element.fieldName].push(false);
            else if (element.fieldName == 'createdBy') {
              model[element.fieldName].push(user.userID);
            } else {
              model[element.fieldName].push(null);
            }

            let modelValidator = [];
            if (element.isRequire) {
              modelValidator.push(Validators.required);
            }
            if (element.fieldName == 'email') {
              modelValidator.push(Validators.email);
            }
            if (modelValidator.length > 0) {
              model[element.fieldName].push(modelValidator);
            }
          }
          model['write'].push(false);
          model['delete'].push(false);
          model['assign'].push(false);
          model['share'].push(false);
        }
        resolve(this.fb.group(model, { updateOn: 'blur' }));
      });
    });
  }

  // getFormGroupBooking(formName, gridView): Promise<FormGroup> {
  //   return new Promise<FormGroup>((resolve, reject) => {
  //     this.cache.gridViewSetup(formName, gridView).subscribe((gv: any) => {
  //       var model = {};
  //       model['write'] = [];
  //       model['delete'] = [];
  //       model['assign'] = [];
  //       model['share'] = [];
  //       if (gv) {
  //         let grv = {
  //           ResourceID: null,
  //           ReasonID: null,
  //           Title: null,
  //           AgencyName: null,
  //           Address: null,
  //         };
  //         gv = Object.assign(grv, gv);
  //         const user = this.auth.get();
  //         for (const key in gv) {
  //           const element = gv[key];
  //           element.fieldName =
  //             element.fieldName.charAt(0).toLowerCase() +
  //             element.fieldName.slice(1);
  //           model[element.fieldName] = [];
  //           if (element.fieldName == 'owner') {
  //             model[element.fieldName].push(user.userID);
  //           } else if (element.fieldName == 'bUID') {
  //             model[element.fieldName].push(user['buid']);
  //           } else if (element.fieldName == 'createdOn') {
  //             model[element.fieldName].push(new Date());
  //           } else if (element.fieldName == 'stop') {
  //             model[element.fieldName].push(false);
  //           } else if (element.fieldName == 'orgUnitID') {
  //             model[element.fieldName].push(user['buid']);
  //           } else if (
  //             element.dataType == 'Decimal' ||
  //             element.dataType == 'Int'
  //           ) {
  //             model[element.fieldName].push(0);
  //           } else if (
  //             element.dataType == 'Bool' ||
  //             element.dataType == 'Boolean'
  //           )
  //             model[element.fieldName].push(false);
  //           else if (element.fieldName == 'createdBy') {
  //             model[element.fieldName].push(user.userID);
  //           } else {
  //             model[element.fieldName].push(null);
  //           }

  //           let modelValidator = [];
  //           if (element.isRequire) {
  //             modelValidator.push(Validators.required);
  //           }
  //           if (element.fieldName == 'email') {
  //             modelValidator.push(Validators.email);
  //           }
  //           if (modelValidator.length > 0) {
  //             model[element.fieldName].push(modelValidator);
  //           }
  //         }
  //         model['write'].push(false);
  //         model['delete'].push(false);
  //         model['assign'].push(false);
  //         model['share'].push(false);
  //       }
  //       resolve(this.fb.group(model, { updateOn: 'blur' }));
  //     });
  //   });
  // }
  // getComboboxName(formName, gridView): Promise<object> {
  //   return new Promise<object>((resolve, reject) => {
  //     var obj: { [key: string]: any } = {};
  //     this.cache.gridViewSetup(formName, gridView).subscribe((gv) => {
  //       if (gv) {
  //         for (const key in gv) {
  //           if (Object.prototype.hasOwnProperty.call(gv, key)) {
  //             const element = gv[key];
  //             if (element?.referedValue != null) {
  //               obj[key] = element.referedValue;
  //             }
  //           }
  //         }
  //       }
  //     });
  //     resolve(obj);
  //   });
  // }
  getListAvailableResource(resourceType: string, startTime: any, endTime: any) {
    return this.api.execSv(
      'EP',
      'ERM.Business.EP',
      'ResourcesBusiness',
      'GetListAvailableResourceAsync',
      [resourceType, startTime, endTime]
    );
  }

  deleteFile(objectID, objectType, delForever) {
    return this.api
      .execSv(
        'DM',
        'ERM.Business.DM',
        'FileBussiness',
        'DeleteByObjectIDAsync',
        [objectID, objectType, delForever]
      )
      .subscribe();
  }
  roleCheck() {
    return this.api.execSv(
      'EP',
      'ERM.Business.EP',
      'BookingsBusiness',
      'AdminModuleCheckAsync',
      []
    );
  }

  getListResource(resourceType: string) {
    return this.api.execSv(
      'EP',
      'ERM.Business.EP',
      'ResourcesBusiness',
      'GetListResourceByTypeAsync',
      [resourceType]
    );
  }

  getListAttendees(recID: any) {
    return this.api.execSv(
      'EP',
      'ERM.Business.EP',
      'BookingsBusiness',
      'GetListBookingAttendeesAsync',
      [recID]
    );
  }

  getListItems(recID: any) {
    return this.api.execSv(
      'EP',
      'ERM.Business.EP',
      'BookingBusiness',
      'GetListBookingItemAsyncLogic',
      [recID]
    );
  }
  getListReason(entity: string) {
    return this.api.execSv(
      'BS',
      'ERM.Business.BS',
      'ReasonCodesBusiness',
      'GetListReasonByEntityAsync',
      [entity]
    );
  }
  getListUM() {
    return this.api.execSv(
      'BS',
      'ERM.Business.BS',
      'UnitsOfMearsureBusiness',
      'GetAsync',
      []
    );
  }

  getStationeryGroup() {
    return this.api.execSv(
      'EP',
      'ERM.Business.EP',
      'ResourcesBusiness',
      'GetListGroupStationeryAsync',
      []
    );
  }

  getResourceByID(resourceID) {
    return this.api.execSv(
      'EP',
      'ERM.Business.EP',
      'ResourcesBusiness',
      'GetResourceAsync',
      [resourceID]
    );
  }

  rescheduleBooking(data: any, note: any) {
    return this.api.execSv(
      'EP',
      'ERM.Business.EP',
      'BookingsBusiness',
      'RescheduleAsync',
      [data, note]
    );
  }

  inviteAttendees(recID: string, attendees: any[]) {
    return this.api.execSv(
      'EP',
      'ERM.Business.EP',
      'BookingsBusiness',
      'InviteAttendeesAfterApprovedAsync',
      [recID, attendees]
    );
  }

  getWarehousesOwner(warehouseID: string) {
    return this.api.execSv(
      'EP',
      'ERM.Business.EP',
      'WarehousesBusiness',
      'GetWarehousesOwnerAsync',
      [warehouseID]
    );
  }

  getGetDriverByCar(carID: string) {
    return this.api.execSv(
      'EP',
      'ERM.Business.EP',
      'ResourcesBusiness',
      'GetDriverByCarAsync',
      [carID]
    );
  }

  driverValidator(driverID: string, startDate: any, endDate: any, recID: any) {
    return this.api.execSv(
      'EP',
      'ERM.Business.EP',
      'BookingsBusiness',
      'DriverValidatorAsync',
      [driverID, startDate, endDate, recID]
    );
  }

  getBookingAttendees(recID: string) {
    return this.api.execSv(
      'EP',
      'ERM.Business.EP',
      'BookingAttendeesBusiness',
      'GetAsync',
      [recID]
    );
  }

  getQuotaByID(resourceID: string) {
    return this.api.execSv(
      'EP',
      'ERM.Business.EP',
      'ResourceQuotaBusiness',
      'GetQuotaByResourceIDAsync',
      [resourceID]
    );
  }

  getEmployeeByOrgUnitID(orgID: string) {
    return this.api.execSv(
      'HR',
      'ERM.Business.HR',
      'PositionsBusiness',
      'GetTotalFilledCountsByOrgUnitIDAsync',
      [orgID]
    );
  }

  getBookingByRecID(recID: string) {
    return this.api.exec<any>(
      'EP',
      'BookingsBusiness',
      'GetBookingByIDAsync',
      recID
    );
  }
  getApproveByRecID(approvalRecID: string) {
    return this.api.exec<any>(
      'EP',
      'BookingsBusiness',
      'GetApprovalBookingByIDAsync',
      approvalRecID
    );
  }

  getBookingByRefID(recID: string) {
    return this.api.exec(
      'EP',
      'BookingsBusiness',
      'GetBookingByRefIDAsync',
      recID
    );
  }

  updateResource(model: any, isAdd: boolean) {
    return this.api.callSv(
      'EP',
      'ERM.Business.EP',
      'ResourcesBusiness',
      'SaveAsync',
      [model, isAdd]
    );
  }

  updateBooking(
    data: any,
    isAdd: boolean,
    attendees: any,
    items: any,
    order: any
  ) {
    return this.api.execSv(
      'EP',
      'ERM.Business.EP',
      'BookingsBusiness',
      'SaveAsync',
      [data, isAdd, attendees, items, order]
    );
  }

  notifyInvalid(
    formGroup: FormGroup,
    formModel: FormModel,
    gridViewSetup: any = null
  ) {
    const invalid = [];
    const controls = formGroup.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
        break;
      }
    }
    let fieldName = invalid[0].charAt(0).toUpperCase() + invalid[0].slice(1);
    if (gridViewSetup == null) {
      this.cache
        .gridViewSetup(formModel.formName, formModel.gridViewName)
        .subscribe((res) => {
          if (res) {
            gridViewSetup = res;
            this.notificationsService.notifyCode(
              'SYS009',
              0,
              '"' + gridViewSetup[fieldName].headerText + '"'
            );
          }
        });
    } else {
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + gridViewSetup[fieldName].headerText + '"'
      );
    }
  }

  //#region File
  getFiles(funcID: string, objectId: string, objectType): Observable<any> {
    return this.api.execSv(
      'DM',
      'ERM.Business.DM',
      'FileBussiness',
      'GetFilesForOutsideAsync',
      [funcID, objectId, objectType]
    );
  }

  getAutoNumberDefault(funcID: string): Observable<any> {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'AutoNumbersBusiness',
      'GetAutoNumberByFuncIDAsync',
      [funcID]
    );
  }

  getLstFileByID(lstID: string[]): Observable<any> {
    return this.api.execSv(
      'DM',
      'ERM.Business.DM',
      'FileBussiness',
      'GetListFileByIDAsync',
      [JSON.stringify(lstID)]
    );
  }
  //#endregion

  //#region Approval
  release(
    booking: any,
    processID: string,
    entityName: string,
    funcID: string,    
    userID: string,
  ): Observable<any> {
    return this.api.execSv(
      'EP',
      'ERM.Business.Core',
      'DataBusiness',
      'ReleaseAsync',
      [
        booking?.recID,
        processID,
        entityName,
        funcID,
        '<div>' + booking?.title + '</div>',
        userID
      ]
    );
  }
  releaseOwner(
    booking: any,
    processID: string,
    entityName: string,
    funcID: string,
    owner: string
  ): Observable<any> {
    return this.api.execSv(
      'EP',
      'ERM.Business.Core',
      'DataBusiness',
      'ReleaseAsync',
      [
        booking?.recID,
        processID,
        entityName,
        funcID,
        '<div>' + booking.title + '</div>',
        owner,
      ]
    );
  }
  approve(recID: string, status: string, reasonID: string, comment: string) {
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'ApprovalTransBusiness',
      'ApproveAsync',
      [recID, status, reasonID, comment, '']
    );
  }

  undo(recID: string) {
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'ApprovalTransBusiness',
      'UndoAsync',
      [recID]
    );
  }

  cancel(recID: string, comment: string, entityName: string) {
    return this.api.execSv(
      'EP',
      'ERM.Business.Core',
      'DataBusiness',
      'CancelAsync',
      [recID, comment, entityName]
    );
  }

  getCategoryByEntityName(entityName: string) {
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'CategoriesBusiness',
      'GetCategoryByEntityNameAsync',
      [entityName]
    );
  }


  checkCreatedRole(curUser: any, createdBy: string) {
    return (
      curUser?.userID == createdBy
    );
  }
  checkHostRole(curUser: any, host: string) {
    return (
      curUser?.userID == host 
    );
  }
  checkAdminRole(curUser: any, isAdmin: boolean) {
    return (
      curUser?.systemAdmin ||
      curUser?.functionAdmin ||
      curUser?.administrator ||
      isAdmin == true
    );
  }

  checkDuplicateBooking(
    startDate: string,
    endDate: string,
    resourceID: string,
    recID: string
  ) {
    return this.api.execSv(
      'EP',
      'ERM.Business.EP',
      'BookingsBusiness',
      'CheckDuplicateBookingAsync',
      [startDate, endDate, resourceID, recID]
    );
  }

  bookingAttendeesValidator(
    listAttendees: any,
    startDate: string,
    endDate: string,
    recID: any
  ) {
    return this.api.execSv(
      'EP',
      'ERM.Business.EP',
      'BookingsBusiness',
      'BookingAttendeesValidatorAsync',
      [listAttendees, startDate, endDate, recID]
    );
  }

  getBookingItems(recID: any) {
    return this.api.execSv(
      'EP',
      'ERM.Business.EP',
      'BookingsBusiness',
      'GetListBookingItemAsync',
      [recID]
    );
  }

  getAvailableResources(
    resourceType: string,
    startDate: string,
    endDate: string,
    recID: string,
    getAll: boolean
  ) {
    return this.api.execSv(
      'EP',
      'ERM.Business.EP',
      'ResourcesBusiness',
      'GetListAvailableResourceAsync',
      [resourceType, startDate, endDate, recID, getAll]
    );
  }

  getAvailableDriver(startDate: string, endDate: string) {
    return this.api.execSv(
      'EP',
      'ERM.Business.EP',
      'ResourcesBusiness',
      'GetListAvailableDriverAsync',
      [startDate, endDate]
    );
  }

  assignDriver(recID: string, driverID: string) {
    return this.api.execSv(
      'EP',
      'ERM.Business.EP',
      'BookingsBusiness',
      'AssignDriverAsync',
      [recID, driverID]
    );
  }
  //old

  getListUserIDByListOrgIDAsync(data) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'OrganizationUnitsBusiness',
      'GetListUserIDByListOrgIDAsync',
      data
    );
  }

  //new

  getUserByListDepartmentID(listDepID) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'OrganizationUnitsBusiness',
      'GetUserByListDepartmentIDAsync',
      listDepID
    );
  }
  getListUserIDByListPositionsID(listPositionID) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'GetListUserIDByListPositionsIDAsync',
      listPositionID
    );
  }
  getListUserIDByListEmployeeID(listEmployeeID) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'GetListUserIDbyListEmployeeIDAsync',
      listEmployeeID
    );
  }

  getListUserIDByListGroupID(listGroupID) {
    return this.api.execSv<any>(
      'SYS',
      'AD',
      'GroupMembersBusiness',
      'GetListUserIDByListGroupIDAsync',
      listGroupID
    );
  }
  afterApprovedManual(entity: string, recID: string, status: string) {
    return this.api.execSv(
      'EP',
      'ERM.Business.EP',
      'BookingsBusiness',
      'ApprovedAsync',
      [entity, recID, status]
    );
  }
  //#endregion
  createResourceTrans(trans: any) {
    return this.api.execSv<any>(
      'EP',
      'ERM.Business.EP',
      'ResourceTransBusiness',
      'AddResourceTransAsync',
      trans
    );
  }
  //#Setting SYS
  getSettingValue(para: any) {
    return this.api.execSv(
      'SYS',
      'ERM.Business.SYS',
      'SettingValuesBusiness',
      'GetByModuleAsync',
      para
    );
  }

  getCalendar() {
    return this.api.execSv(
      'SYS',
      'ERM.Business.SYS',
      'SettingValuesBusiness',
      'GetByModuleAsync',
      'Calendar'
    );
  }

  getCalendarWeekdays(calendarID: any) {
    return this.api.execSv(
      'BS',
      'ERM.Business.BS',
      'CalendarWeekdaysBusiness',
      'GetDayShiftAsync',
      [calendarID]
    );
  }

  getDataValueOfSettingAsync(formName:string,transType:string,category:string) {
    return this.api.execSv(
      'SYS',
      'ERM.Business.SYS',
      'SettingValuesBusiness',
      'GetDataValueOfSettingAsync',
      [formName,transType,category]
    );
  }

  getEPRoomSetting(category: any) {
    return this.api.execSv(
      'SYS',
      'ERM.Business.SYS',
      'SettingValuesBusiness',
      'GetByModuleWithCategoryAsync',
      ['EPRoomParameters', category]
    );
  }

  getEPCarSetting(category: any) {
    return this.api.execSv(
      'SYS',
      'ERM.Business.SYS',
      'SettingValuesBusiness',
      'GetByModuleWithCategoryAsync',
      ['EPCarParameters', category]
    );
  }

  getEPStationerySetting(category: any) {
    return this.api.execSv(
      'SYS',
      'ERM.Business.SYS',
      'SettingValuesBusiness',
      'GetByModuleWithCategoryAsync',
      ['EPStationeryParameters', category]
    );
  }
}
