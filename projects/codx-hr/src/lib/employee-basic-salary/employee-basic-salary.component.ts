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
  ButtonModel,
  DataService,
  FormModel,
  NotificationsService,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxHrService } from '../codx-hr.service';
import { ActivatedRoute } from '@angular/router';
import { PopupEBasicSalariesComponent } from '../employee-profile/popup-ebasic-salaries/popup-ebasic-salaries.component';

@Component({
  selector: 'lib-employee-basic-salary',
  templateUrl: './employee-basic-salary.component.html',
  styleUrls: ['./employee-basic-salary.component.css'],
})
export class EmployeeBasicSalaryComponent extends UIComponent {
  //#region view
  @ViewChild('templateList') templateList?: TemplateRef<any>;
  @ViewChild('headerTemplate') headerTemplate?: TemplateRef<any>;
  //#endregion

  views: Array<ViewModel> = [];
  funcID: string;
  method = 'GetListEBasicSalariesAsync';
  buttonAdd: ButtonModel = {
    id: 'btnAdd',
    text: 'Thêm',
  };
  eContractHeaderText;
  eBasicSalariesFormModel: FormModel;
  currentEbasicSalaryDta: any;
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
  addBasicSalaries(event){
    if(event.id == 'btnAdd'){
      this.handlerEBasicSalary(event.text + ' ' + this.view.function.description,'add',null);
    }
  }
  changeItemDetail(event) {
    console.log(event);
  }
  clickMF(event, data) {
    debugger
    switch (event.functionID){
      // case 'SYS01':
        // break;
      case 'SYS02':
        this.view.dataService.delete([data]);
        break;
      case 'SYS03':
        this.currentEbasicSalaryDta = data;
        this.handlerEBasicSalary(event.text + ' ' + this.view.function.description, 'edit', this.currentEbasicSalaryDta);
        this.df.detectChanges();
        break;
      case 'SYS04':
        this.currentEbasicSalaryDta = data;
        this.handlerEBasicSalary(event.text + ' ' + this.view.function.description,'copy',this.currentEbasicSalaryDta);
        this.df.detectChanges();
        break;
    }
  }
  changeDataMF(event, data): void {}
  handlerEBasicSalary(headerText ,actionType: string, data: any) {
    let option = new SidebarModel();
    option.Width = '800px';
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
        if(actionType == 'add'){
          // this.view.dataService.add(res.event[0],0)
          this.df.detectChanges();
        }
        else if(actionType == 'copy'){
          // this.view.dataService.add(res.event[0],0);
          this.df.detectChanges();
        }
        else if(actionType == 'edit'){
          // this.view.dataService.update(res.event[0]);
          this.df.detectChanges();
        }
        else if(actionType == 'delete'){
          this.df.detectChanges();
        }
      }
      if (res?.event) this.view.dataService.clear();
    });
  }
}
