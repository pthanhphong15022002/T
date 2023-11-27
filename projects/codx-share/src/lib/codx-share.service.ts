import {
  BehaviorSubject,
  finalize,
  isObservable,
  map,
  Observable,
  of,
  share,
} from 'rxjs';
import { Injectable } from '@angular/core';
import {
  ApiHttpService,
  AuthService,
  AuthStore,
  CacheService,
  CallFuncService,
  DataRequest,
  DialogModel,
  FormModel,
  NotificationsService,
  SidebarModel,
  TenantStore,
  Util,
} from 'codx-core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { PopupCommentComponent } from 'projects/codx-es/src/lib/sign-file/popup-comment/popup-comment.component';
import { environment } from 'src/environments/environment';
import { lvFileClientAPI } from '@shared/services/lv.component';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { FileService } from '@shared/services/file.service';
import { PopupSignForApprovalComponent } from 'projects/codx-es/src/lib/sign-file/popup-sign-for-approval/popup-sign-for-approval.component';
import {
  ApproveProcess,
  Approver,
  ExportData,
  ExportUpload,
  ResponseModel,
  TemplateInfo,
} from './models/ApproveProcess.model';
import { HttpClient } from '@angular/common/http';
import axios from 'axios';
import { CodxImportComponent } from './components/codx-import/codx-import.component';
import { CodxExportComponent } from './components/codx-export/codx-export.component';
import { ES_SignFile } from 'projects/codx-es/src/lib/codx-es.model';
import { PopupAddSignFileComponent } from 'projects/codx-es/src/lib/sign-file/popup-add-sign-file/popup-add-sign-file.component';
import { CodxAddApproversComponent } from './components/codx-approval-procress/codx-add-approvers/codx-add-approvers.component';
import { ES_File } from './components/codx-approval-procress/model/codx-approval-process.model';
import { CodxGetTemplateSignFileComponent } from './components/codx-approval-procress/codx-get-template-sign-file/codx-get-template-sign-file.component';
import { tmpCopyFileInfo } from './models/fileInfo.model';
import { CodxFilesAttachmentViewComponent } from './components/codx-files-attachment-view/codx-files-attachment-view.component';
import { CodxEmailComponent } from './components/codx-email/codx-email.component';
import { CodxViewReleaseSignFileComponent } from './components/codx-approval-procress/codx-view-release-sign-file/codx-view-release-sign-file.component';
import { T } from '@angular/cdk/keycodes';
import { SignalRService } from 'projects/codx-common/src/lib/_layout/drawers/chat/services/signalr.service';
import { CodxListReportsComponent } from './components/codx-list-reports/codx-list-reports.component';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';

@Injectable({
  providedIn: 'root',
})
export class CodxShareService {
  hideAside = new BehaviorSubject<any>(null);
  dataUpdateShowEvent = new BehaviorSubject<any>(null);
  dateChange = new BehaviorSubject<any>(null);
  dataResourceModel = new BehaviorSubject<any>(null);
  settingValue = new BehaviorSubject<any>(null);
  public caches = new Map<string, Map<string, any>>();
  private cachedObservables = new Map<string, Observable<any>>();
  listContactBehavior = new BehaviorSubject<any>(null);
  callBackComponent: any;
  private user: any;
  //
  //
  //listApproveMF = [];
  constructor(
    private notificationsService: NotificationsService,
    private callfunc: CallFuncService,
    private api: ApiHttpService,
    private auth: AuthStore,
    private tenant: TenantStore,
    private authService: AuthService,
    private cache: CacheService,
    private fb: FormBuilder,
    private dmSV: CodxDMService,
    private fileService: FileService,
    private signalRSV: SignalRService,
    private codxCommonService: CodxCommonService,
    private httpClient: HttpClient
  ) {
    this.user = this.auth.get();
  }

  loadDataCache(
    paras: any,
    keyRoot: any,
    service: any,
    assemly: any,
    className: any,
    method: any
  ): Observable<any> {
    let key = JSON.stringify(paras).toLowerCase();
    if (this.caches.has(keyRoot)) {
      var c = this.caches.get(keyRoot);
      if (c && c.has(key)) {
        return c.get(key);
      }
    } else {
      this.caches.set(keyRoot, new Map<any, any>());
    }

    if (this.cachedObservables.has(key)) {
      this.cachedObservables.get(key);
    }
    let observable = this.api
      .execSv(service, assemly, className, method, paras)
      .pipe(
        map((res) => {
          if (res) {
            let c = this.caches.get(keyRoot);
            c?.set(key, res);
            return res;
          }
          return null;
        }),
        share(),
        finalize(() => this.cachedObservables.delete(key))
      );
    this.cachedObservables.set(key, observable);
    return observable;
  }
  loadFunctionList(funcID: any): Observable<any> {
    let paras = ['FuncID', funcID];
    let keyRoot = 'FuncID' + funcID;
    let key = JSON.stringify(paras).toLowerCase();
    if (this.caches.has(keyRoot)) {
      var c = this.caches.get(keyRoot);
      if (c && c.has(key)) {
        return c.get(key);
      }
    } else {
      this.caches.set(keyRoot, new Map<any, any>());
    }

    if (this.cachedObservables.has(key)) {
      this.cachedObservables.get(key);
    }
    let observable = this.cache.functionList(funcID).pipe(
      map((res) => {
        if (res) {
          let c = this.caches.get(keyRoot);
          c?.set(key, res);
          return res;
        }
        return null;
      }),
      share(),
      finalize(() => this.cachedObservables.delete(key))
    );
    this.cachedObservables.set(key, observable);
    return observable;
  }
  loadFuncID(functionID: any): Observable<any> {
    let paras = [functionID];
    let keyRoot = 'MFunc' + functionID;

    return this.loadDataCache(
      paras,
      keyRoot,
      'SYS',
      'SYS',
      'MoreFunctionsBusiness',
      'GetAsync'
    );
  }
  checkStatusApproval(recID: any, status): Observable<any> {
    let paras = [recID];
    let keyRoot = recID + status;
    return this.loadDataCache(
      paras,
      keyRoot,
      'ES',
      'ES',
      'ApprovalTransBusiness',
      'CheckRestoreAsync'
    );
  }

  defaultMoreFunc(
    val: any,
    data: any,
    afterSave?: Function,
    formModel?: any,
    dataService?: any,
    that: any = null,
    customData = null
  ) {
    //Duyệt SYS201 , Ký SYS202 , Đồng thuận SYS203 , Hoàn tất SYS204 , Từ chối SYS205 , Làm lại SYS206 , Khôi phục SYS207
    var funcID = val?.functionID;
    switch (funcID) {
      case 'SYS201':
      case 'SYS202':
      case 'SYS203':
      case 'SYS204':
      case 'SYS205':
      case 'SYS206':
      case 'SYS200': {
        if (data?.unbounds?.eSign == true) {
          let option = new SidebarModel();
          option.Width = '800px';
          option.DataService = dataService;
          option.FormModel = formModel;
          let dialogModel = new DialogModel();
          dialogModel.IsFull = true;

          var listApproveMF = this.getMoreFunction(
            funcID,
            data?.unbounds?.stepType
          );

          let dialogApprove = this.callfunc.openForm(
            PopupSignForApprovalComponent,
            'Thêm mới',
            700,
            650,
            formModel.funcID,
            {
              funcID: 'EST021',
              sfRecID: data?.unbounds?.transID,
              title: data?.unbounds?.htmlView,
              status: data?.unbounds?.statusApproval,
              stepType: data?.unbounds?.stepType,
              stepNo: data?.unbounds?.stepNo,
              transRecID: data?.unbounds?.approvalRecID,
              oTrans: data?.unbounds,
              lstMF: listApproveMF,
            },
            '',
            dialogModel
          );
          dialogApprove.closed.subscribe((x) => {
            // if (x.event?.result) {
            //   data.unbounds.statusApproval = x.event?.mode;
            //   dataService.update(data).subscribe();
            // }
            if (x?.event?.msgCodeError == null && x?.event?.rowCount > 0) {
              data.unbounds.statusApproval = x.event?.returnStatus;
              data.unbounds.isLastStep = x.event?.isLastStep;
              dataService.update(data).subscribe();
              that?.reloadFile();
            }
          });
        } else {
          var status;
          if (
            funcID == 'SYS201' ||
            funcID == 'SYS202' ||
            funcID == 'SYS203' ||
            funcID == 'SYS204'
          )
            status = '5';
          else if (funcID == 'SYS205') status = '4';
          else if (funcID == 'SYS206') status = '2';
          let dialog = this.beforeApprove(
            status,
            data?.unbounds,
            formModel.funcID,
            val?.text,
            formModel
          );
          if (dialog) {
            dialog.closed.subscribe((res) => {
              let oComment = res?.event;
              this.codxApprove(
                data?.unbounds?.approvalRecID,
                status,
                oComment?.comment,
                oComment?.reasonID,
                null
              ).subscribe((res2: any) => {
                if (!res2?.msgCodeError) {
                  data.unbounds.statusApproval = status ?? res2?.returnStatus;
                  //Cập nhật lại status duyệt
                  var index = dataService.data.findIndex(
                    (x) => x.transID == data.recID
                  );
                  if (index >= 0)
                    dataService.data[index].unbounds.statusApproval =
                      status ?? res2?.returnStatus;

                  dataService.update(data).subscribe();
                  this.notificationsService.notifyCode('SYS007');
                  //afterSave(data.statusApproval);// Chung CMT trước đo rồi
                  afterSave(data);
                } else this.notificationsService.notify(res2?.msgCodeError);
              });
            });
          } else {
            this.codxApprove(
              data?.unbounds?.approvalRecID,
              status,
              null,
              null,
              null
            ).subscribe((res2: any) => {
              if (!res2?.msgCodeError) {
                data.unbounds.statusApproval = status ?? res2?.returnStatus;
                //Cập nhật lại status duyệt
                var index = dataService.data.findIndex(
                  (x) => x.transID == data.recID
                );
                if (index >= 0)
                  dataService.data[index].unbounds.statusApproval =
                    status ?? res2?.returnStatus;

                dataService.update(data).subscribe();

                this.notificationsService.notifyCode('SYS007');
                afterSave(data);
              } else this.notificationsService.notify(res2?.msgCodeError);
            });
          }
        }
        break;
      }
      case 'SYS207': {
        this.codxUndo(data?.unbounds?.approvalRecID, null).subscribe(
          (res: any) => {
            if (res) {
              data.unbounds.statusApproval = res?.status;
              //Cập nhật lại status duyệt
              var index = dataService.data.findIndex(
                (x) => x.transID == data.recID
              );
              if (index >= 0)
                dataService.data[index].unbounds.statusApproval = res?.status;
              afterSave(data);
              dataService.update(data).subscribe();
              this.notificationsService.notifyCode('SYS007');
            } else this.notificationsService.notify(res?.msgCodeError);
          }
        );
        break;
      }
      //Import file
      case 'SYS001': {
        this.callfunc.openForm(
          CodxImportComponent,
          null,
          900,
          800,
          '',
          formModel,
          null
        );
        break;
      }
      //Export file
      case 'SYS002': {
        var gridModel = new DataRequest();
        gridModel.formName = formModel.formName;
        gridModel.entityName = formModel.entityName;
        gridModel.funcID = formModel.funcID;
        gridModel.gridViewName = formModel.gridViewName;
        gridModel.entityPermission = formModel.entityPer;
        if (dataService) {
          gridModel.page = dataService.request.page;
          gridModel.pageSize = dataService.request.pageSize;
          gridModel.predicate = dataService.request.predicates;
          gridModel.dataValue = dataService.request.dataValues;
        }
        gridModel.groupFields = 'createdBy';
        this.callfunc.openForm(
          CodxExportComponent,
          null,
          900,
          700,
          '',
          [
            gridModel,
            data.recID,
            customData?.dataSource,
            customData?.refID,
            customData?.refType || formModel?.entityName,
          ],
          null
        );
        break;
      }
      //Đính kèm file
      case 'SYS003': {
        var datas = {
          headerText: val?.data?.customName,
          objectID: data?.recID,
          dataSelected: data,
          referType: customData?.referType,
          addPermissions: customData?.addPermissions,
        };
        this.callfunc.openForm(
          CodxFilesAttachmentViewComponent,
          '',
          700,
          600,
          '',
          datas
        );
        break;
      }
      //Gửi mail
      case 'SYS004': {
        var dialog = this.callfunc.openForm(CodxEmailComponent, '', 900, 800);
        dialog.closed.subscribe((x) => {
          if (x.event) {
            var result = {
              funcID: funcID,
              result: x.event,
            };
            afterSave(result);
          }
        });
        break;
      }
    }
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

  getESDataDefault(funcID: string, entityName: string, idField: string) {
    return this.api.execSv<any>(
      'ES',
      'Core',
      'DataBusiness',
      'GetDefaultAsync',
      [funcID, entityName, idField]
    );
  }

  setCacheFormModel(formModel: FormModel) {
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
        });
    });
  }

  notifyInvalid(formGroup: FormGroup, formModel: FormModel) {
    let gridViewSetup;
    const invalid = [];
    const controls = formGroup.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
        break;
      }
    }
    let fieldName = invalid[0].charAt(0).toUpperCase() + invalid[0].slice(1);

    this.cache
      .gridViewSetup(formModel.formName, formModel.gridViewName)
      .subscribe((res) => {
        if (res) {
          gridViewSetup = res;
          let headerText = gridViewSetup[fieldName]?.headerText ?? fieldName;

          if (fieldName == 'Email' && formGroup.value.email != null) {
            this.notificationsService.notifyCode(
              'E0003',
              0,
              '"' + headerText + '"'
            );
          } else {
            this.notificationsService.notifyCode(
              'SYS009',
              0,
              '"' + headerText + '"'
            );
          }
        }
      });
  }

  getDetailApprover(approver: Approvers) {
    let lstAprrover = [approver];

    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'HRBusiness',
      'GetInfoApproverAsync',
      [lstAprrover]
    );
  }

  //#region EmailTemplate
  loadDataCbx(service: string, dataRequest: DataRequest = null) {
    if (dataRequest == null) {
      dataRequest = new DataRequest();
      dataRequest.comboboxName = 'DataViewItems';
      dataRequest.page = 1;
      dataRequest.pageSize = 10;
    }
    return this.api.execSv<any>(
      service,
      'ERM.Business.Core',
      'DataBusiness',
      'LoadDataCbxAsync',
      [dataRequest]
    );
  }

  loadData(service: string, dataRequest: DataRequest = null) {
    return this.api.execSv<any>(
      service,
      'ERM.Business.Core',
      'DataBusiness',
      'LoadDataAsync',
      [dataRequest]
    );
  }

  getFormGroup(formName, gridView): Promise<FormGroup> {
    return new Promise<FormGroup>((resolve, reject) => {
      this.cache.gridViewSetup(formName, gridView).subscribe((gv: any) => {
        if (gv) {
          var arrgv = Object.values(gv) as any[];
          const group: any = {};
          arrgv.forEach((element) => {
            var keytmp = Util.camelize(element.fieldName);
            var value = null;
            var type = element.dataType.toLowerCase();
            if (type === 'bool') value = false;
            if (type === 'datetime') value = new Date();
            if (type === 'int' || type === 'decimal') value = 0;
            group[keytmp] = element.isRequire
              ? new FormControl(value, Validators.required)
              : new FormControl(value);
          });
          group['updateColumn'] = new FormControl('');
          var formGroup = new FormGroup(group);
          resolve(formGroup);
        }
      });
    });
  }

  getEmailTemplate(templateID: string) {
    return this.api.execSv<any>(
      'SYS',
      'ERM.Business.AD',
      'EmailTemplatesBusiness',
      'GetViewEmailTemplateAsync',
      [templateID]
    );
  }

  sendEmailTemplate(emailRecID) {
    return this.api.execSv<any>(
      'SYS',
      'ERM.Business.AD',
      'EmailTemplatesBusiness',
      'SendEmailAsync',
      [emailRecID]
    );
  }

  sendEmail(emailTemplate: any, sendToList: any, option: any = null) {
    if (option) {
      return this.api.execSv<any>(
        option.service,
        option.assembly,
        option.className,
        option.method,
        [emailTemplate, sendToList, option.data]
      );
    }

    return this.api.execSv<any>(
      'SYS',
      'ERM.Business.AD',
      'EmailTemplatesBusiness',
      'SendAsync',
      [emailTemplate, sendToList]
    );
  }

  getDataDefault(functionID: string) {
    return this.api.execSv<any>(
      'SYS',
      'ERM.Business.AD',
      'EmailTemplatesBusiness',
      'GetDataDefaultAsync',
      [functionID]
    );
  }

  addEmailTemplate(data: any, sendTo: any) {
    return this.api.execSv<any>(
      'SYS',
      'ERM.Business.AD',
      'EmailTemplatesBusiness',
      'AddEmaiTemplateAsync',
      [data, sendTo]
    );
  }

  editEmailTemplate(data: any, sendTo: any) {
    return this.api.execSv<any>(
      'SYS',
      'ERM.Business.AD',
      'EmailTemplatesBusiness',
      'EditEmaiTemplateAsync',
      [data, sendTo]
    );
  }

  getNewDefaultEmail() {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'EmailTemplatesBusiness',
      'GetEmailDefaultAsync',
      []
    );
  }
  //#endregion
  getApprovalTrans(recID: string) {
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'ApprovalTransBusiness',
      'GetByRecIDAsync',
      [recID]
    );
  }
  beforeApprove(
    status: string,
    approvalTrans: any,
    funcID: string,
    title: string,
    formModel: FormModel
  ) {
    if (formModel) {
      this.cache.functionList('EST021').subscribe((fm) => {
        if (fm) {
          formModel = fm;
        }
      });
    }

    let _dialog: any;
    switch (status) {
      case '0': {
        //cancel
        if (approvalTrans.cancelControl != 1) {
          _dialog = this.openPopupComment(
            status,
            approvalTrans.cancelControl,
            funcID,
            title,
            formModel
          );
        }
        break;
      }
      case '2': {
        //redo
        if (
          approvalTrans.redoControl == '2' ||
          approvalTrans.redoControl == '3'
        ) {
          _dialog = this.openPopupComment(
            status,
            approvalTrans.redoControl,
            funcID,
            title,
            formModel
          );
        }
        break;
      }
      case '5': {
        //duyet
        if (approvalTrans.approveControl != '1') {
          _dialog = this.openPopupComment(
            status,
            approvalTrans.approveControl,
            funcID,
            title,
            formModel
          );
        }
        break;
      }
      case '4': {
        //reject
        if (
          approvalTrans.rejectControl == '2' ||
          approvalTrans.rejectControl == '3'
        ) {
          _dialog = this.openPopupComment(
            status,
            approvalTrans.rejectControl,
            funcID,
            title,
            formModel
          );
        }
        break;
      }
    }
    return _dialog;
  }

  beforeApproveUseRecID(
    status: string,
    recID: string,
    title: string,
    funcID: string = null
  ) {
    this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'ApprovalTransBusiness',
      'GetByRecIDAsync',
      [recID]
    );

    //console.log('ndhoa', approvalTrans);

    // let _dialog: any;
    // switch (status) {
    //   case '0': {
    //     //cancel
    //     if (approvalTrans.cancelControl != 1) {
    //       _dialog = this.openPopupComment(
    //         status,
    //         approvalTrans.cancelControl,
    //         funcID,
    //         title,
    //         formModel
    //       );
    //     }
    //     break;
    //   }
    //   case '2': {
    //     //redo
    //     if (
    //       approvalTrans.redoControl == '2' ||
    //       approvalTrans.redoControl == '3'
    //     ) {
    //       _dialog = this.openPopupComment(
    //         status,
    //         approvalTrans.redoControl,
    //         funcID,
    //         title,
    //         formModel
    //       );
    //     }
    //     break;
    //   }
    //   case '5': {
    //     //duyet
    //     if (approvalTrans.approveControl != '1') {
    //       _dialog = this.openPopupComment(
    //         status,
    //         approvalTrans.approveControl,
    //         funcID,
    //         title,
    //         formModel
    //       );
    //     }
    //     break;
    //   }
    //   case '4': {
    //     //reject
    //     if (
    //       approvalTrans.rejectControl == '2' ||
    //       approvalTrans.rejectControl == '3'
    //     ) {
    //       _dialog = this.openPopupComment(
    //         status,
    //         approvalTrans.rejectControl,
    //         funcID,
    //         title,
    //         formModel
    //       );
    //     }
    //     break;
    //   }
    // }
    // return _dialog;
  }

  openPopupComment(
    status: string,
    funcControl: string,
    funcID: string,
    title: string,
    formModel: FormModel
  ) {
    let dialogComment = this.callfunc.openForm(
      PopupCommentComponent,
      title,
      500,
      250,
      funcID,
      {
        title: title,
        formModel: formModel,
        approveControl: funcControl,
        mode: status,
      }
    );
    return dialogComment;
  }

  #region_calendar;
  getDataTM_Tasks(requestData) {
    return this.api.execSv(
      'TM',
      'TM',
      'TaskBusiness',
      'GetListMyTasksCalendarAsync',
      [requestData]
    );
  }

  getDataWP_Notes(predicate, dataValue) {
    return this.api.execSv(
      'WP',
      'ERM.Business.WP',
      'NotesBusiness',
      'GetListAsync',
      [predicate, dataValue]
    );
  }

  getDataWP_Notes_IsPin() {
    return this.api.execSv(
      'WP',
      'ERM.Business.WP',
      'NotesBusiness',
      'GetListIsPinAsync'
    );
  }

  getDataCO_Meetings(...args) {
    return this.api.execSv(
      'CO',
      'CO',
      'MeetingsBusiness',
      'GetCalendarEventsAsync',
      args
    );
  }

  getDataEP_Bookings(requestData) {
    return this.api.execSv(
      'EP',
      'EP',
      'BookingsBusiness',
      'GetListBookingCalendarAsync',
      requestData
    );
  }
  #endregion_calendar;

  #region_EP_Booking;
  getBookingByRecID(recID: string) {
    return this.api.exec<any>(
      'EP',
      'BookingsBusiness',
      'GetBookingByIDAsync',
      recID
    );
  }
  #endregion_EP_Booking;

  getListResource(resourceType: string) {
    return this.api.execSv(
      'EP',
      'ERM.Business.EP',
      'ResourcesBusiness',
      'GetListResourceByTypeAsync',
      [resourceType]
    );
  }
  getDataValueOfSetting(formName: string, transType: string, category: string) {
    return this.api.execSv(
      'SYS',
      'ERM.Business.SYS',
      'SettingValuesBusiness',
      'GetDataValueOfSettingAsync',
      [formName, transType, category]
    );
  }
  getThumbByUrl(url: any, width = 30) {
    if (url) {
      var wt = width;
      var widthThumb = 1.2;
      var arr = url.split('/');
      var uploadID = arr[arr.length - 2];

      if (width <= 30 * widthThumb) wt = 30;
      else if (width <= 60 * widthThumb) wt = 60;
      else if (width <= 120 * widthThumb) wt = 120;
      else if (width <= 300 * widthThumb) wt = 300;
      else if (width <= 500 * widthThumb) wt = 500;
      else if (width <= 650 * widthThumb) wt = 600;

      let tenant = this.tenant.getName();
      return (
        environment.urlUpload +
        '/api/' +
        tenant +
        '/thumbs/' +
        uploadID +
        '/' +
        wt +
        '.webp'
      );
    }
    return '';
  }

  async registerFile(appName: any, uploadFile: any, ChunkSizeInKB: any) {
    lvFileClientAPI.setUrl(environment.urlUpload); //"http://192.168.18.36:8011");
    return await lvFileClientAPI.postAsync(`api/${appName}/files/register`, {
      Data: {
        FileName: uploadFile?.name,
        ChunkSizeInKB: ChunkSizeInKB,
        FileSize: uploadFile?.size,
        thumbSize: {
          width: 200, //Kích thước của file ảnh Thum bề ngang
          height: 200, //Kích thước của file ảnh Thum bề dọc
        },
        IsPublic: true,
        ThumbConstraints: '60,200,450,900',
      },
    });
  }

  async uploadFileAsync(uploadFile: any, appName: any, chunkSizeInKB: any) {
    lvFileClientAPI.setUrl(environment.urlUpload);
    var retUpload = await this.registerFile(appName, uploadFile, chunkSizeInKB);
    if (retUpload == '401') {
      await this.dmSV.getToken();
      retUpload = await this.registerFile(appName, uploadFile, chunkSizeInKB);
    }
    var chunSizeInfBytes = chunkSizeInKB * 1024;
    var sizeInBytes = uploadFile?.size;
    var numOfChunks = Math.floor(uploadFile.size / chunSizeInfBytes);
    if (uploadFile?.size % chunSizeInfBytes > 0) {
      numOfChunks++;
    }
    for (var i = 0; i < numOfChunks; i++) {
      var start = i * chunSizeInfBytes; //Vị trí bắt đầu băm file
      var end = start + chunSizeInfBytes; //Vị trí cuối
      if (end > sizeInBytes) end = sizeInBytes; //Nếu điểm cắt cuối vượt quá kích thước file chặn lại
      var blogPart = uploadFile.slice(start, end); //Lấy dữ liệu của chunck dựa vào đầu cuối
      var fileChunk = new File([blogPart], uploadFile.name, {
        type: uploadFile.type,
      }); //Gói lại thành 1 file chunk để upload
      try {
        var uploadChunk = await lvFileClientAPI.formPostWithToken(
          `api/${appName}/files/upload`,
          {
            FilePart: fileChunk,
            UploadId: retUpload.Data?.UploadId,
            Index: i,
          }
        );
        console.log(uploadChunk);
      } catch (ex) {}
    }
    return retUpload;
  }
  addFile(fileItem: any, actionType: any, entityName: any) {
    this.fileService
      .addFile(fileItem, actionType, entityName, false, null)
      .toPromise();
  }

  logout() {
    let user = this.auth.get();
    this.signalRSV.disconnect(user);
    this.redirect('HCS', '', '', true);
    this.authService.logout('');
    // document.location.reload();
  }

  redirect(type, returnUrl, display = '', isLogout = false) {
    switch (type.toUpperCase()) {
      case 'HCS': {
        this.api
          .execSv(
            'SYS',
            'ERM.Business.AD',
            'UsersBusiness',
            'LoginHCSAsync',
            []
          )
          .subscribe((token) => {
            let url = '';
            if (isLogout) {
              url = `${environment.apiUrl}/hcs/UI2017/LogoutUser.aspx?tklid=${token}`;
              // window.open(url, '_blank');
              axios.get(url);
            } else {
              url = `${environment.loginHCS}/verifytoken.aspx?tklid=${token}&returnUrl=${returnUrl}`;
              if (url != '') {
                window.open(url, display == '3' ? '_blank' : '_self');
              }
            }
          });
        break;
      }
    }
  }

  changeMFApproval(data: any, value: object | any = null) {
    var datas = value;
    if (datas) {
      var list = data.filter(
        (x) => x.data != null && x.data.formName == 'Approvals'
      );
      for (var i = 0; i < list.length; i++) {
        list[i].isbookmark = true;
        if (list[i].functionID != 'SYS206' && list[i].functionID != 'SYS205') {
          list[i].disabled = true;
          if (
            value.statusApproval == '5' ||
            value.statusApproval == '2' ||
            value.statusApproval == '4'
          )
            list[i].disabled = true;
          else if (
            ((datas?.stepType == 'S1' ||
              datas?.stepType == 'S2' ||
              datas?.stepType == 'S3' ||
              datas?.stepType == 'S') &&
              list[i].functionID == 'SYS202') ||
            ((datas?.stepType == 'A1' ||
              datas?.stepType == 'R' ||
              datas?.stepType == 'C') &&
              list[i].functionID == 'SYS203') ||
            (datas?.stepType == 'S3' && list[i].functionID == 'SYS204') ||
            (datas?.stepType == 'A2' && list[i].functionID == 'SYS201')
          ) {
            list[i].disabled = false;
          }
        } else if (
          value.statusApproval == '5' ||
          value.statusApproval == '2' ||
          value.statusApproval == '4'
        )
          list[i].disabled = true;
      }

      if (datas?.eSign) {
        var listDis = data.filter(
          (x) =>
            x.functionID == 'SYS202' ||
            x.functionID == 'SYS203' ||
            x.functionID == 'SYS204' ||
            x.functionID == 'SYS205' ||
            x.functionID == 'SYS206' ||
            x.functionID == 'SYS201'
        );
        for (var i = 0; i < listDis.length; i++) {
          listDis[i].disabled = true;
        }

        var sys200 = data.filter((x) => x.functionID == 'SYS200');
        sys200[0].disabled = false;
      }
      // this.listApproveMF = list.filter(
      //   (p) => p.data.functionID == 'SYS208' || p.disabled == false
      // );

      //Ẩn thêm xóa sửa
      var list2 = data.filter(
        (x) =>
          x.functionID == 'SYS02' ||
          x.functionID == 'SYS01' ||
          x.functionID == 'SYS03' ||
          x.functionID == 'SYS04'
      );
      for (var i = 0; i < list2.length; i++) {
        list2[i].disabled = true;
      }
    }
    var bm = data.filter(
      (x: { functionID: string }) => x.functionID == 'SYS207'
    );
    bm[0].disabled = true;
    if (datas?.statusApproval != '3') {
      var check = this.checkStatusApproval(
        datas?.approvalRecID,
        datas?.statusApproval
      );
      if (isObservable(check)) {
        check.subscribe((item) => {
          var bm = data.filter(
            (x: { functionID: string }) => x.functionID == 'SYS207'
          );
          bm[0].disabled = !item;
        });
      } else {
        var bm = data.filter(
          (x: { functionID: string }) => x.functionID == 'SYS207'
        );
        bm[0].disabled = !check;
      }
    }
  }

  getMoreFunction(funcID: any, stepType: any = null) {
    var listApproveMF = [];
    if (stepType == null) {
      if (funcID == 'SYS201') {
        var consensus = {
          functionID: 'SYS201',
          text: 'Duyệt',
          color: '#666666',
        };

        listApproveMF.push(consensus);
      }

      if (funcID == 'SYS202') {
        var consensus = {
          functionID: 'SYS202',
          text: 'Ký',
          color: '#666666',
        };

        listApproveMF.push(consensus);
      }

      if (funcID == 'SYS203') {
        var consensus = {
          functionID: 'SYS203',
          text: 'Đồng thuận',
          color: '#666666',
        };

        listApproveMF.push(consensus);
      }
    } else {
      switch (stepType) {
        //R;Kiểm tra;C;Góp ý;A1;Đồng thuận;---------;S1;Ký nháy;S2;Ký chính;----------S3;Đóng dấu;A2;Duyệt
        case 'R':
        case 'C':
        case 'A1':
          var consensus = {
            functionID: 'SYS203',
            text: 'Đồng thuận',
            color: '#666666',
          };
          listApproveMF.push(consensus);
          break;

        case 'S':
        case 'S1':
        case 'S2':
          var consensus = {
            functionID: 'SYS202',
            text: 'Ký',
            color: '#666666',
          };

          listApproveMF.push(consensus);
          break;

        case 'S3':
        case 'A2':
          var consensus = {
            functionID: 'SYS201',
            text: 'Duyệt',
            color: '#666666',
          };

          listApproveMF.push(consensus);
          break;
      }
    }

    //Từ chối
    var tc = {
      functionID: 'SYS205',
      text: 'Từ chối',
      color: '#F64E60',
    };

    var ll = {
      functionID: 'SYS206',
      text: 'Làm lại',
      color: '#FFA800',
    };
    listApproveMF.push(ll, tc);
    return listApproveMF;
  }
  getCategoryByProcess(processID: string): any {
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'CategoriesBusiness',
      'GetByProcessIDAsync',
      [processID]
    );
  }
  getFileByObjectID(recID) {
    return this.api.execSv(
      'DM',
      'ERM.Business.DM',
      'FileBussiness',
      'GetFilesByIbjectIDAsync',
      recID
    );
  }
  deleteByObjectsWithAutoCreate(
    objectIDs: string,
    module: string,
    delForever: boolean,
    autoCreate: string
  ) {
    return this.api.execSv(
      'DM',
      'ERM.Business.DM',
      'FileBussiness',
      'DeleteByObjectsWithAutoCreateAsync',
      [objectIDs, module, delForever, autoCreate]
    );
  }
  getSignFileTemplateByRefType(refType) {
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'SignFilesBusiness',
      'GetTemplateByRefTypeAsync',
      refType
    );
  }
  getTemplateSF(cateID, category) {
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'SignFilesBusiness',
      'GetTemplateSFAsync',
      [cateID, category]
    );
  }

  exportTemplateData(module: string, exportUpload: ExportUpload) {
    return this.api.execSv(
      module,
      'ERM.Business.Core',
      'CMBusiness',
      'ExportUploadAsync',
      [exportUpload]
    );
  }
  deleteExportReleaseSF(recID: any): Observable<any> {
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'SignFilesBusiness',
      'DeleteExportReleaseSFAsync',
      [recID]
    );
  }
  copyFileByObjectID(
    oldRecID: string,
    newRecID: string,
    objectType: string,
    referType: string = '',
    copyFileInfo: tmpCopyFileInfo = null
  ): Observable<any> {
    return this.api.execSv(
      'DM',
      'ERM.Business.DM',
      'FileBussiness',
      'CopyFileByObjectIDAsync',
      [oldRecID, newRecID, objectType, referType, copyFileInfo]
    );
  }
  genURLParamObject(object: any) {
    var json = JSON.stringify(object);
    //json = encode(json) Thêm bước mã hóa
    let paramURL = encodeURIComponent(json);
    return paramURL;
  }
  getRpListByTemplateID(recID: any) {
    return this.api.execSv(
      'rptrp',
      'Codx.RptBusiness.RP',
      'ReportListBusiness',
      'GetByTemplateIDAsync',
      [recID]
    );
  }
  getListRpListByTemplateID(recIDs: any) {
    return this.api.execSv(
      'rptrp',
      'Codx.RptBusiness.RP',
      'ReportListBusiness',
      'GetListByTemplateIDAsync',
      [recIDs]
    );
  }
  convertFileToPDF(fileRecID: string, fileExtension: string) {
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'SignFilesBusiness',
      'ToPDFAsync',
      [fileRecID, fileExtension]
    );
  }
  getUserIDByPositionsID(listPositionID) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'GetEmployeesByPositionsAsync',
      listPositionID
    );
  }
  getCompanyApprover(companyID, roleType) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'GetCompanyApproverAsync',
      [companyID, roleType]
    );
  }
  getRPList(
    ids: any,
    option: string,
    isLite: boolean = false,
    reportType: string = null
  ) {
    return this.api.execSv(
      'rptrp',
      'Codx.RptBusiness.RP',
      'ReportListBusiness',
      'GetRPAsync',
      [ids, option, isLite, reportType]
    );
  }
  viewApprovalStep(transID, isSettingMode = true, dynamicApprovers = null) {
    return this.api.execSv<any>(
      'ES',
      'ES',
      'ApprovalStepsBusiness',
      'ViewApprovalStepAsync',
      [transID, isSettingMode, dynamicApprovers]
    );
  }

  createNewESSF(sf: any) {
    return this.api.execSv<any>(
      'ES',
      'ES',
      'SignFilesBusiness',
      'AddNewSignFileAsync',
      [sf]
    );
  }
  getSFByID(lstParams) {
    return this.api.execSv<any>(
      'ES',
      'ERM.Business.ES',
      'SignFilesBusiness',
      'GetByIDAsync',
      lstParams
    );
  }
  getSettingValueWithOption(
    option,
    formName,
    transType = null,
    category = null
  ) {
    //option: Filter With
    //"F": FormName
    //"FT" FormName && TransType
    //"FC" FormName && Category
    //"FTC" FormName && TransType && Category
    return this.api.execSv<any>(
      'SYS',
      'SYS',
      'SettingValuesBusiness',
      'GetListAsync',
      [option, formName, transType, category]
    );
  }
  //#region Codx Quy trình duyệt
  //-------------------------------------------Gửi duyệt--------------------------------------------//

  codxRelease(
    module: string, //Tên service
    recID: any, //RecID nghiệp vụ gốc
    processID: string, //Mã quy trình duyệt
    entityName: string, //EntityName nghiệp vụ gốc
    funcID: string, //FunctionID nghiệp vụ gốc
    userID: string, //Mã người dùng (ko bắt buộc - nếu ko có mặc định lấy UserID hiện hành)
    title: string, //Tiêu đề (truyền kiểu chuỗi thường)
    processType: string, //EntityName tùy chỉnh (lưu processType cho ES_ApprovalTrans)
    approvers: Array<Approver> = null, //Danh sách userID của RO
    customParam: string = null
  ): Observable<any> {
    let approveProcess = new ApproveProcess();
    approveProcess.recID = recID;
    approveProcess.processID = processID;
    approveProcess.userID = userID;
    approveProcess.entityName = entityName;
    approveProcess.funcID = funcID;
    approveProcess.htmlView = '<div>' + title + '</div>';
    approveProcess.module = module;
    approveProcess.processType = processType;
    approveProcess.approvers = approvers;
    approveProcess.title = title;
    approveProcess.customParam = customParam;

    return this.api.execSv(
      module,
      'ERM.Business.Core',
      'DataBusiness',
      'ReleaseAsync',
      [approveProcess]
    );
  }

  codxReleaseDynamic(
    //Tham số bắt buộc
    module: string, //Tên service
    data: any, //data nghiệp vụ gốc
    category: any, //Phân loại tài liệu hiện hành (ES_Categories) phục vụ cho việc kiểm tra loại quy trình gửi duyệt và tích hợp với form trình kí số.
    entityName: string, //EntityName nghiệp vụ gốc
    funcID: string, //FunctionID nghiệp vụ gốc
    title: string, //Tiêu đề (truyền kiểu chuỗi thường)
    releaseCallback: (response: ResponseModel, component: any) => void, //Hàm xử lí kết quả trả về
    //Tham số không bắt buộc
    userID: string = null, //Mã người dùng (ko bắt buộc - nếu ko có mặc định lấy UserID hiện hành)
    approvers: Array<Approver> = null, //Danh sách userID của RO hoặc người duyệt chỉ định
    processType: string = null, //EntityName tùy chỉnh (ko bắt buộc - xử lí cho trường hợp đặc biệt)
    releaseOnly: boolean = false, //tham số xử lí tại module ES - chỉ gửi duyệt mà ko kiểm tra thiết lập
    curComponent: any = null, //biến this: tại component gọi hàm
    exportData: ExportData = null, //biến lấy data export (funcID: Để lấy bộ EntityName, FormName, GridViewName; recID : Để lấy ra dữ liệu cần export ,data: data export lấy sẵn nếu có sẽ ưu tiên dùng thay cho việc dùng recID để đi lấy dữ liệu)
    customParam: string = null //Json string chứa tham số tùy chỉnh
  ) {
    let approveProcess = new ApproveProcess();
    approveProcess.recID = data?.recID;
    approveProcess.processID = category?.processID;
    approveProcess.userID = userID;
    approveProcess.entityName = entityName;
    approveProcess.funcID = funcID;
    approveProcess.htmlView = '<div>' + title + '</div>';
    approveProcess.module = module;
    approveProcess.title = title;
    approveProcess.processType = processType;
    approveProcess.approvers = approvers;
    approveProcess.category = category;
    approveProcess.data = data;
    approveProcess.exportData = exportData;
    approveProcess.customParam = customParam;
    if (approveProcess.approvers == null) {
      approveProcess.approvers = [];
    }
    this.callBackComponent = curComponent;

    //Gọi gửi duyệt thẳng (Dùng cho nội bộ ES_SignFile)
    if (releaseOnly) {
      this.apBaseRelease(approveProcess, releaseCallback);
    } else {
      //Kiểm tra tham số editApprovers
      if (category?.editApprovers == true) {
        let dialogApprove = this.callfunc.openForm(
          CodxAddApproversComponent,
          '',
          400,
          250,
          '',
          {},
          ''
        );
        dialogApprove.closed.subscribe((res) => {
          if (res?.event) {
            approveProcess.approvers = res?.event;
            //Gửi duyệt
            this.apCheckReleaseESign(approveProcess, releaseCallback);
          } else {
            //Tắt form chọn người duyệt
            return null;
          }
        });
      } else {
        //Gửi duyệt
        this.apCheckReleaseESign(approveProcess, releaseCallback);
      }
    }
  }

  apCheckReleaseESign(
    approveProcess: ApproveProcess,
    releaseCallback: (response: ResponseModel, component: any) => void
  ) {
    if (approveProcess?.category?.eSign) {
      switch (approveProcess?.category?.releaseControl) {
        //Gửi duyệt kèm SignFile
        case null:
        case '1':
          this.getFileByObjectID(approveProcess.recID).subscribe(
            (listFiles: any) => {
              if (listFiles) {
                //Gửi kí số kèm file cũ
                this.apReleaseWithOldFile(
                  approveProcess,
                  releaseCallback,
                  listFiles
                );
              } else {
                //Thêm trình kí ko có file
                this.apReleaseWithEmptySignFile(
                  approveProcess,
                  releaseCallback
                );
              }
            }
          );
          break;

        case '2': //Export và tạo ES_SignFiles để gửi duyệt
        case '3': //Export và view trc khi gửi duyệt (ko tạo ES_SignFiles)
        case '4': //Export và gửi duyệt ngầm (ko tạo ES_SignFiles)
          //Xóa file export cũ và trình kí số cũ nếu có
          this.deleteExportReleaseSF(approveProcess.recID).subscribe((res) => {
            this.getTemplateSF(
              approveProcess?.category?.categoryID,
              approveProcess?.category?.category
            ).subscribe((sfTemplates: any) => {
              if (sfTemplates?.length >= 1) {
                this.apGetTemplateSF(
                  sfTemplates,
                  approveProcess,
                  releaseCallback
                );
              } else {
                // Ko tìm thấy template mẫu của Category hiện tại
                this.notificationsService.notify(
                  'Không tìm thấy mẫu thiết lập, vui lòng kiểm tra lại',
                  '2',
                  null
                );
                return;
              }
            });
          });
          break;
      }
    } else {
      //Gửi duyệt thường
      this.apBaseRelease(approveProcess, releaseCallback);
    }
  }

  apBaseRelease(
    approveProcess: ApproveProcess,
    releaseCallback: (response: ResponseModel, cur: any) => void
  ) {
    this.api
      .execSv(
        approveProcess?.module,
        'ERM.Business.Core',
        'DataBusiness',
        'ReleaseAsync',
        [approveProcess]
      )
      .subscribe((res: ResponseModel) => {
        if (res) {
          //Thông báo khi gửi duyệt thành công và category?.releaseControl == "4" (Dạng ko mở popup ký số)
          if (
            !res?.msgCodeError &&
            res?.rowCount > 0 &&
            approveProcess?.category?.releaseControl == '4'
          ) {
            this.notificationsService.notifyCode('SYS034');
          }
          releaseCallback && releaseCallback(res, this.callBackComponent);
        }
      });
  }

  apCreateSignFile(
    approveProcess: ApproveProcess,
    listFiles: any = null,
    template: any = null
  ): ES_SignFile {
    let signFile = new ES_SignFile();
    signFile.recID = approveProcess?.recID;
    signFile.approveControl = '2';
    signFile.processID = approveProcess?.category?.recID;
    signFile.categoryID = approveProcess?.category?.categoryID;
    signFile.category = approveProcess?.category?.category;
    signFile.refID = approveProcess?.recID;
    signFile.refType = approveProcess?.entityName;
    signFile.title = approveProcess?.title;
    signFile.files = [];
    if (listFiles != null && listFiles?.length > 0) {
      for (let i = 0; i < listFiles?.length; i++) {
        let file = new ES_File();
        file.fileID = listFiles[i]?.recID;
        file.fileName = listFiles[i]?.fileName;
        file.createdOn = listFiles[i]?.createdOn;
        file.createdBy = listFiles[i]?.createdBy;
        file.comment = listFiles[i]?.extension;
        file.eSign = true;
        signFile.files.push(file);
      }
    }
    // if (template != null) {
    //   signFile.templateID = template[0].templateID;
    // }
    if (approveProcess?.template?.length > 0) {
      if (
        signFile.files?.length == 1 &&
        approveProcess?.template?.length == 1 &&
        approveProcess?.template[0]?.files?.length == 1
      ) {
        signFile.files[0].areas = approveProcess?.template[0]?.files[0]?.areas;
      } else {
        Array.from(approveProcess?.template).forEach((tp: any) => {
          if (tp?.files?.length > 0) {
            tp?.files?.forEach((file) => {
              if (file?.areas?.length > 0) {
                let fName = file?.fileName?.split('.')[0];
                if (fName != null && fName != '') {
                  let sfNewFile = signFile.files.filter((x) =>
                    x.fileName?.startsWith(fName)
                  );
                  if (sfNewFile?.length > 0) {
                    sfNewFile?.forEach((sfn: any) => {
                      sfn.areas = file?.areas;
                    });
                  }
                }
              }
            });
          }
        });
      }
    }
    return signFile;
  }

  apOpenPopupSignFile(
    approveProcess: ApproveProcess,
    releaseCallback: (response: ResponseModel, component: any) => void,
    signFile: ES_SignFile,
    listFile: Array<any> = []
  ) {
    let dialogModel = new DialogModel();
    dialogModel.IsFull = true;

    let dialogSF = this.callfunc.openForm(
      PopupAddSignFileComponent,
      'Thêm mới',
      700,
      650,
      '',
      {
        oSignFile: signFile,
        files: listFile,
        //cbxCategory: this.gridViewSetup['CategoryID']?.referedValue,
        disableCateID: true,
        refType: approveProcess.entityName,
        refID: approveProcess.recID,
        editApprovers: approveProcess.category?.editApprovers,
        approvers: approveProcess.approvers,
        approverProcess: approveProcess,
      },
      '',
      dialogModel
    );
    dialogSF.closed.subscribe((res) => {
      if (res?.event && res?.event?.approved == true) {
        let respone = new ResponseModel();
        respone.msgCodeError = res?.event?.responseModel?.msgCodeError;
        respone.rowCount = res?.event?.responseModel?.rowCount;
        releaseCallback && releaseCallback(respone, this.callBackComponent);
      } else {
        //Lưu - Tắt form kí số khi chưa gửi duyệt
      }
    });
  }

  apReleaseWithEmptySignFile(
    approveProcess: ApproveProcess,
    releaseCallback: (response: ResponseModel, component: any) => void
  ) {
    let signFile = this.apCreateSignFile(approveProcess);
    this.apOpenPopupSignFile(approveProcess, releaseCallback, signFile);
  }

  apReleaseWithOldFile(
    approveProcess: ApproveProcess,
    releaseCallback: (response: ResponseModel, component: any) => void,
    listFiles: any
  ) {
    let signFile = this.apCreateSignFile(approveProcess, listFiles);
    this.apOpenPopupSignFile(
      approveProcess,
      releaseCallback,
      signFile,
      listFiles
    );
  }

  apGetTemplateSF(
    sfTemplates: any,
    approveProcess: ApproveProcess,
    releaseCallback: (response: ResponseModel, component: any) => void,
    releaseBackground: boolean = false
  ) {
    if (sfTemplates?.length > 1) {
      let dialogTemplate = this.callfunc.openForm(
        CodxGetTemplateSignFileComponent,
        '',
        700,
        500,
        '',
        { sfTemplates: sfTemplates },
        ''
      );
      dialogTemplate.closed.subscribe((res) => {
        if (res?.event) {
          let template = res?.event;
          //Gửi duyệt
          let missingTemplate = template.filter(
            (x) => x?.templateID == null || x?.templateType == null
          );
          if (missingTemplate?.length > 0) {
            this.notificationsService.notify(
              'Không tìm thấy mẫu xuất dữ liệu',
              '2'
            );
            return null;
          } else {
            this.apExportFileWithMultiTemplate(
              approveProcess,
              releaseCallback,
              template,
              releaseBackground
            );
          }
        } else {
          //Tắt form chọn người duyệt
          return null;
        }
      });
    } else if (sfTemplates?.length == 1) {
      //Gửi duyệt
      let missingTemplate = sfTemplates.filter(
        (x) => x?.templateID == null || x?.templateType == null
      );
      if (missingTemplate?.length > 0) {
        this.notificationsService.notify(
          'Không tìm thấy mẫu xuất dữ liệu',
          '2'
        );
        return null;
      } else {
        this.apExportFileWithMultiTemplate(
          approveProcess,
          releaseCallback,
          sfTemplates,
          releaseBackground
        );
      }
    }
  }

  apExportFileWithMultiTemplate(
    approveProcess: ApproveProcess,
    releaseCallback: (response: ResponseModel, component: any) => void,
    templates: any,
    releaseBackground: boolean = false
  ) {
    approveProcess.template = templates;
    let exportUpload = new ExportUpload();
    exportUpload.convertToPDF = false;
    exportUpload.title = approveProcess.title;
    exportUpload.entityName = approveProcess.entityName;
    exportUpload.module = approveProcess.module;
    exportUpload.objectID = approveProcess.recID;
    exportUpload.objectType = approveProcess.entityName;
    exportUpload.referType = 'source';
    exportUpload.functionID = approveProcess.funcID;
    exportUpload.dataJson = JSON.stringify(approveProcess?.data);
    exportUpload.templates = [];
    exportUpload.exportData = approveProcess.exportData;

    let listTemplateRecID = [];
    for (let temp of templates) {
      let tmp = new TemplateInfo();
      tmp.templateID = temp?.templateID;
      tmp.templateType = temp?.templateType;
      tmp.exportFileName = temp?.files[0]?.fileName?.split('.')[0];
      listTemplateRecID.push(temp?.templateID);
      exportUpload.templates.push(tmp);
    }

    this.getListRpListByTemplateID(listTemplateRecID).subscribe(
      (rpLists: any) => {
        if (rpLists?.length > 0) {
          for (let temp of exportUpload.templates) {
            let curRpList = rpLists.filter(
              (x) => x.templateID == temp.templateID
            );
            if (curRpList?.length > 0) {
              temp.reportID = curRpList[0]?.recID;
            }
          }
        }
        // this.apCreateExportFile(
        //   approveProcess,
        //   releaseCallback,
        //   exportUpload
        // );
        this.exportTemplateData(approveProcess.module, exportUpload).subscribe(
          (exportedFiles: any) => {
            //Nhận thông tin file trả lên sau khi export
            if (exportedFiles?.length > 0) {
              switch (approveProcess?.category?.releaseControl) {
                case '2': //Export và tạo ES_SignFiles để gửi duyệt
                  this.getFileByObjectID(approveProcess.recID).subscribe(
                    (lstFile: any) => {
                      let signFile = this.apCreateSignFile(
                        approveProcess,
                        lstFile
                      );
                      if (lstFile?.length > 0) {
                        this.apOpenPopupSignFile(
                          approveProcess,
                          releaseCallback,
                          signFile,
                          lstFile
                        );
                      } else {
                        this.notificationsService.notify(
                          'Không tìm thấy tài liệu!',
                          '2'
                        );
                      }
                    }
                  );
                  break;

                case '3': //Export và view trc khi gửi duyệt (ko tạo ES_SignFiles)
                case '4': //Export và gửi duyệt ngầm (ko tạo ES_SignFiles)
                  //Kiểm tra file export có phải file pdf ko, nếu ko thì chuyển sang pdf để kí số
                  let nonPDFFile = exportedFiles.filter(
                    (x) => x.extension != '.pdf'
                  );
                  if (nonPDFFile?.length > 0) {
                    let index = 0;
                    for (let file of nonPDFFile) {
                      if (file?.extension != '.pdf') {
                        this.convertFileToPDF(
                          file?.recID,
                          file?.extension
                        ).subscribe((res) => {
                          if (res) {
                            index++;
                            if (index == nonPDFFile?.length) {
                              this.apReleaseWithoutSignFile(
                                approveProcess,
                                releaseCallback
                              );
                            }
                          } else {
                            //Xuát file lỗi xóa file export đã tạo
                            this.deleteByObjectsWithAutoCreate(
                              approveProcess.recID,
                              '',
                              true,
                              '3'
                            ).subscribe();
                            this.notificationsService.notify(
                              'Xuất tài liệu PDF thất bại!',
                              '2'
                            );

                            return;
                          }
                        });
                      }
                    }
                  } else {
                    this.apReleaseWithoutSignFile(
                      approveProcess,
                      releaseCallback
                    );
                  }
                  break;
              }
            } else {
              this.notificationsService.notify('Xuất tài liệu thất bại!', '2');
            }
          }
        );
      }
    );
  }

  apReleaseWithoutSignFile(
    approveProcess: ApproveProcess,
    releaseCallback: (response: ResponseModel, component: any) => void
  ) {
    switch (approveProcess?.category?.releaseControl) {
      case '3': //Export và view trc khi gửi duyệt (ko tạo ES_SignFiles)
        this.getFileByObjectID(approveProcess.recID).subscribe(
          (lstFile: any) => {
            if (lstFile?.length > 0) {
              let signFile = this.apCreateSignFile(approveProcess, lstFile);
              this.createNewESSF(signFile).subscribe((res) => {
                if (res) {
                  this.apOpenViewSignFile(
                    approveProcess,
                    releaseCallback,
                    res,
                    lstFile
                  );
                }
              });
            } else {
              this.notificationsService.notify('Không tìm thấy tài liệu!', '2');
            }
          }
        );
        break;

      case '4': //Export và gửi duyệt ngầm (ko tạo ES_SignFiles)
        this.getFileByObjectID(approveProcess.recID).subscribe(
          (lstFile: any) => {
            let signFile = this.apCreateSignFile(approveProcess, lstFile);
            this.createNewESSF(signFile).subscribe((res) => {
              if (res) {
                this.getSFByID([
                  res?.recID,
                  this.user?.userID,
                  false,
                  true,
                  null,
                  approveProcess.approvers,
                  false,
                ]).subscribe((res: any) => {
                  this.apBaseRelease(approveProcess, releaseCallback);
                });
              }
            });
          }
        );
        break;
    }
  }
  apOpenViewSignFile(
    approveProcess: ApproveProcess,
    releaseCallback: (response: ResponseModel, component: any) => void,
    signFile: ES_SignFile,
    listFile: Array<any> = []
  ) {
    let dialogModel = new DialogModel();
    dialogModel.IsFull = true;

    let dialogSF = this.callfunc.openForm(
      CodxViewReleaseSignFileComponent,
      'Thêm mới',
      700,
      650,
      '',
      {
        signFile: signFile,
        files: listFile,
        approveProcess: approveProcess,
      },
      '',
      dialogModel
    );
    dialogSF.closed.subscribe((res) => {
      if (res?.event) {
        releaseCallback && releaseCallback(res?.event, this.callBackComponent);
      } else {
        //Tắt form ko làm gì
      }
    });
  }

  //-------------------------------------------Hủy yêu cầu duyệt--------------------------------------------//
  codxCancel(
    module: string, //Tên service
    recID: string, //RecID nghiệp vụ gốc
    entityName: string, //EntityName nghiệp vụ gốc
    comment: string, //ghi chú (ko bắt buộc)
    userID: string //Mã người dùng (ko bắt buộc - nếu ko có mặc định lấy UserID hiện hành)
  ) {
    let approveProcess = new ApproveProcess();
    approveProcess.recID = recID;
    approveProcess.entityName = entityName;
    approveProcess.module = module;
    approveProcess.comment = comment;
    approveProcess.userID = userID;

    return this.api.execSv(
      module,
      'ERM.Business.Core',
      'DataBusiness',
      'CancelAsync',
      [approveProcess]
    );
  }

  //-------------------------------------------Khôi phục--------------------------------------------//
  codxUndo(
    tranRecID: string, //RecID của ES_ApprovalTrans hiện hành
    userID: string //Mã người dùng (ko bắt buộc - nếu ko có mặc định lấy UserID hiện hành)
  ) {
    let approveProcess = new ApproveProcess();
    approveProcess.tranRecID = tranRecID;
    approveProcess.userID = userID;
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'ApprovalTransBusiness',
      'UndoAsync',
      [approveProcess]
    );
  }
  //-------------------------------------------Duyệt/Làm lại/Từ chối--------------------------------------------//
  codxApprove(
    tranRecID: any, //RecID của ES_ApprovalTrans hiện hành
    status: string, //Trạng thái
    reasonID: string, //Mã lí do (ko bắt buộc)
    comment: string, //Bình luận (ko bắt buộc)
    userID: string //Người thực hiện (ko bắt buộc)
  ): Observable<any> {
    let approveProcess = new ApproveProcess();
    approveProcess.tranRecID = tranRecID;
    approveProcess.status = status;
    approveProcess.reasonID = reasonID;
    approveProcess.comment = comment;
    approveProcess.userID = userID;

    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'ApprovalTransBusiness',
      'ApproveAsync',
      [approveProcess]
    );
  }
  //#endregion Codx Quy trình duyệt


  //Lấy icon Folder/File
  getIconFile(ex: string) {
    if (!ex) return 'file.svg';
    var ext = ex.toLocaleLowerCase();
    switch (ext) {
      case '.txt':
        return 'txt.svg';
      case '.doc':
      case '.docx':
        return 'doc.svg';
      case '.7z':
      case '.rar':
      case '.zip':
        return 'zip.svg';
      case '.jpg':
      case '.jpeg':
      case '.jfif':
        return 'jpg.svg';
      case '.mp4':
        return 'mp4.svg';
      case '.xls':
      case '.xlsx':
        return 'xls.svg';
      case '.pdf':
        return 'pdf.svg';
      case '.png':
        return 'png.svg';
      case '.js':
        return 'javascript.svg';
      case '.apk':
        return 'android.svg';
      case '.ppt':
        return 'ppt.svg';
      case '.mp3':
      case '.wma':
      case '.wav':
      case '.flac':
      case '.ogg':
      case '.aiff':
      case '.aac':
      case '.alac':
      case '.lossless':
      case '.wma9':
      case '.aac+':
      case '.ac3':
        return 'audio.svg';
      default:
        return 'file.svg';
    }
  }

  getEmployeeInfor(userID: string) {
    if (!userID) return of(null);
    if (!this.user || this.user.userID != userID || !this.user.employee) {
      return this.api
        .execSv<any>(
          'HR',
          'ERM.Business.HR',
          'EmployeesBusiness',
          'GetByDomainUserAsync',
          [userID]
        )
        .pipe(
          map((res: any) => {
            if (this.user && this.user.userID == userID) {
              this.user.employee = res;
              this.auth.set(this.user);
            }
            return res;
          })
        );
    } else {
      return of(this.user.employee);
    }
  }

  getRPByIDAndType(reportID, reportType) {
    return this.api.execSv(
      'rptrp',
      'Codx.RptBusiness.RP',
      'ReportListBusiness',
      'GetListReportByIDandType',
      [reportID, reportType]
    );
  }

  printReport(
    reportID: string,
    reportType: string,
    paras: any,
    formModel: any
  ) {
    this.getRPByIDAndType(reportID, reportType).subscribe((rpList: any) => {
      if (rpList != null) {
        let tenantName = this.tenant.getName();
        let params = {
          ReportID: reportID,
        };
        if (paras) {
          for (const p in paras) {
            params[p] = paras[p];
          }
        }
        //let paramURL = this.shareService.genURLParamObject(params);
        let paramURL = encodeURIComponent(JSON.stringify(params));
        let rpOpenReportUI = function (recID, module) {
          let url = `/${tenantName}/${module}/report/detail/${recID}?params=${paramURL}`;
          window.open(url);
        };
        if (rpList?.length > 1) {
          this.rpViewReportList(rpList, formModel, params, rpOpenReportUI);
        } else if (rpList?.length == 1) {
          rpOpenReportUI(rpList[0]?.recID, rpList[0]?.moduleID?.toLowerCase());
        }
      }
    });
  }

  rpViewReportList(
    reportList: any,
    formModel: any,
    params: any,
    rpOpenReportUI: (recID: string, moduleID: string) => void
  ) {
    let moduleID = reportList[0]?.moduleID?.toLowerCase();
    var obj = {
      reportID: reportList[0]?.reportID,
      reportList: reportList,
      url: moduleID + '/report/detail/',
      formModel: formModel,
      headerText: 'Chọn mẫu in',
      parameters: params,
    };
    let opt = new DialogModel();
    let dialogViewRP = this.callfunc.openForm(
      CodxListReportsComponent,
      '',
      400,
      600,
      '',
      obj,
      '',
      opt
    );
    dialogViewRP.closed.subscribe((res) => {
      if (res?.event) {
        let tenantName = this.tenant.getName();
        rpOpenReportUI(res?.event?.recID, moduleID);
      }
    });
  }
}

//#region Model

export class Approvers {
  recID: string;
  roleType: string;
  approver: string;
  name: string = null;
  position: string = null;
  email: string = null;
  phone: string = null;
  leadTime: any = 0;
  allowEditAreas: boolean;
  confirmControl: string;
  comment: string = null;
  icon: string = null;
  createdOn: any = new Date();
  delete: boolean = true;
  write: boolean = false;
  userID: string;
  userName: string;
  orgUnitName: string;
}

//#endregion
