import { forkJoin } from 'rxjs';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormModel, CodxGridviewV2Component, CacheService, ApiHttpService, ImageViewerComponent, RequestOption, CRUDService, SidebarModel, CallFuncService, CodxService } from 'codx-core';
import { PopupAddEmployeeComponent } from '../popup/popup-add-employee/popup-add-employee.component';
import { PopupUpdateStatusComponent } from '../popup/popup-update-status/popup-update-status.component';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';

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
  @Input() showRowNumber: boolean = true;
  @Input() funcID: string = 'HRT03a1';
  @Output() dataChange: EventEmitter<any> = new EventEmitter();
  @Output() gridViewDataService: EventEmitter<any> = new EventEmitter();
  totalEmployee: number = 0;
  sysMoreFunc: any[] = [];
  columnsGrid: any[];
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
  className = 'EmployeesBusiness_Old';
  method = 'GetEmployeeListByOrgUnitIDGridView';
  idField = 'employeeID';
  predicates = '@0.Contains(OrgUnitID)';
  funcIDEmpInfor: string = 'HRT03b';
  itemSelected;
  hadEmitDataService = false;
  inputTimes = 0;
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private callfc: CallFuncService,
    private shareService: CodxShareService,
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
    if (this.grid && this.editable) {
      this.gridViewDataService.emit(this.grid.dataService);
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
    if(changes.orgUnitID.currentValue){
      this.orgUnitID = changes.orgUnitID.currentValue;
      if (this.showManager) {
        this.getManager(this.orgUnitID);
      }
      if (this.grid) {
        // this.grid.dataService.rowCount = null;
        this.grid.dataService.rowCount = 0;
        this.grid.dataService.request.dataValues = this.orgUnitID;
        this.grid.dataValues = this.orgUnitID;
        //clearInterval(ins);
        this.grid.refresh();
        //clearInterval(ins);
        if (this.grid && this.editable && !this.hadEmitDataService) {
          this.hadEmitDataService = true;
          this.gridViewDataService.emit(this.grid.dataService);
        }
      }
    }

  }
  getRefreshFlag(event){
    if(event?.field == 'rowCount'){
      this.grid.dataService.rowCount = event.value;
    }
  }
  getManager(orgUnitID: string) {
    if (orgUnitID) {
      this.api.execSv('HR', 'ERM.Business.HR', 'EmployeesBusiness_Old', 'GetOrgManager', [orgUnitID])
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
      default:
        this.shareService.defaultMoreFunc(
          moreFunc,
          data,
          null,
          this.view.formModel,
          this.view.dataService,
          this
        );
        break;
    }
  }

  delete(data: any) {
    if (data) {
      (this.grid.dataService as CRUDService)
        .delete([data], true, (opt: any) => this.beforDelete(opt, data))
        .subscribe(res => {
          if (res) {
            this.getManager(this.orgUnitID);
            let ins = setInterval(() => {
              if (this.grid) {
                clearInterval(ins);
                this.grid.deleteRow(data, true);
                this.grid.dataService.rowCount = this.grid.dataService.rowCount - 1;
                this.dataChange.emit({ data: res, actionType: 'delete', hasDataChanged: true });
              }
            }, 100);
          }
        });
    }
  }
  beforDelete(option: RequestOption, employee: any) {
    option.service = 'HR';
    option.assemblyName = 'ERM.Business.HR';
    option.className = 'EmployeesBusiness_Old';
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
        .execSv('HR', 'ERM.Business.HR', 'EmployeesBusiness_Old', 'GetEmployeeInfoByIDAsync', [data.employeeID]).subscribe(res => {
          (this.grid.dataService as CRUDService).dataSelected = res ? res : this.itemSelected;
          (this.grid.dataService as CRUDService).copy().subscribe((res: any) => {
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
                  this.grid.addRow(e.event, 0, true);
                } else {
                  this.orgUnitID = e.event.orgUnitID;
                  let ins = setInterval(() => {
                    if (this.grid) {
                      this.grid.dataService.rowCount = 0;
                      clearInterval(ins);
                      this.grid.refresh();
                    }
                  }, 100);
                }
                if (this.showManager)
                  this.getManager(this.orgUnitID);
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
      (this.grid.dataService as CRUDService).edit(data).subscribe((res: any) => {
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
            if (e.event.orgUnitID === this.orgUnitID) {
              this.grid.refresh();
            } else {
              this.orgUnitID = e.event.orgUnitID;
              let ins = setInterval(() => {
                if (this.grid) {
                  this.grid.dataService.rowCount = 0;
                  clearInterval(ins);
                  this.grid.refresh();
                }
              }, 200);
            }
            if (this.showManager)
              this.getManager(this.orgUnitID);
            this.dataChange.emit({ data: e.event, oldData: data, actionType: 'edit', hasDataChanged: true });
          }
        });
      });
    }
  }
  clickViewEmpInfo(data: any) {
    this.cache.functionList(this.funcIDEmpInfor).subscribe((func) => {
      this.api.execSv('HR', 'ERM.Business.HR', 'OrganizationUnitsBusiness_Old', 'GetOrgUnitChild', [this.orgUnitID])
      .subscribe(res => {
        if (res){
          let dataValue = Array(res).join();

          let request = this.grid.dataService.request;
          request.dataValues = dataValue;

          let queryParams = {
            employeeID: data.employeeID,
            page: this.grid.dataService.page +1,
          };
          let state = {
            data: this.grid.dataService.data.map(function (obj) {
              return { EmployeeID: obj.employeeID };
            }),
            request: request,
            totalPage: this.grid.dataService.pageCount,
            totalCount: this.grid.dataService.rowCount,
            from: 'gridView'
          };
          this.codxService.navigate('', func?.url, queryParams, state, true);
        }else return;
      });
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
              clearInterval(ins);
              this.grid.deleteRow(data, true);
              this.grid.dataService.rowCount = this.grid.dataService.rowCount - 1;
            }
          }, 200);
        }
        this.dataChange.emit({ data: emp, actionType: 'edit', hasDataChanged: true });
      }
    });
  }
}
