import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormModel, CodxGridviewV2Component, CacheService, ApiHttpService, ImageViewerComponent, RequestOption, CRUDService, SidebarModel, CallFuncService, CodxService } from 'codx-core';
import { PopupAddEmployeeComponent } from '../popup/popup-add-employee/popup-add-employee.component';
import { PopupUpdateStatusComponent } from '../popup-update-status/popup-update-status.component';

@Component({
  selector: 'lib-employee-list-by-org',
  templateUrl: './employee-list-by-org.component.html',
  styleUrls: ['./employee-list-by-org.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EmployeeListByOrgComponent {
  @Input() orgUnitID: string = '';
  @Input() formModel: FormModel = null;
  @Input() showManager: boolean = false;
  @Input() view: any;
  @Input() grvSetup: any;
  @Input() editable: boolean = false;
  @Input() modeView: string = 'employee';
  @Input() rowHeight: string = '50';
  @Input() showRowNumber: boolean = false;
  @Input() funcID: string = 'HRT03a1';
  @Output() dataChange: EventEmitter<any> = new EventEmitter();
  totalEmployee: number = 0;
  sysMoreFunc: any[] = [];
  columnsGrid;
  columnsGridContact;
  manager: any = null;
  @ViewChild('grid') grid: CodxGridviewV2Component;
  @ViewChild('templateName') templateName: TemplateRef<any>;
  @ViewChild('templateBirthday') templateBirthday: TemplateRef<any>;
  @ViewChild('templatePhone') templatePhone: TemplateRef<any>;
  @ViewChild('templateEmail') templateEmail: TemplateRef<any>;
  @ViewChild('templateJoinedOn') templateJoinedOn: TemplateRef<any>;
  @ViewChild('templateStatus') templateStatus: TemplateRef<any>;
  @ViewChild('templateMoreFC') templateMoreFC: TemplateRef<any>;
  @ViewChild('empAvatar') empAvatar: ImageViewerComponent;


  @ViewChild('colEmployeeHeader') colEmployeeHeader: TemplateRef<any>;
  @ViewChild('colContactHeader') colContactHeader: TemplateRef<any>;
  @ViewChild('colPersonalHeader') colPersonalHeader: TemplateRef<any>;
  @ViewChild('colStatusHeader') colStatusHeader: TemplateRef<any>;
  @ViewChild('colEmployee') colEmployee: TemplateRef<any>;
  @ViewChild('colContact') colContact: TemplateRef<any>;
  @ViewChild('colPersonal') colPersonal: TemplateRef<any>;
  @ViewChild('colStatus') colStatus: TemplateRef<any>;

  service = 'HR';
  entityName = 'HR_Employees';
  assemblyName = 'ERM.Business.HR';
  className = 'EmployeesBusiness';
  method = 'GetEmployeeListByOrgUnitIDGridView';
  idField = 'employeeID';
  predicates = '@0.Contains(OrgUnitID)';
  funcIDEmpInfor: string = 'HRT03b';
  itemSelected;
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private callfc: CallFuncService,
    private codxService: CodxService) { }

  ngOnInit(): void {
    // get more funtion hệ thống
    this.cache.moreFunction('CoDXSystem', '').subscribe((mFuc: any) => {
      if (mFuc) this.sysMoreFunc = mFuc;
    });
  }
  ngAfterViewInit(): void {
    if (this.grvSetup) {
      this.initColumnGrid();
    } else {
      this.cache.gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
        .subscribe((res: any) => {
          if (res) {
            this.grvSetup = res;
            this.initColumnGrid();
          }
        });
    }
  }
  initColumnGrid() {
    switch (this.modeView) {
      case 'contact':
        this.columnsGrid = [
          {
            headerText: this.grvSetup['EmployeeName']['headerText'],
            field: 'EmployeeName',
            template: this.templateName,
            width: '200',
          },
          {
            headerText: this.grvSetup['Birthday']['headerText'],
            field: 'Birthday',
            template: this.templateBirthday,
            width: '100',
          },
          {
            headerText: this.grvSetup['Phone']['headerText'],
            field: 'Phone',
            template: this.templatePhone,
            width: '140',
          },
          {
            headerText: this.grvSetup['Email']['headerText'],
            field: 'Email',
            template: this.templateEmail,
            width: '200',
          },
          {
            headerText: this.grvSetup['JoinedOn']['headerText'],
            field: 'JoinedOn',
            template: this.templateJoinedOn,
            width: '100',
          },
          {
            headerText: this.grvSetup['Status']['headerText'],
            field: 'Status',
            template: this.templateStatus,
            width: '100',
          },
        ];
        break;
      case 'employee':
        this.columnsGrid = [
          {
            headerTemplate: this.colEmployeeHeader,
            template: this.colEmployee,
            width: '200',
          },
          {
            headerTemplate: this.colContactHeader,
            template: this.colContact,
            width: '150',
          },
          {
            headerTemplate: this.colPersonalHeader,
            template: this.colPersonal,
            width: '150',
          },
          {
            headerTemplate: this.colStatusHeader,
            template: this.colStatus,
            width: '150',
          },
        ];
        break;
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.orgUnitID = changes.orgUnitID.currentValue;
    if (this.showManager) {
      this.getManager(this.orgUnitID);
      //this.empAvatar.refreshAvatar();
    }
    let ins = setInterval(() => {
      if (this.grid) {
        this.grid.dataService.rowCount = 0;
        clearInterval(ins);
        this.grid.refresh();
      }
    }, 200);
  }

  getManager(orgUnitID: string) {
    if (orgUnitID) {
      this.api.execSv('HR', 'ERM.Business.HR', 'EmployeesBusiness', 'GetOrgManager', [orgUnitID])
        .subscribe((res: any) => {
          if (res) {
            this.manager = JSON.parse(JSON.stringify(res));
          } else {
            this.manager = null;
          }
          this.dt.detectChanges();
        });
    }
  }

  clickMF(moreFunc: any, data: any) {
    this.itemSelected = data;
    switch (moreFunc.functionID) {
      case 'SYS02': // xóa
        this.delete(data);
        break;
      case 'SYS03': // sửa
        this.edit(data, moreFunc);
        break;
      case 'SYS04': // sao chép
        this.copy(data, moreFunc);
        break;
      case 'HRT03a1A07': // cập nhật tình trạng
        this.updateStatus(data, moreFunc.functionID);
        break;
      case 'HR0032': // xem chi tiết
        break;
      case 'SYS002':
        // this.exportFile();
        break;
    }
  }

  delete(data: any) {
    if (data) {
      this.view.dataService
        .delete([data], true, (opt: any) => this.beforDelete(opt, data))
        .subscribe(res => {
          if (res) {
            let ins = setInterval(() => {
              if (this.grid) {
                //this.grid.dataService.rowCount = 0;
                clearInterval(ins);
                this.grid.deleteRow(data, true);
                this.grid.dataService.rowCount = this.grid.dataService.rowCount - 1;
                this.dataChange.emit({ data: res, actionType: 'delete', hasDataChanged: true });
              }
            }, 200);
          }
        });
    }
  }
  beforDelete(option: RequestOption, employee: any) {
    option.service = 'HR';
    option.assemblyName = 'ERM.Business.HR';
    option.className = 'EmployeesBusiness';
    option.methodName = 'DeleteAsync';
    option.data = employee;
    return true;
  }
  // coppy employee
  copy(data: any, moreFunc: any) {
    if (data) {
      if (!moreFunc)
        moreFunc = this.sysMoreFunc.find((x) => x.functionID == 'SYS04');
      this.api
        .execSv('HR', 'ERM.Business.HR', 'EmployeesBusiness', 'GetEmployeeInfoByIDAsync', [data.employeeID]).subscribe(res => {
          this.view.dataService.dataSelected = res ? res : this.itemSelected;
          this.view.dataService.copy().subscribe((res: any) => {
            let option = new SidebarModel();
            option.DataService = this.view.dataService;
            option.FormModel = this.view.formModel;
            option.Width = '800px';
            let popup = this.callfc.openSide(
              PopupAddEmployeeComponent,
              {
                action: 'copy',
                text: moreFunc.defaultName ?? moreFunc.text,
                data: res,
              },
              option
            );
            popup.closed.subscribe((e) => {
              if (e.event) {
                if (e.event.orgUnitID === this.orgUnitID) {
                  if (this.showManager)
                    this.getManager(this.orgUnitID);
                  this.grid.addRow(e.event, 0, true);
                  //this.grid.refresh();
                } else {
                  (this.view.dataService as CRUDService).add(e.event).subscribe();
                }
                this.dataChange.emit({ data: e.event, actionType: 'copy', hasDataChanged: true });
              }
            });
          });

        })

    }
  }

  //edit Employee
  edit(data: any, moreFunc: any) {
    if (data) {
      let index = this.grid.dataService.data.findIndex(
        (p) => p.employeeID == data.employeeID
      );
      if (!moreFunc)
        moreFunc = this.sysMoreFunc.find((x) => x.functionID == 'SYS03');
      this.view.dataService.edit(data).subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = '800px';
        var dialog = this.callfc.openSide(
          PopupAddEmployeeComponent,
          {
            action: 'edit',
            text: moreFunc.defaultName ?? moreFunc.text,
            data: res,
          },
          option
        );
        dialog.closed.subscribe((e) => {
          if (e.event) {
            if (e.event?.employeeID === this.manager?.employeeID) {
              if (e.event?.positionID === this.manager?.positionID
                || e.event?.orgUnitID === this.manager?.orgUnitID) {
                this.getManager(this.orgUnitID);
              } else {
                this.manager.employeeName = e.event?.employeeName;
                this.manager.phone = e.event?.phone;
                this.manager.mobile = e.event?.mobile;
              }
            }
            if (e.event.orgUnitID === this.orgUnitID) {
              if (this.showManager)
                this.getManager(this.orgUnitID);
              //this.grid.updateRow(index,e.event, true);
              this.grid.refresh();
            } else {
              (this.view.dataService as CRUDService).add(e.event).subscribe();
            }
            this.dataChange.emit({ data: e.event, oldData: data, actionType: 'edit', hasDataChanged: true });
          }
        });
      });
    }
  }
  clickViewEmpInfo(data: any) {
    this.cache.functionList(this.funcIDEmpInfor).subscribe((func) => {
      let queryParams = {
        employeeID: data.employeeID,
        page: this.view.dataService.page,
        totalPage: this.view.dataService.pageCount,
      };
      let state = {
        data: this.view.dataService.data.map(function (obj) {
          return { EmployeeID: obj.employeeID };
        }),
        request: this.view.dataService.request,
      };
      this.codxService.navigate('', func?.url, queryParams, state, true);
    });
  }
  updateStatus(data: any, funcID: string) {
    let popup = this.callfc.openForm(
      PopupUpdateStatusComponent,
      'Cập nhật tình trạng',
      350,
      200,
      funcID,
      data
    );
    popup.closed.subscribe((e) => {
      if (e?.event) {
        var emp = e.event;
        if (emp.status === '90') {
          let ins = setInterval(() => {
            if (this.grid) {
              //this.grid.dataService.rowCount = 0;
              clearInterval(ins);
              this.grid.deleteRow(data, true);
              this.grid.dataService.rowCount = this.grid.dataService.rowCount - 1;
            }
          }, 200);
        }
        //else this.view.dataService.update(emp).subscribe();
        this.dataChange.emit({ data: emp, actionType: 'edit', hasDataChanged: true });
      }
    });
  }
}
