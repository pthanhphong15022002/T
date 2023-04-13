import {
  Component,
  Injector,
  ChangeDetectorRef,
  TemplateRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
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
import { ActivatedRoute } from '@angular/router';
import { PopupEmployeeJobsalaryComponent } from './popup-employee-jobsalary/popup-employee-jobsalary.component';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'lib-employee-job-salary',
  templateUrl: './employee-job-salary.component.html',
  styleUrls: ['./employee-job-salary.component.css']
})
export class EmployeeJobSalaryComponent extends UIComponent {
  console = console;
  //#region view
  @ViewChild('templateList') templateList?: TemplateRef<any>;
  @ViewChild('headerTemplate') headerTemplate?: TemplateRef<any>;
  //#endregion

  views: Array<ViewModel> = [];
  funcID: string;
  method = 'GetEJobSalariesListAsync';
  buttonAdd: ButtonModel = {
    id: 'btnAdd',
    text: 'Thêm',
  };
  eContractHeaderText;
  eBasicSalariesFormModel: FormModel;
  currentEmpObj: any = null;
  grvSetup: any;

  //More function
  @ViewChild('templateUpdateStatus', { static: true })
  templateUpdateStatus: TemplateRef<any>;
  editStatusObj: any;
  formGroup: FormGroup;
  dialogEditStatus: any;
  dataCategory;
  itemDetail;
  cmtStatus: string = '';


   //#region eJobSalaryFuncID
   actionAddNew = 'HRTPro04A01'
   actionSubmit = 'HRTPro04A03'
   actionUpdateCanceled = 'HRTPro04AU0'
   actionUpdateInProgress = 'HRTPro04AU3'
   actionUpdateRejected = 'HRTPro04AU4'
   actionUpdateApproved = 'HRTPro04AU5'
   actionUpdateClosed = 'HRTPro04AU9'


  constructor(
    inject: Injector,
    private hrService: CodxHrService,
    private activatedRoute: ActivatedRoute,
    private df: ChangeDetectorRef,
    private notify: NotificationsService
  ) {
    super(inject);
    this.funcID = this.activatedRoute.snapshot.params['funcID'];
  }


  onInit(): void {
    //Load headertext from grid view setup database
    this.cache.gridViewSetup("EJobSalaries", "grvEJobSalaries").subscribe((res) => {
       if(res){
        this.grvSetup= Util.camelizekeyObj(res); 
       }
      })

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
      // {
      //   type: ViewType.listdetail,
      //   sameData: true,
      //   active: true,
      //   model: {
      //     // template: this.itemTemplateListDetail,
      //     // panelRightRef: this.panelRightListDetail,
      //   },
      // },
    ];
  }


  //Open, push data to modal
  HandleEJobSalary(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.Width = '550px';
    option.FormModel = this.view.formModel;

    let dialogAdd = this.callfc.openSide(
      PopupEmployeeJobsalaryComponent,
      {
        actionType: actionType,
        empObj: actionType == 'add' ? null : this.currentEmpObj,
        headerText:
          actionHeaderText,
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
          console.log('moi add hop dong xong', res.event[0]);
          this.view.dataService.add(res.event[0], 0).subscribe((res) => {
          });
          this.df.detectChanges();
        }
        else if (actionType == 'copy') {
          this.view.dataService.add(res.event[0], 0).subscribe((res) => {
          });
          this.df.detectChanges();
        }
        else if (actionType == 'edit') {
          this.view.dataService.update(res.event[0]).subscribe((res) => {
          })
          this.df.detectChanges();
        }
      }
      if (res?.event) this.view.dataService.clear();
    });
  }

  addJobSalaries(event): void {
    if (event.id == 'btnAdd') {
      this.HandleEJobSalary(event.text + ' ' + this.view.function.description, 'add', null);
    }
  }

  changeItemDetail(event) {
    // console.log(event);
  }

  //Call api delete  
  beforeDelete(opt: RequestOption, data) {
    opt.methodName = 'DeleteEmployeeJobsalaryInfoAsync';
    opt.className = 'EJobSalariesBusiness';
    opt.assemblyName = 'HR';
    opt.service = 'HR';
    opt.data = data;
    return true;
  }

  //#region more functions

  //Set form group data when open Modal dialog 
  ngAfterViewChecked(){ 
    if(!this.formGroup?.value){
      this.hrService.getFormGroup(this.view?.formModel?.formName, this.view?.formModel?.gridViewName).then((res) => {
        this.formGroup = res;
      });
    }
  }

  onSaveUpdateForm(){
    this.hrService.EditEmployeeJobSalariesMoreFunc(this.editStatusObj).subscribe((res) => {
      if(res != null){
        this.notify.notifyCode('SYS007');
        res[0].emp = this.currentEmpObj;
        this.view.formModel.entityName;
        this.hrService.AddEJSlariesTrackLog(
          res[0].recID,
          this.cmtStatus,
          this.view.formModel.entityName,
          'C1',
          null
        ).subscribe((res) => {
          console.log('kq luu track log', res);
          
        });
        this.dialogEditStatus && this.dialogEditStatus.close(res);
      }
    })
  }

  ValueChangeComment(evt){
    this.cmtStatus = evt.data;
  }

  close2(dialog: DialogRef) {
    dialog.close();
  }

  popupUpdateEJobSalaryStatus(funcID, data){
    this.hrService.handleUpdateRecordStatus(funcID, data);

    console.log('data sau khi mo form', data);
    // console.log('form model trc khi mo form', this.view.formModel);
    // console.log('form group trc khi mo form', this.formGroup);
    // console.log('edit object', this.editStatusObj);
    
    this.editStatusObj = data;
    this.currentEmpObj = data.emp;
    this.formGroup.patchValue(this.editStatusObj);
    debugger
    this.dialogEditStatus = this.callfc.openForm(
      this.templateUpdateStatus,
      null,
      850,
      550,
      null,
      null
    );
    this.dialogEditStatus.closed.subscribe((res) => {
      // console.log('res sau khi update status', res);
      if(res?.event){
        this.view.dataService.update(res.event[0]).subscribe((res) => {
        })
      }
      this.df.detectChanges();
    });
  }

  // release() {
  //   this.hrService
  //     .getCategoryByEntityName(this.view.formModel.entityName)
  //     .subscribe((res) => {
  //       if (res) {
  //         this.dataCategory = res;
  //         this.hrService
  //           .release(
  //             this.itemDetail.recID,
  //             this.dataCategory.processID,
  //             this.view.formModel.entityName,
  //             this.view.formModel.funcID,
  //             '<div> Hợp đồng lao động - ' + this.itemDetail.contractNo + '</div>'
  //           )
  //           .subscribe((result) => {
  //             if (result?.msgCodeError == null && result?.rowCount) {
  //               this.notify.notifyCode('ES007');
  //               this.itemDetail.status = '3';
  //               this.hrService
  //                 .editEContract(this.itemDetail)
  //                 .subscribe((res) => {
  //                   if (res) {
  //                     this.view?.dataService
  //                       ?.update(this.itemDetail)
  //                       .subscribe();
  //                   }
  //                 });
  //             } else this.notify.notifyCode(result?.msgCodeError);
  //           });
  //       }
  //     });
  // }

  // beforeRelease() {
  //   let category = '4';
  //   let formName = 'HRParameters';
  //   this.hrService.getSettingValue(formName, category).subscribe((res) => {
  //     console.log(res)
  //     if (res) {
  //       let parsedJSON = JSON.parse(res?.dataValue);
  //       let index = parsedJSON.findIndex(
  //         (p) => p.Category == this.view.formModel.entityName
  //       );
  //       if (index > -1) {
  //         let eContractsObj = parsedJSON[index];
  //         if (eContractsObj['ApprovalRule'] == '1') {
  //           this.release();
  //         } else {
  //         }
  //       }
  //     }
  //   });
  // }
  //#endregion

  clickMF(event, data): void {
    switch (event.functionID) {
      // case this.actionSubmit:
      //   this.beforeRelease();
      //   break;
        case this.actionUpdateCanceled:
          case this.actionUpdateInProgress:
            case this.actionUpdateRejected:
              case this.actionUpdateApproved:
                case this.actionUpdateClosed:
      let oUpdate = JSON.parse(JSON.stringify(data));
      this.popupUpdateEJobSalaryStatus(event.functionID , oUpdate)
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
          .subscribe(() => { });
        // this.df.detectChanges();
        break;
      //Edit
      case 'SYS03':
        this.currentEmpObj = data;
        this.HandleEJobSalary(event.text + ' ' + this.view.function.description, 'edit', this.currentEmpObj);
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
    console.log('copy data', data)
    this.hrService
      .copy(data, this.view.formModel, 'RecID')
      .subscribe((res) => {
        console.log('result', res);
        this.HandleEJobSalary(actionHeaderText + ' ' + this.view.function.description, 'copy', res);
      });
  }
  changeDataMF(event, data): void {
    this.hrService.handleShowHideMF(event, data, this.view);
   }
}
