import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import { data } from './../../../../codx-cm/src/lib/task/codx-table/data';
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
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxHrService } from '../codx-hr.service';
import { PopupEAwardsComponent } from '../employee-profile/popup-eawards/popup-eawards.component';

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
    private activatedRoute: ActivatedRoute,
    private df: ChangeDetectorRef,
    private notify: NotificationsService
  ) {
    super(injector);
    this.funcID = this.activatedRoute.snapshot.params['funcID'];
  }

  service = 'HR';
  assemblyName = 'ERM.Business.HR';
  entityName = 'HR_EAwards';
  className = 'EAwardsBusiness';
  method = 'GetListAwardByDataRequestAsync';

  actionAddNew = 'HRTPro06A01'; // mới tạo
  actionSubmit = 'HRTPro06A03'; //gửi duyệt
  actionUpdateCanceled = 'HRTPro06AU0'; //hủy
  actionUpdateInProgress = 'HRTPro06AU3'; //đang duyệt
  actionUpdateRejected = 'HRTPro06AU4'; //từ chối
  actionUpdateApproved = 'HRTPro06AU5';
  actionUpdateClosed = 'HRTPro06AU9'; // đóng

  funcID: string;
  grvSetup: any;
  views: Array<ViewModel> = [];
  buttonAdd: ButtonModel = {
    id: 'btnAdd',
    text: 'Thêm',
  };
  eAwardsHeaderText;
  formGroup: FormGroup;
  currentEmpObj: any;
  editStatusObj: any;
  dialogEditStatus: DialogRef;
  cmtStatus: string = '';
  dialogAddEdit: DialogRef;

  onInit(): void {
    this.cache
      .gridViewSetup('EAwards', 'grvEAwards')
      .subscribe((res) => {
        if (res) {
          this.grvSetup = res;
        }
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
    this.view.dataService.methodDelete = 'DeleteEmployeeAwardInfoAsync';

  }

  ngAfterViewChecked(){
    if(!this.formGroup?.value){
      this.hrService.getFormGroup(this.view?.formModel?.formName,
        this.view?.formModel?.gridViewName).then(res =>{
          this.formGroup = res;
        })
    }
  }

  addAward(event) {
    if (event.id == 'btnAdd') {
      this.handlerEAwards(
        event.text + ' ' + this.view.function.description,
        'add',
        null
      );
    }
  }

  handleAction(event) {}
  onMoreMulti(event) {}
  changeItemDetail(event) {}

  clickMF(event, data) {
    switch (event.functionID) {
      case this.actionUpdateCanceled:
      case this.actionUpdateInProgress:
      case this.actionUpdateRejected:
      case this.actionUpdateApproved:
      case this.actionUpdateClosed:
        let oUpdate = JSON.parse(JSON.stringify(data));
        this.popupUpdateEAwardStatus(event.functionID, oUpdate);
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
        this.currentEmpObj = data;
        this.handlerEAwards(
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
  changeDataMF(event, data) {
    this.hrService.handleShowHideMF(event, data, this.view);
  }

  handlerEAwards(actionHeaderText: string, actionType: string, data: any) {
    let option = new SidebarModel();
    option.Width = '550px';
    option.FormModel = this.view.formModel;

    //open form
    let dialogAdd = this.callfc.openSide(
      PopupEAwardsComponent,
      {
        //pass data
        actionType: actionType,
        dataInput: data,
        headerText: actionHeaderText,
        employeeId: data?.employeeID,
        funcID: this.view.funcID,
        fromListView: true,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      console.log(res);
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
    opt.methodName = 'DeleteEmployeeAwardInfoAsync';
    opt.className = 'EAwardsBusiness';
    opt.assemblyName = 'HR';
    opt.service = 'HR';
    opt.data = data;
    return true;
  }

  copyValue(actionHeaderText, data) {
    this.hrService.copy(data, this.view.formModel, 'RecID').subscribe((res) => {
      console.log('result', res);
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
      850,
      550,
      null,
      null
    );
    this.dialogEditStatus.closed.subscribe((res) => {
      if(res?.event){
        this.view.dataService.update(res.event[0]).subscribe((res) => {
        })
      }
      this.df.detectChanges();
    });
  }

  getIdUser(string1, tring2) {}

  valueChangeComment(event){
    this.cmtStatus = event.data;
  }
  onSaveUpdateForm(){
    this.hrService.UpdateEmployeeAwardInfo(this.editStatusObj).subscribe(res =>{
      if(res){
        this.notify.notifyCode('SYS007');
        res[0].emp = this.currentEmpObj;
        this.hrService.addBGTrackLogEAwards(
          res[0].recID,
          this.cmtStatus,
          this.view.formModel.entityName,
          'C1',
          null
        ).subscribe((res) => {
          
        });
        this.dialogEditStatus && this.dialogEditStatus.close(res)
      }
    })
  }
  closeUpdateStatusForm(dialog: DialogRef){
    dialog.close();
  }
}
