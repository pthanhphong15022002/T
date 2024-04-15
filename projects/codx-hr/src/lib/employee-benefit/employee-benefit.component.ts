import {
  ChangeDetectorRef,
  Component,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { isObservable } from 'rxjs';
import {
  ButtonModel,
  DialogRef,
  NotificationsService,
  RequestOption,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxHrService } from 'projects/codx-hr/src/public-api';
//import { PopupEmployeeBenefitComponent } from './popup-employee-benefit/popup-employee-benefit.component';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';
import { CodxOdService } from 'projects/codx-od/src/public-api';
import moment from 'moment';
import { PopupEbenefitComponent } from '../employee-profile/popup-ebenefit/popup-ebenefit.component';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';

@Component({
  selector: 'lib-employee-benefit',
  templateUrl: './employee-benefit.component.html',
  styleUrls: ['./employee-benefit.component.css'],
})
export class EmployeeBenefitComponent extends UIComponent {
  console = console;
  @ViewChild('templateList') itemTemplate?: TemplateRef<any>;
  @ViewChild('headerTemplate') headerTemplate?: TemplateRef<any>;

  //Detail
  @ViewChild('templateListDetail') templateListDetail?: TemplateRef<any>;
  @ViewChild('panelRightListDetail') panelRightListDetail?: TemplateRef<any>;
  itemDetail;

  //Get data
  views: Array<ViewModel> = [];
  method = 'GetEBenefitListAsync';
  grvSetup: any;
  buttonAdd: ButtonModel[] = [{
    id: 'btnAdd',
  }];
  formGroup: FormGroup;

  //Object data
  currentEmpObj: any = null;
  runModeCheck: boolean = false;
  flagChangeMF: boolean = false;
  viewActive: string;

  //More function
  @ViewChild('templateUpdateStatus', { static: true })
  templateUpdateStatus: TemplateRef<any>;
  editStatusObj: any;
  dialogEditStatus: any;
  dataCategory;
  cmtStatus: string = '';
  // genderGrvSetup: any;
  moment = moment;
  dateNow = moment().format('YYYY-MM-DD');

  //#region Update modal Status
  actionCancelSubmit = 'HRTPro05A00';
  actionSubmit = 'HRTPro05A03';
  actionAddNew = 'HRTPro05A01';
  actionUpdateCanceled = 'HRTPro05AU0';
  actionUpdateInProgress = 'HRTPro05AU3';
  // actionUpdateRejected = 'HRTPro05AU4';
  actionUpdateApproved = 'HRTPro05AU5';
  actionUpdateClosed = 'HRTPro05AU9';
  //#endregion

  constructor(
    inject: Injector,
    private hrService: CodxHrService,
    private activedRouter: ActivatedRoute,
    private codxShareService: CodxShareService,
    private df: ChangeDetectorRef,
    private notify: NotificationsService,
    private codxCommonService: CodxCommonService,
    private codxODService: CodxOdService
  ) {
    super(inject);
  }

  GetGvSetup() {
    let funID = this.activedRouter.snapshot.params['funcID'];
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
          template: this.templateListDetail,
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
          this.view?.formModel?.gridViewName,
          this.view?.formModel
        )
        .then((res) => {
          this.formGroup = res;
        });
    }
  }

  //Call api delete
  beforeDelete(opt: RequestOption, data) {
    opt.methodName = 'DeleteEBenefitAsync';
    opt.className = 'EBenefitsBusiness_Old';
    opt.assemblyName = 'HR';
    opt.service = 'HR';
    opt.data = data;
    return true;
  }

  onSaveUpdateForm() {
    this.hrService.EditEBenefit(this.editStatusObj).subscribe((res) => {
      console.log(res);
      if (res != null) {
        this.notify.notifyCode('SYS007');
        res[0].emp = this.currentEmpObj;
        if (res[1]) {
          res[1].emp = this.currentEmpObj;
        }
        this.view.formModel.entityName;
        this.hrService
          .addBGTrackLog(
            res[0].recID,
            this.cmtStatus,
            this.view.formModel.entityName,
            'C1',
            null,
            'EBenefitsBusiness_Old'
          )
          .subscribe((res) => {
            //console.log('kq luu track log', res);
          });
        this.dialogEditStatus && this.dialogEditStatus.close(res);
      }
    });
  }

  ValueChangeComment(evt) {
    this.cmtStatus = evt.data;
  }

  close2(dialog: DialogRef) {
    dialog.close();
  }

  popupUpdateEbenefitStatus(funcID, data) {
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
        this.view.dataService.update(res.event[0]).subscribe();
        if (res.event[1]) {
          this.view.dataService.update(res.event[1]).subscribe();
        }

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

  //More function send approved
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
              this.itemDetail.decisionNo +
              ' - ' +
              this.itemDetail.employeeID,
            (res: any) => {
              if (res?.msgCodeError == null && res?.rowCount) {
                this.notify.notifyCode('ES007');
                this.itemDetail.status = '3';
                this.itemDetail.approveStatus = '3';
                this.hrService
                  .EditEBenefit(this.itemDetail)
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
          //     this.processID.processID,
          //     this.view.formModel.entityName,
          //     this.view.formModel.funcID,
          //     '',
          //     'Phụ cấp - ' + this.itemDetail.decisionNo,
          //     ''
          //   )
          //   .subscribe((result) => {
          //     if (result?.msgCodeError == null && result?.rowCount) {
          //       this.notify.notifyCode('ES007');
          //       this.itemDetail.status = '3';
          //       this.itemDetail.approveStatus = '3';
          //       this.hrService
          //         .EditEmployeeBenefitMoreFunc(this.itemDetail, false)
          //         .subscribe((res) => {
          //           console.log('Result after send edit' + res);
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

  beforeRelease() {
    this.hrService
      .validateBeforeReleaseBenefit(this.itemDetail.recID)
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
    //       let eJobSalaryObj = parsedJSON[index];
    //       if (eJobSalaryObj['ApprovalRule'] == '1') {
    //         this.release();
    //       } else {
    //       }
    //     }
    //   }
    // });
  }

  //#endregion

  clickMF(event, data): void {
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
        this.popupUpdateEbenefitStatus(event.functionID, oUpdate);
        break;
      //Propose increase benefit
      case this.actionAddNew:
        this.HandleEBenefit(event.text, 'add', data);
        break;
      //Delete
      case 'SYS02':
        if (data) {
          this.view.dataService.dataSelected = data;
        }
        this.view.dataService
          .delete([data], true, (option: RequestOption) =>
            this.beforeDelete(option, data)
          )
          .subscribe(() => {});
        break;
      //Edit
      case 'SYS03':
        this.currentEmpObj = data;
        this.HandleEBenefit(
          event.text + ' ' + this.view.function.description,
          'edit',
          this.currentEmpObj
        );
        this.df.detectChanges();
        break;
      //Copy
      case 'SYS04':
        this.currentEmpObj = data;
        this.copyValue(event.text, this.currentEmpObj);
        this.df.detectChanges();
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
    }
  }

  copyValue(actionHeaderText, data) {
    this.hrService.copy(data, this.view.formModel, 'RecID').subscribe((res) => {
      this.HandleEBenefit(
        actionHeaderText + ' ' + this.view.function.description,
        'copy',
        res
      );
    });
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

  changeDataMFBefore(e: any, data: any, fc: any) {
    if (fc.runMode == '1') {
      this.runModeCheck = true;
      this.codxShareService.changeMFApproval(e, data?.unbounds);
    }
    //  else {
    //   this.hrService.handleShowHideMF(event, data, this.view.formModel);
    // }
  }

  // changeDataMF(event, data): void {
  //   this.hrService.handleShowHideMF(event, data, this.view);
  // }

  //Open, push data to modal add, update
  HandleEBenefit(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.Width = '550px';
    option.FormModel = this.view.formModel;
    let dialogAdd = this.callfc.openSide(
      PopupEbenefitComponent,
      {
        actionType: actionType,
        benefitObj: data,
        empObj: this.currentEmpObj,
        headerText: actionHeaderText,
        formModel: this.view.formModel,
        employeeId: data?.employeeID || this.currentEmpObj?.employeeID,
        funcID: this.view.funcID,
        useForQTNS: true,
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
      if (res?.event) this.view.dataService.clear();
    });
  }

  addBenefit(event): void {
    this.currentEmpObj = this.itemDetail?.emp;
    if (event.id == 'btnAdd') {
      this.HandleEBenefit(
        event.text + ' ' + this.view.function.description,
        'add',
        null
      );
    }
  }

  //#region Handle detail data
  getDetailESalary(event, data) {
    if (data) {
      this.itemDetail = data;

      this.df.detectChanges();
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
      this.codxShareService.changeMFApproval(e, data?.unbounds);
    }
  }

  //#endregion

  handleMutipleUpdateStatus(funcID, data) {
    this.hrService.handleUpdateRecordStatus(funcID, data);

    this.hrService.EditEBenefit(data).subscribe((res) => {
      if (res != null) {
        res[0].emp = this.currentEmpObj;
        this.view.dataService.update(res[0]).subscribe();

        if (res[1]) {
          res[1].emp = this.currentEmpObj;
          this.view.dataService.update(res[1]).subscribe();
        }

        this.hrService
          .addBGTrackLog(
            res[0].recID,
            this.cmtStatus,
            this.view.formModel.entityName,
            'C1',
            null,
            'EBenefitsBusiness_Old'
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
