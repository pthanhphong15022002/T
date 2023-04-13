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

  @ViewChild('changeStatus', { static: true }) changeStatus: TemplateRef<any>;
  //#endregion

  views: Array<ViewModel> = [];
  funcID: string;
  method: string = 'GetListEBasicSalariesAsync';
  buttonAdd: ButtonModel = {
    id: 'btnAdd',
    text: 'Thêm',
  };
  eBasicSalariesHeaderText;
  eBasicSalariesFormModel: FormModel;
  currentEbasicSalaryDta: any;
  grvSetup: any;

  // get file sv
  services: string = 'DM';
  assemblyName: string = 'ERM.Business.HM';
  className: string = 'FileBussiness';
  lstFile: any[] = [];
  @ViewChild('tmpListItem') tmpListItem: TemplateRef<any>;
  REFERTYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };
  user: any;
  itemDetail: any;

  itemSelected: any;
  formGroup: FormGroup;
  currentEmpObj: any;
  editStatusObj: any;
  dialogEditStatus: DialogRef;
  cmtStatus: any;
  //
  constructor(
    inject: Injector,
    private hrService: CodxHrService,
    private activatedRoute: ActivatedRoute,
    private df: ChangeDetectorRef,
    private notify : NotificationsService,
    //auth
    private auth: AuthService
  ) {
    super(inject);
    this.funcID = this.activatedRoute.snapshot.params['funcID'];
  }

  onInit(): void {
    if (!this.funcID) {
      this.funcID = this.activatedRoute.snapshot.params['funcID'];
    }
    this.cache
      .gridViewSetup('EbasicSalaries', 'grvEbasicSalaries')
      .subscribe((res) => {
        if (res) this.grvSetup = Util.camelizekeyObj(res);
      });
    this.user = this.auth.userValue;
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.list,
        sameData: true,
        active: true,
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
  }

  changeItemDetail(event) {
    this.itemSelected = event?.data;
  }

  clickMF(event, data) {
    console.log(event.functionID);

    switch (event.functionID) {
      // case 'SYS01':
      // break;
      case 'SYS02': //delete
        this.view.dataService.delete([data]).subscribe((res) => {});
        this.df.detectChanges();
        break;
      case 'SYS03': //edit
        this.handlerEBasicSalary(
          event.text + ' ' + this.view.function.description,
          'edit',
          data
        );
        this.df.detectChanges();
        break;
      case 'SYS04': //copy
        this.copyValue(event.text, data);
        this.df.detectChanges();
        break;

      case 'HRTPro03A03': //submit
        this.openUpdateStatus(data, event.functionID);
        this.df.detectChanges();
        break;
      case 'HRTPro03AU5': //approve
        this.openUpdateStatus(data, event.functionID);
        this.df.detectChanges();
        break;
      case 'HRTPro03AU3': //in-progress
        this.openUpdateStatus(data, event.functionID);
        this.df.detectChanges();
        break;
      case 'HRTPro03AU4': //reject
        this.openUpdateStatus(data, event.functionID);
        this.df.detectChanges();
        break;
      case 'HRTPro03AU0': //cancel
        this.openUpdateStatus(data, event.functionID);
        this.df.detectChanges();
        break;

      case 'SYS003':
        break;
      case 'SYS004':
        break;
      case 'SYS002':
        break;
    }
  }
  changeDataMF(event, data): void {
    this.hrService.handleShowHideMF(event, data, this.view);
  }
  

  //#region status update
  openUpdateStatus(data: any, funcID:  any) {
    this.hrService.handleUpdateRecordStatus(funcID, data);
    this.editStatusObj = data;
    this.currentEmpObj = data.emp;
    this.formGroup.patchValue(this.editStatusObj);
    this.dialogEditStatus = this.callfc.openForm(
      this.changeStatus,
      null,
      600,
      400,
      null,
      null
    );
    this.dialogEditStatus.closed.subscribe((res) => {
      // console.log('res sau khi update status', res);
      // if(res?.event){
      //   this.view.dataService.update(res.event[0]).subscribe((res) => {
      //   })
      // }
      this.df.detectChanges();
    });
  }

  closeUpdateStatusDialog(dialog: DialogRef) {
    dialog.close();
  }

  saveUpdateStatusDialog(){
    this.hrService.UpdateEmployeeBasicSalariesInfo(this.editStatusObj).subscribe(res =>{
      if(res){
        this.notify.notifyCode('SYS007');
        res[0].emp = this.currentEmpObj;
        //this.view.formModel.entityName
        this.hrService.addBGTrackLogEBasicSalaries(
          res[0].recID,
          this.cmtStatus,
          this.view.formModel.entityName,
          'C1',
          null
        ).subscribe((res) => {
          console.log('kq luu track log', res);
          
        });
        this.dialogEditStatus && this.dialogEditStatus.close(res)
      }
    })
  }

  ngAfterViewChecked(){
    if(!this.formGroup?.value){
      this.hrService.getFormGroup(this.view?.formModel?.formName, this.view?.formModel?.gridViewName).then((res) => {
        this.formGroup = res;
      });
    }
  }
  //#endregion
  

  //#region mf event handlers
  handlerEBasicSalary(headerText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.Width = '550px';
    option.FormModel = this.view.formModel;

    //open form
    let dialogAdd = this.callfc.openSide(
      PopupEBasicSalariesComponent,
      {
        //pass data
        actionType: actionType,
        dataObj: data,
        headerText: headerText,
        employeeId: data?.employeeID,
        funcID: this.view.funcID,
        salaryObj: data,
        fromListView: true,
      },
      option
    );

    //close form
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
        } else if (actionType == 'delete') {
          this.df.detectChanges();
        }
      }
      if (res?.event) this.view.dataService.clear();
    });
  }

  copyValue(actionHeaderText, data) {
    this.hrService.copy(data, this.view.formModel, 'RecID').subscribe((res) => {
      this.handlerEBasicSalary(
        actionHeaderText + ' ' + this.view.function.description,
        'copy',
        res
      );
    });
  }

  addBasicSalaries(event) {
    if (event.id == 'btnAdd') {
      this.view.dataService.addNew().subscribe((res) => {
        this.handlerEBasicSalary(
          event.text + ' ' + this.view.function.description,
          'add',
          null
        );
      });
    }
  }

  getIdUser(createdBy: any, owner: any) {
    var arr = [];
    if (createdBy) arr.push(createdBy);
    if (owner && createdBy != owner) arr.push(owner);
    return arr.join(';');
  }

  getDetailContract(event, data) {
    if (data) {
      this.itemDetail = data;
      this.df.detectChanges();
    }
  }

  clickEvent(event, data) {
    // this.popupUpdateEContractStatus(event?.event?.functionID , event?.data);
    this.clickMF(event?.event, event?.data);
  }

  // get file list
  getDataAsync(recId: string) {
    if (recId) {
      this.api
        .execSv(
          this.services,
          this.assemblyName,
          this.className,
          'GetFilesByIbjectIDAsync',
          recId
        )
        .subscribe((res: any) => {
          if (res.length > 0) {
            let files = res;
            files.map((e: any) => {
              if (e && e.referType == this.REFERTYPE.VIDEO) {
                e[
                  'srcVideo'
                ] = `${environment.apiUrl}/api/dm/filevideo/${e.recID}?access_token=${this.user.token}`;
              }
            });
            this.lstFile = res;
            //this.countData = res.length;
          }
        });
    }
  }

  openFiles(recID: string) {
    if (this.tmpListItem) {
      debugger;
      let option = new DialogModel();
      //if (this.zIndex > 0) option.zIndex = this.zIndex;
      let popup = this.callfc.openForm(
        this.tmpListItem,
        '',
        400,
        500,
        '',
        null,
        '',
        option
      );
      popup.closed.subscribe((res: any) => {
        if (res) {
          this.getDataAsync(recID);
        }
      });
    }
  }


  commentValueChange(event: any){
    this.cmtStatus = event.data;
  }
}
