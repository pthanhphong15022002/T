import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  ApiHttpService,
  ButtonModel,
  CallFuncService,
  CodxService,
  DataRequest,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  SidebarModel,
  ViewModel,
  ViewsComponent,
  ViewType,
  CacheService,
} from 'codx-core';
import moment from 'moment';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { catchError, map, finalize, Observable, of } from 'rxjs';
import { CodxHrService } from '../codx-hr.service';
import { HR_Employees } from '../model/HR_Employees.model';
import { PopupAddEmployeesComponent } from './popup-add-employees/popup-add-employees.component';
import { UpdateStatusComponent } from './update-status/update-status.component';

@Component({
  selector: 'lib-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css'],
})
export class EmployeesComponent implements OnInit {
  views: Array<ViewModel> = [];
  button?: ButtonModel;
  columnsGrid = [];
  dialog!: DialogRef;
  currentEmployee: boolean = true;
  dataValue = '90';
  predicate = 'Status<@0';
  functionID: string;
  employee: HR_Employees = new HR_Employees();
  itemSelected: any;
  formModel: FormModel;

  // @Input() formModel: any;
  @ViewChild('cardTemp') cardTemp: TemplateRef<any>;
  @ViewChild('itemEmployee', { static: true }) itemEmployee: TemplateRef<any>;
  @ViewChild('itemContact', { static: true }) itemContact: TemplateRef<any>;
  @ViewChild('itemInfoPersonal', { static: true })
  itemInfoPersonal: TemplateRef<any>;
  @ViewChild('itemStatusName', { static: true })
  itemStatusName: TemplateRef<any>;
  @ViewChild('itemAction', { static: true }) itemAction: TemplateRef<any>;
  @ViewChild('view') view!: ViewsComponent;
  @ViewChild('grid', { static: true }) grid: TemplateRef<any>;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('view') codxView!: any;
  @ViewChild('templateTree') templateTree: TemplateRef<any>;
  employStatus: any;
  urlView: string;
  listMoreFunc = [];

  constructor(
    private changedt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private notiService: NotificationsService,
    private api: ApiHttpService,
    private cache: CacheService,
    private codxService: CodxService
  ) {
    this.cache.moreFunction('Employees', 'grvEmployees').subscribe((res) => {
      if (res) this.listMoreFunc = res;
    });
  }

  ngOnInit(): void {
    this.button = {
      id: 'btnAdd',
    };
    
  }

  ngAfterViewInit(): void {
    this.columnsGrid = [
      {
        field: 'employeeID',
        headerText: 'Nhân viên',
        width: 250,
        template: this.itemEmployee,
      },
      {
        field: 'email',
        headerText: 'Liên hệ',
        width: 250,
        template: this.itemContact,
      },
      {
        field: 'birthday',
        headerText: 'Thông tin cá nhân',
        width: 200,
        template: this.itemInfoPersonal,
      },
      {
        field: 'statusName',
        headerText: 'Tình trạng',
        width: 200,
        template: this.itemStatusName,
      },
      { field: '', 
        headerText: '', 
        width: 50, 
        template: this.itemAction
      },
    ];
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
        },
      },
      {
        id: '2',
        type: ViewType.card,
        active: true,
        sameData: true,
        model: {
          // resizable: true,
          // template: this.templateTree,
          // panelRightRef: this.cardTemp
          panelLeftRef: this.panelLeftRef,
          template: this.cardTemp,
        },
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
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '800px';
      this.dialog = this.callfunc.openSide(
        PopupAddEmployeesComponent,
        this.view.dataService.dataSelected,
        option
      );
      this.dialog.closed.subscribe((e) => {
        console.log(e);
        this.changedt.detectChanges();
      });
    });
  }

  senioritydate(value: string) {
    if (!value) {
      return value;
    }
    return moment(value).fromNow(true);
  }

  edit(data?) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = '800px';
        var dialog = this.callfunc.openSide(
          PopupAddEmployeesComponent,
          'edit',
          option
        );
        dialog.closed.subscribe((e) => {
          if (e?.event == null)
            this.view.dataService.delete(
              [this.view.dataService.dataSelected],
              false
            );
          if (e?.event && e?.event != null) {
            this.view.dataService
              .update(e.event.update.InfoPersonal)
              .subscribe();
            // this.view.dataService.update(e.event.update.Employees).subscribe();
            // e?.event.update.forEach((obj) => {
            //   this.view.dataService.update(obj).subscribe();
            // });
            this.changedt.detectChanges();
          }
        });
      });
    // this.changedt.detectChanges();
  }

  copy(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .copy(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = '800px';
        this.dialog = this.callfunc.openSide(
          PopupAddEmployeesComponent,
          'copy',
          option
        );
      });
    this.changedt.detectChanges();
  }

  delete(data: any) {
    if (data.status != '10') {
      this.notiService.notifyCode('E0760');
      return;
    }
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete(
        [this.view.dataService.dataSelected],
        true,
        (opt) => this.beforeDel(opt),
        'Thông báo'
      )
      .subscribe((res) => {
        if (res[0]) {
          this.itemSelected = this.view.dataService.data[0];
        }
      });
    this.changedt.detectChanges();
  }

  async onSelectionChanged($event) {
    await this.setEmployeePredicate($event.dataItem.orgUnitID);
    // this.employList.onChangeSearch();
  }

  setEmployeePredicate(orgUnitID): Promise<any> {
    return new Promise((resolve, reject) => {
      this.loadEOrgChartListChild(orgUnitID)
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
        //  e?.event.forEach((obj) => {
        var emp = e?.event;
        if (emp.status == '90') {
          this.view.dataService.remove(e?.event).subscribe();
        } else this.view.dataService.update(e?.event).subscribe();
        // });
        // this.itemSelected = e?.event;
      }
      this.changedt.detectChanges();
    });
  }

  viewEmployeeInfo(func, data) {
    if (func.url)
      this.codxService.navigate('', func.url, { employeeID: data.employeeID });
  }

  exportFile() {
    var gridModel = new DataRequest();
    gridModel.formName = this.view.formModel.formName;
    gridModel.entityName = this.view.formModel.entityName;
    gridModel.funcID = this.view.formModel.funcID;
    gridModel.gridViewName = this.view.formModel.gridViewName;
    gridModel.page = this.view.dataService.request.page;
    gridModel.pageSize = this.view.dataService.request.pageSize;
    gridModel.predicate = this.view.dataService.request.predicates;
    gridModel.dataValue = this.view.dataService.request.dataValues;
    gridModel.entityPermission = this.view.formModel.entityPer;
    gridModel.groupFields = 'createdBy';
    this.callfunc.openForm(
      CodxExportComponent,
      null,
      null,
      800,
      '',
      [gridModel, this.itemSelected.employeeID],
      null
    );
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
      case 'HR0031': /// cần biến cố định để truyền vào đây !!!!
        this.updateStatus(data);
        break;
      case 'HR0032':
        this.viewEmployeeInfo(e.data, data);
        break;
      case 'SYS002':
        this.exportFile();
        break;
    }
  }

  doubleClick(data) {
    if (this.listMoreFunc.length > 0) {
      this.listMoreFunc.forEach((obj) => {
        if (obj.functionID == 'HR0032') this.urlView = obj.url;
      });
      this.codxService.navigate('', this.urlView, {
        employeeID: data.employeeID,
      });
    }
  }

  placeholder(value: string,formModel: FormModel,field: string): Observable<string> {
    if (value) {
      return of(`<span>${value}</span>`);
    } else {
      return this.cache
        .gridViewSetup(formModel.formName, formModel.gridViewName)
        .pipe(
          map((datas) => {
            if (datas && datas[field]) {
              var gvSetup = datas[field];
              if (gvSetup) {
                if (!value) {
                  var headerText = gvSetup.headerText as string;
                  return `<span class="opacity-50">${headerText}</span>`;
                }
              }
            }
            return `<span class="opacity-50">${field}</span>`;
          })
        );
    }
  }
}
