import { copy } from '@syncfusion/ej2-angular-spreadsheet';
import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { CodxHrService } from '../codx-hr.service';
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
import { FormGroup } from '@angular/forms';
import moment from 'moment';
import { PopupEdayoffsComponent } from '../employee-profile/popup-edayoffs/popup-edayoffs.component';

@Component({
  selector: 'lib-employee-day-off',
  templateUrl: './employee-day-off.component.html',
  styleUrls: ['./employee-day-off.component.css'],
})
export class EmployeeDayOffComponent extends UIComponent {
  //#region view
  @ViewChild('templateList') templateList?: TemplateRef<any>;
  @ViewChild('headerTemplate') headerTemplate?: TemplateRef<any>;

  @ViewChild('templateListDetail') templateListDetail?: TemplateRef<any>;
  @ViewChild('templateItemDetailRight')
  templateItemDetailRight?: TemplateRef<any>;

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
  entityName = 'HR_EDayOffs';
  className = 'EDayOffsBusiness';
  method = 'GetListDayOffByDataRequestAsync';

  //add = 'SYS03';
  copy = 'SYS04';
  edit = 'SYS03';
  delete = 'SYS02';

  actionAddNew = 'HRTPro09A01'; //tạo mới
  actionSubmit = 'HRTPro09A03'; //gửi duyệt
  actionUpdateCanceled = 'HRTPro09AU0'; //hủy
  actionUpdateInProgress = 'HRTPro09AU3'; //đang duyệt
  actionUpdateRejected = 'HRTPro09AU4'; //từ chối
  actionUpdateApproved = 'HRTPro09AU5';
  actionUpdateClosed = 'HRTPro09AU9'; // đóng

  funcID: string;
  grvSetup: any;
  genderGrvSetup: any;
  views: Array<ViewModel> = [];
  buttonAdd: ButtonModel = {
    id: 'btnAdd',
    text: 'Thêm',
  };
  eDayOffsHeaderText;
  formGroup: FormGroup;
  eDayOffObj: any;
  editStatusObj: any;
  dialogEditStatus: DialogRef;
  cmtStatus: string = '';
  dialogAddEdit: DialogRef;
  dataCategory: any;
  itemDetail;
  currentEmpObj: any;
  eDayOff: any;

  //Initviews
  onInit() {
    this.cache.gridViewSetup('EDayOffs', 'grvEDayOffs').subscribe((res) => {
      if (res) {
        this.grvSetup = res;
        console.log(this.grvSetup)
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

  ngAfterViewInit(): void {
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
    this.view.dataService.methodDelete = 'DeleteEmployeeDayOffInfoAsync';
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

  handleAction(event) {}
  onMoreMulti(event) {}
  changeItemDetail(event) {
    this.itemDetail = event?.data;
  }

  //More function
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
        this.handlerEDayOffs(event.text + ' ' + this.view.function.description,
          'add', newData);
        break;
      //Delete
      case this.delete:
        if (data) {this.view.dataService.dataSelected = data; }
        this.view.dataService
          .delete([data], true, (option: RequestOption) =>
            this.beforeDelete(option, data.recID)
          )
          .subscribe(() => {});
        break;
      //Edit
      case this.edit:
        //  let input = JSON.parse(JSON.stringify(data));//????
        this.handlerEDayOffs(
          event.text + ' ' + this.view.function.description,
          'edit',
          data
        );
        this.df.detectChanges();
        break;
      //Copy
      case this.copy:
        this.copyValue(event.text, this.itemDetail);
        this.df.detectChanges();
        break;
    }
  }
  changeDataMF(event, data) {
    this.hrService.handleShowHideMF(event, data, this.view);
  }
  clickEvent(event, data) {
    this.clickMF(event?.event, event?.data);
  }

  dateCompare(beginDate, endDate) {
    if (beginDate && endDate) {
      let date1 = moment(beginDate).format('dd-MM-yyyy');
      let date2 = moment(endDate).format('dd-MM-yyyy');

      //return beginDate.getDate() < endDate.getDate();
      return date1 < date2;
    }
    return false;
  }

  //add/edit/copy/delete
  handlerEDayOffs(actionHeaderText: string, actionType: string, data: any){
    let option = new SidebarModel();
    option.Width = '550px';
    option.FormModel = this.view.formModel;

    this.currentEmpObj = data?.emp;
    //open form
    let dialogAdd = this.callfc.openSide(
      PopupEdayoffsComponent,
      {
        //pass data
        actionType: actionType,
        dayoffObj: data,
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
  addDayOff(event) {
    if (event.id == 'btnAdd') {
      this.handlerEDayOffs(
        event.text + ' ' + this.view.function.description,
        'add',
        null
      );
    }
  }
  copyValue(actionHeaderText, data) {
    this.hrService.copy(data, this.view.formModel, 'RecID').subscribe((res) => {
      this.handlerEDayOffs(
        actionHeaderText + ' ' + this.view.function.description,
        'copy',
        res
      );
    });
  }
  beforeDelete(opt: RequestOption, data) {
    opt.methodName = 'DeleteEmployeeDayOffInfoAsync';
    opt.className = 'EDayOffsBusiness';
    opt.assemblyName = 'HR';
    opt.service = 'HR';
    opt.data = data;
    return true;
  }

  //change status
  popupUpdateEAwardStatus(funcID, data) {
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
      }
      this.df.detectChanges();
    });
  }
  closeUpdateStatusForm(dialog: DialogRef) {
    dialog.close();
  }
  valueChangeComment(event) {
    this.cmtStatus = event.data;
  }
  onSaveUpdateForm() {
    this.hrService
      .UpdateEmployeeDayOffInfo(this.editStatusObj)
      .subscribe((res) => {
        if (res) {
          this.notify.notifyCode('SYS007');
          res.emp = this.currentEmpObj;
          this.hrService.addBGTrackLog(
            res.recID,
            this.cmtStatus,
            this.view.formModel.entityName,
            'C1',
            null,
            'EDayOffsBusiness'
          ).subscribe(res =>{});
          this.dialogEditStatus && this.dialogEditStatus.close(res);
        }
      });
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
          this.hrService
            .release(
              this.itemDetail.recID,
              this.dataCategory.processID,
              this.view.formModel.entityName,
              this.view.formModel.funcID,
              '<div> ' + this.view.function.description +' - ' 
                + this.itemDetail.decisionNo + '</div>'
            )
            .subscribe((result) => {
              // console.log('ok', result);
              if (result?.msgCodeError == null && result?.rowCount) {
                this.notify.notifyCode('ES007');
                this.itemDetail.status = '3';
                this.itemDetail.approveStatus = '3';
                this.hrService
                  .UpdateEmployeeDayOffInfo((res) => {
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
