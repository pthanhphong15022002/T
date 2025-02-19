import { share } from 'rxjs';
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
import { CodxHrService } from 'projects/codx-hr/src/public-api';
import { PopupEmployeeJobsalaryComponent } from './popup-employee-jobsalary/popup-employee-jobsalary.component';
import { CodxEpService } from 'projects/codx-ep/src/public-api';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';

@Component({
  selector: 'lib-employee-job-salary',
  templateUrl: './employee-job-salary.component.html',
  styleUrls: ['./employee-job-salary.component.css'],
})
export class EmployeeJobSalaryComponent extends UIComponent {
  console = console;
  //#region view
  @ViewChild('templateList') templateList?: TemplateRef<any>;
  @ViewChild('headerTemplate') headerTemplate?: TemplateRef<any>;

  //Detail
  @ViewChild('templateListDetail') templateListDetail?: TemplateRef<any>;
  @ViewChild('panelRightListDetail') panelRightListDetail?: TemplateRef<any>;
  itemDetail;
  //#endregion

  views: Array<ViewModel> = [];
  method = 'GetEJobSalariesListAsync';
  buttonAdd: ButtonModel[] = [{
    id: 'btnAdd',
  }];
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
  actionAddNew = 'HRTPro04A01';
  actionSubmit = 'HRTPro04A03';
  actionUpdateCanceled = 'HRTPro04AU0';
  actionUpdateInProgress = 'HRTPro04AU3';
  actionUpdateRejected = 'HRTPro04AU4';
  actionUpdateApproved = 'HRTPro04AU5';
  actionUpdateClosed = 'HRTPro04AU9';

  //Fix change when change codx-view
  popupTitle: any;
  columnGrids: any;

  constructor(
    inject: Injector,
    private hrService: CodxHrService,
    private codxShareService: CodxShareService,
    private codxCommonService: CodxCommonService,
    private activatedRoute: ActivatedRoute,
    private df: ChangeDetectorRef,
    private notify: NotificationsService,
    //Fix change when change codx-view
    private codxEpService: CodxEpService,
  ) {
    super(inject);
    this.funcID = this.activatedRoute.snapshot.params['funcID'];
    this.cache.functionList(this.funcID).subscribe((res) => {
      if (res) {
        this.popupTitle = res.defaultName.toString();
      }
    });
    this.codxEpService.getFormModel(this.funcID).then((res) => {
      if (res) {
        this.eBasicSalariesFormModel = res;
      }
    });
  }

  onInit(): void {
    this.initForm()
  }

  initForm() {
  //Load headertext from grid view setup database
  this.cache
  .gridViewSetup('EJobSalaries', 'grvEJobSalaries')
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
  }

  //Fix change when change codx-view
  viewChanged(evt: any) {
    this.funcID = this.router.snapshot.params['funcID'];
    this.cache.functionList(this.funcID).subscribe((res) => {
      if (res) {
        this.popupTitle = res.defaultName.toString();
      }
    });
    this.codxEpService.getFormModel(this.funcID).then((res) => {
      if (res) {
        this.eBasicSalariesFormModel = res;
      }
    });
  }

  //Fix change when change codx-view
  onLoading(evt: any) {
    let formModel = this.view.formModel;
    if (formModel) {
      this.cache
        .gridViewSetup(formModel?.formName, formModel?.gridViewName)
        .subscribe((gv) => {
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
          this.detectorRef.detectChanges();
        });
    }

  }

  ngAfterViewInit(): void {
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
      PopupEmployeeJobsalaryComponent,
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
    opt.methodName = 'DeleteEmployeeJobsalaryInfoAsync';
    opt.className = 'EJobSalariesBusiness_Old';
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
          this.view?.formModel?.gridViewName,
          this.view?.formModel
        )
        .then((res) => {
          this.formGroup = res;
        });
    }
  }

  onSaveUpdateForm() {
    this.hrService
      .EditEmployeeJobSalariesMoreFunc(this.editStatusObj)
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
              'EJobSalariesBusiness_Old'
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
          this.codxCommonService
            .codxRelease(
              'HR',
              this.itemDetail?.recID,
              this.processID?.processID,
              this.view?.formModel?.entityName,
              this.view?.formModel?.funcID,
              '',
              this.itemDetail?.decisionNo,
              ''
            )
            .subscribe((result) => {
              console.log(result)
              if (result?.msgCodeError == null && result?.rowCount) {
                this.notify.notifyCode('ES007');
                this.itemDetail.status = '3';
                this.itemDetail.approveStatus = '3';
                this.hrService
                  .EditEmployeeJobSalariesMoreFunc(this.itemDetail)
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
      //Propose increase salaries
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
            this.beforeDelete(option, data.recID)
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
