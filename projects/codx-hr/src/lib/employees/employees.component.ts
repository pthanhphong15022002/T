import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModel, CallFuncService, DialogRef, NotificationsService, RequestOption, SidebarModel, ViewModel, ViewsComponent, ViewType } from 'codx-core';
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
  itemSelected: any;
  
  @ViewChild('cardTemp') cardTemp: TemplateRef<any>;
  @ViewChild('itemEmployee', { static: true }) itemEmployee: TemplateRef<any>;
  @ViewChild('itemContact', { static: true }) itemContact: TemplateRef<any>;
  @ViewChild('itemInfoPersonal', { static: true }) itemInfoPersonal: TemplateRef<any>;
  @ViewChild('itemStatusName', { static: true }) itemStatusName: TemplateRef<any>;
  @ViewChild('itemAction', { static: true }) itemAction: TemplateRef<any>;
  @ViewChild('view') view!: ViewsComponent;
  @ViewChild("grid", { static: true }) grid: TemplateRef<any>;

  constructor(
    private changedt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private notiService: NotificationsService,
  ) {
   }

  ngOnInit(): void {
    this.button = {
      id: 'btnAdd',
    };
    this.columnsGrid = [
      // { field: '', headerText: '', width: 20, template: this.itemAction },
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
          // template: this.grid,
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
        this.add();
        break;
    }
  }

  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      // option.Width = '750px';
      this.dialog = this.callfunc.openSide(PopupAddEmployeesComponent, this.view.dataService.dataSelected, option);
      this.dialog.closed.subscribe(e => {
        console.log(e);
      })
    });
  }

  changeView(evt: any) { }

  requestEnded(evt: any) {
  }

  edit(data?) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view?.currentView?.dataService;
        option.FormModel = this.view?.currentView?.formModel;
        // option.Width = '750px';
        this.dialog = this.callfunc.openSide(
          PopupAddEmployeesComponent,
          [this.view.dataService.dataSelected, 'edit'],
          option
        );
      });
  }

  copy(data) {
    this.view.dataService.copy().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      // option.Width = '750px';
      this.view.dataService.dataSelected = data;
      this.dialog = this.callfunc.openSide(
        PopupAddEmployeesComponent,
        [this.view.dataService.dataSelected, 'copy'],
        option
      );
    });
  }

  delete(data: any) {
    this.view.dataService
    .delete([this.view.dataService.dataSelected], (opt) =>
      this.beforeDel(opt)
    )
    .subscribe((res) => {
      if (res[0]) {
        this.notiService.notifyCode('TM004');
      }
    });
  }

  beforeDel(opt: RequestOption) {
    opt.methodName = 'DeleteAsync';
    opt.data = this.itemSelected.taskID;
    return true;
  }

  selectedChange(val: any) {
    this.itemSelected = val.data;
    this.changedt.detectChanges();
  }

  clickMF(e: any, data?: any) {
    switch (e.functionID) {
      case 'add':
        this.add();
        break;
        case 'edit':
        this.copy(data);
        break;
      case 'edit':
        this.edit(data);
        break;
      case 'delete':
        // this.delete(data);
        break;
    }
  }
}
