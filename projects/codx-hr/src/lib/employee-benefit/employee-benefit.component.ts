import {
  Component,
  Injector,
  ChangeDetectorRef,
  TemplateRef,
  ViewChild,
} from '@angular/core';
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
import { ActivatedRoute } from '@angular/router';
import { PopupEmployeeBenefitComponent } from './popup-employee-benefit/popup-employee-benefit.component';
import { FormGroup } from '@angular/forms';

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
  funcID: string;
  method = 'GetEBenefitListAsync';
  eContractHeaderText;
  grvSetup: any;
  buttonAdd: ButtonModel = {
    id: 'btnAdd',
    text: 'Thêm',
  };
  formGroup: FormGroup;

  //Object data
  currentEmpObj: any = null;

  //More function
  @ViewChild('templateUpdateStatus', { static: true })
  templateUpdateStatus: TemplateRef<any>;
  editStatusObj: any;
  dialogEditStatus: any;
  dataCategory;
  cmtStatus: string = '';
  genderGrvSetup: any;
  eBenefitHeader;

  //#region Update modal Status
  actionUpdateCanceled = 'HRTPro05AU0';
  actionUpdateInProgress = 'HRTPro05AU3';
  actionUpdateRejected = 'HRTPro05AU4';
  actionUpdateApproved = 'HRTPro05AU5';
  actionUpdateClosed = 'HRTPro05AU9';
  //#endregion

  constructor(
    inject: Injector,
    private hrService: CodxHrService,
    private activedRouter: ActivatedRoute,
    private df: ChangeDetectorRef,
    private notify: NotificationsService
  ) {
    super(inject);
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  onInit(): void {
    if (!this.funcID) {
      this.funcID = this.activedRouter.snapshot.params['funcID'];
    }

    this.cache
      .gridViewSetup('EmployeeInfomation', 'grvEmployeeInfomation')
      .subscribe((res) => {
        this.genderGrvSetup = res?.Gender;
      });
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
        active: true,
        model: {
          template: this.templateListDetail,
          panelRightRef: this.panelRightListDetail,
        },
      },
    ];

    //Get Header text when view detail
    this.hrService.getHeaderText(this.view?.formModel?.funcID).then((res) => {
      this.eBenefitHeader = res;
    });
  }

  //Call api delete
  beforeDelete(opt: RequestOption, data) {
    opt.methodName = 'DeleteEBenefitAsync';
    opt.className = 'EBenefitsBusiness';
    opt.assemblyName = 'HR';
    opt.service = 'HR';
    opt.data = data;
    return true;
  }

  onSaveUpdateForm() {
    this.hrService
      .EditEmployeeBenefitMoreFunc(this.editStatusObj)
      .subscribe((res) => {
        if (res != null) {
          this.notify.notifyCode('SYS007');
          res[0].emp = this.currentEmpObj;
          this.view.formModel.entityName;
          this.hrService
            .AddEBenefitTrackLog(
              res[0].recID,
              this.cmtStatus,
              this.view.formModel.entityName,
              'C1',
              null
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

  popupUpdateEbenefitStatus(funcID, data) {
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

  clickMF(event, data): void {
    switch (event.functionID) {
      case this.actionUpdateCanceled:
      case this.actionUpdateInProgress:
      case this.actionUpdateRejected:
      case this.actionUpdateApproved:
      case this.actionUpdateClosed:
        let oUpdate = JSON.parse(JSON.stringify(data));
        this.popupUpdateEbenefitStatus(event.functionID, oUpdate);
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

  changeDataMF(event, data): void {
    this.hrService.handleShowHideMF(event, data, this.view);
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

  //Open, push data to modal add, update
  HandleEBenefit(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.Width = '550px';
    option.FormModel = this.view.formModel;

    let dialogAdd = this.callfc.openSide(
      PopupEmployeeBenefitComponent,
      {
        actionType: actionType,
        empObj: actionType == 'add' ? null : this.currentEmpObj,
        headerText: actionHeaderText,
        employeeId: data?.employeeID,
        funcID: this.view.funcID,
        dataObj: data,
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

  addBenefit(event): void {
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

  changeItemDetail(event) {
    this.itemDetail = event?.data;
  }

  clickEvent(event, data) {
    this.clickMF(event?.event, event?.data);
  }

  //#endregion
}
