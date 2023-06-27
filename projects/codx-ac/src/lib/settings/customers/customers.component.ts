import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ViewModel,
  ButtonModel,
  UIComponent,
  CallFuncService,
  ViewType,
  DialogRef,
  SidebarModel,
  RequestOption,
} from 'codx-core';
import { PopAddCustomersComponent } from './pop-add-customers/pop-add-customers.component';

@Component({
  selector: 'lib-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css'],
})
export class CustomersComponent extends UIComponent {
  //#region Contructor
  views: Array<ViewModel> = [];
  buttons: ButtonModel = { id: 'btnAdd' };
  headerText: any;
  columnsGrid = [];
  dialog: DialogRef;
  funcName: any;
  objecttype: string = '1';
  gridViewSetup: any;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  constructor(
    private inject: Injector,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
  }
  //#endregion

  //#region Init
  onInit(): void {}
  ngAfterViewInit() {
    this.cache.moreFunction('Customers', 'grvCustomers').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'ACS20500');
        if (m) this.funcName = m.defaultName;
      }
    });
    this.views = [
      {
        type: ViewType.grid,
        active: true,
        sameData: false,
        model: {
          template2: this.templateMore,
        },
      },
    ];
  }
  //#endregion

  //#region Function
  toolBarClick(e) {
    switch (e.id) {
      case 'btnAdd':
        this.add(e);
        break;
    }
  }
  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(e, data);
        break;
      case 'SYS04':
        this.copy(e, data);
        break;
    }
  }
  add(e) {
    this.headerText = e.text + ' ' + this.funcName;
    this.view.dataService.addNew().subscribe((res: any) => {
      var obj = {
        formType: 'add',
        headerText: this.headerText,
      };
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '800px';
      this.dialog = this.callfunc.openSide(
        PopAddCustomersComponent,
        obj,
        option,
        this.view.funcID
      );
      this.dialog.closed.subscribe((x) => {
        if (x.event == null) this.view.dataService.clear();
      });
    });
  }
  edit(e, data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        var obj = {
          formType: 'edit',
          headerText: e.text + ' ' + this.funcName,
        };
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width = '800px';
        this.dialog = this.callfunc.openSide(
          PopAddCustomersComponent,
          obj,
          option
        );
      });
  }
  copy(e, data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .copy()
      .subscribe((res: any) => {
        var obj = {
          formType: 'copy',
          headerText: e.text + ' ' + this.funcName,
        };
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width = '800px';
        this.dialog = this.callfunc.openSide(
          PopAddCustomersComponent,
          obj,
          option
        );
      });
  }
  delete(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.delete([data], true).subscribe((res: any) => {
      if (res) {
        this.api
          .exec('ERM.Business.BS', 'BankAccountsBusiness', 'DeleteAsync', [
            this.objecttype,
            data.customerID,
          ])
          .subscribe((res: any) => {
            if (res) {
              this.api
                .exec(
                  'ERM.Business.BS',
                  'AddressBookBusiness',
                  'DeleteAsync',
                  [this.objecttype, data.customerID]
                )
                .subscribe((res: any) => {
                  if (res) {
                    this.api
                      .exec(
                        'ERM.Business.BS',
                        'ContactBookBusiness',
                        'DeleteAsync',
                        [this.objecttype, data.customerID]
                      )
                      .subscribe((res: any) => {
                        if (res) {
                          this.api
                            .exec(
                              'ERM.Business.AC',
                              'ObjectsBusiness',
                              'DeleteAsync',
                              [data.customerID]
                            )
                            .subscribe((res: any) => {});
                        }
                      });
                  }
                });
            }
          });
      }
    });
  }
  //#endregion
}
