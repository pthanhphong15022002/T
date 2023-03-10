import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonModel,
  CallFuncService,
  DialogModel,
  DialogRef,
  RequestOption,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { of } from 'rxjs';
import { PopAddCashComponent } from './pop-add-cash/pop-add-cash.component';

@Component({
  selector: 'lib-cash-payments',
  templateUrl: './cash-payments.component.html',
  styleUrls: ['./cash-payments.component.css'],
})
export class CashPaymentsComponent extends UIComponent {
  //#region Constructor
  views: Array<ViewModel> = [];
  @ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  dialog!: DialogRef;
  button?: ButtonModel = { id: 'btnAdd' };
  headerText: any;
  moreFuncName: any;
  funcName: any;
  parentID: string;
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
    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'SYS01');
        if (m) this.moreFuncName = m.defaultName;
      }
    });
    this.routerActive.queryParams.subscribe((res) => {
      if (res && res?.recID) this.parentID = res.recID;
    });
  }
  //#endregion

  //#region Init
  onInit(): void {}

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
          frozenColumns: 1,
        },
      },
    ];
  }
  //#endregion

  //#region Event
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
        this.edit(e, data);
        break;
      case 'SYS04':
        this.copy(e, data);
        break;
    }
  }
  //#endregion

  //#region Method
  setDefault(o) {
    return this.api.exec('AC', 'CashPaymentsBusiness', 'SetDefaultAsync', [
      this.parentID,
    ]);
  }

  add() {
    this.headerText = this.moreFuncName + ' ' + this.funcName;
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
          PopAddCashComponent,
          '',
          null,
          null,
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
          PopAddCashComponent,
          '',
          null,
          null,
          this.view.funcID,
          obj,
          '',
          option
        );
      });
  }
  copy(e, data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .copy(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        var obj = {
          formType: 'copy',
          headerText: e.text + ' ' + this.funcName,
        };
        let option = new DialogModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.IsFull = true;
        this.dialog = this.callfunc.openForm(
          PopAddCashComponent,
          '',
          null,
          null,
          this.view.funcID,
          obj,
          '',
          option
        );
      });
  }

  delete(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .delete([data], true, (option: RequestOption) =>
        this.beforeDelete(option, data)
      )
      .subscribe((res: any) => {
        if (res) {
          this.api
            .exec(
              'ERM.Business.AC',
              'CashPaymentsLinesBusiness',
              'DeleteAsync',
              [data.recID]
            )
            .subscribe((res: any) => {});
        }
      });
  }
  //#endregion

  //#region Function
  beforeDelete(opt: RequestOption, data) {
    opt.methodName = 'DeleteAsync';
    opt.className = 'CashPaymentsBusiness';
    opt.assemblyName = 'AC';
    opt.service = 'AC';
    opt.data = data.recID;
    return true;
  }
  //#endregion
}
