import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ButtonModel, CallFuncService, DialogRef, SidebarModel, ViewModel, ViewsComponent, ViewType } from 'codx-core';
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
  ) { }

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
