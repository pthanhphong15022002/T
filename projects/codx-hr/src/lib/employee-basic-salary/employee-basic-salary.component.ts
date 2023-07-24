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
import { CodxHrService } from '../codx-hr.service';
import { PopupEBasicSalariesComponent } from '../employee-profile/popup-ebasic-salaries/popup-ebasic-salaries.component';
import { ViewBasicSalaryDetailComponent } from './view-basic-salary-detail/view-basic-salary-detail.component';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';
import { CodxOdService } from 'projects/codx-od/src/public-api';

@Component({
  selector: 'lib-employee-basic-salary',
  templateUrl: './employee-basic-salary.component.html',
  styleUrls: ['./employee-basic-salary.component.css'],
})
export class EmployeeBasicSalaryComponent extends UIComponent {
  //#region view
  @ViewChild('templateList') templateList?: TemplateRef<any>;
  @ViewChild('headerTemplate') headerTemplate?: TemplateRef<any>;

  @ViewChild('templateListDetail') templateListDetail?: TemplateRef<any>;
  @ViewChild('templateItemDetailRight')
  templateItemDetailRight?: TemplateRef<any>;

  @ViewChild('viewDetail') viewDetail: ViewBasicSalaryDetailComponent;

  @ViewChild('templateUpdateStatus', { static: true })
  templateUpdateStatus: TemplateRef<any>;
  //#endregion

  constructor(
    injector: Injector,
    private hrService: CodxHrService,
    private codxShareService: CodxShareService,
    private activatedRoute: ActivatedRoute,
    private df: ChangeDetectorRef,
    private notify: NotificationsService,
    private codxODService: CodxOdService
  ) {
    super(injector);
  }

  actionAddNew = 'HRTPro03A01';
  actionSubmit = 'HRTPro03A03';
  actionUpdateCanceled = 'HRTPro03AU0';
  actionUpdateInProgress = 'HRTPro03AU3';
  actionUpdateRejected = 'HRTPro03AU4';
  actionUpdateApproved = 'HRTPro03AU5';
  actionUpdateClosed = 'HRTPro03AU9';

  grvSetup: any;
  views: Array<ViewModel> = [];
  buttonAdd: ButtonModel = {
    id: 'btnAdd',
  };
  formGroup: FormGroup;
  currentEmpObj: any;
  editStatusObj: any;
  dialogEditStatus: DialogRef;
  cmtStatus: string = '';
  dataCategory;
  itemDetail;
  runModeCheck: boolean = false;
  flagChangeMF: boolean = false;
  viewActive: string;

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

  ngAfterViewInit() {
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
          this.view?.formModel?.gridViewName
        )
        .then((res) => {
          this.formGroup = res;
        });
    }
  }

  addBasicSalary(event) {
    if (event.id == 'btnAdd') {
      this.handlerEBasicSalaries(
        event.text + ' ' + this.view.function.description,
        'add',
        this.itemDetail
      );
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
        this.popupUpdateEBasicSalaryStatus(event.functionID, oUpdate);
        break;
      case this.actionAddNew:
        let newData = {
          emp: data?.emp,
          employeeID: data?.employeeID,
        };
        this.handlerEBasicSalaries(
          event.text + ' ' + this.view.function.description,
          'add',
          newData
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
        break;
      //Edit
      case 'SYS03':
        this.handlerEBasicSalaries(
          event.text + ' ' + this.view.function.description,
          'edit',
          data
        );
        this.df.detectChanges();
        break;
      //Copy
      case 'SYS04':
        this.copyValue(event.text, data);
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

  // changeDataMF(event, data): void {
  //   this.hrService.handleShowHideMF(event, data, this.view);
  // }

  popupUpdateEBasicSalaryStatus(funcID, data) {
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
        this.df.detectChanges();
      }
    });
  }
  handlerEBasicSalaries(
    actionHeaderText: string,
    actionType: string,
    data: any
  ) {
    let option = new SidebarModel();
    option.Width = '550px';
    option.FormModel = this.view.formModel;
    this.currentEmpObj = data?.emp;
    //open form
    let dialogAdd = this.callfc.openSide(
      PopupEBasicSalariesComponent,
      {
        //pass data
        actionType: actionType,
        headerText: actionHeaderText,
        funcID: this.view.funcID,
        salaryObj: data,
        fromListView: true,
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
  beforeDelete(opt: RequestOption, data) {
    opt.methodName = 'DeleteEmployeeBasicSalariesInfoAsync';
    opt.className = 'EBasicSalariesBusiness';
    opt.assemblyName = 'HR';
    opt.service = 'HR';
    opt.data = data;
    return true;
  }
  copyValue(actionHeaderText, data) {
    this.hrService.copy(data, this.view.formModel, 'RecID').subscribe((res) => {
      this.handlerEBasicSalaries(
        actionHeaderText + ' ' + this.view.function.description,
        'copy',
        res
      );
    });
  }

  getIdUser(createdBy: any, owner: any) {
    var arr = [];
    if (createdBy) arr.push(createdBy);
    if (owner && createdBy != owner) arr.push(owner);
    return arr.join(';');
  }

  valueChangeComment(event) {
    this.cmtStatus = event.data;
  }
  onSaveUpdateForm() {
    this.hrService
      .UpdateEmployeeBasicSalariesInfo(this.editStatusObj)
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
              'EBasicSalariesBusiness'
            )
            .subscribe();
          this.dialogEditStatus && this.dialogEditStatus.close(res);
        }
      });
  }

  closeUpdateStatusForm(dialog: DialogRef) {
    dialog.close();
  }

  clickEvent(event) {
    this.clickMF(event?.event, event?.data);
  }

  //#region gửi duyệt
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
          let eBasicSalaryObj = parsedJSON[index];
          if (eBasicSalaryObj['ApprovalRule'] == '1') {
            this.release();
          }
        }
      }
    });
  }
  release() {
    this.hrService
      .getCategoryByEntityName(this.view.formModel.entityName)
      .subscribe((res) => {
        if (res) {
          this.dataCategory = res;
          this.codxShareService
            .codxRelease(
              'HR',
              this.itemDetail.recID,
              this.dataCategory.processID,
              this.view.formModel.entityName,
              this.view.formModel.funcID,
              '',
              this.view.function.description +
                ' - ' +
                this.itemDetail.decisionNo,
              ''
            )
            .subscribe((result) => {
              if (result?.msgCodeError == null && result?.rowCount) {
                this.notify.notifyCode('ES007');
                this.itemDetail.status = '3';
                this.itemDetail.approveStatus = '3';
                this.hrService
                  .UpdateEmployeeBasicSalariesInfo(this.itemDetail)
                  .subscribe((res) => {
                    if (res) {
                      this.view?.dataService
                        ?.update(this.itemDetail)
                        .subscribe();
                    }
                  });
              } else {
                this.notify.notifyCode(result?.msgCodeError);
              }
            });
        }
      });
  }
  //#endregion
}
