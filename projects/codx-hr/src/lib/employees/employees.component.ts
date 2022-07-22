import { ChangeDetectorRef, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiHttpService, ButtonModel, CallFuncService, DialogRef, NotificationsService, RequestOption, SidebarModel, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { catchError, map, finalize, Observable, of } from 'rxjs';
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
  employee: HR_Employees = new HR_Employees();
  itemSelected: any;

  @Input() formModel: any;
  @ViewChild('cardTemp') cardTemp: TemplateRef<any>;
  @ViewChild('itemEmployee', { static: true }) itemEmployee: TemplateRef<any>;
  @ViewChild('itemContact', { static: true }) itemContact: TemplateRef<any>;
  @ViewChild('itemInfoPersonal', { static: true }) itemInfoPersonal: TemplateRef<any>;
  @ViewChild('itemStatusName', { static: true }) itemStatusName: TemplateRef<any>;
  @ViewChild('itemAction', { static: true }) itemAction: TemplateRef<any>;
  @ViewChild('view') view!: ViewsComponent;
  @ViewChild("grid", { static: true }) grid: TemplateRef<any>;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;

  constructor(
    private changedt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private notiService: NotificationsService,
    private api: ApiHttpService,
  ) {
  }

  ngOnInit(): void {
    this.button = {
      id: 'btnAdd',
    };
    this.columnsGrid = [
      { field: '', headerText: '', width: 20, template: this.itemAction },
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
        active: false,
        sameData: true,
        model: {
          panelLeftRef: this.panelLeftRef,
          resources: this.columnsGrid,
          // template: this.grid,
        }
      },
      {
        id: '2',
        type: ViewType.card,
        active: true,
        sameData: true,
        model: {
          panelLeftRef: this.panelLeftRef,
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
      option.Width = '800px';
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
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.edit(this.view.dataService.dataSelected).subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = '800px';
      this.dialog = this.callfunc.openSide(PopupAddEmployeesComponent, 'edit', option);
    });
  }

  copy(data) {
    // this.view.dataService.copy().subscribe((res: any) => {
    //   let option = new SidebarModel();
    //   option.DataService = this.view?.currentView?.dataService;
    //   option.FormModel = this.view?.currentView?.formModel;
    //   option.Width = '800px';
    //   this.view.dataService.dataSelected = data;
    //   this.dialog = this.callfunc.openSide(
    //     PopupAddEmployeesComponent,
    //     [this.view.dataService.dataSelected, 'copy'],
    //     option
    //   );
    // });

    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.copy(this.view.dataService.dataSelected).subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = '800px';
      this.dialog = this.callfunc.openSide(PopupAddEmployeesComponent, 'copy', option);
    });
  }

  delete(data: any) {
    this.view.dataService.dataSelected = data;
    this.view.dataService.delete([this.view.dataService.dataSelected], true, (opt,) =>
      this.beforeDel(opt)).subscribe((res) => {
        if (res[0]) {
          this.itemSelected = this.view.dataService.data[0];
        }
      }
      );
  }

  async onSelectionChanged($event) {
    await this.setEmployeePredicate($event.dataItem.orgUnitID);
    // this.employList.onChangeSearch();
  }

  setEmployeePredicate(orgUnitID): Promise<any> {
    return new Promise((resolve, reject) => {
      this
        .loadEOrgChartListChild(orgUnitID)
        .pipe()
        .subscribe((response) => {
          if (response) {
            var v = '';
            var p = '';
            for (let index = 0; index < response.length; index++) {
              const element = response[index];
              if (v != '') v = v + ';';
              if (p != '') p = p + '||';
              v = v + element;
              p = p + 'OrgUnitID==@' + index.toString();
            }
            // this.employList.predicate = p;
            // this.employList.dataValue = v;
          }
          resolve('');
        });
    });
  }

  loadEOrgChartListChild(orgUnitID): Observable<any> {
    return this.api
      .call(
        'ERM.Business.HR',
        'OrganizationUnitsBusiness',
        'GetOrgChartListChildAsync',
        orgUnitID
      )
      .pipe(
        map((data: any) => {
          if (data.error) return;
          return data.msgBodyData[0];
        }),
        catchError((err) => {
          return of(undefined);
        }),
        finalize(() => null)
      );
  }

  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeleteAsync';

    opt.data = itemSelected.taskGroupID;
    return true;
  }


  selectedChange(val: any) {
    this.itemSelected = val.data;
    this.changedt.detectChanges();
  }

  clickMF(e: any, data?: any) {
    switch (e.functionID) {
      // case 'add':
      //   this.add();
      //   break;
      case 'edit':
        this.edit(data);
        break;
      case 'copy':
        this.copy(data);
        break;
      case 'delete':
        this.delete(data);
        break;
    }
  }
}
