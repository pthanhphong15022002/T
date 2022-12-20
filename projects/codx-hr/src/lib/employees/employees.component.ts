import {
  ChangeDetectorRef,
  Component,
  Injector,
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
  UIComponent,
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
export class EmployeesComponent extends UIComponent {
  views: Array<ViewModel> = [];
  button?: ButtonModel;
  columnsGrid = [];
  dialog!: DialogRef;
  currentEmployee: boolean = true;
  dataValue = '90';
  predicate = 'Status < @0';
  functionID: string;
  employee: HR_Employees = new HR_Employees();
  itemSelected: any;
  employStatus: any;
  urlView: string;
  listMoreFunc = [];
  functionName:string = "";

  // @Input() formModel: any;
  @ViewChild('cardTemp') cardTemp: TemplateRef<any>;
  @ViewChild('itemEmployee', { static: true }) itemEmployee: TemplateRef<any>;
  @ViewChild('itemContact', { static: true }) itemContact: TemplateRef<any>;
  @ViewChild('itemInfoPersonal', { static: true }) itemInfoPersonal: TemplateRef<any>;
  @ViewChild('itemStatusName', { static: true }) itemStatusName: TemplateRef<any>;
  @ViewChild('itemAction', { static: true }) itemAction: TemplateRef<any>;
  @ViewChild('grid', { static: true }) grid: TemplateRef<any>;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('templateTree') templateTree: TemplateRef<any>;


  constructor(
    private injector: Injector,
    private notifiSV: NotificationsService,
  ) {
    super(injector);

  }
  onInit(): void {
    this.router.params.subscribe((param:any) =>{
      if(param){
        let funcID = param["funcID"];
        if(funcID)
        {
          this.functionID = funcID;
          this.getSetup(funcID);
        }
      }
    })
  }

  ngAfterViewInit(): void {
    this.button = {
      id: 'btnAdd',
    };
    this.columnsGrid = [
      {
        field: 'employeeID',
        headerText: 'Nhân viên',
        width: 300,
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
      {
        field: '',
        headerText: '',
        width: 30,
        template: this.itemAction
      },
    ];
    this.views = [
      {
        id: '1',
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {
          panelLeftRef: this.panelLeftRef,
          resources: this.columnsGrid,
        },
      },
      // {
      //   id: '2',
      //   type: ViewType.card,
      //   active: false,
      //   sameData: true,
      //   model: {
      //     panelLeftRef: this.panelLeftRef,
      //     template: this.cardTemp,
      //   },
      // },
    ];
    this.view.dataService.methodUpdate = 'UpdateAsync';
    this.detectorRef.detectChanges();
  }

  getSetup(functionID:string){
    if(functionID){
      this.cache.functionList(functionID).subscribe((func:any) => {
        if(func)
        {
          this.functionName = func.description;
          this.cache.moreFunction(func.formName, func.gridViewName).subscribe((res) => {
            if (res) 
            {
              this.listMoreFunc = res;
            }
          });
        }
      });
    }
  }

  senioritydate(value: string) {
    if (!value) {
      return value;
    }
    return moment(value).fromNow(true);
  }

  btnClick(event:any) {
    if (event?.text) 
    {
      this.view.dataService.addNew().subscribe((res:any) => {
        if(res){
          let option = new SidebarModel();
          option.DataService = this.view.dataService;
          option.FormModel = this.view.formModel;
          option.Width = '800px';
          let object = {
            employee:res,
            action:"add",
            title: `${event.text}  ${this.functionName}` 
          };
          debugger
          let popup = this.callfc.openSide(
            PopupAddEmployeesComponent,
            object,
            option
          );
          popup.closed.subscribe((res: any) => {
            if (res?.event) {
              let data = res.event;
              this.view.dataService.add(data, 0).subscribe();
              this.detectorRef.detectChanges();
            }
          });
        }
      });
    }
  }

  
  clickMF(event: any, data: any) {
    if(event && data){
      this.view.dataService.dataSelected = data;
      switch (event.functionID) {
        case 'SYS02': // xóa
          this.delete(data);
          break;
        case 'SYS03': // edit
          this.edit(event,data);
          break;
        case 'SYS04': // sao chép
          this.copy(event,data);
          break;
        case 'HR0031': // cập nhật tình trạng
          this.updateStatus(data, event.functionID);
          break;
        case 'HR0032': // xem chi tiết
          this.viewEmployeeInfo(event.data, data);
          break;
        case 'SYS002':
          this.exportFile();
          break;
      }
    }
  }
  edit(event:any,data:any) {
    if (event && data) 
    {
      this.view.dataService.dataSelected = data;
      this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width = '800px';
        let object = {
          employee:data,
          action:"edit",
          title: `${event.text}  ${this.functionName}` 
        };
        let popup = this.callfc.openSide(
          PopupAddEmployeesComponent,
          object,
          option
        );
        popup.closed.subscribe((result) => {
          if (result?.event) 
          {
            let dataUpdate = result.event;
            this.view.dataService
              .update(dataUpdate)
              .subscribe();
          }
        });
      });
    }
    
  }

  copy(event:any,data:any) {
    if (event && data)
    {
      this.view.dataService.dataSelected = data;
      this.view.dataService
        .copy(0)
        .subscribe((res: any) => {
          let option = new SidebarModel();
          option.DataService = this.view?.dataService;
          option.FormModel = this.view?.formModel;
          option.Width = '800px';
          let object = {
            employee:res,
            action:"copy",
            title: `${event.text}  ${this.functionName}` 
          };
          debugger
          let popup = this.callfc.openSide(
            PopupAddEmployeesComponent,
            object,
            option
          );
        });
      this.detectorRef.detectChanges();
    }
  }

  delete(data:any) 
  {
    this.view.dataService
      .delete([data],true,(option:any) => this.beforeDel(option),null,null,null,null,false)
      .subscribe();
    this.detectorRef.detectChanges();
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
    debugger
    opt.service = "HR";
    opt.assemblyName = "ERM.Business.HR";
    opt.className = 'EmployeesBusiness';
    opt.methodName = 'DeleteAsync';
    opt.data = this.view.dataService.dataSelected.employeeID;
    return true;
  }

  selectedChange(val: any) {
    this.itemSelected = val.data;
    this.detectorRef.detectChanges();
  }

  updateStatus(data: any, funcID: string) {
    let popup = this.callfc.openForm(UpdateStatusComponent, 'Cập nhật tình trạng', 350, 200, funcID, data);
    popup.closed.subscribe((e) => {
      if (e?.event) {
        var emp = e.event;
        if (emp.status == '90') {
          this.view.dataService.remove(emp).subscribe();
        }
        else this.view.dataService.update(emp).subscribe();
      }
      this.detectorRef.detectChanges();
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
    this.callfc.openForm(
      CodxExportComponent,
      null,
      null,
      800,
      '',
      [gridModel, this.itemSelected.employeeID],
      null
    );
  }

  

  doubleClick(data) {
    // this.codxService.navigate('HRT0301', '', {employeeID: data.employeeID});
    debugger
    if (this.listMoreFunc.length > 0) {
      this.listMoreFunc.forEach((obj) => {
        if (obj.functionID == 'HR0032') this.urlView = obj.url;
      });
      this.codxService.navigate('', this.urlView, {
        employeeID: data.employeeID,
      });
    }
  }

  placeholder(value: string, formModel: FormModel, field: string): Observable<string> {
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
