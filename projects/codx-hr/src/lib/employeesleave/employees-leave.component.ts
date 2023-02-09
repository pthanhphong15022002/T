import { ChangeDetectorRef, Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CacheService, CallFuncService, CodxService, DataRequest, DialogRef, NotificationsService, RequestOption, SidebarModel, UIComponent, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { CodxHrService } from '../codx-hr.service';
import { PopupAddEmployeesComponent } from '../employees/popup-add-employees/popup-add-employees.component';
import { UpdateStatusComponent } from '../employees/update-status/update-status.component';

@Component({
  selector: 'lib-employees-leave',
  templateUrl: './employees-leave.component.html',
  styleUrls: ['./employees-leave.component.css']
})
export class EmployeesLeaveComponent  extends UIComponent {
  views: Array<ViewModel> = [];
  columnsGrid = [];
  dataValue = "90";
  predicate = "Status=@0";
  dialog!: DialogRef;
  functionID:string ="";
  listMoreFunc:any = null;
  @ViewChild('cardTemp') cardTemp: TemplateRef<any>;
  @ViewChild('itemEmployee', { static: true }) itemEmployee: TemplateRef<any>;
  @ViewChild('itemContact', { static: true }) itemContact: TemplateRef<any>;
  @ViewChild('itemInfoPersonal', { static: true }) itemInfoPersonal: TemplateRef<any>;
  @ViewChild('itemStatusName', { static: true }) itemStatusName: TemplateRef<any>;
  @ViewChild('itemAction', { static: true }) itemAction: TemplateRef<any>;
  @ViewChild("grid", { static: true }) grid: TemplateRef<any>;

  constructor(
    private changedt: ChangeDetectorRef,
    private notiService: NotificationsService,
    private callfunc: CallFuncService,
    private hrService: CodxHrService,
    private injector: Injector,
  ) 
  {
    super(injector);
    
  }

  onInit(): void {
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
    this.columnsGrid = [
      { field: 'employeeID', headerText: 'Nhân viên', width: 300, template: this.itemEmployee },
      { field: 'email', headerText: 'Liên hệ', width: 200, template: this.itemContact },
      { field: 'birthday', headerText: 'Thông tin cá nhân', width: 200, template: this.itemInfoPersonal },
      { field: 'statusName', headerText: 'Tình trạng', width: 200, template: this.itemStatusName },
      { field: '', headerText: '', width: 40, template: this.itemAction }
    ];
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
  getSetup(functionID: string) {
    if (functionID) {
      this.cache.functionList(functionID).subscribe((func: any) => {
        if (func) {
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
  // more func
  clickMF(event: any, data: any) {
    if (event && data) {
      this.view.dataService.dataSelected = data;
      switch (event.functionID) {
        case 'HR0033': // cập nhật tình trạng
          this.updateStatus(data, event.functionID);
          break;
      }
    }
  }




  // cập nhật tình trạng nhân viên
  updateStatus(data: any, funcID: string) {
    let popup = this.callfunc.openForm(
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
        if (emp.status !== '90') {
          this.view.dataService.remove(emp).subscribe();
        } else this.view.dataService.update(emp).subscribe();
      }
      this.changedt.detectChanges();
    });
  }

}
