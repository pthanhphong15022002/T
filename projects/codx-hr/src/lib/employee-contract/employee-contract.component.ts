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
import { CodxHrService } from './../codx-hr.service';
import { PopupEProcessContractComponent } from './popup-eprocess-contract/popup-eprocess-contract.component';
import { ViewDetailContractsComponent } from './popup-eprocess-contract/view-detail-contracts/view-detail-contracts/view-detail-contracts.component';

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

  grvSetup: any;

  //#region eContractFuncID
  actionAddNew = 'HRTPro01A01';
  actionSubmit = 'HRTPro01A03';
  actionUpdateCanceled = 'HRTPro01AU0';
  actionUpdateInProgress = 'HRTPro01AU3';
  actionUpdateRejected = 'HRTPro01AU4';
  actionUpdateApproved = 'HRTPro01AU5';
  actionUpdateClosed = 'HRTPro01AU9';
  //#endregion

  constructor(
    inject: Injector,
    private hrService: CodxHrService,
    private activatedRoute: ActivatedRoute,
    private df: ChangeDetectorRef,
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
        this.view.dataService.update(res.event[0]).subscribe();
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
        res[0].emp = this.currentEmpObj;
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
  }

  clickEvent(event) {
    this.clickMF(event?.event, event?.data);
  }

  clickMF(event, data) {
    this.itemDetail = data;

    console.log(event);
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
        this.popupUpdateEContractStatus(event.functionID, oUpdate);
        break;
      case this.actionAddNew: // de xuat hop dong tiep theo
        this.HandleEContractInfo(event.text, 'add', data);
        break;

      case 'SYS03':
        this.currentEmpObj = data.emp;
        this.HandleEContractInfo(
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
        this.copyValue(event.text, data, 'eContract');
        this.df.detectChanges();
        break;
    }
  }

  HandleEContractInfo(actionHeaderText, actionType: string, data: any) {
    this.currentEmpObj = this.itemDetail.emp;
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
        employeeId: data?.employeeID || this.currentEmpObj.employeeID,
        funcID: this.view.funcID,
        openFrom: 'empContractProcess',
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
        this.df.detectChanges();
      }
    });
  }

  copyValue(actionHeaderText, data, flag) {
    this.hrService.copy(data, this.view.formModel, 'RecID').subscribe((res) => {
      if (flag == 'eContract') {
        this.HandleEContractInfo(
          actionHeaderText + ' ' + this.view.function.description,
          'copy',
          res
        );
      }
    });
  }

  addContract(evt) {
    if (evt.id == 'btnAdd') {
      this.HandleEContractInfo(
        evt.text + ' ' + this.view.function.description,
        'add',
        null
      );
    }
  }

  getIdUser(createdBy: any, owner: any) {
    var arr = [];
    if (createdBy) arr.push(createdBy);
    if (owner && createdBy != owner) arr.push(owner);
    return arr.join(';');
  }

  changeItemDetail(event) {
    this.itemDetail = event?.data;
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
          let eContractsObj = parsedJSON[index];
          if (eContractsObj['ApprovalRule'] == '1') {
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
          console.log(this.itemDetail);
          this.hrService
            .release(
              this.itemDetail.recID,
              this.dataCategory.processID,
              this.view.formModel.entityName,
              this.view.formModel.funcID,
              '<div> ' +
                this.view.function.description +
                ' - ' +
                this.itemDetail.contractNo +
                '</div>'
            )
            .subscribe((result) => {
              if (result?.msgCodeError == null && result?.rowCount) {
                this.notify.notifyCode('ES007');
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
              } else this.notify.notifyCode(result?.msgCodeError);
            });
        }
      });
  }
}
