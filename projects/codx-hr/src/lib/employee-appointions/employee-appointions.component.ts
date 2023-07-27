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
import { PopupEappointionsComponent } from '../employee-profile/popup-eappointions/popup-eappointions.component';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';
import { CodxOdService } from 'projects/codx-od/src/public-api';
import { isObservable } from 'rxjs';

@Component({
  selector: 'lib-employee-appointions',
  templateUrl: './employee-appointions.component.html',
  styleUrls: ['./employee-appointions.component.css'],
})
export class EmployeeAppointionsComponent extends UIComponent {
  console = console;
  //#region view
  @ViewChild('templateList') templateList?: TemplateRef<any>;
  @ViewChild('headerTemplate') headerTemplate?: TemplateRef<any>;

  //Detail
  @ViewChild('templateListDetail') templateListDetail?: TemplateRef<any>;
  @ViewChild('panelRightListDetail') panelRightListDetail?: TemplateRef<any>;
  itemDetail;
  //#endregion

  views: Array<ViewModel> = [];
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
  genderGrvSetup: any;
  flagChangeMF: boolean = false;
  runModeCheck: boolean = false;
  viewActive: string;

  //#region more functions
  actionAddNew = 'HRTPro02A01';
  actionSubmit = 'HRTPro02A03';
  actionUpdateCanceled = 'HRTPro02AU0';
  actionUpdateInProgress = 'HRTPro02AU3';
  actionUpdateRejected = 'HRTPro02AU4';
  actionUpdateApproved = 'HRTPro02AU5';
  actionUpdateClosed = 'HRTPro02AU9';

  constructor(
    inject: Injector,
    private hrService: CodxHrService,
    private df: ChangeDetectorRef,
    private notify: NotificationsService,
    private activatedRoute: ActivatedRoute,
    private codxShareService: CodxShareService,
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
  HandleEAppoint(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.Width = '550px';
    option.FormModel = this.view.formModel;
    let dialogAdd = this.callfc.openSide(
      PopupEappointionsComponent,
      {
        actionType: actionType,
        employeeId: data?.employeeID || this.currentEmpObj.employeeID,
        funcID: this.view.funcID,
        appointionObj: data,
        headerText: actionHeaderText,
        empObj: this.currentEmpObj,
        isUseEmployee: true,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        if (actionType == 'add') {
          this.view.dataService.add(res.event).subscribe();
        } else if (actionType == 'copy') {
          this.view.dataService.add(res.event).subscribe();
        } else if (actionType == 'edit') {
          this.view.dataService.update(res.event).subscribe();
        }
        this.df.detectChanges();
      }
    });
  }

  AddAppoint(event): void {
    this.currentEmpObj = this.itemDetail.emp;
    if (event.id == 'btnAdd') {
      this.HandleEAppoint(
        event.text + ' ' + this.view.function.description,
        'add',
        null
      );
    }
  }

  //Call api delete
  beforeDelete(opt: RequestOption, data) {
    opt.methodName = 'DeleteEmployeeAppointionsInfoAsync';
    opt.className = 'EAppointionsBusiness';
    opt.assemblyName = 'HR';
    opt.service = 'HR';
    opt.data = data;
    return true;
  }

  //#region more functions

  onSaveUpdateForm() {
    this.hrService
      .EditEmployeeAppointionsMoreFunc(this.editStatusObj)
      .subscribe((res) => {
        if (res != null) {
          this.notify.notifyCode('SYS007');
          let data = {
            ...res[0],
            emp: this.currentEmpObj,
          };
          this.hrService
            .addBGTrackLog(
              res[0].recID,
              this.cmtStatus,
              this.view.formModel.entityName,
              'C1',
              null,
              'EAppointionsBusiness'
            )
            .subscribe();
          this.dialogEditStatus && this.dialogEditStatus.close(data);
        }
      });
  }

  ValueChangeComment(evt) {
    this.cmtStatus = evt.data;
  }

  CloseStatus(dialog: DialogRef) {
    dialog.close();
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

  PopupUpdateEAppointStatus(funcID, data) {
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
        this.view.dataService.update(res.event).subscribe();
        //Render new data when update new status on view detail
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
          this.codxShareService.codxReleaseDynamic(
            'HR',
            this.itemDetail,
            res,
            this.view.formModel.entityName,
            this.view.formModel.funcID,
            this.view.function.description + ' - ' + this.itemDetail.decisionNo,
            (res: any) => {
              if (res?.msgCodeError == null && res?.rowCount) {
                this.notify.notifyCode('ES007');
                this.itemDetail.status = '3';
                this.itemDetail.approveStatus = '3';
                this.hrService
                  .EditEmployeeAppointionsMoreFunc(this.itemDetail)
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
          //         .EditEmployeeAppointionsMoreFunc(this.itemDetail)
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
    let category = '4';
    let formName = 'HRParameters';
    this.hrService.getSettingValue(formName, category).subscribe((res) => {
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

  clickMF(event, data): void {
    this.itemDetail = data;
    switch (event.functionID) {
      case this.actionSubmit:
        this.beforeRelease();
        break;
      case this.actionUpdateCanceled:
      case this.actionUpdateInProgress:
      case this.actionUpdateRejected:
      case this.actionUpdateApproved:
      case this.actionUpdateClosed:
        let oUpdate = JSON.parse(JSON.stringify(data));
        this.PopupUpdateEAppointStatus(event.functionID, oUpdate);
        break;
      //Propose increase salaries
      case this.actionAddNew:
        this.HandleEAppoint(
          event.text + ' ' + this.view.function.description,
          'add',
          data
        );
        break;
      //Delete
      case 'SYS02':
        if (data) {
          this.view.dataService.dataSelected = data;
        }
        this.view.dataService
          .delete([data], true, (option: RequestOption) =>
            this.beforeDelete(option, data.recID)
          )
          .subscribe(() => {});
        // this.df.detectChanges();
        break;
      //Edit
      case 'SYS03':
        this.currentEmpObj = data;
        this.HandleEAppoint(
          event.text + ' ' + this.view.function.description,
          'edit',
          this.currentEmpObj
        );
        this.df.detectChanges();
        break;
      //Copy
      case 'SYS04':
        this.currentEmpObj = data;
        this.CopyValue(event.text, this.currentEmpObj);
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
        //this.df.detectChanges();
        //this.view.dataService.load();
        break;
      }
    }
  }

  CopyValue(actionHeaderText, data) {
    this.hrService.copy(data, this.view.formModel, 'RecID').subscribe((res) => {
      this.HandleEAppoint(
        actionHeaderText + ' ' + this.view.function.description,
        'copy',
        res
      );
    });
  }
  ChangeDataMF(event, data) {
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

  //#endregion

  //#region Handle detail data
  viewChanged(event: any) {
    this.viewActive = event?.view?.id;
  }

  ChangeItemDetail(event) {
    if (this.viewActive !== '1') {
      this.itemDetail = event?.data;
    }
  }

  ClickEvent(event) {
    this.clickMF(event?.event, event?.data);
  }

  //#endregion
}
