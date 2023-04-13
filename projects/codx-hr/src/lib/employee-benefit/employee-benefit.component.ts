import {
  Component,
  Injector,
  ChangeDetectorRef,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ButtonModel, 
  RequestOption,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxHrService } from '../codx-hr.service';
import { ActivatedRoute } from '@angular/router';
import { PopupEmployeeBenefitComponent } from './popup-employee-benefit/popup-employee-benefit.component';


@Component({
  selector: 'lib-employee-benefit',
  templateUrl: './employee-benefit.component.html',
  styleUrls: ['./employee-benefit.component.css']
})
export class EmployeeBenefitComponent extends UIComponent{
  console = console;
  @ViewChild('templateList') itemTemplate?: TemplateRef<any>;
  @ViewChild('headerTemplate') headerTemplate?: TemplateRef<any>;

  //Get data
  views: Array<ViewModel> = [];
  funcID: string;
  method = 'GetEBenefitListAsync';
  eContractHeaderText;
  grvSetup: any;
  buttonAdd: ButtonModel = {
    id: 'btnAdd',
    text: 'Thêm',
  };

  //Object data 
  currentEmpObj: any = null;

  constructor(
    inject: Injector,
    private hrService: CodxHrService,
    private activedRouter: ActivatedRoute,
    private df: ChangeDetectorRef,
  ) {
    super(inject);
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }


  onInit(): void {
    if (!this.funcID) {
      this.funcID = this.activedRouter.snapshot.params['funcID'];
    }
  }

  
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.list,
        active: true,
        sameData: true,
        model: {
          template: this.itemTemplate,
          headerTemplate: this.headerTemplate,
        },
      },
    ];
  }

    //Call api delete
    beforeDelete(opt: RequestOption, data) {
      opt.methodName = 'DeleteEBenefitAsync';
      opt.className = 'EBenefitsBusiness';
      opt.assemblyName = 'HR';
      opt.service = 'HR';
      opt.data = data;
      return true;
    }

  
  clickMF(event, data): void {
    switch (event.functionID) {
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
      // case 'SYS03':
      //   this.currentEmpObj = data;
      //   this.HandleEJobSalary(
      //     event.text + ' ' + this.view.function.description,
      //     'edit',
      //     this.currentEmpObj
      //   );
      //   this.df.detectChanges();
      //   break;
      //Copy
      // case 'SYS04':
      //   this.currentEmpObj = data;
      //   this.copyValue(event.text, this.currentEmpObj);
      //   this.df.detectChanges();
      //   break;
    }
  }

  changeDataMF(event, data): void {
    this.hrService.handleShowHideMF(event, data, this.view);
   }


  //Open, push data to modal
  HandleEBenefit(actionHeaderText, actionType: string, data: any) {
    let option = new SidebarModel();
    option.Width = '550px';
    option.FormModel = this.view.formModel;

    let dialogAdd = this.callfc.openSide(
      PopupEmployeeBenefitComponent,
      {
        actionType: actionType,
        empObj: actionType == 'add' ? null : this.currentEmpObj,
        headerText: actionHeaderText,
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

  addBenefit(event): void {
    if (event.id == 'btnAdd') {
      this.HandleEBenefit(
        event.text + ' ' + this.view.function.description,
        'add',
        null
      );
    }
  }
}
