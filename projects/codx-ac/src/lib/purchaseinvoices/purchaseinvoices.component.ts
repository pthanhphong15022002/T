import { Component, Injector, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UIComponent, ViewModel, DialogRef, ButtonModel, CallFuncService, ViewType, FormModel, DialogModel } from 'codx-core';
import { PopAddPurchaseComponent } from './pop-add-purchase/pop-add-purchase.component';

@Component({
  selector: 'lib-purchaseinvoices',
  templateUrl: './purchaseinvoices.component.html',
  styleUrls: ['./purchaseinvoices.component.css']
})
export class PurchaseinvoicesComponent extends UIComponent {
  views: Array<ViewModel> = [];
  @ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  dialog!: DialogRef;
  button?: ButtonModel = { id: 'btnAdd' };
  headerText: any;
  funcName: any;
  parentID: string;
  width: any;
  height: any;
  innerWidth: any;
  tabItem: any = [
    { text: 'Thông tin chứng từ', iconCss: 'icon-info' },
    { text: 'Chi tiết bút toán', iconCss: 'icon-format_list_numbered' },
  ];
  constructor(
    private inject: Injector,
    private callfunc: CallFuncService,
    private routerActive: ActivatedRoute,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.routerActive.queryParams.subscribe((res) => {
      if (res && res?.recID) this.parentID = res.recID;
    });
   }

   onInit(): void {
    this.innerWidth = window.innerWidth;
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
        },
      },
    ];
  }
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
        //this.delete(data);
        break;
      case 'SYS03':
        this.edit(e, data);
        break;
      case 'SYS04':
        //this.copy(e, data);
        break;
    }
  }
  setDefault(o) {
    return this.api.exec('PS', 'PurchaseInvoicesBusiness', 'SetDefaultAsync', [
      this.parentID,
    ]);
  }
  add() {
    this.headerText = this.funcName;
    this.view.dataService
      .addNew((o) => this.setDefault(o))
      .subscribe((res: any) => {
        var obj = {
          formType: 'add',
          headerText: this.headerText,
        };
        let option = new DialogModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.IsFull = true;
        this.dialog = this.callfunc.openForm(
          PopAddPurchaseComponent,
          '',
          this.width,
          969,
          this.view.funcID,
          obj,
          '',
          option
        );
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
        let option = new DialogModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.IsFull = true;
        this.dialog = this.callfunc.openForm(
          PopAddPurchaseComponent,
          '',
          this.width,
          this.height,
          this.view.funcID,
          obj,
          '',
          option
        );
      });
  }
}
