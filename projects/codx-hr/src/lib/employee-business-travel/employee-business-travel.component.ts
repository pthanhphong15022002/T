import {
  Component,
  Injector,
  ChangeDetectorRef,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';
import {
  ButtonModel,
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
import { PopupEmployeeBusinessComponent } from './popup-employee-business/popup-employee-business.component';

@Component({
  selector: 'lib-employee-business-travel',
  templateUrl: './employee-business-travel.component.html',
  styleUrls: ['./employee-business-travel.component.css']
})
export class EmployeeBusinessTravelComponent extends UIComponent{
  console = console;
  //#region view
  @ViewChild('templateList') templateList?: TemplateRef<any>;
  @ViewChild('headerTemplate') headerTemplate?: TemplateRef<any>;

   //Detail
   @ViewChild('templateListDetail') templateListDetail?: TemplateRef<any>;
   @ViewChild('panelRightListDetail') panelRightListDetail?: TemplateRef<any>;
   itemDetail;

  views: Array<ViewModel> = [];
  funcID: string;
  method = 'LoadDataEBTravelsAsync';
  buttonAdd: ButtonModel = {
    id: 'btnAdd',
    text: 'Thêm',
  };
  eJobSalaryHeader;
  eBasicSalariesFormModel: FormModel;
  currentEmpObj: any = null;
  grvSetup: any;

  //More function
  @ViewChild('templateUpdateStatus', { static: true })
  templateUpdateStatus: TemplateRef<any>;
  editStatusObj: any;
  formGroup: FormGroup;
  dialogEditStatus: any;
  processID;
  cmtStatus: string = '';
  genderGrvSetup: any;

  //#region eJobSalaryFuncID
  actionAddNew = 'HRTPro10A01';
  actionSubmit = 'HRTPro10A03';
  actionUpdateCanceled = 'HRTPro10AU0';
  actionUpdateInProgress = 'HRTPro10AU3';
  actionUpdateRejected = 'HRTPro10AU4';
  actionUpdateApproved = 'HRTPro10AU5';
  actionUpdateClosed = 'HRTPro10AU9';


  constructor(
    inject: Injector,
    private hrService: CodxHrService,
    private activatedRoute: ActivatedRoute,
    private df: ChangeDetectorRef,
    private notify: NotificationsService
  ) {
    super(inject);
    // this.funcID = this.activatedRoute.snapshot.params['funcID'];
  }

  onInit(): void {
    //Load headertext from grid view setup database
    this.cache
      .gridViewSetup('EBusinessTravels', 'grvEBusinessTravels')
      .subscribe((res) => {
        if (res) {
          this.grvSetup = Util.camelizekeyObj(res);
        }
      });

    //Load data field gender from database
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
          panelRightRef: this.panelRightListDetail,
        },
      },
    ];

    //Get Header text when view detail
    this.hrService.getHeaderText(this.view?.formModel?.funcID).then((res) => {
      this.eJobSalaryHeader = res;
    });
  }

  //Open, push data to modal
  HandleEJobSalary(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.Width = '550px';
    option.FormModel = this.view.formModel;

    let dialogAdd = this.callfc.openSide(
      PopupEmployeeBusinessComponent,
      {
        funcID: this.view.funcID,
        employeeId: data?.employeeID,
        headerText: actionHeaderText,
        empObj: actionType == 'add' ? null : this.currentEmpObj,
        actionType: actionType,
        dataObj: data,
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
          console.log(res)
          this.view.dataService.update(res.event[0]).subscribe((res) => {});
          this.df.detectChanges();
        }
      }
      if (res?.event) this.view.dataService.clear();
    });
  }

  addJobSalaries(event): void {
    if (event.id == 'btnAdd') {
      this.HandleEJobSalary(
        event.text + ' ' + this.view.function.description,
        'add',
        null
      );
    }
  }

  //Call api delete
  beforeDelete(opt: RequestOption, data) {
    opt.methodName = 'DeleteEBusinessTravelsAsync';
    opt.className = 'EBusinessTravelsBusiness';
    opt.assemblyName = 'HR';
    opt.service = 'HR';
    opt.data = data;
    return true;
  }

  //#region more functions

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

  onSaveUpdateForm() {
    this.hrService
      .EditEmployeeContactMoreFunc(this.editStatusObj)
      .subscribe((res) => {
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
              'EBusinessTravelsBusiness'
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

  popupUpdateEJobSalaryStatus(funcID, data) {
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

  //More function send approved
  release() {
    this.hrService
      .getCategoryByEntityName(this.view.formModel.entityName)
      .subscribe((res) => {
        if (res) {
          this.processID = res;
          this.hrService
            .release(
              this.itemDetail.recID,
              this.processID.processID,
              this.view.formModel.entityName,
              this.view.formModel.funcID,
              '<div> Công tác - ' + this.itemDetail.decisionNo + '</div>'
            )
            .subscribe((result) => {
              console.log(result)
              if (result?.msgCodeError == null && result?.rowCount) {
                this.notify.notifyCode('ES007');
                this.itemDetail.status = '3';
                this.itemDetail.approveStatus = '3';
                this.hrService
                  .EditEmployeeContactMoreFunc(this.itemDetail)
                  .subscribe((res) => {
                    console.log('Result after send edit' + res)
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
          let eJobSalaryObj = parsedJSON[index];
          if (eJobSalaryObj['ApprovalRule'] == '1') {
            this.release();
          } else {
          }
        }
      }
    });
  }

  //#endregion

  clickMF(event, data): void {
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
        this.popupUpdateEJobSalaryStatus(event.functionID, oUpdate);
        break;
      //Propose increase business
      case this.actionAddNew:
        this.HandleEJobSalary(event.text, 'add', data);
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
        // this.df.detectChanges();
        break;
      //Edit
      case 'SYS03':
        this.currentEmpObj = data;
        this.HandleEJobSalary(
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
      this.HandleEJobSalary(
        actionHeaderText + ' ' + this.view.function.description,
        'copy',
        res
      );
    });
  }
  changeDataMF(event, data): void {
    this.hrService.handleShowHideMF(event, data, this.view);
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
