import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CallFuncService, CodxService, DialogRef, NotificationsService, RequestOption, SidebarModel, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { CodxHrService } from '../codx-hr.service';
import { PopupAddEmployeesComponent } from '../employees/popup-add-employees/popup-add-employees.component';

@Component({
  selector: 'lib-employees-leave',
  templateUrl: './employees-leave.component.html',
  styleUrls: ['./employees-leave.component.css']
})
export class EmployeesLeaveComponent implements OnInit {
  views: Array<ViewModel> = [];
  columnsGrid = [];
  dataValue = "90";
  predicate = "Status=@0";
  currentEmployee: boolean = false;
  itemSelected: any;
  dialog!: DialogRef;
  urlDetail = '';

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
    private notiService: NotificationsService,
    private callfunc: CallFuncService,
    private codxService: CodxService,
    private hrService: CodxHrService,
  ) {
    this.hrService.getMoreFunction(['HRT04', null, null]).subscribe((res) => {
      if (res) {
        this.urlDetail = res[1].url;
      }
    });
  }

  ngOnInit(): void {
    this.columnsGrid = [
      { field: '', headerText: '', width: 40, template: this.itemAction },
      { field: 'employeeID', headerText: 'Nhân viên', width: 300, template: this.itemEmployee },
      { field: 'email', headerText: 'Liên hệ', width: 300, template: this.itemContact },
      { field: 'birthday', headerText: 'Thông tin cá nhân', width: 200, template: this.itemInfoPersonal },
      { field: 'statusName', headerText: 'Tình trạng', width: 200, template: this.itemStatusName },
    ];
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {
          resources: this.columnsGrid,
          // template: this.grid,
        }
      },
      {
        id: '2',
        type: ViewType.card,
        active: false,
        sameData: true,
        model: {
          template: this.cardTemp,
        }
      },

    ];
    this.changedt.detectChanges();
  }

  // delete(data: any) {
  // this.view.dataService
  //   .delete([this.view.dataService.dataSelected] ,true,(opt) =>
  //     this.beforeDel(opt)
  //   )
  //   .subscribe((res) => {
  //     if (res[0]) {
  //       this.notiService.notifyCode('TM004');
  //     }
  //   });
  // }

  // beforeDel(opt: RequestOption) {
  //   opt.methodName = 'DeleteAsync';
  //   opt.data = this.itemSelected.employeeID;
  //   return true;
  // }

  selectedChange(val: any) {
    this.itemSelected = val.data;
    this.changedt.detectChanges();
  }

  edit(data?) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.edit(this.view.dataService.dataSelected).subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '800px';
      this.dialog = this.callfunc.openSide(PopupAddEmployeesComponent, [this.view.dataService.dataSelected, 'edit'], option);
    });
    this.changedt.detectChanges();
  }

  clickMF(e: any, data?: any) {
    switch (e.functionID) {
      case 'SYS03':
        this.edit(data);
        break;
      case 'HR0032':
        this.viewEmployeeInfo(data);
        break;
    }
  }

  viewEmployeeInfo(data) {
    this.codxService.navigate('', this.urlDetail, { employeeID: data.employeeID });
  }

  requestEnded(event) { }
}
