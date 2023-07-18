import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import {
  ButtonModel,
  SidebarModel,
  ViewModel,
  ViewType,
  UIComponent,
  CRUDService,
  RequestOption,
  ResourceModel,
} from 'codx-core';
import { PopupAddEmployeeComponent } from './popup/popup-add-employee/popup-add-employee.component';
import { ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { PopupUpdateStatusComponent } from './popup/popup-update-status/popup-update-status.component';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';
@Component({
  selector: 'lib-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
})
export class EmployeeListComponent extends UIComponent {
  views: Array<ViewModel> = [];
  button: ButtonModel = null;
  columnsGrid = [];
  funcID: string = '';
  itemSelected: any;
  sysMoreFunc: any[] = [];
  grvSetup: any;
  funcIDEmpInfor: string = 'HRT03b';
  orgUnitID: string = '';
  request: ResourceModel;
  viewActive: string = '';
  gridViewDataService: any;
  // template columns grid
  @ViewChild('colEmployee', { static: true }) colEmployee: TemplateRef<any>;
  @ViewChild('colContact', { static: true }) colContact: TemplateRef<any>;
  @ViewChild('colPersonal', { static: true }) colPersonal: TemplateRef<any>;
  @ViewChild('colStatus', { static: true }) colStatus: TemplateRef<any>;

  @ViewChild('templateList') templateList?: TemplateRef<any>;
  @ViewChild('headerTemplate') headerTemplate?: TemplateRef<any>;

  @ViewChild('tempTree') tempTree: TemplateRef<any>;
  @ViewChild('tmpMasterDetail') tmpMasterDetail: TemplateRef<any>;
  // template any

  service = 'HR';
  assemblyName = 'ERM.Business.HR';
  entityName = 'HR_Employees';
  className = 'EmployeesBusiness';
  method = 'GetListEmployeeAsync';
  idField = 'employeeID';

  gridViewAction;
  cmtStatus = '';
  formGroup: FormGroup;
  grv2DataChanged: any;
  hasChangedData: boolean = false;
  constructor(
    private injector: Injector,
    private routerActive: ActivatedRoute,
    private shareService: CodxShareService,
  ) {
    super(injector);
    this.funcID = this.routerActive.snapshot.params['funcID'];
  }
  onInit(): void {
    this.router.params.subscribe((param: any) => {
      this.funcID = param.funcID;
      // xử lý ẩn hiện button thêm trên toolbar
      this.funcID == 'HRT03a2'
        ? (this.button = null)
        : (this.button = { id: 'btnAdd' });
      this.getFunction(this.funcID);
    });
    // get more funtion hệ thống
    this.cache.moreFunction('CoDXSystem', '').subscribe((mFuc: any) => {
      if (mFuc) this.sysMoreFunc = mFuc;
    });
  }

  ngAfterViewInit(): void {
    this.request = new ResourceModel();
    this.request.service = 'HR';
    this.request.assemblyName = 'ERM.Business.HR';
    this.request.className = 'EmployeesBusiness';
    this.request.method = 'GetListEmployeeAsync';
    this.request.autoLoad = false;
    this.request.parentIDField = 'ParentID';
    this.request.idField = 'orgUnitID';

    this.views = [
      {
        id: '1',
        type: ViewType.list,
        sameData: true,
        //active: true,
        model: {
          template: this.templateList,
          headerTemplate: this.headerTemplate,
        },
      },
      {
        id: '2',
        type: ViewType.tree_masterdetail,
        request: this.request,
        sameData: false,
        model: {
          resizable: true,
          isCustomize: true,
          template: this.tempTree,
          panelRightRef: this.tmpMasterDetail,
          resourceModel: { parentIDField: 'ParentID', idField: 'OrgUnitID' },
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

  // click more func
  clickMF(moreFunc: any, data: any) {
    this.itemSelected = data;
    switch (moreFunc.functionID) {
      case 'SYS01': // thêm
        this.add(moreFunc);
        break;
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
      // case 'HR0032': // xem chi tiết
      //   break;
      // case 'SYS002':
      //   // this.exportFile();
      //   break;
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

  //get function
  getFunction(funcID: string) {
    if (funcID) {
      this.cache.functionList(funcID).subscribe((func: any) => {
        if (func?.formName && func?.gridViewName) {
          this.cache
            .gridViewSetup(func.formName, func.gridViewName)
            .subscribe((grd: any) => {
              if (grd) {
                this.grvSetup = grd;
              }
            });
        }
      });
    }
  }

  // add Employee
  add(moreFunc: any = null) {
    if (!moreFunc)
      moreFunc = this.sysMoreFunc.find((x) => x.functionID == 'SYS01');
    if (this.view.dataService.idField == 'orgUnitID' || this.view.idField == 'orgUnitID') { // on tree view
      (this.gridViewDataService as CRUDService).addNew().subscribe((res: any) => { // add from tree view
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width = '800px';
        let popup = this.callfc.openSide(
          PopupAddEmployeeComponent,
          {
            action: 'add',
            text: moreFunc.defaultName ?? moreFunc.text,
            data: res,
          },
          option
        );
        popup.closed.subscribe((e) => {
          if (e.event) {
            this.grv2DataChanged = true;
            this.view.currentView.dataService.load().subscribe();
            if (e.event?.orgUnitID == this.itemSelected?.orgUnitID)
              this.itemSelected = e.event;
            //(this.view.dataService as CRUDService).add(e.event).subscribe();
            //this.hasChangedData = true;
          }
        });
      });
    } else {
      this.view.dataService.addNew().subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width = '800px';
        let popup = this.callfc.openSide(
          PopupAddEmployeeComponent,
          {
            action: 'add',
            text: moreFunc.defaultName ?? moreFunc.text,
            data: res,
          },
          option
        );
        popup.closed.subscribe((e) => {
          if (e.event) {
            (this.view.dataService as CRUDService).add(e.event).subscribe();
            this.hasChangedData = true;
          }
        });
      });
    }
    this.detectorRef.detectChanges();
  }

  //edit Employee
  edit(data: any, moreFunc: any) {
    if (data) {
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
            (this.view.dataService as CRUDService).update(e.event).subscribe();
            this.hasChangedData = true;
          }
        });
      });
    }
  }

  // coppy employee
  copy(data: any, moreFunc: any) {
    if (data) {
      if (!moreFunc)
        moreFunc = this.sysMoreFunc.find((x) => x.functionID == 'SYS04');
      this.api
        .execSv(
          'HR',
          'ERM.Business.HR',
          'EmployeesBusiness',
          'GetEmployeeInfoByIDAsync',
          [data.employeeID]
        )
        .subscribe((res) => {
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
                (this.view.dataService as CRUDService).add(e.event).subscribe();
                this.hasChangedData = true;
              }
            });
          });
        });
    }
  }

  //delete Employee
  delete(data: any) {
    if (data) {
      this.view.dataService
        .delete([data], true, (opt: any) => this.beforDelete(opt, data))
        .subscribe(res => { if (res) this.hasChangedData = true });
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

  // update status
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
        if (emp.status === '90') this.view.dataService.remove(emp).subscribe();
        else this.view.dataService.update(emp).subscribe();
        this.hasChangedData = true;
      }
      this.detectorRef.detectChanges();
    });
  }
  viewChanging(event: any) {
    if (event?.view?.id === '2' || event?.id === '2') {
      this.view.dataService.parentIdField = 'ParentID';
      this.view.dataService.idField = 'orgUnitID';
      this.view.idField = 'orgUnitID';
    } else if (event?.view?.id === '1' || event?.id === '1') {
      this.view.dataService.parentIdField = '';
      this.view.dataService.idField = 'employeeID';
      this.view.idField = 'employeeID';
    }
  }

  viewChanged(event: any) {
    // if (event?.view?.id === '2' || event?.id === '2') {
    //   this.view.dataService.parentIdField = 'ParentID';
    //   this.view.dataService.idField = 'orgUnitID';
    //   this.view.idField = 'orgUnitID';
    // } else if (event?.view?.id === '1' || event?.id === '1') {
    //   this.view.dataService.parentIdField = '';
    //   this.view.dataService.idField = 'employeeID';
    //   this.view.idField = 'employeeID';
    // }
    if (this.grv2DataChanged || this.hasChangedData) {
      // if (this.viewActive !== event.view.id && this.flagLoaded) {
      // if (event?.view?.id === '1' || event?.id === '1') {
      //   this.view.dataService.data = [];
      //   this.view.dataService.parentIdField = '';
      // } else {
      //   this.view.dataService.parentIdField = 'ParentID';
      // }
      if (event?.view?.id == '1' || event?.id == '1') {
        this.view.dataService.data = [];
        this.view.dataService.page = 0;
        this.view.dataService.load().subscribe();
      }
      if (event?.view?.id == '2' || event?.id == '2') {
        this.view.currentView.dataService.load().subscribe();
      }
      //check update data when CRUD or not
      // this.flagLoaded = false;

      //Prevent load data when click same id
      this.viewActive = event.view.id;
      //this.view.currentView.dataService.load().subscribe();
    }
    this.grv2DataChanged = false;
    this.hasChangedData = false;
  }
  // export File
  // exportFile() {
  //   var gridModel = new DataRequest();
  //   gridModel.formName = this.view.formModel.formName;
  //   gridModel.entityName = this.view.formModel.entityName;
  //   gridModel.funcID = this.view.formModel.funcID;
  //   gridModel.gridViewName = this.view.formModel.gridViewName;
  //   gridModel.page = this.view.dataService.request.page;
  //   gridModel.pageSize = this.view.dataService.request.pageSize;
  //   gridModel.predicate = this.view.dataService.request.predicates;
  //   gridModel.dataValue = this.view.dataService.request.dataValues;
  //   gridModel.entityPermission = this.view.formModel.entityPer;
  //   gridModel.groupFields = 'createdBy';
  //   this.callfc.openForm(
  //     CodxExportComponent,
  //     null,
  //     null,
  //     800,
  //     '',
  //     [gridModel, this.itemSelected.employeeID],
  //     null
  //   );
  // }

  //selected Change
  selectedChange(val: any) {
    this.itemSelected = val.data;
    console.log(this.itemSelected);
    this.detectorRef.detectChanges();
  }
  // view imployee infor
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
  dataChange(event) {
    this.grv2DataChanged = event?.hasDataChanged ? true : false;
  }
  getGridViewDataService(event) {
    this.gridViewDataService = event;
  }
}
