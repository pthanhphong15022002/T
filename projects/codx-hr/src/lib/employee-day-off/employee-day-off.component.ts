import {
  ChangeDetectorRef,
  Component,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  ButtonModel,
  DialogRef,
  NotificationsService,
  RequestOption,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxHrService } from '../codx-hr.service';
import { PopupEdayoffsComponent } from '../employee-profile/popup-edayoffs/popup-edayoffs.component';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';
import { CodxOdService } from 'projects/codx-od/src/public-api';
import { isObservable } from 'rxjs';
import { ViewDayOffDetailComponent } from './view-day-off-detail/view-day-off-detail.component';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';

@Component({
  selector: 'lib-employee-day-off',
  templateUrl: './employee-day-off.component.html',
  styleUrls: ['./employee-day-off.component.css'],
})
export class EmployeeDayOffComponent extends UIComponent {
  console = console;
  //#region view
  @ViewChild('templateList') templateList?: TemplateRef<any>;
  @ViewChild('headerTemplate') headerTemplate?: TemplateRef<any>;

  @ViewChild('viewdetail') viewdetail: ViewDayOffDetailComponent;
  @ViewChild('templateListDetail') templateListDetail?: TemplateRef<any>;
  @ViewChild('templateItemDetailRight')
  templateItemDetailRight?: TemplateRef<any>;

  @ViewChild('templateUpdateStatus', { static: true })
  templateUpdateStatus: TemplateRef<any>;

  //#endregion

  constructor(
    injector: Injector,
    private authStore: AuthStore,
    private hrService: CodxHrService,
    private activatedRoute: ActivatedRoute,
    private df: ChangeDetectorRef,
    private notify: NotificationsService,
    private codxCommonService: CodxCommonService,
    private shareService: CodxShareService,
    private codxODService: CodxOdService
  ) {
    super(injector);
  }

  service = 'HR';
  assemblyName = 'ERM.Business.HR';
  entityName = 'HR_EDayOffs';
  className = 'EDayOffsBusiness_Old';
  method = 'GetListDayOffByDataRequestAsync';

  //add = 'SYS03';
  copy = 'SYS04';
  edit = 'SYS03';
  delete = 'SYS02';

  actionCancelSubmit = 'HRTPro09A00';
  actionAddNew = 'HRTPro09A01'; //tạo mới
  actionSubmit = 'HRTPro09A03'; //gửi duyệt
  actionUpdateCanceled = 'HRTPro09AU0'; //hủy
  actionUpdateInProgress = 'HRTPro09AU3'; //đang duyệt
  // actionUpdateRejected = 'HRTPro09AU4'; //từ chối
  actionUpdateApproved = 'HRTPro09AU5';
  actionUpdateClosed = 'HRTPro09AU9'; // đóng

  grvSetup: any;
  views: Array<ViewModel> = [];
  buttonAdd: ButtonModel[] = [{
    id: 'btnAdd',
  }];
  eDayOffsHeaderText;
  formGroup: FormGroup;
  eDayOffObj: any;
  editStatusObj: any;
  dialogEditStatus: DialogRef;
  cmtStatus: string = '';
  dialogAddEdit: DialogRef;
  dataCategory: any;
  itemDetail;
  currentEmpObj: any;
  eDayOff: any;
  flagChangeMF: boolean = false;
  runModeCheck: boolean = false;
  isPortal: boolean;
  viewActive: string;
  user;
  userLogin;

  GetGvSetup() {
    let funID = this.activatedRoute.snapshot.params['funcID'];
    this.cache.functionList(funID).subscribe((fuc) => {
      this.isPortal = fuc.isPortal;
      this.cache
        .gridViewSetup(fuc?.formName, fuc?.gridViewName)
        .subscribe((res) => {
          this.grvSetup = res;
        });
    });
  }

  onInit() {
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

    this.GetGvSetup();
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.list,
        active: false,
        sameData: true,
        model: {
          template: this.templateList,
          headerTemplate: this.headerTemplate,
        },
      },
      {
        id: '2',
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        model: {
          template: this.templateListDetail,
          panelRightRef: this.templateItemDetailRight,
        },
      },
    ];
  }
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

  viewChanged(event: any) {
    this.viewActive = event?.view?.id;
  }

  changeItemDetail(event) {
    if (this.viewActive !== '1') {
      this.itemDetail = event?.data;
    }
  }

  //More function
  clickMF(event, data) {
    this.itemDetail = data;
    switch (event.functionID) {
      case this.actionSubmit:
        this.beforeRelease();
        break;
      case this.actionCancelSubmit:
      case this.actionUpdateCanceled:
      case this.actionUpdateInProgress:
      // case this.actionUpdateRejected:
      case this.actionUpdateApproved:
      case this.actionUpdateClosed:
        let oUpdate = JSON.parse(JSON.stringify(data));
        this.popupUpdateEDayOffStatus(event.functionID, oUpdate);
        break;
      // case this.actionAddNew:
      //   let newData = {
      //     //new data just with emp info (id??)
      //     emp: data?.emp,
      //     employeeID: data?.employeeID,
      //   };
      //   this.handlerEDayOffs(
      //     event.text + ' ' + this.view.function.description,
      //     'add',
      //     newData
      //   );
      //   break;
      //Delete
      case this.delete:
        if (data) {
          this.view.dataService.dataSelected = data;
        }
        this.view.dataService
          .delete([data], true, (option: RequestOption) =>
            this.beforeDelete(option, data.recID)
          )
          .subscribe(() => {});
        break;
      //Edit
      case this.edit:
        //  let input = JSON.parse(JSON.stringify(data));//????
        this.handlerEDayOffs(
          event.text + ' ' + this.view.function.description,
          'edit',
          data
        );
        this.df.detectChanges();
        break;
      //Copy
      case this.copy:
        this.copyValue(event.text, this.itemDetail);
        this.df.detectChanges();
        break;
      default: {
        this.shareService.defaultMoreFunc(
          event,
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

  changeDataMF(event, data) {
    this.hrService.handleShowHideMF(event, data, this.view.formModel);

    this.flagChangeMF = true;
    var funcList = this.codxODService.loadFunctionList(
      this.view.formModel.funcID
    );
    if (isObservable(funcList)) {
      funcList.subscribe((fc) => {
        this.changeDataMFBefore(event, data, fc);
      });
    } else this.changeDataMFBefore(event, data, funcList);
  }

  clickEvent(event) {
    this.clickMF(event?.event, event?.data);
  }

  changeDataMFCdxView(e: any, data: any) {
    this.hrService.handleShowHideMF(e, data, this.view.formModel);

    var funcList = this.codxODService.loadFunctionList(
      this.view.formModel.funcID
    );
    if (isObservable(funcList)) {
      funcList.subscribe((fc) => {
        this.changeDataMFBeforeCdxView(e, data, fc);
      });
    } else this.changeDataMFBeforeCdxView(e, data, funcList);
  }

  changeDataMFBeforeCdxView(e: any, data: any, fc: any) {
    if (fc.runMode == '1') {
      this.shareService.changeMFApproval(e, data?.unbounds);
    }
  }

  changeDataMFBefore(e: any, data: any, fc: any) {
    if (fc.runMode == '1') {
      this.runModeCheck = true;
      this.shareService.changeMFApproval(e, data?.unbounds);
    }
  }

  //add/edit/copy/delete
  handlerEDayOffs(actionHeaderText: string, actionType: string, data: any) {
    let option = new SidebarModel();
    option.Width = '550px';
    option.FormModel = this.view.formModel;

    if (data?.emp) {
      this.currentEmpObj = data?.emp;
    } else {
      this.currentEmpObj = this.userLogin;
    }
    //open form
    let dialogAdd = this.callfc.openSide(
      PopupEdayoffsComponent,
      {
        //pass data
        actionType: actionType,
        dayoffObj: data ?? this.userLogin,
        headerText: actionHeaderText,
        isPortal: this.isPortal,
        employeeId: data?.employeeID ?? this.userLogin.employeeID,
        funcID: this.view.funcID,
        fromListView: true,
        //empObj: actionType == 'add' ? null : this.currentEmpObj,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        if (actionType == 'add') {
          this.view.dataService.add(res.event, 0).subscribe((res) => {});
        } else if (actionType == 'copy') {
          this.view.dataService.add(res.event, 0).subscribe((res) => {});
        } else if (actionType == 'edit') {
          this.view.dataService.update(res.event).subscribe((res) => {});
        }
        this.df.detectChanges();
      }
      // if (res?.event) this.view.dataService.clear();
    });
  }
  addDayOff(event) {
    if (event.id == 'btnAdd') {
      this.handlerEDayOffs(
        event.text + ' ' + this.view.function.description,
        'add',
        this.itemDetail
      );
    }
  }
  copyValue(actionHeaderText, data) {
    this.hrService.copy(data, this.view.formModel, 'RecID').subscribe((res) => {
      this.handlerEDayOffs(
        actionHeaderText + ' ' + this.view.function.description,
        'copy',
        res
      );
    });
  }
  beforeDelete(opt: RequestOption, data) {
    opt.methodName = 'DeleteEmployeeDayOffInfoAsync';
    opt.className = 'EDayOffsBusiness_Old';
    opt.assemblyName = 'HR';
    opt.service = 'HR';
    opt.data = data;
    return true;
  }

  //change status
  popupUpdateEDayOffStatus(funcID, data) {
    this.hrService.handleUpdateRecordStatus(funcID, data);
    this.editStatusObj = data;
    this.currentEmpObj = data.emp;
    this.formGroup.patchValue(this.editStatusObj);
    if (!this.view.formModel.currentData) {
      this.view.formModel.currentData = this.editStatusObj;
    }

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
        this.view.dataService.update(res.event).subscribe((res) => {});

        //Gọi hàm hủy yêu cầu duyệt bên core
        if (
          funcID === this.actionUpdateCanceled ||
          funcID === this.actionCancelSubmit
        ) {
          this.codxCommonService
            .codxCancel(
              'HR',
              this.itemDetail.recID,
              this.view.formModel.entityName,
              '',
              ''
            )
            .subscribe();
        }

        this.df.detectChanges();
      }
    });
  }
  closeUpdateStatusForm(dialog: DialogRef) {
    dialog.close();
  }
  valueChangeComment(event) {
    this.cmtStatus = event.data;
  }
  onSaveUpdateForm() {
    this.hrService
      .UpdateEmployeeDayOffInfo(this.editStatusObj)
      .subscribe((res) => {
        if (res) {
          this.notify.notifyCode('SYS007');
          res.emp = this.currentEmpObj;
          this.hrService
            .addBGTrackLog(
              res.recID,
              this.cmtStatus,
              this.view.formModel.entityName,
              'C1',
              null,
              'EDayOffsBusiness_Old'
            )
            .subscribe();
          this.dialogEditStatus && this.dialogEditStatus.close(res);
        }
      });
  }

  //#region gui duyet
  beforeRelease() {
    this.hrService
      .validateBeforeReleaseDayoff(this.itemDetail.recID)
      .subscribe((res: any) => {
        if (res.result) {
          let category = '4';
          let formName = 'HRParameters';
          this.hrService
            .getSettingValue(formName, category)
            .subscribe((res) => {
              if (res) {
                let parsedJSON = JSON.parse(res?.dataValue);
                let index = parsedJSON.findIndex(
                  (p) => p.Category == this.view.formModel.entityName
                );
                if (index > -1) {
                  let data = parsedJSON[index];
                  if (data['ApprovalRule'] == '1') {
                    this.release();
                  }
                }
              }
            });
        }
      });
    // let category = '4';
    // let formName = 'HRParameters';
    // this.hrService.getSettingValue(formName, category).subscribe((res) => {
    //   if (res) {
    //     let parsedJSON = JSON.parse(res?.dataValue);
    //     let index = parsedJSON.findIndex(
    //       (p) => p.Category == this.view.formModel.entityName
    //     );
    //     if (index > -1) {
    //       let eBasicSalaryObj = parsedJSON[index];
    //       if (eBasicSalaryObj['ApprovalRule'] == '1') {
    //         this.release();
    //       } else {
    //         //đợi BA mô tả
    //       }
    //     }
    //   }
    // });
  }
  release() {
    this.hrService
      .getCategoryByEntityName(this.view.formModel.entityName)
      .subscribe((res) => {
        if (res) {
          this.dataCategory = res;
          this.codxCommonService.codxReleaseDynamic(
            'HR',
            this.itemDetail,
            this.dataCategory,
            this.view.formModel.entityName,
            this.view.formModel.funcID,
            this.view.function.description +
              ' - ' +
              this.itemDetail.contractNo +
              ' - ' +
              this.itemDetail.employeeID,
            (res: any) => {
              if (res?.msgCodeError == null && res?.rowCount) {
                this.notify.notifyCode('ES007');
                this.itemDetail.status = '3';
                this.itemDetail.approveStatus = '3';
                this.hrService
                  .UpdateEmployeeDayOffInfo(this.itemDetail)
                  .subscribe((res) => {
                    if (res) {
                      this.view?.dataService
                        ?.update(this.itemDetail)
                        .subscribe();
                    }
                  });
              } else this.notify.notifyCode(res?.msgCodeError);
            }
          );
          // this.shareService
          //   .codxRelease(
          //     'HR',
          //     this.itemDetail.recID,
          //     this.dataCategory.processID,
          //     this.view.formModel.entityName,
          //     this.view.formModel.funcID,
          //     '',
          //     this.view.function.description +
          //       ' - ' +
          //       this.itemDetail.decisionNo,
          //     ''
          //   )
          //   .subscribe((result) => {
          //     if (result?.msgCodeError == null && result?.rowCount) {
          //       this.notify.notifyCode('ES007');
          //       this.itemDetail.status = '3';
          //       this.itemDetail.approveStatus = '3';
          //       this.hrService
          //         .UpdateEmployeeDayOffInfo(this.itemDetail)
          //         .subscribe((res) => {
          //           if (res) {
          //             this.view?.dataService
          //               ?.update(this.itemDetail)
          //               .subscribe();
          //           }
          //         });
          //     } else this.notify.notifyCode(result?.msgCodeError);
          //   });
        }
      });
  }
  //#endregion

  viewDetail(data) {
    this.handlerEDayOffs('Xem chi tiết', 'view', data);
  }

  handleMutipleUpdateStatus(funcID, data) {
    this.hrService.handleUpdateRecordStatus(funcID, data);

    this.hrService.UpdateEmployeeDayOffInfo(data).subscribe((res) => {
      if (res != null) {
        res.emp = this.currentEmpObj;
        this.view.dataService.update(res).subscribe();

        this.hrService
          .addBGTrackLog(
            res[0].recID,
            this.cmtStatus,
            this.view.formModel.entityName,
            'C1',
            null,
            'EDayOffsBusiness_Old'
          )
          .subscribe();

        //Gọi hàm hủy yêu cầu duyệt bên core
        if (
          funcID === this.actionUpdateCanceled ||
          funcID === this.actionCancelSubmit
        ) {
          this.codxCommonService
            .codxCancel(
              'HR',
              res[0].recID,
              this.view.formModel.entityName,
              '',
              ''
            )
            .subscribe();
        }
        this.df.detectChanges();
      }
    });
  }

  async onMoreMulti(e) {
    let dataSelected = e.dataSelected;
    let funcID = e.event.functionID;

    switch (funcID) {
      case this.actionCancelSubmit:
      case this.actionUpdateCanceled:
      case this.actionUpdateInProgress:
      case this.actionUpdateApproved:
      case this.actionUpdateClosed:
        await Promise.all([
          ...dataSelected.map((res) =>
            this.handleMutipleUpdateStatus(funcID, res)
          ),
        ]);
    }
  }
}
