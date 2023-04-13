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
  AuthStore,
  ButtonModel,
  CallFuncService,
  DataRequest,
  DialogModel,
  DialogRef,
  FormModel,
  RequestOption,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { of } from 'rxjs';
import { PopAddCashComponent } from './pop-add-cash/pop-add-cash.component';
import { CashPaymentLine } from '../models/CashPaymentLine.model';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';

@Component({
  selector: 'lib-cash-payments',
  templateUrl: './cash-payments.component.html',
  styleUrls: ['./cash-payments.component.css'],
})
export class CashPaymentsComponent extends UIComponent {
  //#region Constructor
  views: Array<ViewModel> = [];
  @ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  @ViewChild('templateDetail') templateDetail?: TemplateRef<any>;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  dialog!: DialogRef;
  button?: ButtonModel = { id: 'btnAdd' };
  headerText: any;
  moreFuncName: any;
  funcName: any;
  journalNo: string;
  itemSelected: any;
  objectname: any;
  oData: any;
  cashbook: any;
  page: any = 1;
  pageSize = 6;
  userID: any;
  transactionText: any;
  cashpaymentline: Array<CashPaymentLine> = [];
  fmCashPaymentsLines: FormModel = {
    formName: 'CashPaymentsLines',
    gridViewName: 'grvCashPaymentsLines',
    entityName: 'AC_CashPaymentsLines',
  };
  tabItem: any = [
    { text: 'Thông tin chứng từ', iconCss: 'icon-info' },
    { text: 'Chi tiết bút toán', iconCss: 'icon-format_list_numbered' },
  ];
  tabInfo: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Link', textDefault: 'Liên kết', isActive: false },
  ];
  authStore: AuthStore;
  constructor(
    private inject: Injector,
    private callfunc: CallFuncService,
    private routerActive: ActivatedRoute,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.authStore = inject.get(AuthStore);
    this.dialog = dialog;
    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'SYS01');
        if (m) this.moreFuncName = m.defaultName;
      }
    });
    this.routerActive.queryParams.subscribe((params) => {
      this.journalNo = params?.journalNo;
    });
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.userID = this.authStore.get().userID;
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
          frozenColumns: 1,
        },
      },
      {
        type: ViewType.listdetail,
        active: true,
        sameData: true,

        model: {
          template: this.itemTemplate,
          panelRightRef: this.templateDetail,
        },
      },
    ];

    this.detectorRef.detectChanges();
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
      case 'SYS002':
        this.export(data);
        break;
    }
  }
  //#endregion

  //#region Method
  setDefault(o) {
    return this.api.exec('AC', 'CashPaymentsBusiness', 'SetDefaultAsync', [
      this.journalNo,
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
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.isFull = true;
        this.dialog = this.callfunc.openSide(
          PopAddCashComponent,
          obj,
          option,
          this.view.funcID
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
          headerText: this.funcName,
        };
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.isFull = true;
        this.dialog = this.callfunc.openSide(
          PopAddCashComponent,
          obj,
          option,
          this.view.funcID
        );
      });
  }

  copy(e, data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .copy((o) => this.setDefault(o))
      .subscribe((res: any) => {
        var obj = {
          formType: 'copy',
          headerText: this.funcName,
        };
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.isFull = true;
        this.dialog = this.callfunc.openSide(
          PopAddCashComponent,
          obj,
          option,
          this.view.funcID
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
        if (res != null) {
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
  export(data) {
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
    //Chưa có group
    gridModel.groupFields = 'createdBy';
    this.callfunc.openForm(
      CodxExportComponent,
      null,
      900,
      700,
      '',
      [gridModel, data.recID],
      null
    );
  }

  beforeDelete(opt: RequestOption, data) {
    opt.methodName = 'DeleteAsync';
    opt.className = 'CashPaymentsBusiness';
    opt.assemblyName = 'AC';
    opt.service = 'AC';
    opt.data = data;
    return true;
  }

  changeDataMF(e: any, data: any) {
    this.itemSelected = this.view.dataService.dataSelected;
    //Bookmark
    var bm = e.filter(
      (x: { functionID: string }) =>
        x.functionID == 'ACT041003' ||
        x.functionID == 'ACT041002' ||
        x.functionID == 'ACT041004'
    );
    // check có hay ko duyệt trước khi ghi sổ
    if (data?.status == '1') {
      switch (data?.approveStatus) {
        case '0':
          bm[0].disabled = true;
          bm[2].disabled = true;
          break;
        case '1':
          bm[1].disabled = true;
          bm[2].disabled = true;
          break;
      }
    }
    //Chờ duyệt
    if (data?.approveStatus == '3' && data?.createdBy == this.userID) {
      bm[1].disabled = true;
      bm[0].disabled = true;
    }
    //hủy duyệt
    if (data?.approveStatus == '4') {
      for (var i = 0; i < bm.length; i++) {
        bm[i].disabled = true;
      }
    }
    this.loadDatadetail(this.itemSelected);
  }

  clickChange(data) {
    this.itemSelected = data;
    this.loadDatadetail(data);
  }

  loadDatadetail(data) {
    this.api
      .exec('AC', 'CashPaymentsLinesBusiness', 'LoadDataAsync', [data.recID])
      .subscribe((res: any) => {
        this.cashpaymentline = res;
      });
  }
  //#endregion
}
