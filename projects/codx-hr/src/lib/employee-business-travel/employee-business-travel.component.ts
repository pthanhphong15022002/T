import {
  Component,
  Injector,
  ChangeDetectorRef,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';
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
import { CodxHrService } from '../codx-hr.service';
//import { PopupEmployeeBusinessComponent } from './popup-employee-business/popup-employee-business.component';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';
import { CodxOdService } from 'projects/codx-od/src/public-api';
import { isObservable } from 'rxjs';
import { PopupEmpBusinessTravelsComponent } from '../employee-profile/popup-emp-business-travels/popup-emp-business-travels.component';

@Component({
  selector: 'lib-employee-business-travel',
  templateUrl: './employee-business-travel.component.html',
  styleUrls: ['./employee-business-travel.component.css'],
})
export class EmployeeBusinessTravelComponent extends UIComponent {
  console = console;
  //#region view
  @ViewChild('templateList') templateList?: TemplateRef<any>;
  @ViewChild('headerTemplate') headerTemplate?: TemplateRef<any>;

  //Detail
  @ViewChild('templateListDetail') templateListDetail?: TemplateRef<any>;
  @ViewChild('panelRightListDetail') panelRightListDetail?: TemplateRef<any>;
  itemDetail;

  views: Array<ViewModel> = [];
  funcID: string;
  method = 'LoadDataEBTravelsAsync';
  buttonAdd: ButtonModel = {
    id: 'btnAdd',
  };
  currentEmpObj: any = null;
  grvSetup: any;

  //More function
  @ViewChild('templateUpdateStatus', { static: true })
  templateUpdateStatus: TemplateRef<any>;
  editStatusObj: any;
  formGroup: FormGroup;
  dialogEditStatus: any;
  processID;
  cmtStatus: string = '';
  viewActive: string;
  genderGrvSetup: any;
  runModeCheck: boolean = false;
  flagChangeMF: boolean = false;

  //#region eBusinessTravelFuncID
  actionCancelSubmit = 'HRTPro10A00';
  actionAddNew = 'HRTPro10A01';
  actionSubmit = 'HRTPro10A03';
  actionUpdateCanceled = 'HRTPro10AU0';
  actionUpdateInProgress = 'HRTPro10AU3';
  actionUpdateRejected = 'HRTPro10AU4';
  actionUpdateApproved = 'HRTPro10AU5';
  actionUpdateClosed = 'HRTPro10AU9';

  constructor(
    inject: Injector,
    private hrService: CodxHrService,
    private activatedRoute: ActivatedRoute,
    private codxShareService: CodxShareService,
    private df: ChangeDetectorRef,
    private notify: NotificationsService,
    private codxODService: CodxOdService
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
          panelRightRef: this.panelRightListDetail,
        },
      },
    ];
  }

  //Open, push data to modal
  HandleEBusinessTravel(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.Width = '550px';
    option.FormModel = this.view.formModel;

    let dialogAdd = this.callfc.openSide(
      PopupEmpBusinessTravelsComponent,
      {
        funcID: this.view.funcID,
        employeeId: data?.employeeID || this.currentEmpObj?.employeeID,
        headerText: actionHeaderText,
        empObj: this.currentEmpObj,
        actionType: actionType,
        businessTravelObj: data,
        useForQTNS: true,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        if (actionType == 'add') {
          console.log(res.event);
          this.view.dataService.add(res.event, 0).subscribe((res) => {});
        } else if (actionType == 'copy') {
          this.view.dataService.add(res.event, 0).subscribe((res) => {});
        } else if (actionType == 'edit') {
          this.view.dataService.update(res.event).subscribe((res) => {});
        }
        this.df.detectChanges();
      }
    });
  }

  addBusinessTravel(event): void {
    this.currentEmpObj = this.itemDetail?.emp;
    if (event.id == 'btnAdd') {
      this.HandleEBusinessTravel(
        event.text + ' ' + this.view.function.description,
        'add',
        null
      );
    }
  }

  //Call api delete
  beforeDelete(opt: RequestOption, data) {
    opt.methodName = 'DeleteEBusinessTravelsAsync';
    opt.className = 'EBusinessTravelsBusiness';
    opt.assemblyName = 'HR';
    opt.service = 'HR';
    opt.data = data;
    return true;
  }

  //#region more functions

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

  onSaveUpdateForm() {
    this.hrService
      .EditEBusinessTravelMoreFunc(this.editStatusObj)
      .subscribe((res) => {
        if (res != null) {
          this.notify.notifyCode('SYS007');
          res[0].emp = this.currentEmpObj;
          this.view.formModel.entityName;
          this.hrService
            .addBGTrackLog(
              res[0].recID,
              this.cmtStatus,
              this.view.formModel.entityName,
              'C1',
              null,
              'EBusinessTravelsBusiness'
            )
            .subscribe((res) => {
              console.log('kq luu track log', res);
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

  popupUpdateEBusinessTravelStatus(funcID, data) {
    this.hrService.handleUpdateRecordStatus(funcID, data);

    this.editStatusObj = data;
    this.currentEmpObj = data.emp;
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
          this.processID = res;
          this.codxShareService.codxReleaseDynamic(
            'HR',
            this.itemDetail,
            this.processID,
            this.view.formModel.entityName,
            this.view.formModel.funcID,
            this.view.function.description + ' - ' + this.itemDetail.decisionNo,
            (res: any) => {
              if (res?.msgCodeError == null && res?.rowCount) {
                this.notify.notifyCode('ES007');
                this.itemDetail.status = '3';
                this.itemDetail.approveStatus = '3';
                this.hrService
                  .EditEBusinessTravelMoreFunc(this.itemDetail)
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
          //         .EditEBusinessTravelMoreFunc(this.itemDetail)
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

  beforeRelease() {
    this.hrService
      .validateBeforeReleaseBusiness(this.itemDetail.recID)
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
        this.popupUpdateEBusinessTravelStatus(event.functionID, oUpdate);
        break;
      //Propose increase business
      case this.actionAddNew:
        this.HandleEBusinessTravel(event.text, 'add', data);
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
        // this.df.detectChanges();
        break;
      //Edit
      case 'SYS03':
        this.currentEmpObj = data;
        this.HandleEBusinessTravel(
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
      this.HandleEBusinessTravel(
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

  //#endregion
}
