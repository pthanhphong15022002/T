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
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxHrService } from '../codx-hr.service';
import { PopupEDisciplinesComponent } from '../employee-profile/popup-edisciplines/popup-edisciplines.component';

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
  funcID: string;
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

  //#region eDisciplineFuncID
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
    private df: ChangeDetectorRef,
    private notify: NotificationsService
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
        type: ViewType.list,
        active: true,
        sameData: true,
        model: {
          template: this.itemTemplate,
          headerTemplate: this.headerTemplate,
        },
      },
      {
        type: ViewType.listdetail,
        sameData: true,
        active: false,
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
    this.hrService.handleShowHideMF(event, data, this.view);
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
        employeeId: data?.employeeID || this.currentEmpObj.employeeID,
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
      if (res?.event) this.view.dataService.clear();
    });
  }

  addDiscipline(evt) {
    this.currentEmpObj = this.itemDetail.emp;
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
      850,
      550,
      null,
      null
    );
    this.dialogEditStatus.closed.subscribe((res) => {
      if (res?.event) {
        this.view.dataService.update(res.event).subscribe((res) => {});
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
      case this.actionUpdateCanceled:
      case this.actionUpdateInProgress:
      case this.actionUpdateRejected:
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
    }
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
          let eDisciplinessObj = parsedJSON[index];
          if (eDisciplinessObj['ApprovalRule'] == '1') {
            this.release();
          } else {
            //đợi BA mô tả
          }
        }
      }
    });
  }

  changeItemDetail(event) {
    this.itemDetail = event?.data;
  }

  release() {
    this.hrService
      .getCategoryByEntityName(this.view.formModel.entityName)
      .subscribe((res) => {
        if (res) {
          this.dataCategory = res;
          this.hrService
            .release(
              this.itemDetail.recID,
              this.dataCategory.processID,
              this.view.formModel.entityName,
              this.view.formModel.funcID,
              '<div> Kỷ luật - ' + this.itemDetail.decisionNo + '</div>'
            )
            .subscribe((result) => {
              console.log('ok', result);
              if (result?.msgCodeError == null && result?.rowCount) {
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
              } else this.notify.notifyCode(result?.msgCodeError);
            });
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
