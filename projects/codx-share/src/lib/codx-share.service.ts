import {
  async,
  BehaviorSubject,
  finalize,
  isObservable,
  map,
  Observable,
  of,
  share,
} from 'rxjs';
import { Injectable } from '@angular/core';
import { TM_Tasks } from './components/codx-tasks/model/task.model';
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
  Util,
} from 'codx-core';
import { AssignInfoComponent } from './components/assign-info/assign-info.component';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { PopupCommentComponent } from 'projects/codx-es/src/lib/sign-file/popup-comment/popup-comment.component';
import { environment } from 'src/environments/environment';
import { AssignTaskModel } from './models/assign-task.model';
import { lvFileClientAPI } from '@shared/services/lv.component';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { FileService } from '@shared/services/file.service';
import { SignalRService } from './layout/drawers/chat/services/signalr.service';
import { PopupSignForApprovalComponent } from 'projects/codx-es/src/lib/sign-file/popup-sign-for-approval/popup-sign-for-approval.component';
import { ApproveProcess } from './models/ApproveProcess.model';
import { HttpClient } from '@angular/common/http';
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
  //
  user;
  //
  //listApproveMF = [];
  constructor(
    private notificationsService: NotificationsService,
    private callfunc: CallFuncService,
    private api: ApiHttpService,
    private auth: AuthStore,
    private authService: AuthService,
    private cache: CacheService,
    private fb: FormBuilder,
    private dmSV: CodxDMService,
    private fileService: FileService,
    private signalRSV: SignalRService,
    private httpClient: HttpClient
  ) {
    this.user = this.auth.get();
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
    let key = JSON.stringify(paras).toLowerCase();
    if (this.caches.has(keyRoot)) {
      var c = this.caches.get(keyRoot);
      if (c && c.has(key)) {
        return c.get(key);
      }
    }
    if (this.cachedObservables.has(key)) {
      this.cachedObservables.get(key);
    }
    let observable = this.api
      .execSv('SYS', 'SYS', 'MoreFunctionsBusiness', 'GetAsync', functionID)
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
  checkStatusApproval(recID: any, status): Observable<any> {
    let paras = [recID];
    let keyRoot = recID + status;
    let key = JSON.stringify(paras).toLowerCase();
    if (this.caches.has(keyRoot)) {
      var c = this.caches.get(keyRoot);
      if (c && c.has(key)) {
        return c.get(key);
      }
    }
    if (this.cachedObservables.has(key)) {
      this.cachedObservables.get(key);
    }

    let observable = this.api
      .execSv(
        'ES',
        'ERM.Business.ES',
        'ApprovalTransBusiness',
        'CheckRestoreAsync',
        recID
      )
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
  defaultMoreFunc(
    val: any,
    data: any,
    afterSave?: Function,
    formModel?: any,
    dataService?: any,
    that: any = null
  ) {
    //Duyệt SYS201 , Ký SYS202 , Đồng thuận SYS203 , Hoàn tất SYS204 , Từ chối SYS205 , Làm lại SYS206 , Khôi phục SYS207
    var funcID = val?.functionID;
    switch (funcID) {
      case 'SYS201':
      case 'SYS202':
      case 'SYS203':
      case 'SYS204':
      case 'SYS205':
      case 'SYS206': {
        if (data?.unbounds?.eSign == true) {
          let option = new SidebarModel();
          option.Width = '800px';
          option.DataService = dataService;
          option.FormModel = formModel;
          let dialogModel = new DialogModel();
          dialogModel.IsFull = true;

          var listApproveMF = this.getMoreFunction(funcID);

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
            if (x.event?.result) {
              data.statusApproval = x.event?.mode;
              dataService.update(data).subscribe();
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
                oComment.comment,
                oComment.reasonID
              ).subscribe((res2: any) => {
                if (!res2?.msgCodeError) {
                  data.unbounds.statusApproval = status;
                  dataService.update(data).subscribe();
                  this.notificationsService.notifyCode('SYS007');
                  //afterSave(data.statusApproval);
                } else this.notificationsService.notify(res2?.msgCodeError);
              });
            });
          } else {
            this.codxApprove(
              data?.unbounds?.approvalRecID,
              status,
              '',
              ''
            ).subscribe((res2: any) => {
              if (!res2?.msgCodeError) {
                data.unbounds.statusApproval = status;
                dataService.update(data).subscribe();
                this.notificationsService.notifyCode('SYS007');
                afterSave(data.statusApproval);
              } else this.notificationsService.notify(res2?.msgCodeError);
            });
          }
        }
        break;
      }
      case 'SYS207': {
        this.codxUndo(data?.unbounds?.approvalRecID).subscribe((res: any) => {
          if (res) {
            data.unbounds.statusApproval = res?.status;
            dataService.update(data).subscribe();
            //this.notificationsService.notifyCode('SYS007');
          }
        });
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

  sendEmail(emailTemplate: any, sendToList: any) {
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
    let formModel;
    let approvalTrans: any = {};

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
      500,
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

  getDataCO_Meetings(requestData) {
    return this.api.execSv(
      'CO',
      'CO',
      'MeetingsBusiness',
      'GetListMeetingsCalendarAsync',
      requestData
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

      return (
        environment.urlUpload +
        '/api/' +
        this.user?.tenant+
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
    if (this.user) {
      let ele = document.getElementsByTagName('codx-chat-container');
      if (ele.length > 0) {
        ele[0].remove();
      }
      this.signalRSV.sendData(
        'LogOutAsync',
        this.user.tenant,
        this.user.userID
      );
    }
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
              url = `${environment.loginHCS}/LogoutUser.aspx?tklid=${token}`;
              this.httpClient.get<any>(url).subscribe((reponse) => {
                console.log('log out', reponse);
              });
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
    if (datas.statusApproval != '3') {
      var check = this.checkStatusApproval(
        datas.approvalRecID,
        datas.statusApproval
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

  getMoreFunction(funcID: any) {
    var listApproveMF = [];

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
    customEntityName: string //EntityName tùy chỉnh (ko bắt buộc - xử lí cho trường hợp đặc biệt)
  ): Observable<any> {
    let approveProcess = new ApproveProcess();
    approveProcess.recID = recID;
    approveProcess.processID = processID;
    approveProcess.userID = userID;
    approveProcess.entityName = entityName;
    approveProcess.funcID = funcID;
    approveProcess.htmlView = '<div>' + title + '</div>';
    approveProcess.module = module;
    approveProcess.customEntityName = customEntityName;

    return this.api.execSv(
      module,
      'ERM.Business.Core',
      'DataBusiness',
      'ReleaseAsync',
      [approveProcess]
    );
  }

  //-------------------------------------------Hủy yêu cầu duyệt--------------------------------------------//
  codxCancel(
    module: string, //Tên service
    recID: string, //RecID nghiệp vụ gốc
    entityName: string, //EntityName nghiệp vụ gốc
    comment: string //ghi chú (ko bắt buộc)
  ) {
    let approveProcess = new ApproveProcess();
    approveProcess.recID = recID;
    approveProcess.entityName = entityName;
    approveProcess.module = module;
    approveProcess.comment = comment;

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
    tranRecID: string //RecID của ES_ApprovalTrans hiện hành
  ) {
    let approveProcess = new ApproveProcess();
    approveProcess.tranRecID = tranRecID;
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
    comment: string //Bình luận (ko bắt buộc)
  ): Observable<any> {
    let approveProcess = new ApproveProcess();
    approveProcess.tranRecID = tranRecID;
    approveProcess.status = status;
    approveProcess.reasonID = reasonID;
    approveProcess.comment = comment;

    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'ApprovalTransBusiness',
      'ApproveAsync',
      [approveProcess]
    );
  }
  //#endregion Codx Quy trình duyệt
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
}
//#endregion
