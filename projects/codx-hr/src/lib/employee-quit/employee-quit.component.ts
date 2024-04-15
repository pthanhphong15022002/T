import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import {
  AuthStore,
  ButtonModel,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxHrService } from 'projects/codx-hr/src/public-api';
import { ActivatedRoute } from '@angular/router';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { CodxOdService } from 'projects/codx-od/src/public-api';
import { FormGroup } from '@angular/forms';
import { isObservable } from 'rxjs';
import { PopupEquitComponent } from '../employee-profile/popup-equit/popup-equit.component';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';

@Component({
  selector: 'lib-employee-quit',
  templateUrl: './employee-quit.component.html',
  styleUrls: ['./employee-quit.component.css'],
})
export class EmployeeQuitComponent extends UIComponent {
  console = console;
  constructor(
    inject: Injector,
    private authStore: AuthStore,
    private hrService: CodxHrService,
    private notify: NotificationsService,
    private activatedRoute: ActivatedRoute,
    private codxCommonService: CodxCommonService,
    private codxShareService: CodxShareService,
    private codxODService: CodxOdService
  ) {
    super(inject);
  }

  views: Array<ViewModel> = [];
  grvSetup;
  buttonAdd: ButtonModel[] = [{
    id: 'btnAdd',
  }];
  cmtStatus: string = '';
  formGroup: FormGroup;
  itemDetail;
  currentEmpObj;
  flagChangeMF: boolean = false;
  runModeCheck: boolean = false;
  editStatusObj;
  dialogEditStatus: any;
  fmContract;
  user;
  userLogin;

  //More function
  @ViewChild('templateUpdateStatus', { static: true })
  templateUpdateStatus: TemplateRef<any>;

  actionCancelSubmit = 'HRTPro08A00';
  actionAddNew = 'HRTPro08A01';
  actionSubmit = 'HRTPro08A03';
  actionUpdateCanceled = 'HRTPro08AU0';
  actionUpdateInProgress = 'HRTPro08AU3';
  actionUpdateApproved = 'HRTPro08AU5';
  actionUpdateClosed = 'HRTPro08AU9';

  //Detail
  @ViewChild('templateListDetail') templateListDetail?: TemplateRef<any>;
  @ViewChild('panelRightListDetail') panelRightListDetail?: TemplateRef<any>;

  GetGvSetup() {
    let funID = this.activatedRoute.snapshot.params['funcID'];
    this.cache.functionList(funID).subscribe((fuc) => {
      this.cache
        .gridViewSetup(fuc?.formName, fuc?.gridViewName)
        .subscribe((res) => {
          this.grvSetup = res;
        });
    });

    this.hrService.getFormModel(funID).then((formModel) => {
      if (formModel) {
        let tmp = formModel;
        this.hrService
          .getFormGroup(tmp.formName, tmp.gridViewName, tmp)
          .then((fg) => {
            if (fg) {
              this.formGroup = fg;
            }
          });
      }
    });
  }

  onInit() {
    this.fmContract = new FormModel();
    this.fmContract.entityName = 'HR_EContracts';
    this.fmContract.gridViewName = 'grvEContracts';
    this.fmContract.formName = 'EContracts';

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
        id: '2',
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        model: {
          template: this.templateListDetail,
          panelRightRef: this.panelRightListDetail,
        },
      },
    ];

    this.detectorRef.detectChanges();
  }

  CloseStatus(dialog: DialogRef) {
    dialog.close();
  }

  ValueChangeComment(evt) {
    this.cmtStatus = evt.data;
  }

  release() {
    this.hrService
      .getCategoryByEntityName(this.view.formModel.entityName)
      .subscribe((res) => {
        if (res) {
          this.codxCommonService.codxReleaseDynamic(
            'HR',
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
                this.notify.notifyCode('ES007');
                this.itemDetail.status = '3';
                this.itemDetail.approveStatus = '3';
                this.hrService
                  .UpdateEmployeeAppointionsInfo(this.itemDetail)
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
        }
      });
  }

  beforeRelease() {
    this.hrService
      .validateBeforeReleaseEQuit(this.itemDetail.recID)
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

  PopupUpdateEAppointStatus(funcID, data) {
    this.hrService.handleUpdateRecordStatus(funcID, data);
    this.editStatusObj = data;
    this.editStatusObj.employeeID = data.emp.employeeID;
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
        this.view.dataService.update(res.event).subscribe();

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

        //Render new data when update new status on view detail
        this.detectorRef.detectChanges();
      }
    });
  }

  onSaveUpdateForm() {
    console.log(this.editStatusObj);
    this.hrService.EditEQuit(this.editStatusObj).subscribe((res: any) => {
      if (res != null) {
        this.notify.notifyCode('SYS007');
        let data = {
          ...res,
          emp: this.currentEmpObj,
        };
        this.hrService
          .addBGTrackLog(
            res.recID,
            this.cmtStatus,
            this.view.formModel.entityName,
            'C1',
            null,
            'EQuitBusiness_Old'
          )
          .subscribe();
        this.dialogEditStatus && this.dialogEditStatus.close(data);
      }
    });
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
      this.codxShareService.changeMFApproval(e, data?.unbounds);
    }
  }

  clickMF(event, data): void {
    if (data?.emp) {
      this.currentEmpObj = data.emp;
    }
    this.itemDetail = data;
    switch (event.functionID) {
      case this.actionSubmit:
        this.beforeRelease();
        break;
      case this.actionCancelSubmit:
      case this.actionUpdateCanceled:
      case this.actionUpdateInProgress:
      case this.actionUpdateApproved:
      case this.actionUpdateClosed:
        let oUpdate = JSON.parse(JSON.stringify(data));
        this.PopupUpdateEAppointStatus(event.functionID, oUpdate);
        break;
      //Delete
      case 'SYS02':
        this.view.dataService
          .delete([data], true, (option: RequestOption) =>
            this.beforeDelete(option, data.recID)
          )
          .subscribe();
        break;
      //Edit
      case 'SYS03':
        this.HandleEQuitInfo(event.text, 'edit', data);
        break;
      //Copy
      case 'SYS04':
        this.HandleEQuitInfo(event.text, 'copy', data);
        //this.copyValue(event.text, data, 'eContract');
        break;
      default: {
        this.codxShareService.defaultMoreFunc(
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

  ChangeDataMF(event, data) {
    var funcList = this.codxODService.loadFunctionList(
      this.view.formModel.funcID
    );
    if (isObservable(funcList)) {
      funcList.subscribe((fc) => {
        this.changeDataMFBefore(event, data, fc);
      });
    } else this.changeDataMFBefore(event, data, funcList);
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

  clickEvent(event) {
    this.clickMF(event?.event, event?.data);
  }

  //#region CRUD
  HandleEQuitInfo(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialogAdd = this.callfc.openSide(
      PopupEquitComponent,
      {
        fmContract: this.fmContract,
        formGroup: this.formGroup,
        actionType: actionType,
        dataObj: data,
        empObj: this.currentEmpObj ?? this.userLogin,
        headerText: actionHeaderText,
        funcID: this.view.funcID,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        if (actionType == 'add') {
          this.view.dataService.add(res.event, 0).subscribe();
        } else if (actionType == 'copy') {
          this.view.dataService.add(res.event, 0).subscribe();
        } else if (actionType == 'edit') {
          this.view.dataService.update(res.event).subscribe();
        }
        this.detectorRef.detectChanges();
      }
    });
  }

  add(evt) {
    if (evt.id == 'btnAdd') {
      this.HandleEQuitInfo(evt.text, 'add', null);
    }
  }

  //Call api delete
  beforeDelete(opt: RequestOption, data) {
    opt.methodName = 'DeleteAsync';
    opt.className = 'EQuitBusiness_Old';
    opt.assemblyName = 'HR';
    opt.service = 'HR';
    opt.data = data;
    return true;
  }

  //#endregion

  handleMutipleUpdateStatus(funcID, data) {
    this.hrService.handleUpdateRecordStatus(funcID, data);

    this.hrService.EditEQuit(data).subscribe((res: any) => {
      if (res != null) {
        res.inforEmployee = data?.inforEmployee;
        this.view.dataService.update(res).subscribe();

        this.hrService
          .addBGTrackLog(
            res.recID,
            this.cmtStatus,
            this.view.formModel.entityName,
            'C1',
            null,
            'EQuitBusiness_Old'
          )
          .subscribe();

        //Gọi hàm hủy yêu cầu duyệt bên core
        if (
          funcID === this.actionUpdateCanceled ||
          funcID === this.actionCancelSubmit
        ) {
          this.codxCommonService
            .codxCancel('HR', res.recID, this.view.formModel.entityName, '', '')
            .subscribe();
        }
        this.detectorRef.detectChanges();
      }
    });
  }

  //Send multi
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

  ChangeItemDetail(event) {
    if (event?.data?.emp) {
      this.currentEmpObj = event.data.emp;
    }
    this.itemDetail = event?.data;
  }
}
