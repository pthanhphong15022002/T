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
import { PopupEAwardsComponent } from '../employee-profile/popup-eawards/popup-eawards.component';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';

@Component({
  selector: 'lib-employee-awards',
  templateUrl: './employee-awards.component.html',
  styleUrls: ['./employee-awards.component.css'],
})
export class EmployeeAwardsComponent extends UIComponent {
  //#region view
  @ViewChild('templateList') templateList?: TemplateRef<any>;
  @ViewChild('headerTemplate') headerTemplate?: TemplateRef<any>;

  @ViewChild('templateListDetail') templateListDetail?: TemplateRef<any>;
  @ViewChild('templateItemDetailRight')
  templateItemDetailRight?: TemplateRef<any>;

  @ViewChild('templateUpdateStatus', { static: true })
  templateUpdateStatus: TemplateRef<any>;

  @ViewChild('reasonAward') reasonAward: TemplateRef<any>;

  //#endregion

  constructor(
    injector: Injector,
    private hrService: CodxHrService,
    private codxShareService: CodxShareService,
    private activatedRoute: ActivatedRoute,
    private df: ChangeDetectorRef,
    private notify: NotificationsService
  ) {
    super(injector);
  }

  service = 'HR';
  assemblyName = 'ERM.Business.HR';
  entityName = 'HR_EAwards';
  className = 'EAwardsBusiness';
  method = 'GetListAwardByDataRequestAsync';

  actionAddNew = 'HRTPro06A01'; //tạo mới
  actionSubmit = 'HRTPro06A03'; //gửi duyệt
  actionUpdateCanceled = 'HRTPro06AU0'; //hủy
  actionUpdateInProgress = 'HRTPro06AU3'; //đang duyệt
  actionUpdateRejected = 'HRTPro06AU4'; //từ chối
  actionUpdateApproved = 'HRTPro06AU5';
  actionUpdateClosed = 'HRTPro06AU9'; // đóng

  funcID: string;
  grvSetup: any;
  // genderGrvSetup: any;
  views: Array<ViewModel> = [];
  buttonAdd: ButtonModel = {
    id: 'btnAdd',
  };
  eAwardsHeaderText;
  formGroup: FormGroup;
  currentEmpObj: any;
  eAwardObj: any;
  editStatusObj: any;
  dialogEditStatus: DialogRef;
  cmtStatus: string = '';
  dialogAddEdit: DialogRef;
  dataCategory: any;

  itemDetail;

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
        active: false,
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
    this.view.dataService.methodDelete = 'DeleteEmployeeAwardInfoAsync';
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

  addAward(event) {
    if (event.id == 'btnAdd') {
      this.handlerEAwards(
        event.text + ' ' + this.view.function.description,
        'add',
        this.itemDetail
      );
    }
  }

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
        this.popupUpdateEAwardStatus(event.functionID, oUpdate);
        break;
      case this.actionAddNew:
        let newData = {
          //new data just with emp info (id??)
          emp: data?.emp,
          employeeID: data?.employeeID,
        };
        this.handlerEAwards(
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
        this.handlerEAwards(
          event.text + ' ' + this.view.function.description,
          'edit',
          this.itemDetail
        );
        this.df.detectChanges();
        break;
      //Copy
      case 'SYS04':
        this.eAwardObj = data;
        this.copyValue(event.text, this.eAwardObj);
        this.df.detectChanges();
        break;
    }
  }
  changeDataMF(event, data) {
    this.hrService.handleShowHideMF(event, data, this.view);
  }

  handlerEAwards(actionHeaderText: string, actionType: string, data: any) {
    let option = new SidebarModel();
    option.Width = '550px';
    option.FormModel = this.view.formModel;

    this.currentEmpObj = data?.emp;
    //open form
    let dialogAdd = this.callfc.openSide(
      PopupEAwardsComponent,
      {
        //pass data
        actionType: actionType,
        dataInput: data,
        headerText: actionHeaderText,
        //employeeId: data?.employeeID,
        funcID: this.view.funcID,
        fromListView: true,
        //empObj: actionType == 'add' ? null : this.currentEmpObj,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        if (actionType == 'add') {
          this.view.dataService.add(res.event[0], 0).subscribe((res) => {});
        } else if (actionType == 'copy') {
          this.view.dataService.add(res.event[0], 0).subscribe((res) => {});
        } else if (actionType == 'edit') {
          this.view.dataService.update(res.event[0]).subscribe((res) => {});
        }
        this.df.detectChanges();
      }
      if (res?.event) this.view.dataService.clear();
    });
  }

  beforeDelete(opt: RequestOption, data) {
    opt.methodName = 'DeleteEmployeeAwardInfoAsync';
    opt.className = 'EAwardsBusiness';
    opt.assemblyName = 'HR';
    opt.service = 'HR';
    opt.data = data;
    return true;
  }

  copyValue(actionHeaderText, data) {
    this.hrService.copy(data, this.view.formModel, 'RecID').subscribe((res) => {
      this.handlerEAwards(
        actionHeaderText + ' ' + this.view.function.description,
        'copy',
        res
      );
    });
  }

  popupUpdateEAwardStatus(funcID, data) {
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
        this.view.dataService.update(res.event[0]).subscribe((res) => {});
        this.df.detectChanges();
      }
    });
  }

  valueChangeComment(event) {
    this.cmtStatus = event.data;
  }
  onSaveUpdateForm() {
    this.hrService
      .UpdateEmployeeAwardInfo(this.editStatusObj)
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
              'EAwardsBusiness'
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

  //#region gui duyet
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
              // console.log('ok', result);
              if (result?.msgCodeError == null && result?.rowCount) {
                this.notify.notifyCode('ES007');
                this.itemDetail.status = '3';
                this.itemDetail.approveStatus = '3';
                this.hrService
                  .UpdateEmployeeAwardInfo(this.itemDetail)
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
  //#endregion
}
