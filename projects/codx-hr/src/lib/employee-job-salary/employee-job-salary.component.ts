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
  SidebarModel,
  UIComponent,
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


  HandleEContractInfo(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.Width = '550px';
    option.FormModel = this.view.formModel; 

    let dialogAdd = this.callfc.openSide(
      PopupEmployeeJobsalaryComponent,
      {
        actionType: actionType,
        empObj: actionType == 'add' ? null: this.currentEmpObj,
        headerText:
          actionHeaderText,
        funcID: this.view.funcID,
        dataObj: data,
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if (res.event) {
        if(actionType == 'add'){
          console.log('moi add hop dong xong', res.event[0]);
          this.view.dataService.add(res.event[0],0).subscribe((res) => {
          });
          this.df.detectChanges();
        }
        else if(actionType == 'copy'){
          this.view.dataService.add(res.event[0],0).subscribe((res) => {
          });
          this.df.detectChanges();
        }
        else if(actionType == 'edit'){
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
      this.HandleEContractInfo(event.text + ' ' + this.view.function.description, 'add', null);
    }
  }

  changeItemDetail(event) {
    // console.log(event);
  }
  clickMF(event, data): void { }
  changeDataMF(event, data): void { }
}
