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
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxHrService } from '../codx-hr.service';
import { PopupEDisciplinesComponent } from '../employee-profile/popup-edisciplines/popup-edisciplines.component';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';
import { CodxOdService } from 'projects/codx-od/src/public-api';

@Component({
  selector: 'lib-employee-discipline',
  templateUrl: './employee-discipline.component.html',
  styleUrls: ['./employee-discipline.component.css'],
})
export class EmployeeDisciplineComponent extends UIComponent {
  console = console;
  @ViewChild('templateList') itemTemplate?: TemplateRef<any>;
  @ViewChild('templateListDetail') itemTemplateListDetail?: TemplateRef<any>;
  @ViewChild('panelRightListDetail') panelRightListDetail?: TemplateRef<any>;
  @ViewChild('headerTemplate') headerTemplate?: TemplateRef<any>;
  @ViewChild('eInfoTemplate') eInfoTemplate?: TemplateRef<any>;
  @ViewChild('templateUpdateStatus') templateUpdateStatus: TemplateRef<any>;
  views: Array<ViewModel> = [];
  editStatusObj: any;
  dataCategory;
  eDisciplineHeaderText;
  method = 'LoadDataEDisciplineWithEmployeeInfoAsync';
  itemDetail;
  buttonAdd: ButtonModel = {
    id: 'btnAdd',
  };
  formGroup: FormGroup;
  cmtStatus: string = '';
  currentEmpObj: any = null;
  dialogEditStatus: any;
  grvSetup: any;
  runModeCheck: boolean = false;
  flagChangeMF: boolean = false;
  viewActive: string;

  //#region eDisciplineFuncID
  actionCancelSubmit = 'HRTPro07A00';
  actionAddNew = 'HRTPro07A01';
  actionSubmit = 'HRTPro07A03';
  actionUpdateCanceled = 'HRTPro07AU0';
  actionUpdateInProgress = 'HRTPro07AU3';
  actionUpdateRejected = 'HRTPro07AU4';
  actionUpdateApproved = 'HRTPro07AU5';
  actionUpdateClosed = 'HRTPro07AU9';
  //#endregion

  constructor(
    inject: Injector,
    private hrService: CodxHrService,
    private activedRouter: ActivatedRoute,
    private codxShareService: CodxShareService,
    private df: ChangeDetectorRef,
    private notify: NotificationsService,
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

  clickEvent(event) {
    this.clickMF(event?.event, event?.data);
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
    this.hrService.getHeaderText(this.view?.formModel?.funcID).then((res) => {
      this.eDisciplineHeaderText = res;
    });
  }

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

  changeDataMFBefore(e: any, data: any, fc: any) {
    if (fc.runMode == '1') {
      this.runModeCheck = true;
      this.codxShareService.changeMFApproval(e, data?.unbounds);
    }
  }

  ValueChangeComment(evt) {
    this.cmtStatus = evt.data;
  }

  close2(dialog: DialogRef) {
    dialog.close();
  }

  onSaveUpdateForm() {
    this.hrService
      .UpdateEmployeeDisciplineInfo(this.editStatusObj)
      .subscribe((res) => {
        if (res != null) {
          this.notify.notifyCode('SYS007');
          res.emp = this.currentEmpObj;
          this.view.formModel.entityName;
          this.hrService
            .addBGTrackLog(
              res.recID,
              this.cmtStatus,
              this.view.formModel.entityName,
              'C1',
              null,
              'EDisciplinesBusiness'
            )
            .subscribe();
          this.dialogEditStatus && this.dialogEditStatus.close(res);
        }
      });
  }

  HandleEDisciplineInfo(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.Width = '550px';
    option.FormModel = this.view.formModel;
    let dialogAdd = this.callfc.openSide(
      PopupEDisciplinesComponent,
      {
        actionType: actionType,
        dataInput: data,
        empObj: this.currentEmpObj,
        headerText: actionHeaderText,
        employeeId: data?.employeeID || this.currentEmpObj?.employeeID,
        funcID: this.view.funcID,
        openFrom: 'empDisciplinesProcess',
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

  addDiscipline(evt) {
    this.currentEmpObj = this.itemDetail?.emp;
    if (evt.id == 'btnAdd') {
      this.HandleEDisciplineInfo(
        evt.text + ' ' + this.view.function.description,
        'add',
        null
      );
    }
  }

  popupUpdateEDisciplineStatus(funcID, data) {
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
        this.view.dataService.update(res.event).subscribe((res) => {});

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
        this.popupUpdateEDisciplineStatus(event.functionID, oUpdate);
        break;
      case this.actionAddNew:
        this.currentEmpObj = this.itemDetail.emp;
        this.HandleEDisciplineInfo(
          event.text + ' ' + this.view.function.description,
          'add',
          data
        );
        break;

      case 'SYS03':
        this.currentEmpObj = data.emp;
        this.HandleEDisciplineInfo(
          event.text + ' ' + this.view.function.description,
          'edit',
          data
        );
        this.df.detectChanges();
        break;
      case 'SYS02': //delete
        this.view.dataService.delete([data]).subscribe();
        break;
      case 'SYS04': //copy
        this.currentEmpObj = data.emp;
        this.copyValue(event.text, data, 'eDiscipline');
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
        // this.df.detectChanges();
        break;
      }
    }
  }

  beforeRelease() {
    this.hrService
      .validateBeforeReleaseDiscipline(this.itemDetail.recID)
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
    //       let eDisciplinessObj = parsedJSON[index];
    //       if (eDisciplinessObj['ApprovalRule'] == '1') {
    //         this.release();
    //       }
    //     }
    //   }
    // });
  }

  viewChanged(event: any) {
    this.viewActive = event?.view?.id;
  }

  changeItemDetail(event) {
    if (this.viewActive !== '1') {
      this.itemDetail = event?.data;
    }
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
            this.view.function.description + ' - ' + this.itemDetail.decisionNo,
            (res: any) => {
              if (res?.msgCodeError == null && res?.rowCount) {
                this.notify.notifyCode('ES007');
                this.itemDetail.status = '3';
                this.itemDetail.approveStatus = '3';
                this.hrService
                  .UpdateEmployeeDisciplineInfo(this.itemDetail)
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
          //     'Kỷ luật - ' + this.itemDetail.decisionNo,
          //     ''
          //   )
          //   .subscribe((result) => {
          //     console.log('ok', result);
          //     if (result?.msgCodeError == null && result?.rowCount) {
          //       this.notify.notifyCode('ES007');
          //       this.itemDetail.status = '3';
          //       this.itemDetail.approveStatus = '3';
          //       this.hrService
          //         .UpdateEmployeeDisciplineInfo(this.itemDetail)
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

  copyValue(actionHeaderText, data, flag) {
    this.hrService.copy(data, this.view.formModel, 'RecID').subscribe((res) => {
      if (flag == 'eDiscipline') {
        this.HandleEDisciplineInfo(
          actionHeaderText + ' ' + this.view.function.description,
          'copy',
          res
        );
      }
    });
  }
}
