import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { APICONSTANT } from '@shared/constant/api-const';
import axios from 'axios';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  FormModel,
  NotificationsService,
  UploadFile,
  UserModel,
} from 'codx-core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';

export class ModelPage {
  functionID = '';
  gridViewName = '';
  formName = '';
  entity = '';
}

export class AddGridData {
  dataItem: any = null;
  isAdd: boolean = false;
  key: String = '';
}

export class GridModels {
  pageSize: number;
  entityName: string;
  entityPermission: string;
  formName: string;
  gridViewName: string;
  funcID: string;
  dataValue: string;
  predicate: string;
}
@Injectable({
  providedIn: 'root',
})
export class CodxEpService {
  user: UserModel;
  constructor(
    private cache: CacheService,
    private auth: AuthStore,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private api: ApiHttpService,
    private notificationsService: NotificationsService
  ) {}

  //#region Get from FunctionList
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

  getModelPage(functionID): Promise<ModelPage> {
    return new Promise<ModelPage>((resolve, rejects) => {
      this.cache.functionList(functionID).subscribe((funcList) => {
        var modelPage = new ModelPage();
        if (funcList) {
          modelPage.entity = funcList?.entityName;
          modelPage.formName = funcList?.formName;
          modelPage.gridViewName = funcList?.gridViewName;
          modelPage.functionID = funcList?.functionID;
        }
        resolve(modelPage);
      });
    });
  }

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

  getComboboxName(formName, gridView): Promise<object> {
    return new Promise<object>((resolve, reject) => {
      var obj: { [key: string]: any } = {};
      this.cache.gridViewSetup(formName, gridView).subscribe((gv) => {
        if (gv) {
          for (const key in gv) {
            if (Object.prototype.hasOwnProperty.call(gv, key)) {
              const element = gv[key];
              if (element?.referedValue != null) {
                obj[key] = element.referedValue;
              }
            }
          }
        }
      });
      resolve(obj);
    });
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

  getGetDriverByCar(carID: string) {
    return this.api.callSv(
      'EP',
      'ERM.Business.EP',
      'ResourcesBusiness',
      'GetDriverByCarAsync',
      [carID]
    );
  }

  driverValidator(driverID: string, startDate: any, endDate: any, recID: any) {
    return this.api.callSv(
      'EP',
      'ERM.Business.EP',
      'BookingsBusiness',
      'DriverValidatorAsync',
      [driverID, startDate, endDate, recID]
    );
  }

  getBookingAttendees(recID: string) {
    return this.api.callSv(
      'EP',
      'ERM.Business.EP',
      'BookingAttendeesBusiness',
      'GetAsync',
      [recID]
    );
  }

  getQuotaByResourceID(resourceID: string) {
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
    return this.api
      .exec<any>(
        'EP',
        'BookingsBusiness',
        'GetBookingByIDAsync',
        recID
      )
  }

  updateResource(model: any, isAdd: boolean) {
    return this.api.callSv(
      'EP',
      'ERM.Business.EP',
      'ResourcesBusiness',
      'AddEditItemAsync',
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
      'AddEditItemAsync',
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

  execEP(
    className: string,
    methodName: string,
    data: any = null,
    uploadFiles: UploadFile[] = null
  ) {
    return this.api.exec<any>(
      APICONSTANT.ASSEMBLY.EP,
      className,
      methodName,
      data
    );
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
    funcID: string
  ): Observable<any> {
    return this.api.execSv(
      'EP',
      'ERM.Business.CM',
      'DataBusiness',
      'ReleaseAsync',
      [
        booking?.recID,
        processID,
        entityName,
        funcID,
        '<div>' + booking.title + '</div>',
      ]
    );
  }

  approve(recID: string, status: string) {
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'ApprovalTransBusiness',
      'ApproveAsync',
      [recID, status, '', '', '']
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
  getAvailableResources(resourceType: string, startDate: string, endDate:string) {
    return this.api.execSv(
      'EP',
      'ERM.Business.EP',
      'ResourcesBusiness',
      'GetListAvailableResourceAsync',
      [resourceType, startDate, endDate]
    );
  }
  //#endregion

  //#region EmailTemplate
  public lstTmpEmail = [];
  deleteEmailTemplate(): Observable<any> {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'EmailTemplatesBusiness',
      'DeleteEmailTemplateAsync',
      [this.lstTmpEmail]
    );
  }

  getEmailTemplate(templateID: string): Observable<any> {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'EmailTemplatesBusiness',
      'GetEmailTemplateAsync',
      templateID
    );
  }

  addEmailTemplate(data: any, sendTo: any): Observable<any> {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'EmailTemplatesBusiness',
      'AddEmaiTemplateAsync',
      [data, sendTo]
    );
  }

  editEmailTemplate(data: any, sendTo: any): Observable<any> {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'EmailTemplatesBusiness',
      'EditEmaiTemplateAsync',
      [data, sendTo]
    );
  }

  createMeeting(
    meetingUrl,
    meetingTitle,
    meetingDescription,
    meetingStartDate,
    meetingStartTime,
    meetingDuration,
    meetingPassword
  ): Promise<string> {
    if (meetingUrl) {
      return meetingUrl;
    }
    return axios
      .create({
        baseURL: environment.SureMeet.baseUrl,
      })
      .post(environment.SureMeet.tokenUrl, {
        client_id: environment.SureMeet.client_id,
        client_secret: environment.SureMeet.client_secret,
      })
      .then((res: any) => {
        let data = {
          app_id: environment.SureMeet.app_id,
          app_secret: environment.SureMeet.app_secret,
          meetingschedule_id: 0,
          meetingschedule_title: meetingTitle,
          meetingschedule_description: meetingDescription,
          meetingschedule_startdate: this.datePipe
            .transform(meetingStartDate, 'yyyy-MM-dd')
            .toString(),
          meetingschedule_starttime: meetingStartTime,
          meetingschedule_duration: meetingDuration,
          meetingschedule_password: meetingPassword,
        };

        return axios
          .create({
            baseURL: environment.SureMeet.baseUrl,
          })
          .post(environment.SureMeet.addUpdateMeetingUrl, data)
          .then((meeting: any) => {
            return meeting.data.url;
          })
          .catch((err: any) => {});
      })
      .catch((err: any) => {});
    return null;
  }

  async connectMeetingNow(
    meetingTitle: string,
    meetingDescription: string,
    meetingDuration: number,
    meetingPassword: string,
    userName: string,
    mail: string,
    isManager: boolean,
    meetingUrl?: string,
    meetingStartDate?: string,
    meetingStartTime?: string
  ) {
    meetingStartDate = meetingStartDate ?? new Date().toString();

    meetingStartDate = this.datePipe
      .transform(meetingStartDate, 'yyyy-MM-dd')
      .toString();

    meetingStartTime =
      meetingStartTime ??
      this.datePipe.transform(new Date().toString(), 'HH:mm');

    let url =
      meetingUrl ??
      (await this.createMeeting(
        meetingUrl,
        meetingTitle,
        meetingDescription,
        meetingStartDate,
        meetingStartTime,
        meetingDuration,
        meetingPassword
      ).then((url) => {
        return url;
      }));

    return axios
      .create({
        baseURL: environment.SureMeet.baseUrl,
      })
      .post(environment.SureMeet.tokenUrl, {
        client_id: environment.SureMeet.client_id,
        client_secret: environment.SureMeet.client_secret,
      })
      .then((res: any) => {
        let data = {
          app_id: environment.SureMeet.app_id,
          app_secret: environment.SureMeet.app_secret,
          key: (url as string).split('/').reverse().at(0),
          password: null,
          name: userName,
          email: mail,
          manager: isManager == true ? 1 : 0,
        };
        return axios
          .create({
            baseURL: environment.SureMeet.baseUrl,
          })
          .post(environment.SureMeet.connectMettingUrl, data)
          .then((connectData: any) => {
            if (connectData?.data?.url) {
              return connectData?.data?.url;
            }
          })
          .catch((err: any) => {});
      })
      .catch((err: any) => {});
  }
  //#endregion
}
