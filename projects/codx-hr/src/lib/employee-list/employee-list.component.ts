import {
  Component,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ButtonModel,
  DataRequest,
  NotificationsService,
  SidebarModel,
  ViewModel,
  ViewType,
  UIComponent,
  CRUDService,
} from 'codx-core';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { HR_Employees } from '../model/HR_Employees.model';
import { PopupAddNewHRComponent } from './popup-add-new-hr/popup-add-new-hr.component';
import { PopupAddEmployeeComponent } from './popup/popup-add-employee/popup-add-employee.component';

@Component({
  selector: 'lib-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
})
export class EmployeeListComponent extends UIComponent {
  views: Array<ViewModel> = [];
  button?: ButtonModel;
  columnsGrid = [];
  currentEmployee: boolean = true;
  dataValue = '90';
  predicate = 'Status < @0';
  funcID: string = "";
  employee: HR_Employees = new HR_Employees();
  itemSelected: any;
  employStatus: any;
  urlView: string;
  listMoreFunc = [];
  sysMoreFunc:any[] = [];

  // template columns grid
  @ViewChild('colEmployee', { static: true }) colEmployee: TemplateRef<any>;
  @ViewChild('colContact', { static: true }) colContact: TemplateRef<any>;
  @ViewChild('colPersonal', { static: true })colPersonal: TemplateRef<any>;
  @ViewChild('colStatus', { static: true })colStatus: TemplateRef<any>;

  // template any


  constructor(
    private injector: Injector,
    private notifiSV: NotificationsService
  ) 
  {
    super(injector);
  }
  onInit(): void {
    this.router.params.subscribe((param:any) => {
      this.funcID = param.funcID;
      // xử lý ẩn hiện button thêm trên toolbar
      this.funcID == "HRT03a2" ? this.button = null : this.button = { id: 'btnAdd'}; 
      
    });
  }

  ngAfterViewInit(): void {
    this.columnsGrid = [
      {
        formName: 'employees',
        gridViewName:'grvEmployees',
        fieldName: 'employeeID',
        controlName: 'lblEmployeeID',
        headerText: 'Nhân viên',
        width: 250,
        template: this.colEmployee,
      },
      {
        formName: 'employees',
        gridViewName:'grvEmployees',
        controlName: 'LblEmail',
        fieldName: 'email',
        headerText: 'Liên hệ',
        width: 250,
        template: this.colContact,
      },
      {
        formName: 'employees',
        gridViewName:'grvEmployees',
        controlName: 'lblBirthday',
        fieldName: 'birthday',
        headerText: 'Thông tin cá nhân',
        width: 200,
        template: this.colPersonal,
      },
      {
        formName: 'employees',
        gridViewName:'grvEmployees',
        controlName: 'lblStatus',
        fieldName: 'status',
        headerText: 'Tình trạng',
        width: 200,
        template: this.colStatus,
      },
    ];
    this.views = [
      {
        id: '1',
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {
          resources: this.columnsGrid,
          hideMoreFunc: true
        },
      },
    ];
    // get more funtion default
    this.cache.moreFunction("CoDXSystem","")
    .subscribe((mFuc:any) => {
      if(mFuc) this.sysMoreFunc = mFuc;
    });
    this.detectorRef.detectChanges();
  }

  // click more func
  clickMF(moreFunc: any, data: any) {
    // debugger
    // this.itemSelected = data;
    // switch (moreFunc.functionID) {
    //   case 'SYS01': // thêm
    //     this.add(moreFunc);
    //     break;
    //   case 'SYS02': // xóa
    //     this.delete(data);
    //     break;
    //   case 'SYS03': // sửa
    //     this.edit(data,moreFunc);
    //     break;
    //   case 'SYS04': // sao chép
    //     this.copy(data,moreFunc);
    //     break;
    //   case 'HR0031': // cập nhật tình trạng
    //     this.updateStatus(data, moreFunc.functionID);
    //     break;
    //   case 'HR0032': // xem chi tiết

    //     break;
    //   case 'SYS002':
    //     this.exportFile();
    //     break;
    // }
  }


  // open popup add
  add(moreFunc:any = null) {
    debugger
    if(!moreFunc)
      moreFunc = this.sysMoreFunc.find(x => x.functionID == "SYS01");
    this.view.dataService.addNew()
    .subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '800px';
      let popup = this.callfc.openSide(
        PopupAddEmployeeComponent,
        {
          actionType: 'add',
          text:moreFunc.defaultName ?? moreFunc.text,
          data: res,
        },
        option
      );
      popup.closed.subscribe((e) => {
        debugger
        if(e.event){
          (this.view.dataService as CRUDService).add(e.event).subscribe();
        }
        this.detectorRef.detectChanges();
      });
    });
  }
  
  //edit Employee
  edit(data:any,moreFunc:any) {
    debugger
    if(!moreFunc)
      moreFunc = this.sysMoreFunc.find(x => x.functionID == "SYS03");
    this.view.dataService
      .edit(data)
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view?.dataService;
        option.FormModel = this.view?.formModel;
        option.Width = '800px';
        var dialog = this.callfc.openSide(
          PopupAddNewHRComponent,
          {
            isEdit: true,
            oldEmployeeID: data.employeeID,
            actionType: 'edit',
            text:moreFunc.defaultName ?? moreFunc.text,
            data: res,
          },
          option
        );
        dialog.closed.subscribe((res2) => {
          if(res2.event){
            (this.view.dataService as CRUDService).update(res2.event).subscribe();
          }
          this.detectorRef.detectChanges();
        });
      });
  }

  // coppy employee
  copy(data:any,moreFunc:any) {
    if(!moreFunc)
      moreFunc = this.sysMoreFunc.find(x => x.functionID == "SYS04");
    this.view.dataService
      .copy(data)
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width = '800px';
        let popup = this.callfc.openSide(
          PopupAddNewHRComponent,
          {
            actionType: 'copy',
            text:moreFunc.defaultName ?? moreFunc.text,
            data: res,
          },
          option
        );
      });
    this.detectorRef.detectChanges();
  }

  //delete Employee
  delete(data: any) {
    debugger
    if(data)
    {
      this.api.execSv("HR","ERM.Business.HR","EmployeesBusiness","DeleteAsync",[data])
      .subscribe((res:boolean) => {
        if(res)
        {
          (this.view.dataService as CRUDService).remove(data).subscribe();
          this.notifiSV.notifyCode("SYS008");
        }
        else
          this.notifiSV.notifyCode("SYS022");
      });
    }
  }

  // update status
  updateStatus(data: any, funcID: string) {
    debugger
    let popup = this.callfc.openForm(
      PopupAddNewHRComponent,
      'Cập nhật tình trạng',
      350,
      200,
      funcID,
      data
    );
    popup.closed.subscribe((e) => {
      if (e?.event) {
        var emp = e.event;
        if (emp.status == '90') 
          this.view.dataService.remove(emp).subscribe();
        else 
          this.view.dataService.update(emp).subscribe();
      }
      this.detectorRef.detectChanges();
    });
  }

  // export File
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

  
  //selected Change
  selectedChange(val: any) {
    this.itemSelected = val.data;
    this.detectorRef.detectChanges();
  }
  // view imployee infor
  doubleClick(data) {
  }
}
