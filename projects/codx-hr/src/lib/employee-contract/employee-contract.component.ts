import {
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonModel,
  CallFuncService,
  DataRequest,
  DialogModel,
  DialogRef,
  NotificationsService,
  RequestOption,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { Observable, concat, of } from 'rxjs';
import { delay, toArray, tap } from 'rxjs/operators';
import moment from 'moment';
import { getListImg } from 'projects/codx-od/src/lib/function/default.function';
import { CodxOdService } from 'projects/codx-od/src/public-api';
import { CodxEmailComponent } from 'projects/codx-share/src/lib/components/codx-email/codx-email.component';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { CodxListReportsComponent } from 'projects/codx-share/src/lib/components/codx-list-reports/codx-list-reports.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { isObservable, map } from 'rxjs';
import { CodxHrService } from './../codx-hr.service';
import { PopupEProcessContractComponent } from './popup-eprocess-contract/popup-eprocess-contract.component';
import { ViewDetailContractsComponent } from './popup-eprocess-contract/view-detail-contracts/view-detail-contracts/view-detail-contracts.component';
import { PopupSubEContractComponent } from '../employee-profile/popup-sub-econtract/popup-sub-econtract.component';

@Component({
  selector: 'lib-employee-contract',
  templateUrl: './employee-contract.component.html',
  styleUrls: ['./employee-contract.component.css'],
})
export class EmployeeContractComponent extends UIComponent {
  console = console;

  @ViewChild('templateList') itemTemplate?: TemplateRef<any>;
  @ViewChild('viewdetail') viewdetail: ViewDetailContractsComponent;
  @ViewChild('templateListDetail') itemTemplateListDetail?: TemplateRef<any>;
  @ViewChild('panelRightListDetail') panelRightListDetail?: TemplateRef<any>;
  @ViewChild('headerTemplate') headerTemplate?: TemplateRef<any>;
  @ViewChild('contractTemplate') contractTemplate?: TemplateRef<any>;
  @ViewChild('templateUpdateStatus', { static: true })

  templateUpdateStatus: TemplateRef<any>;

  views: Array<ViewModel> = [];
  dataCategory;
  itemDetail;
  buttonAdd: ButtonModel = {
    id: 'btnAdd',
  };
  formGroup: FormGroup;
  editStatusObj: any;
  cmtStatus: string = '';
  currentEmpObj: any = null;
  dialogEditStatus: any;
  statusCbx = true;
  dialog!: DialogRef;
  grvSetup: any;
  runModeCheck: boolean = false;
  flagChangeMF: boolean = false;
  resignStatus: boolean = false;
  viewActive: string;
  moment = moment;
  dateNow = moment().format('YYYY-MM-DD');
  datasUpdated: Array<ViewModel> = [];

  //#region eContractFuncID
  actionCancelSubmit = 'HRTPro01A00';
  actionAddNew = 'HRTPro01A01';
  actionSubmit = 'HRTPro01A03';
  actionUpdateCanceled = 'HRTPro01AU0';
  actionUpdateInProgress = 'HRTPro01AU3';
  // actionUpdateRejected = 'HRTPro01AU4';
  actionUpdateApproved = 'HRTPro01AU5';
  actionUpdateClosed = 'HRTPro01AU9';
  actionAddAppendix = 'HRTPro01A10';
  actionCheckResignApprove = 'HRTPro01A11';
  actionCheckResignCancel = 'HRTPro01A12';
  //#endregion
  constructor(
    inject: Injector,
    private hrService: CodxHrService,
    private codxShareService: CodxShareService,
    private activatedRoute: ActivatedRoute,
    private df: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private codxODService: CodxOdService,
    private notify: NotificationsService
  ) {
    super(inject);
  }

  GetGvSetup() {
    let funID = this.activatedRoute.snapshot.params['funcID'];
    this.cache.functionList(funID).subscribe((fuc) => {
      this.cache
        .gridViewSetup(fuc?.formName, fuc?.gridViewName)
        .subscribe((res) => {
          this.grvSetup = res;
        });
    });
  }

  onInit(): void {
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
          template: this.itemTemplate,
          headerTemplate: this.headerTemplate,
        },
      },
      {
        id: '2',
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        model: {
          template: this.itemTemplateListDetail,
          panelRightRef: this.panelRightListDetail,
        },
      },
    ];
  }

  //Set form group data when open Modal dialog
  ngAfterViewChecked() {
    if (!this.formGroup?.value) {
      this.hrService
        .getFormGroup(
          this.view?.formModel?.formName,
          this.view?.formModel?.gridViewName
        )
        .then((res) => {
          this.formGroup = res;
        });
    }
  }

  CloseDialog(dialog: DialogRef) {
    dialog.close();
  }

  popupUpdateEContractStatus(funcID, data) {
    if (
      funcID === this.actionCheckResignCancel ||
      funcID === this.actionCheckResignApprove
    ) {
      this.resignStatus = true;
    } else {
      this.resignStatus = false;
    }

    this.hrService.handleUpdateRecordStatus(funcID, data);
    this.editStatusObj = data;
    this.currentEmpObj = data?.inforEmployee;
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
        this.view.dataService.update(res.event[0]).subscribe();
        if (res.event[1]) {
          this.view.dataService.update(res.event[1]).subscribe();
        }

        //Gọi hàm hủy yêu cầu duyệt bên core
        if (
          funcID === this.actionUpdateCanceled ||
          funcID === this.actionCancelSubmit
        ) {
          this.codxShareService
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
        this.df.detectChanges();
      }
    });
  }

  ValueChangeComment(evt) {
    this.cmtStatus = evt.data;
  }

  onSaveUpdateForm() {
    this.hrService.editEContract(this.editStatusObj).subscribe((res) => {
      if (res != null) {
        this.notify.notifyCode('SYS007');
        res[0].inforEmployee = this.currentEmpObj;
        if (res[1]) {
          res[1].inforEmployee = this.currentEmpObj;
        }
        this.view.formModel.entityName;
        this.hrService
          .addBGTrackLog(
            res[0].recID,
            this.cmtStatus,
            this.view.formModel.entityName,
            'C1',
            null,
            'EContractsBusiness'
          )
          .subscribe();
        this.dialogEditStatus && this.dialogEditStatus.close(res);
      }
    });
  }

  changeDataMf(event, data) {
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

  changeDataMFBefore(e: any, data: any, fc: any) {
    if (fc.runMode == '1') {
      this.runModeCheck = true;
      this.codxShareService.changeMFApproval(e, data?.unbounds);
    }
    //  else {
    //   this.hrService.handleShowHideMF(event, data, this.view.formModel);
    // }
  }

  //Call api delete
  beforeDelete(opt: RequestOption, data) {
    opt.methodName = 'DeleteEContractAsync';
    opt.className = 'EContractsBusiness';
    opt.assemblyName = 'HR';
    opt.service = 'HR';
    opt.data = data;
    return true;
  }

  clickMF(event, data) {
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
      case this.actionCheckResignApprove:
      case this.actionCheckResignCancel:
        let oUpdate = JSON.parse(JSON.stringify(data));
        this.popupUpdateEContractStatus(event.functionID, oUpdate);
        break;
      case this.actionAddNew: // de xuat hop dong tiep theo
        this.currentEmpObj = data.inforEmployee;
        this.HandleEContractInfo(event.text.substr(0, 7), 'add', data);
        break;
      case 'SYS03':
        this.currentEmpObj = data.inforEmployee;
        this.HandleEContractInfo(event.text, 'edit', data);
        this.df.detectChanges();
        break;
      case 'SYS02': //delete
        this.view.dataService
          .delete([data], true, (option: RequestOption) =>
            this.beforeDelete(option, data)
          )
          .subscribe((res) => {
            if (res[1]) {
              res[1].inforEmployee = data?.inforEmployee;
              this.view.dataService.update(res[1]).subscribe();
            }
          });
        break;
      case 'SYS04': //copy
        this.currentEmpObj = data.inforEmployee;
        this.copyValue(event.text, data, 'eContract');
        this.df.detectChanges();
        break;
      case 'HRTPro01A20': // in hợp đồng
        this.printContract(event, data.recID);
        break;
      case this.actionAddAppendix:
        this.currentEmpObj = data.inforEmployee;
        this.handleSubContract(event.text, 'add');
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
        this.df.detectChanges();
        break;
      }
      //Send email
      // case 'SYS004': {
      //   this.dialog = this.callfunc.openForm(CodxEmailComponent, '', 900, 800);
      //   this.dialog.closed.subscribe((x) => {
      //     if (x.event != null) {
      //       this.itemDetail = x.event[0];
      //       this.itemDetail.lstUserID = getListImg(x.event[0].relations);
      //       this.itemDetail.listInformationRel = x.event[1];
      //     }
      //   });
      //   break;
      // }
    }
  }

  printContract(moreFC: any, objectID: string) {
    let parameters = {
      recID: objectID,
    };
    let dialogModel = new DialogModel();
    dialogModel.FormModel = this.view.formModel;
    dialogModel.DataService = this.view.dataService;
    let data = {
      headerText: moreFC.text,
      reportID: moreFC.functionID,
      parameters: parameters,
    };
    this.callfc.openForm(
      CodxListReportsComponent,
      moreFC.defaultName,
      0,
      0,
      moreFC.functionID,
      data,
      '',
      dialogModel
    );
  }

  handleSubContract(headerText, actionType) {
    let popupSubContract = this.callfunc.openForm(
      PopupSubEContractComponent,
      '',
      550,
      1000,
      '',
      {
        employeeId: this.itemDetail.employeeID,
        contractNo: this.itemDetail.contractNo,
        actionType: actionType,
        dataObj: this.itemDetail,
        headerText: headerText,
      }
    );
    popupSubContract.closed.subscribe((res) => {
      if (res.event) {
        res.event[0].inforEmployee = this.currentEmpObj;
        this.view.dataService.add(res.event[0], 0).subscribe();
      }
    });
  }

  HandleEContractInfo(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '800px';
    let dialogAdd = this.callfc.openSide(
      PopupEProcessContractComponent,
      {
        actionType: actionType,
        dataObj: data,
        empObj: this.currentEmpObj,
        headerText: actionHeaderText,
        employeeId: data?.employeeID || this.currentEmpObj?.employeeID,
        funcID: this.view.funcID,
        openFrom: 'empContractProcess',
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        if (actionType == 'add') {
          this.currentEmpObj = res.event.inforEmployee;
          this.view.dataService.add(res.event, 0).subscribe();
          // this.view.dataService.update(res.event[1]).subscribe();
        } else if (actionType == 'copy') {
          this.view.dataService.add(res.event, 0).subscribe();
        } else if (actionType == 'edit') {
          this.view.dataService.update(res.event).subscribe();
          // this.view.dataService.update(res.event[1]).subscribe();
        }
        this.df.detectChanges();
      }
    });
  }

  copyValue(actionHeaderText, data, flag) {
    this.hrService.copy(data, this.view.formModel, 'RecID').subscribe((res) => {
      if (flag == 'eContract') {
        this.HandleEContractInfo(actionHeaderText, 'copy', res);
      }
    });
  }

  addContract(evt) {
    if (evt.id == 'btnAdd') {
      this.HandleEContractInfo(evt.text, 'add', null);
    }
  }

  getIdUser(createdBy: any, owner: any) {
    var arr = [];
    if (createdBy) arr.push(createdBy);
    if (owner && createdBy != owner) arr.push(owner);
    return arr.join(';');
  }

  viewChanged(event: any) {
    this.viewActive = event?.view?.id;
  }

  changeItemDetail(event) {
    this.currentEmpObj = event?.data?.inforEmployee;
    if (this.viewActive !== '1') {
      this.itemDetail = event?.data;
    }
  }

  beforeRelease() {
    //Validate backend send approval
    this.hrService
      .validateBeforeReleaseContract(this.itemDetail.recID)
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
                  let eContractsObj = parsedJSON[index];
                  if (eContractsObj['ApprovalRule'] == '1') {
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
          this.dataCategory = res;
          this.codxShareService.codxReleaseDynamic(
            'HR',
            this.itemDetail,
            this.dataCategory,
            this.view.formModel.entityName,
            this.view.formModel.funcID,
            this.view.function.description + ' - ' + this.itemDetail.contractNo,
            (res: any) => {
              if (res?.msgCodeError == null && res?.rowCount) {
                //this.notify.notifyCode('ES007');
                this.itemDetail.status = '3';
                this.itemDetail.approveStatus = '3';
                this.hrService
                  .editEContract(this.itemDetail)
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
          // this.codxShareService
          //   .codxRelease(
          //     'HR',
          //     this.itemDetail.recID,
          //     this.dataCategory.processID,
          //     this.view.formModel.entityName,
          //     this.view.formModel.funcID,
          //     '',
          //     this.view.function.description +
          //       ' - ' +
          //       this.itemDetail.contractNo,
          //     ''
          //   )
          //   .subscribe((result) => {
          //     if (result?.msgCodeError == null && result?.rowCount) {
          //       this.notify.notifyCode('ES007');
          //       this.itemDetail.status = '3';
          //       this.itemDetail.approveStatus = '3';
          //       this.hrService
          //         .editEContract(this.itemDetail, false)
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

  handleMutipleUpdateStatus(funcID, data) {
    this.datasUpdated = [];
    if (
      funcID === this.actionCheckResignCancel ||
      funcID === this.actionCheckResignApprove
    ) {
      this.resignStatus = true;
    } else {
      this.resignStatus = false;
    }
    this.hrService.handleUpdateRecordStatus(funcID, data);

    this.hrService.editEContract(data).subscribe((res) => {
      this.datasUpdated.push(res[0]);
      if (res != null) {
        res[0].inforEmployee = data?.inforEmployee;
        this.view.dataService.update(res[0]).subscribe();

        if (res[1]) {
          res[1].inforEmployee = data?.inforEmployee;
          this.view.dataService.update(res[1]).subscribe();
        }
        this.view.formModel.entityName;
        this.hrService
          .addBGTrackLog(
            res[0].recID,
            this.cmtStatus,
            this.view.formModel.entityName,
            'C1',
            null,
            'EContractsBusiness'
          )
          .subscribe();

        //Gọi hàm hủy yêu cầu duyệt bên core
        if (
          funcID === this.actionUpdateCanceled ||
          funcID === this.actionCancelSubmit
        ) {
          this.codxShareService
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
      case this.actionCheckResignApprove:
      case this.actionCheckResignCancel:
        await Promise.all([
          ...dataSelected.map((res) =>
            this.handleMutipleUpdateStatus(funcID, res)
          ),
        ]);
    }

    console.log(this.datasUpdated);
  }

  viewDetail(data) {
    this.HandleEContractInfo('Xem chi tiết', 'view', data);
  }
}
