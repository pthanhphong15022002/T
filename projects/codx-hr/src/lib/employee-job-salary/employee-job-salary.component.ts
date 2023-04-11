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


  clickMF(event, data): void {
    switch (event.functionID) {
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
      case 'SYS03':
        this.currentEmpObj = data;
        this.HandleEJobSalary(event.text + ' ' + this.view.function.description, 'edit', this.currentEmpObj);
        this.df.detectChanges();
        break;
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
  changeDataMF(event, data): void { }
}
