import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import { CodxReportIframeComponent } from './../../../codx-report/src/lib/report-iframe/report-iframe.component';
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
import { CodxReportViewDetailComponent } from 'projects/codx-report/src/lib/codx-report-view-detail/codx-report-view-detail.component';
import { CodxReportPopupViewDetailComponent } from 'projects/codx-report/src/lib/codx-report-popup-view-detail/codx-report-popup-view-detail.component';

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
  dataApproveTrans = new BehaviorSubject<any>(null); //data Approvel Trans- cần ở DP- CM để khỏi gọi- VTHAO

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

  loadCombobox(cbb: any): Observable<any> {
    let paras = ['Cbb', cbb];
    let keyRoot = 'Cbb' + cbb;
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
    let observable = this.cache.combobox(cbb).pipe(
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
  loadValueList(vll: any): Observable<any> {
    let paras = ['ValueList', vll];
    let keyRoot = 'ValueList' + vll;
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
    let observable = this.cache.valueList(vll).pipe(
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
              afterSave(data);
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
              if (res?.event) {
                let oComment = res?.event;
                this.codxCommonService
                  .codxApprove(
                    data?.unbounds?.approvalRecID,
                    status,
                    oComment?.comment,
                    oComment?.reasonID,
                    null
                  )
                  .subscribe((res2: any) => {
                    if (!res2?.msgCodeError) {
                      data.unbounds.statusApproval =
                        status ?? res2?.returnStatus;
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
            });
          } else {
            this.codxCommonService
              .codxApprove(
                data?.unbounds?.approvalRecID,
                status,
                null,
                null,
                null
              )
              .subscribe((res2: any) => {
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
        this.codxCommonService
          .codxUndo(data?.unbounds?.approvalRecID, null)
          .subscribe((res: any) => {
            if (!res?.msgCodeError) {
              data.unbounds.statusApproval = res?.status;
              //Cập nhật lại status ủy
              var index = dataService.data.findIndex(
                (x) => x.transID == data.recID
              );
              if (index >= 0)
                dataService.data[index].unbounds.statusApproval = res?.status;
              afterSave(data);
              dataService.update(data).subscribe();
              this.notificationsService.notifyCode('SYS007');
            } else this.notificationsService.notify(res?.msgCodeError);
          });
        break;
      }
      //Ủy quyền
      case 'SYS209': {
        this.codxCommonService.codxAuthority(
          data?.unbounds?.approvalRecID,
          (res: any) => {
            if (!res?.msgCodeError) {
              data.unbounds.statusApproval = res?.returnStatus;
              //Cập nhật lại status duyệt
              var index = dataService?.data?.findIndex(
                (x) => x?.transID == data?.recID
              );
              if (index >= 0)
                dataService.data[index].unbounds.statusApproval =
                  res?.returnStatus;
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
          gridModel.filter = dataService.request.filter;
          gridModel.searchText = dataService.request.searchText;
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
      'HRBusiness_Old',
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

  getEmailTemplateType(templateType: string) {
    return this.api.execSv<any>(
      'SYS',
      'ERM.Business.AD',
      'EmailTemplatesBusiness',
      'GetEmailTemplateByTemplateTypeAsync',
      [templateType]
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
    if (option && option.method && option.data) {
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
      [emailTemplate, sendToList, option.idAlert]
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

  getOrCreateSignature(
    email: string,
    signatureType: string,
    supplier: string,
    userID: string
  ) {
    return this.api.execSv<any>(
      'ES',
      'ERM.Business.ES',
      'SignaturesBusiness',
      'GetApproverSignatureAsync',
      [email, signatureType, supplier, userID]
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
        if (approvalTrans?.cancelControl != 1) {
          _dialog = this.openPopupComment(
            status,
            approvalTrans?.cancelControl,
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
          approvalTrans?.redoControl == '2' ||
          approvalTrans?.redoControl == '3'
        ) {
          _dialog = this.openPopupComment(
            status,
            approvalTrans?.redoControl,
            funcID,
            title,
            formModel
          );
        }
        break;
      }
      case '5': {
        //duyet
        if (approvalTrans?.approveControl != '1') {
          _dialog = this.openPopupComment(
            status,
            approvalTrans?.approveControl,
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
          approvalTrans?.rejectControl == '2' ||
          approvalTrans?.rejectControl == '3'
        ) {
          _dialog = this.openPopupComment(
            status,
            approvalTrans?.rejectControl,
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
    //     if (approvalTrans?.cancelControl != 1) {
    //       _dialog = this.openPopupComment(
    //         status,
    //         approvalTrans?.cancelControl,
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
    //       approvalTrans?.redoControl == '2' ||
    //       approvalTrans?.redoControl == '3'
    //     ) {
    //       _dialog = this.openPopupComment(
    //         status,
    //         approvalTrans?.redoControl,
    //         funcID,
    //         title,
    //         formModel
    //       );
    //     }
    //     break;
    //   }
    //   case '5': {
    //     //duyet
    //     if (approvalTrans?.approveControl != '1') {
    //       _dialog = this.openPopupComment(
    //         status,
    //         approvalTrans?.approveControl,
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
    //       approvalTrans?.rejectControl == '2' ||
    //       approvalTrans?.rejectControl == '3'
    //     ) {
    //       _dialog = this.openPopupComment(
    //         status,
    //         approvalTrans?.rejectControl,
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
        approveControl: funcControl ?? '0',
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

  getRequestDataCO_Meetings(request) {
    return this.api.execSv(
      'CO',
      'CO',
      'MeetingsBusiness',
      'GetListMeetingsCalendarAsync',
      request
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
      var tenant =  arr[arr.length - 4];
      if (width <= 30 * widthThumb) wt = 30;
      else if (width <= 60 * widthThumb) wt = 60;
      else if (width <= 120 * widthThumb) wt = 120;
      else if (width <= 300 * widthThumb) wt = 300;
      else if (width <= 500 * widthThumb) wt = 500;
      else if (width <= 650 * widthThumb) wt = 600;

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
    if (bm && bm[0]) {
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
    // var authority = {
    //   functionID: 'SYS209',
    //   text: 'Ủy quyền',
    //   color: '#FFA800',
    // };
    //listApproveMF.push(ll, tc,authority);
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
      'EmployeesBusiness_Old',
      'GetEmployeesByPositionsAsync',
      listPositionID
    );
  }
  getCompanyApprover(companyID, roleType) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness_Old',
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
  getStepsByTransID(transID: any) {
    return this.api.execSv<any>(
      'ES',
      'ES',
      'ApprovalStepsBusiness',
      'GetByTransIDAsync',
      [transID]
    );
  }
  addCustomStep(steps: any) {
    return this.api.execSv<any>(
      'ES',
      'ES',
      'ApprovalStepsBusiness',
      'AddCustomStepAsync',
      [steps]
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
          'EmployeesBusiness_Old',
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
        // let paramURL = encodeURIComponent(JSON.stringify(params));
        // let rpOpenReportUI = function (recID, module) {
        //   let url = `/${tenantName}/${module}/report/detail/${recID}?params=${paramURL}`;
        //   window.open(url);

        // };
        if (rpList?.length > 1) {
          this.rpViewReportList(rpList, formModel, params);
        } else if (rpList?.length == 1) {
          //rpOpenReportUI(rpList[0]?.recID, rpList[0]?.moduleID?.toLowerCase());
          this.popupPrintRP(rpList[0], params);
        }
      }
    });
  }
  popupPrintRP(rpList: any, params: any) {
    let paramURL = encodeURIComponent(JSON.stringify(params));
    let dialogModel = new DialogModel();
    dialogModel.IsFull = false;
    dialogModel.DataService = null;
    let printDialog = this.callfunc.openForm(
      CodxReportPopupViewDetailComponent,
      rpList.customName,
      1080,
      720,
      rpList?.recID,
      { isPopup: true, reportList: rpList, params: paramURL },
      '',
      dialogModel
    );
  }
  rpViewReportList(
    reportList: any,
    formModel: any,
    params: any
    //rpOpenReportUI: (recID: string, moduleID: string) => void
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
        //rpOpenReportUI(res?.event?.recID, moduleID);
        this.popupPrintRP(res?.event, params);
      }
    });
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

  getApproverByRole(approvers = [], isSettingMode: boolean, trueUser: string) {
    return this.api.execSv<any>(
      'HR',
      'ERM.Business.HR',
      'EmployeesBusiness_Old',
      'GetStepApproverAsync',
      [approvers, isSettingMode, trueUser]
    );
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
  idCardType: string;
  idCardNo: string;
  negative: string;
}

//#endregion
