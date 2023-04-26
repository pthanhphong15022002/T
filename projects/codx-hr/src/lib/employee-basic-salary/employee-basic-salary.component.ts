import { EventHandler } from '@syncfusion/ej2-base';
import { FuncID } from './../../../../codx-ep/src/lib/models/enum/enum';
import { change } from '@syncfusion/ej2-grids';
import {
  Component,
  Injector,
  ChangeDetectorRef,
  TemplateRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import {
  AuthService,
  ButtonModel,
  DataService,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  SidebarModel,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxHrService } from '../codx-hr.service';
import { ActivatedRoute } from '@angular/router';
import { PopupEBasicSalariesComponent } from '../employee-profile/popup-ebasic-salaries/popup-ebasic-salaries.component';
import { environment } from 'src/environments/environment';
import { ViewBasicSalaryDetailComponent } from './view-basic-salary-detail/view-basic-salary-detail.component';
import { PopupAddNewHRComponent } from '../employee-list/popup-add-new-hr/popup-add-new-hr.component';
import { FormGroup } from '@angular/forms';

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
    private activatedRoute: ActivatedRoute,
    private df: ChangeDetectorRef,
    private notify: NotificationsService
  ) {
    super(injector);
    this.funcID = this.activatedRoute.snapshot.params['funcID'];
  }

  service = 'HR';
  assemblyName = 'ERM.Business.HR';
  entityName = 'HR_EBasicSalaries';
  className = 'EBasicSalariesBusiness';
  method = 'GetListEBasicSalariesAsync';

  actionAddNew = 'HRTPro03A01';
  actionSubmit = 'HRTPro03A03';
  actionUpdateCanceled = 'HRTPro03AU0';
  actionUpdateInProgress = 'HRTPro03AU3';
  actionUpdateRejected = 'HRTPro03AU4';
  actionUpdateApproved = 'HRTPro03AU5';
  actionUpdateClosed = 'HRTPro03AU9';

  funcID: string;
  grvSetup: any;
  genderGrvSetup: any;
  views: Array<ViewModel> = [];
  buttonAdd: ButtonModel = {
    id: 'btnAdd',
    text: 'Thêm',
  };
  eBasicSalariesHeaderText;
  formGroup: FormGroup;
  currentEmpObj: any;
  editStatusObj: any;
  dialogEditStatus: DialogRef;
  cmtStatus: string = '';
  dataCategory;
  itemDetail;

  onInit(): void {
    this.cache
      .gridViewSetup('EBasicSalaries', 'grvEBasicSalaries')
      .subscribe((res) => {
        if (res) {
          this.grvSetup = res;
        }
      });
    this.cache
      .gridViewSetup('EmployeeInfomation', 'grvEmployeeInfomation')
      .subscribe((res) => {
        this.genderGrvSetup = res?.Gender;
      });
    if (!this.funcID) {
      this.funcID = this.activatedRoute.snapshot.params['funcID'];
    }
  }
  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.list,
        active: true,
        sameData: true,
        model: {
          template: this.templateList,
          headerTemplate: this.headerTemplate,
        },
      },
      {
        type: ViewType.listdetail,
        sameData: true,
        active: true,
        model: {
          template: this.templateListDetail,
          panelRightRef: this.templateItemDetailRight,
        },
      },
    ];
    this.hrService.getHeaderText(this.view?.formModel?.funcID).then(response => {
      this.eBasicSalariesHeaderText = response;
    })
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
        null
      );
    }
  }
  handleAction(event) {}
  onMoreMulti(event) {}
  changeItemDetail(event) {
    this.itemDetail = event?.data;
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
    }
  }
  changeDataMF(event, data) {
    this.hrService.handleShowHideMF(event, data, this.view);
  }
  popupUpdateEBasicSalaryStatus(funcID, data) {
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
        this.view.dataService.update(res.event[0]).subscribe((res) => {});
      }
      this.df.detectChanges();
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
        //dataObj: data,
        headerText: actionHeaderText,
        //employeeId: data?.employeeID,
        funcID: this.view.funcID,
        salaryObj: data,
        //empObj: this.currentEmpObj,
        fromListView: true,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        if (actionType == 'add') {
          this.view.dataService.add(res.event[0], 0).subscribe((res) => {});
          this.df.detectChanges();
        } else if (actionType == 'copy') {
          this.view.dataService.add(res.event[0], 0).subscribe((res) => {});
          this.df.detectChanges();
        } else if (actionType == 'edit') {
          this.view.dataService.update(res.event[0]).subscribe((res) => {});
          this.df.detectChanges();
        }
      }
      if (res?.event) this.view.dataService.clear();
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
          res[0].emp = this.currentEmpObj;
          this.hrService
            .addBGTrackLog(
              res[0].recID,
              this.cmtStatus,
              this.view.formModel.entityName,
              'C1',
              null,
              'EBasicSalariesBusiness'
            )
            .subscribe((res) => {});
          this.dialogEditStatus && this.dialogEditStatus.close(res);
        }
      });
  }

  closeUpdateStatusForm(dialog: DialogRef) {
    dialog.close();
  }

  getDetailAward(event, data) {
    if (data) {
      this.itemDetail = data;
      this.df.detectChanges();
    }
  }
  clickEvent(event, data) {
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
          } else {
            //đợi BA mô tả
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
          this.hrService
            .release(
              this.itemDetail.recID,
              this.dataCategory.processID,
              this.view.formModel.entityName,
              this.view.formModel.funcID,
              '<div> '+ this.view.function.description + ' - ' + this.itemDetail.decisionNo + '</div>'
            )
            .subscribe((result) => {
              // console.log('ok', result);
              if (result?.msgCodeError == null && result?.rowCount) {
                this.notify.notifyCode('ES007');
                this.itemDetail.status = '3';
                this.itemDetail.approveStatus = '3';
                this.hrService
                  .UpdateEmployeeBasicSalariesInfo((res) => {
                    if (res) {
                      // console.log('after release', res);
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
  //#endregion
}
