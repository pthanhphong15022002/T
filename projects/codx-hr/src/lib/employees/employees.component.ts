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
import { CodxHrService } from 'projects/codx-hr/src/public-api';

import { PopupAddEmployeesComponent } from './popup-add-employees/popup-add-employees.component';
import { UpdateStatusComponent } from './update-status/update-status.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { HR_Employees } from '../codx-hr-common/model/HR_Employees.model';

@Component({
  selector: 'lib-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css'],
})
export class EmployeesComponent extends UIComponent {
  views: Array<ViewModel> = [];
  button?: ButtonModel[];
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
  // @Input() formModel: any;
  @ViewChild('cardTemp') cardTemp: TemplateRef<any>;
  @ViewChild('itemEmployee', { static: true }) itemEmployee: TemplateRef<any>;
  @ViewChild('itemContact', { static: true }) itemContact: TemplateRef<any>;
  @ViewChild('itemInfoPersonal', { static: true })
  itemInfoPersonal: TemplateRef<any>;
  @ViewChild('itemStatusName', { static: true })
  itemStatusName: TemplateRef<any>;
  //@ViewChild('itemAction', { static: true }) itemAction: TemplateRef<any>;
  @ViewChild('grid', { static: true }) grid: TemplateRef<any>;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('templateTree') templateTree: TemplateRef<any>;
  hideMF: boolean = false;
  formlabel: any = null;
  constructor(
    private injector: Injector,
    private notifiSV: NotificationsService,
    private df: ChangeDetectorRef,
    private shareService: CodxShareService,
    private hrService: CodxHrService,
  ) {
    super(injector);
  }

  onInit(): void {
    if (this.codxService.asideMode == '2') this.hideMF = true;
    this.router.params.subscribe((param: any) => {
      if (param) {
        let funcID = param['funcID'];
        if (funcID) {
          this.functionID = funcID;
          this.getSetup(funcID);
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.button = [
      {
        id: 'btnAdd',
      },
    ];
    this.columnsGrid = [
      {
        field: 'employeeID',
        controlName: 'EmployeeInfor',
        headerText: 'Nhân viên',
        width: 300,
        template: this.itemEmployee,
        formName: 'Employees',
      },
      {
        field: 'email',
        controlName: 'EmployeeContact',
        headerText: 'Liên hệ',
        width: 250,
        template: this.itemContact,
        formName: 'Employees',
      },
      {
        field: 'birthday',
        controlName: 'EmployeePersional',
        headerText: 'Thông tin cá nhân',
        width: 200,
        template: this.itemInfoPersonal,
        formName: 'Employees',
      },
      // {
      //   field: '',
      //   headerText: '',
      //   width: 30,
      //   template: this.itemAction,
      // },
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
          hideMoreFunc: true,
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
  changeDataMF(event: any) {
    event.forEach((element) => {
      if (element.functionID == 'HR0032') {
        element.disabled = true;
      }
    });
  }
  getSetup(functionID: string) {
    if (functionID) {
      this.cache.functionList(functionID).subscribe((func: any) => {
        if (func) {
          this.cache.formLabel(func.formName).subscribe((res) => {});
          this.cache
            .moreFunction(func.formName, func.gridViewName)
            .subscribe((res) => {
              if (res) {
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

  btnClick(event: any) {
    if (event?.text) {
      this.view.dataService
      .addNew()
      .subscribe((res: any) => {
        if (res) {
          let option = new SidebarModel();
          option.DataService = this.view.dataService;
          option.FormModel = this.view.formModel;
          option.Width = '800px';
          let object = {
            employee: res,
            isAdd: true,
            funcID: this.view.funcID,
            action: event.text,
          };
          let popup = this.callfc.openSide(PopupAddEmployeesComponent,object,option);
          popup.closed.subscribe((res: any) => {
            if (res?.event) {
              let data = res.event;
              this.hrService.getProvincesNameByProvincesName2Async(data.birthPlace).subscribe((res: any) => {
                if (res) {
                  data.birthPlaceName = res;
                  this.view.dataService.add(data, 0).subscribe();
                  this.detectorRef.detectChanges();
                }
              });
            }
          });
        }
      });
    }
  }

  clickMF(event: any, data: any) {
    if (!data) data = this.view?.dataService?.dataSelected;
    if (!data)
      data =
        this.view?.dataService?.data?.length > 0
          ? this.view?.dataService?.data[0]
          : null;
    if (event) {
      this.view.dataService.dataSelected = data;
      switch (event.functionID) {
        case 'SYS02': // xóa
          this.delete(data);
          break;
        case 'SYS03': // edit
          this.edit(event, data);
          break;
        case 'SYS04': // sao chép
          this.copy(event, data);
          break;
        case 'HR0031': // cập nhật tình trạng
          this.updateStatus(data, event.functionID);
          break;
        // case 'HR0032': // xem chi tiết
        //   this.viewEmployeeInfo(event.data, data);
        //   break;
        // case 'SYS002':
        //   this.exportFile();
        //   break;
        default:
          this.shareService.defaultMoreFunc(
            event,
            data,
            null,
            this.view.formModel,
            this.view.dataService,
            this
          );
          break;
      }
    }
  }

  //departmentname: "Trung tâm DXS"
  //orgunitID: "T02"
  //departmentID: "D08"
  //companyID: "C01"

  // edit
  edit(event: any, data: any) {
    if (event && data) {
      this.view.dataService.dataSelected = data;
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '800px';
      let object = {
        employee: data,
        isAdd: false,
        funcID: this.view.funcID,
        action: event.text,
      };
      let popup = this.callfc.openSide(
        PopupAddEmployeesComponent,
        object,
        option
      );
      popup.closed.subscribe((result) => {
        if (result?.event) {
          this.view.dataService.data = [];
          this.view.dataService.load().subscribe((temp) => {});
          // let dataUpdate = result.event;
          // this.view.dataService.update(dataUpdate).subscribe();
        }
      });
      this.detectorRef.detectChanges();
    }
  }

  copy(event: any, data: any) {
    if (event && data) {
      this.view.dataService.dataSelected = data;
      this.view.dataService.copy().subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = '800px';
        let object = {
          employee: res,
          isAdd: true,
          funcID: this.view.funcID,
          action: event.text,
        };
        let popup = this.callfc.openSide(
          PopupAddEmployeesComponent,
          object,
          option
        );
        popup.closed.subscribe((res: any) => {
          if (res?.event) {
            let data = res.event;
            this.view.dataService.add(data, 0).subscribe();
          }
        });
      });
      this.detectorRef.detectChanges();
    }
  }

  delete(data: any) {
    if(!data) return;
    this.view.dataService
      .delete([data], true, (option: any) => this.beforeDel(option))
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
        'OrganizationUnitsBusiness_Old',
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
    opt.service = 'HR';
    opt.assemblyName = 'ERM.Business.HR';
    opt.className = 'EmployeesBusiness_Old';
    opt.methodName = 'DeleteAsync';
    opt.data = this.view.dataService.dataSelected;
    return true;
  }

  selectedChange(val: any) {
    this.itemSelected = val.data;
    this.detectorRef.detectChanges();
  }

  // cập nhật tình trạng nhân viên
  updateStatus(data: any, funcID: string) {
    if(!data) return;
    let popup = this.callfc.openForm(
      UpdateStatusComponent,
      'Cập nhật tình trạng',
      350,
      200,
      funcID,
      data
    );
    popup.closed.subscribe((e) => {
      if (e?.event) {
        var emp = e.event;
        if (emp.status === '90') this.view.dataService.remove(emp).subscribe();
        else this.view.dataService.update(emp).subscribe();
      }
      this.detectorRef.detectChanges();
    });
  }

  // view emp infor
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
    // if (Array.isArray(this.listMoreFunc)){
    //   let _mFunc = this.listMoreFunc.find(x => x.functionID === "HR0032");
    //   if(_mFunc?.url){
    //     this.codxService.navigate('', _mFunc.url, {
    //       employeeID: data.employeeID,
    //     });
    //   }
    // }
  }

  placeholder(
    value: string,
    formModel: FormModel,
    field: string
  ): Observable<string> {
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
