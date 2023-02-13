import { ChangeDetectorRef, Component, Injector, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { ViewModel, ButtonModel, UIComponent, CallFuncService, ViewType, DialogRef, SidebarModel, RequestOption } from 'codx-core';
import { PopAddCustomersComponent } from './pop-add-customers/pop-add-customers.component';

@Component({
  selector: 'lib-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent extends UIComponent {
  //#region Contructor
  views: Array<ViewModel> = [];
  buttons: ButtonModel = { id: 'btnAdd' };
  headerText :any;
  columnsGrid = [];
  dialog: DialogRef;
  moreFuncName:any;
  funcName:any;
  htxcusGroup:string = '';
  gridViewSetup:any;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  constructor(
    private inject: Injector,
    private dt: ChangeDetectorRef, 
    private callfunc: CallFuncService,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'SYS01');
        if (m) this.moreFuncName = m.defaultName;
      }
    });
  }
  //#endregion

  //#region Init
  onInit(): void {
  }
  ngAfterViewInit() {
    this.cache.functionList(this.view.funcID).subscribe((res) => {
      if (res) this.funcName = res.defaultName;
    });
    this.views = [
      {
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {
          template2: this.templateMore,
          frozenColumns:1
        },
      },
    ];
  }
  //#endregion

  //#region Function
  toolBarClick(e) {
    switch (e.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }
  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(e,data);
        break;
    }
    
  }
  add() {
    this.headerText = this.moreFuncName + ' ' + this.funcName;
    this.view.dataService.addNew().subscribe((res: any) => {
      var obj = {
        formType: 'add',
        headerText: this.headerText,
      };
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '850px';
      this.dialog = this.callfunc.openSide(PopAddCustomersComponent, obj, option,this.view.funcID);
      this.dialog.closed.subscribe((x) => {
        if (x.event == null)
        this.view.dataService.clear();
      });
    });
  }
  edit(e,data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.edit(this.view.dataService.dataSelected).subscribe((res: any) => {
      var obj = {
        formType: 'edit',
        headerText: e.text + ' ' + this.funcName
      };
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = '850px';
      this.dialog = this.callfunc.openSide(PopAddCustomersComponent, obj, option);
    });
  }
  delete(data){
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.delete([data], true, (option: RequestOption) =>
    this.beforeDelete(option,data)
  ).subscribe((res:any) => {
    if (res) {
      this.api.exec(
        'ERM.Business.BS',
        'BankAccountsBusiness',
        'DeleteAsync',
        [data.customerID]
      ).subscribe((res:any)=>{
        if (res) {
          this.api.exec(
            'ERM.Business.BS',
            'AddressBookBusiness',
            'DeleteAsync',
            [data.customerID]
          ).subscribe((res:any)=>{
            if (res) {
              this.api.exec(
                'ERM.Business.BS',
                'ContactBookBusiness',
                'DeleteAsync',
                [data.customerID]
              ).subscribe((res:any)=>{
                
              }); 
            }
          }); 
        }
      });   
    }
  });
  }
  beforeDelete(opt: RequestOption,data) {
    opt.methodName = 'DeleteAsync';
    opt.className = 'CustomersBusiness';
    opt.assemblyName = 'SM';
    opt.service = 'SM';
    opt.data = data;
    return true;
  }
  //#endregion
}
