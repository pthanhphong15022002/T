import { ChangeDetectorRef, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiHttpService, ButtonModel, CallFuncService, CodxService, DialogRef, NotificationsService, RequestOption, SidebarModel, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import moment from 'moment';
import { catchError, map, finalize, Observable, of } from 'rxjs';
import { CodxHrService } from '../codx-hr.service';
import { HR_Employees } from '../model/HR_Employees.model';
import { PopupAddEmployeesComponent } from './popup-add-employees/popup-add-employees.component';
import { UpdateStatusComponent } from './update-status/update-status.component';

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
  urlDetail = '';

  // @Input() formModel: any;
  @ViewChild('cardTemp') cardTemp: TemplateRef<any>;
  @ViewChild('itemEmployee', { static: true }) itemEmployee: TemplateRef<any>;
  @ViewChild('itemContact', { static: true }) itemContact: TemplateRef<any>;
  @ViewChild('itemInfoPersonal', { static: true }) itemInfoPersonal: TemplateRef<any>;
  @ViewChild('itemStatusName', { static: true }) itemStatusName: TemplateRef<any>;
  @ViewChild('itemAction', { static: true }) itemAction: TemplateRef<any>;
  @ViewChild('view') view!: ViewsComponent;
  @ViewChild("grid", { static: true }) grid: TemplateRef<any>;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('view') codxView!: any;
  employStatus: any;

  constructor(
    private changedt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private notiService: NotificationsService,
    private api: ApiHttpService,
    private df: ChangeDetectorRef,
    private codxService: CodxService,
    private hrService: CodxHrService,
  ) {
    this.hrService.getMoreFunction(['HRT03', null, null]).subscribe((res) => {
      if (res) {
        this.urlDetail = res[1].url;
      }
    });
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
    this.view.dataService.methodUpdate = 'UpdateAsync';
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
      option.FormModel = this.view?.formModel;
      option.Width = '800px';
      this.dialog = this.callfunc.openSide(PopupAddEmployeesComponent, this.view.dataService.dataSelected, option);
      this.dialog.closed.subscribe(e => {
        console.log(e);
      })
    });
  }

  senioritydate(value: string) {
    if (!value) {
      return value;
    }
    return moment(value).fromNow(true);
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
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '800px';
      this.dialog = this.callfunc.openSide(PopupAddEmployeesComponent, 'edit', option);
    });
  }

  copy(data) {
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
      this.df.detectChanges();
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
    opt.className = 'EmployeesBusiness';
    opt.data = itemSelected.employeeID;
    return true;
  }


  selectedChange(val: any) {
    this.itemSelected = val.data;
    this.changedt.detectChanges();
  }

  updateStatus(data) {
    this.dialog = this.callfunc.openForm(
      UpdateStatusComponent,
      'Cập nhật tình trạng',
      350,
      200,
      '',
      data
    );
    this.dialog.closed.subscribe((e) => {
      if (e?.event && e?.event != null) {
        e?.event.forEach((obj) => {
          this.view.dataService.update(obj).subscribe();
        });
        this.itemSelected = e?.event[0];
      }
      this.df.detectChanges();
    });
  }

  viewEmployeeInfo(data) {
    this.codxService.navigate('', this.urlDetail, { employeeID: data.employeeID });
  }

  clickMF(e: any, data?: any) {
    this.itemSelected = data;
    switch (e.functionID) {
      case 'SYS01':
        this.add();
        break;
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
      case 'HR0031':   /// cần biến cố định để truyền vào đây !!!!
        this.updateStatus(data);
        break;
      case 'HR0032':
        this.viewEmployeeInfo(data);
        break;
    }
  }
}
