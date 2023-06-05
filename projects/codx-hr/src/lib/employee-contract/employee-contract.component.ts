import { ViewDetailContractsComponent } from './popup-eprocess-contract/view-detail-contracts/view-detail-contracts/view-detail-contracts.component';
import { FormGroup } from '@angular/forms';
import { PopupEProcessContractComponent } from './popup-eprocess-contract/popup-eprocess-contract.component';
import { CodxHrService } from './../codx-hr.service';
import {
  UIComponent,
  ViewModel,
  ButtonModel,
  ViewType,
  NotificationsService,
  SidebarModel,
  DialogRef,
  AuthStore,
} from 'codx-core';
import {
  Component,
  ViewChild,
  TemplateRef,
  Injector,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// import { PopupEContractComponent } from '../employee-profile/popup-econtract/popup-econtract.component';

@Component({
  selector: 'lib-employee-contract',
  templateUrl: './employee-contract.component.html',
  styleUrls: ['./employee-contract.component.css'],
})
export class EmployeeContractComponent extends UIComponent {
  @ViewChild('templateList') itemTemplate?: TemplateRef<any>;
  @ViewChild('viewdetail') viewdetail: ViewDetailContractsComponent;
  @ViewChild('templateListDetail') itemTemplateListDetail?: TemplateRef<any>;
  @ViewChild('panelRightListDetail') panelRightListDetail?: TemplateRef<any>;
  @ViewChild('headerTemplate') headerTemplate?: TemplateRef<any>;
  @ViewChild('contractTemplate') contractTemplate?: TemplateRef<any>;
  @ViewChild('templateUpdateStatus', { static: true })
  templateUpdateStatus: TemplateRef<any>;
  views: Array<ViewModel> = [];
  funcID: string;
  dataCategory;
  eContractHeaderText;
  method = 'LoadDataEcontractWithEmployeeInfoAsync';
  numofRecord;
  itemDetail;
  buttonAdd: ButtonModel = {
    id: 'btnAdd',
    text: 'Thêm',
  };
  formGroup: FormGroup;
  editStatusObj: any;
  cmtStatus: string = '';
  currentEmpObj: any = null;
  dialogEditStatus: any;
  statusCbx = true;

  //genderGrvSetup: any
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

  // moreFuncs = [
  //   {
  //     id: 'btnEdit',
  //     icon: 'icon-list-checkbox',
  //     text: 'Chỉnh sửa',
  //   },
  //   {
  //     id: 'btnDelete',
  //     icon: 'icon-list-checkbox',
  //     text: 'Xóa',
  //   },
  // ];

  constructor(
    inject: Injector,
    private hrService: CodxHrService,
    private activedRouter: ActivatedRoute,
    private df: ChangeDetectorRef,
    private notify: NotificationsService,
    private auth: AuthStore
  ) {
    super(inject);
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  onInit(): void {
    if (!this.funcID) {
      this.funcID = this.activedRouter.snapshot.params['funcID'];
    }
    this.cache.gridViewSetup('EContracts', 'grvEContracts').subscribe((res) => {
      this.grvSetup = res;
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
          template: this.itemTemplateListDetail,
          panelRightRef: this.panelRightListDetail,
        },
      },
    ];
    this.hrService.getHeaderText(this.view?.formModel?.funcID).then((res) => {
      this.eContractHeaderText = res;
    });
  }

  ngAfterViewChecked() {
    // if(this.view.dataService?.data){
    //   this.numofRecord = this.view.dataService.data.length
    //   var PageTiltle = (window as any).ng.getComponent(document.querySelector('codx-page-title'));
    //   if(PageTiltle.pageTitle.breadcrumbs._value[0]?.title){
    //     PageTiltle.pageTitle.breadcrumbs._value[0].title = `(Tất cả ${this.numofRecord})`;
    //   }
    // }
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

  HandleAction(evt) {
    console.log('on action', evt);
  }

  close2(dialog: DialogRef) {
    dialog.close();
  }

  popupUpdateEContractStatus(funcID, data) {
    // let option = new DialogModel();
    // option.zIndex = 999;
    // option.FormModel = this.view.formModel

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
          .subscribe((res) => {
            console.log('kq luu track log', res);
          });
        this.dialogEditStatus && this.dialogEditStatus.close(res);
      }
    });
  }
  changeDataMf(event, data) {
    this.hrService.handleShowHideMF(event, data, this.view.formModel);
  }

  clickEvent(event, data) {
    // this.popupUpdateEContractStatus(event?.event?.functionID , event?.data);
    this.clickMF(event?.event, event?.data);
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
        this.view.dataService.delete([data]).subscribe((res) => {
          if (res) {
            // debugger
            // this.view.dataService.remove(data).subscribe((res) => {
            //   console.log('res sau khi remove', res);
            // });
            // this.df.detectChanges();
          }
        });
        // this.hrService.deleteEContract(data.contract).subscribe((p) => {
        //   if (p) {
        //     this.notify.notifyCode('SYS008');
        //     this.view.dataService.delete(data).subscribe((res) => {});
        //     this.df.detectChanges();
        //   } else {
        //     this.notify.notifyCode('SYS022');
        //   }
        // });
        break;
      case 'SYS04': //copy
        this.currentEmpObj = data.emp;
        this.copyValue(event.text, data, 'eContract');
        this.df.detectChanges();
        break;
    }
  }

  HandleEContractInfo(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '800px';
    // let isAppendix = false;
    // if((actionType == 'edit' || actionType == 'copy') && data.isAppendix == true){
    //   isAppendix = true;
    // }
    let dialogAdd = this.callfc.openSide(
      PopupEProcessContractComponent,
      // isAppendix ? PopupSubEContractComponent : PopupEContractComponent,
      {
        actionType: actionType,
        dataObj: data,
        empObj: this.currentEmpObj,
        headerText: actionHeaderText,
        employeeId: this.currentEmpObj.employeeID,
        funcID: this.view.funcID,
        openFrom: 'empContractProcess',
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        if (actionType == 'add') {
          this.view.dataService.add(res.event, 0).subscribe((res) => {});
          this.df.detectChanges();
        } else if (actionType == 'copy') {
          this.view.dataService.add(res.event, 0).subscribe((res) => {});
          this.df.detectChanges();
        } else if (actionType == 'edit') {
          this.view.dataService.update(res.event).subscribe((res) => {});
          this.df.detectChanges();
        }
      }
      if (res?.event) this.view.dataService.clear();
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
    this.currentEmpObj = this.itemDetail.emp;
    if (evt.id == 'btnAdd') {
      this.HandleEContractInfo(
        evt.text + ' ' + this.view.function.description,
        'add',
        null
      );
    }
  }

  onMoreMulti(evt) {
    // console.log('chon nhieu dong', evt);
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

  getDetailContract(event, data) {
    if (data) {
      this.itemDetail = data;

      this.df.detectChanges();
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
          this.hrService
            .release(
              this.itemDetail.recID,
              this.dataCategory.processID,
              this.view.formModel.entityName,
              this.view.formModel.funcID,
              '<div> Hợp đồng lao động - ' +
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
