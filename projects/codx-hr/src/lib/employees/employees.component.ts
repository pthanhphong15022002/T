import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModel, CallFuncService, DialogRef, SidebarModel, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { HR_Employees } from '../model/HR_Employees.model';
import { PopupAddEmployeesComponent } from './popup-add-employees/popup-add-employees.component';

@Component({
  selector: 'lib-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {
  views: Array<ViewModel> = [];
  button?: ButtonModel;
  columnsGrid = [];
  dialog!: DialogRef;
  currentEmployee: boolean = true;
  dataValue = "90";
  predicate = "Status<@0";
  functionID: string;
  employee:HR_Employees  = new HR_Employees();
  
  @ViewChild('cardTemp') cardTemp: TemplateRef<any>;
  @ViewChild('itemEmployee', { static: true }) itemEmployee: TemplateRef<any>;
  @ViewChild('itemContact', { static: true }) itemContact: TemplateRef<any>;
  @ViewChild('itemInfoPersonal', { static: true }) itemInfoPersonal: TemplateRef<any>;
  @ViewChild('itemStatusName', { static: true }) itemStatusName: TemplateRef<any>;
  @ViewChild('itemAction', { static: true }) itemAction: TemplateRef<any>;
  @ViewChild('view') view!: ViewsComponent;

  constructor(
    private changedt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private router: Router,
  ) {
    var arrPara = this.router.url.match(/[^/]+/g);
    var _class = arrPara && arrPara.length > 0 ? arrPara[2] : "employeeleave";
    if (_class.split("?").length > 0) {
      _class = _class.split("?")[0];
    }
    if (_class == "employee") {
      this.currentEmployee = true;
      this.predicate = "Status<@0";
      this.dataValue = "90";
      this.functionID == "HR003";
    } else {
      this.currentEmployee = false;
      this.predicate = "Status==@0";
      this.dataValue = "90";
      this.functionID == "HR004";
    }
   }

  ngOnInit(): void {
    this.button = {
      id: 'btnAdd',
    };
    this.columnsGrid = [
      { field: 'employeeID', headerText: 'Nhân viên', width: 300, template: this.itemEmployee },
      { field: 'email', headerText: 'Liên hệ', width: 200, template: this.itemContact },
      { field: 'birthday', headerText: 'Thông tin cá nhân', width: 200, template: this.itemInfoPersonal },
      { field: 'statusName', headerText: 'Tình trạng', width: 200, template: this.itemStatusName },
      { headerText: 'Hành động', width: 200, template: this.itemAction },
    ];
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.grid,
        active: true,
        sameData:true,
        model: {
          resources: this.columnsGrid,
        }
      },
      {
        id: '2',
        type: ViewType.card,
        active: true,
        sameData:true,
        model: {
          template: this.cardTemp,
        }
      },
     
    ];
    this.changedt.detectChanges();
  }

  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.show();
        break;
    }
  }

  show() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = '750px';
      this.dialog = this.callfunc.openSide(PopupAddEmployeesComponent, this.view.dataService.dataSelected, option);
      this.dialog.closed.subscribe(e => {
        console.log(e);
      })
    });
  }

  changeView(evt: any) { }

  requestEnded(evt: any) {
  }

  edit(data) {
    // this.beginEdit = true;
    // this.employee = data;
    // this.profilesv.employeeComponent =this;
    // this.dt.detectChanges();
    // this.viewBase.currentView.openSidebarRight(); 
    
    // this.view.dataService.dataSelected = data;
    // this.view.dataService.edit(this.view.dataService.dataSelected).subscribe((res: any) => {
    //   let option = new SidebarModel();
    //   option.DataService = this.view?.currentView?.dataService;
    //   option.FormModel = this.view?.currentView?.formModel;
    //   option.Width = '750px';
    //   this.dialog = this.callfunc.openSide(PopAddTaskgroupComponent, this.view.dataService.dataSelected, option);
    // });
  }
}
