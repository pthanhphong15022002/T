import {
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  AuthStore,
  ButtonModel,
  CacheService,
  DialogRef,
  NotificationsService,
  ResourceModel,
  SidebarModel,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';
import moment from 'moment';
import { isObservable } from 'rxjs';
import { DataVll } from 'projects/codx-hr/src/lib/model/HR_OrgChart.model';
import { PopupOverTimeComponent } from './popup-over-time/popup-over-time.component';
import { ViewDetailComponent } from './view-detail/view-detail.component';
import { CodxOdService } from 'projects/codx-od/src/public-api';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { CodxHrService } from 'projects/codx-hr/src/public-api';
import { FormGroup } from '@angular/forms';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';
import { CodxPrService } from 'projects/codx-pr/src/public-api';

@Component({
  selector: 'pr-timekeeping-request-ot',
  templateUrl: './timekeeping-request-ot.component.html',
  styleUrls: ['./timekeeping-request-ot.component.css'],
})
export class TimeKeepingRequestOT extends UIComponent {
  console = console;
  //#region declare properties
  @ViewChild('templateListDetail') itemTemplateListDetail?: TemplateRef<any>;
  @ViewChild('panelRightListDetail') panelRightListDetail?: TemplateRef<any>;
  @ViewChild('viewdetail') viewdetail: ViewDetailComponent;
  @ViewChild('templateUpdateStatus', { static: true })
  templateUpdateStatus: TemplateRef<any>;

  @Input() showMoreFunc = true;

  formGroup: FormGroup;

  cmtStatus: string = '';
  views: Array<ViewModel> = [];
  buttons: ButtonModel[];
  popupTitle;
  funcIDName = '';
  user;
  userLogin;
  dataVll: Array<DataVll> = null;
  grvSetup: any;
  vllStatus = 'HRS104';
  runModeCheck: boolean = false;
  flagChangeMF: boolean = false;
  recID = null;
  itemSelected: any;
  registerForm = ['1', '2'];
  lblAdd: any;
  status: any;
  itemDetail: any;
  editStatusObj: any;
  currentEmpObj: any = null;
  dialogEditStatus: DialogRef;
  crrStatus: string = '';
  requestDetail: any = null;

  //#region more functions
  actionCancelSubmit = 'HRTPro11A00';
  actionSubmit = 'HRTPro11A03';
  actionUpdateCanceled = 'HRTPro11AU0';
  actionUpdateInProgress = 'HRTPro11AU3';
  actionUpdateApproved = 'HRTPro11AU5';
  //#endregion

  //#region View schedule
  requestSchedule: ResourceModel;
  modelResource: ResourceModel;
  eventModel = {
    id: 'recID',
    subject: { name: 'employeeID' },
    startTime: { name: 'fromDate' },
    endTime: { name: 'toDate' },
    resourceId: { name: 'employeeID' }, //trung voi idField của resourceModel
  };
  resourceModel = {
    Name: 'employeeID',
    Field: 'employeeID',
    IdField: 'employeeID',
    TextField: 'employeeID',
    Title: 'employeeID',
  };

  @ViewChild('resourceHeader') resourceHeader: TemplateRef<any>;
  @ViewChild('mfButton') mfButton?: TemplateRef<any>;
  @ViewChild('contentTmp') contentTmp?: TemplateRef<any>;
  @ViewChild('cardTemplate') cardTemplate?: TemplateRef<any>;
  //#endregion

  //#endregion

  constructor(
    injector: Injector,
    private authStore: AuthStore,
    private cacheService: CacheService,
    private codxODService: CodxOdService,
    private codxShareService: CodxShareService,
    private codxCommonService: CodxCommonService,
    private hrService: CodxHrService,
    private prService: CodxPrService,
    private notify: NotificationsService,
    private df: ChangeDetectorRef
  ) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
    this.cache.functionList(this.funcID).subscribe((funcList) => {
      if (funcList) {
        this.funcIDName = funcList?.customName?.toString()?.toLowerCase();
      }
    });
  }

  //Get user default login
  getUserLogin() {
    this.user = this.authStore.get();
    if (this.user.userID) {
      this.api
        .execSv(
          'HR',
          'ERM.Business.HR',
          'EmployeesBusiness_Old',
          'GetEmployeeByUserIDAsync',
          this.user.userID
        )
        .subscribe((res: any) => {
          this.userLogin = res;
        });
    }
  }

  getColorItem(data: any) {
    return this.dataVll
      .filter((item) => item.value === data)
      .map((obj) => obj.color)
      .toString();
  }

  getHour(data) {
    if (data) {
      return moment(data).format('HH : mm');
    } else {
      return null;
    }
  }

  GetGvSetup() {
    this.cache.functionList(this.funcID).subscribe((fuc) => {
      this.cache
        .gridViewSetup(fuc?.formName, fuc?.gridViewName)
        .subscribe((res) => {
          this.grvSetup = res;
        });
    });
  }
  //Set form group data when open Modal dialog
  ngAfterViewChecked() {
    if (!this.formGroup?.value) {
      this.hrService
        .getFormGroup(
          this.view?.formModel?.formName,
          this.view?.formModel?.gridViewName,
          this.view?.formModel
        )
        .then((res) => {
          this.formGroup = res;
        });
    }
  }

  //#region Init components
  ngAfterViewInit() {
    this.requestDetail = new ResourceModel();
    this.requestDetail.assemblyName = 'PR';
    this.requestDetail.className = 'TimeKeepingRequestBusiness';
    this.requestDetail.service = 'PR';
    this.requestDetail.method = 'GetListAsync';

    this.modelResource = new ResourceModel();
    this.modelResource.assemblyName = 'PR';
    this.modelResource.className = 'TimeKeepingRequestBusiness';
    this.modelResource.service = 'PR';
    this.modelResource.method = 'GetEmployeeAsync';
    // this.modelResource.method = 'GetEmployeeResourceAsync';

    this.requestSchedule = new ResourceModel();
    this.requestSchedule.service = 'PR';
    this.requestSchedule.assemblyName = 'ERM.Business.PR';
    this.requestSchedule.className = 'TimeKeepingRequestBusiness';
    this.requestSchedule.method = 'GetListAsync';
    // this.requestSchedule.idField = 'recID';

    this.views = [
      {
        type: ViewType.listdetail,
        active: false,
        sameData: true,
        request: this.requestDetail,
        model: {
          template: this.itemTemplateListDetail,
          panelRightRef: this.panelRightListDetail,
        },
      },
      {
        type: ViewType.schedule,
        active: true,
        sameData: false,
        request: this.requestSchedule,
        request2: this.modelResource,
        showSearchBar: false,
        showFilter: true,
        model: {
          eventModel: this.eventModel,
          resourceModel: this.resourceModel,
          template: this.cardTemplate,
          template4: this.resourceHeader,
          template6: this.mfButton, //header
          template8: this.contentTmp, //content
          statusColorRef: this.vllStatus,
        },
      },
    ];
  }

  onInit() {
    this.cacheService.valueList(this.vllStatus).subscribe((res) => {
      if (res) {
        this.dataVll = res.datas;
      }
    });

    this.buttons = [{
      id: 'btnAdd',
    }];
    this.cache.message('AC0033').subscribe((res) => {
      if (res) {
        this.lblAdd = res?.customName;
      }
    });
    this.getUserLogin();
    // this.getSchedule();
    this.GetGvSetup();
  }

  getSchedule() {
    //let resourceType = '1';
  }

  CloseStatus(dialog: DialogRef) {
    dialog.close();
  }
  ValueChangeComment(evt) {
    this.cmtStatus = evt.data;
  }
  //#endregion

  clickMF(e, data) {
    this.itemDetail = data;
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      //Edit
      case 'SYS03':
        this.edit(e, data);
        break;
      //Copy
      case 'SYS04':
        this.copy(e, data);
        break;
      case this.actionSubmit:
        // gui xet duyet
        this.beforeRelease();
        break;
      case this.actionCancelSubmit:
      case this.actionUpdateCanceled:
      case this.actionUpdateInProgress:
      case this.actionUpdateApproved:
        // cap nhat trang thai
        let oUpdate = JSON.parse(JSON.stringify(data));
        this.openPopupUpdateStatus(e.functionID, oUpdate);
        break;
      //Delete

      default: {
        this.codxShareService.defaultMoreFunc(
          e,
          data,
          null,
          this.view.formModel,
          this.view.dataService,
          this
        );
        break;
      }
    }
  }

  beforeRelease() {
    this.prService
      .validateBeforeReleaseTimeKeepingRequest(this.itemDetail.recID)
      .subscribe((res: any) => {
        if (res.result) {
          let category = '4'; //xet duyen
          let formName = 'PRParameters';
          this.hrService
            .getSettingValue(formName, category)
            .subscribe((res) => {
              if (res) {
                let parsedJSON = JSON.parse(res?.dataValue);
                let index = parsedJSON.findIndex(
                  (p) => p.Category == this.view.formModel.entityName
                );
                if (index > -1) {
                  let eJobSalaryObj = parsedJSON[index];
                  if (eJobSalaryObj['ApprovalRule'] == '1') {
                    this.release();
                  }
                }
              }
            });
        }
      });
  }

  release() {
    this.hrService
      .getCategoryByEntityName(this.view.formModel.entityName)
      .subscribe((res) => {
        if (res) {
          this.codxCommonService.codxReleaseDynamic(
            'PR',
            this.itemDetail,
            res,
            this.view.formModel.entityName,
            this.view.formModel.funcID,
            this.view.function.description +
              ' - ' +
              this.itemDetail.decisionNo +
              ' - ' +
              this.itemDetail.employeeID,
            (res: any) => {
              if (res?.msgCodeError == null && res?.rowCount) {
                this.itemDetail.status = '3';
                this.itemDetail.approveStatus = '3';
                this.prService
                  .UpdateStatus(this.itemDetail)
                  .subscribe((res) => {
                    if (res) {
                      this.notify.notifyCode('ES007');

                      this.view?.dataService
                        ?.update(this.itemDetail)
                        .subscribe();
                    }
                  });
              } else this.notify.notifyCode(res?.msgCodeError);
            }
          );
        }
      });
  }

  onSaveUpdateForm() {
    this.prService.UpdateStatus(this.editStatusObj).subscribe((res) => {
      if (res != null) {
        this.notify.notifyCode('SYS007');
        let data = {
          ...res,
          emp: this.currentEmpObj,
        };
        this.prService
          .addBGTrackLog(
            res.recID,
            this.cmtStatus,
            this.view.formModel.entityName,
            'C1',
            null,
            'TimeKeepingRequestBusiness'
          )
          .subscribe();
        this.view.dataService.update(this.editStatusObj).subscribe();
        this.detectorRef.detectChanges();
        this.dialogEditStatus && this.dialogEditStatus.close(data);
      }
    });
  }
  changeDataMF(e, data) {
    var funcList = this.codxODService.loadFunctionList(
      this.view.formModel.funcID
    );
    if (isObservable(funcList)) {
      funcList.subscribe((fc) => {
        this.changeDataMFBefore(e, data, fc);
      });
    } else this.changeDataMFBefore(e, data, funcList);
  }

  changeDataMFBefore(e: any, data: any, fc: any) {
    this.flagChangeMF = true;

    if (fc.runMode == '1') {
      this.runModeCheck = true;
      this.codxShareService.changeMFApproval(e, data?.unbounds);
    } else {
      this.hrService.handleShowHideMF(e, data, this.view.formModel);
    }
  }

  //#region CRUD
  click(evt: ButtonModel) {
    // add by button
    this.popupTitle = evt?.text + ' ' + this.funcIDName;
    switch (evt.id) {
      case 'btnAdd':
        this.addNew();
        break;
    }
  }

  onActionClick(event?) {
    //add by schedule
    if (event.type == 'add') {
      this.addNew(event.data);
    }
  }

  changeResource(event: any) {
    if (event) {
      let resources = {};

      resources['value'] = event.employeeID;
      resources['text'] = event.employeeID;
      resources['positionName'] = event.emp.positionName;
      resources['employeeName'] = event.emp.employeeName;
      resources['employeeID'] = event.employeeID;
      resources['ClassName'] = 'e-child-node';
      (this.view.currentView as any).schedule.resourceDataSource.push(
        resources
      );
      (this.view.currentView as any).schedule.resourceDataSource = [
        ...(this.view.currentView as any).schedule.resourceDataSource,
      ];
      (this.view.currentView as any).schedule.setEventSettings();
    }
  }

  addNew(evt?) {
    this.view.dataService.addNew().subscribe((res) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '550px';
      if (evt?.startDate) {
        res.fromDate = evt.startDate;
      }
      if (evt?.endDate) {
        res.toDate = evt.endDate;
      }
      this.popupTitle = this.lblAdd + ' ' + this.funcIDName;
      let dialogAdd = this.callfc.openSide(
        PopupOverTimeComponent,
        [res, 'add', this.popupTitle, evt ? evt : null, this.userLogin],
        option
      );
      dialogAdd.closed.subscribe((res) => {
        if (res?.event) {
          this.changeResource(res?.event);
        } else {
          this.view.dataService.clear();
        }
      });
    });
  }

  delete(data) {
    this.view.dataService.delete([data]).subscribe((res) => {
      // after delete
    });
  }
  edit(evt, data) {
    if (data) this.view.dataService.dataSelected = data;

    this.view.dataService.edit(data).subscribe((res) => {
      let option = new SidebarModel();
      this.view.dataService.dataSelected = data;
      option.DataService = this.view?.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '550px';
      var obj = [
        this.view.dataService.dataSelected,
        'edit',
        this.popupTitle,
        null,
        this.userLogin,
      ];
      this.popupTitle = evt.text + ' ' + this.funcIDName;
      let dialogAdd = this.callfc.openSide(PopupOverTimeComponent, obj, option);
      dialogAdd.closed.subscribe((res) => {
        if (res?.event) {
          this.itemSelected = res.event;
          this.changeResource(res?.event);
        } else {
          this.view.dataService.clear();
        }
      });
    });
  }
  copy(evt, data) {
    if (data) this.view.dataService.dataSelected = data;

    this.view.dataService.copy().subscribe((res) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '550px';
      var obj = [
        this.view.dataService.dataSelected,
        'copy',
        this.popupTitle,
        null,
        this.userLogin,
      ];
      this.popupTitle = evt.text + ' ' + this.funcIDName;
      let dialogAdd = this.callfc.openSide(PopupOverTimeComponent, obj, option);
      dialogAdd.closed.subscribe((res) => {
        if (!res?.event) {
          this.view.dataService.clear();
        } else {
          this.changeResource(res?.event);
        }
      });
    });
  }

  openPopupUpdateStatus(functionID, data) {
    this.hrService.handleUpdateRecordStatus(functionID, data);
    this.editStatusObj = data;
    this.currentEmpObj = data.emp;
    this.crrStatus = data.status;
    this.formGroup.patchValue(this.editStatusObj);

    this.dialogEditStatus = this.callfc.openForm(
      this.templateUpdateStatus,
      null,
      500,
      350,
      null,
      null
    );
    this.dialogEditStatus.closed.subscribe((res) => {
      if (res?.event) {
        this.view.dataService.update(res.event).subscribe();

        //Gọi hàm hủy yêu cầu duyệt bên core
        if (
          functionID === this.actionUpdateCanceled ||
          functionID === this.actionCancelSubmit
        ) {
          this.codxCommonService
            .codxCancel(
              'PR',
              this.itemDetail.recID,
              this.view.formModel.entityName,
              '',
              ''
            )
            .subscribe();
        }
      }
      //Render new data when update new status on view detail
      this.df.detectChanges();
    });
  }
  //#endregion

  //#region selectedChange
  selectedChange(e) {
    if (e?.data) {
      this.itemSelected = e.data;
      this.recID = e.data.recID;
    }
  }
  //#endregion

  receiveMF(e: any) {
    this.clickMF(e?.event, e?.data);
  }
}
