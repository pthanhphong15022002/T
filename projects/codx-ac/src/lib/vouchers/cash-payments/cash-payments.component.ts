import {
  Component,
  ElementRef,
  Injector,
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
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { PopAddCashComponent } from './pop-add-cash/pop-add-cash.component';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { IJournal } from '../../journals/interfaces/IJournal.interface';
import { CashPaymentLine } from '../../models/CashPaymentLine.model';
import { CodxAcService } from '../../codx-ac.service';
import { SettledInvoices } from '../../models/SettledInvoices.model';
import { map } from 'rxjs';

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
  @ViewChild('accountRef') accountRef: ElementRef;
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
  userID: any;
  dataCategory: any;
  journal: IJournal;
  approval: any;
  total: any = 0;
  className: any;
  classNameLine: any;
  entityName: any;
  cashpaymentline: any;
  settledInvoices: any;
  acctTrans: any;
  baseCurr: any;
  cashbookName: any;
  reasonName: any;
  lsAccount = [];
  fmCashPaymentsLines: FormModel = {
    formName: 'CashPaymentsLines',
    gridViewName: 'grvCashPaymentsLines',
    entityName: 'AC_CashPaymentsLines',
  };
  fmSettledInvoices: FormModel = {
    formName: 'SettledInvoices',
    gridViewName: 'grvSettledInvoices',
    entityName: 'AC_SettledInvoices',
  };
  tabItem: any = [
    { text: 'Thông tin chứng từ', iconCss: 'icon-info' },
    { text: 'Chi tiết bút toán', iconCss: 'icon-format_list_numbered' },
  ];
  //Bo
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
    private acService: CodxAcService,
    private notification: NotificationsService,
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
    this.cache.companySetting().subscribe((res) => {
      this.baseCurr = res.filter((x) => x.baseCurr != null)[0].baseCurr;
    });
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.userID = this.authStore.get().userID;
    this.loadjounal();
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
    switch (this.view.funcID) {
      case 'ACT0429':
      case 'ACT0410':
        this.classNameLine = 'CashPaymentsLinesBusiness';
        this.entityName = 'AC_CashPayments';
        this.className = 'CashPaymentsBusiness';
        break;
      case 'ACT0428':
      case 'ACT0401':
        this.classNameLine = 'CashReceiptsLinesBusiness';
        this.entityName = 'AC_CashReceipts';
        this.className = 'CashReceiptsBusiness';
        break;
    }
    this.api
      .exec('AC', 'CommonBusiness', 'GetAccountName')
      .subscribe((res: any) => {
        this.lsAccount = res;
      });
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
      case 'ACT041002':
        this.release(data);
        break;
    }
  }
  //#endregion

  //#region Method
  setDefault(o) {
    return this.api.exec('AC', this.className, 'SetDefaultAsync', [
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
        this.dialog.closed.subscribe((res) => {
          if (res.event != null) {
            if (res.event['update']) {
              this.itemSelected = res.event['data'];
              this.loadDatadetail(this.itemSelected);
            }
          }
        });
      });
  }

  edit(e, data) {
    if (data) {
      this.view.dataService.dataSelected = { ...data };
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
        this.dialog.closed.subscribe((res) => {
          if (res.event != null) {
            if (res.event['update']) {
              this.itemSelected = res.event['data'];
              this.loadDatadetail(this.itemSelected);
            }
          }
        });
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
    this.view.dataService.delete([data], true).subscribe((res: any) => {});
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
    //Bookmark
    var bm = e.filter(
      (x: { functionID: string }) =>
        x.functionID == 'ACT041003' ||
        x.functionID == 'ACT041002' ||
        x.functionID == 'ACT041004'
    );
    if (bm.length > 0) {
      // check có hay ko duyệt trước khi ghi sổ
      if (data?.status == '1') {
        if (this.approval == '0') {
          bm.forEach((element) => {
            element.disabled = true;
          });
        } else {
          bm[1].disabled = true;
          bm[2].disabled = true;
        }
      }
      //Chờ duyệt
      if (data?.approveStatus == '3' && data?.createdBy == this.userID) {
        bm[1].disabled = true;
        bm[0].disabled = true;
      }
      //hủy duyệt
      if (data?.approveStatus == '4' || data?.status == '0') {
        for (var i = 0; i < bm.length; i++) {
          bm[i].disabled = true;
        }
      }
    }
  }

  changeItemDetail(event) {
    if (typeof event.data !== 'undefined') {
      if (event?.data.data || event?.data.error) {
        return;
      } else {
        if (this.itemSelected && this.itemSelected.recID == event?.data.recID) {
          return;
        } else {
          this.itemSelected = event?.data;
          this.loadDatadetail(this.itemSelected);
        }
      }
    }
  }

  loadDatadetail(data) {
    switch (data.subType) {
      case '1':
      case '3':
        this.api
          .exec('AC', this.classNameLine, 'LoadDataAsync', [data.recID])
          .subscribe((res: any) => {
            this.cashpaymentline = res;
            this.loadTotal();
            this.loadAccountName(res);
          });
        this.api
          .exec('AC', 'AcctTransBusiness', 'LoadDataAsync', [data.recID])
          .subscribe((res: any) => {
            this.acctTrans = res;
          });
        break;
      case '2':
        this.api
          .exec('AC', 'SettledInvoicesBusiness', 'LoadDataAsync', [data.recID])
          .subscribe((res: any) => {
            this.settledInvoices = res;
            //this.loadTotal();
          });
        this.api
          .exec('AC', 'AcctTransBusiness', 'LoadDataAsync', [data.recID])
          .subscribe((res: any) => {
            this.acctTrans = res;
          });
        break;
    }
    this.loadCashbookName(this.itemSelected);
    this.loadReasonName(this.itemSelected);
  }

  release(data: any) {
    // this.acService
    //   .getCategoryByEntityName(this.view.formModel.entityName)
    //   .subscribe((res) => {
    //     this.dataCategory = res;
    //     this.acService
    //       .release(
    //         data.recID,
    //         this.dataCategory.processID,
    //         this.view.formModel.entityName,
    //         this.view.formModel.funcID,
    //         ''
    //       )
    //       .subscribe((result) => {
    //         if (result?.msgCodeError == null && result?.rowCount) {
    //           this.notification.notifyCode('ES007');
    //           data.status = '3';
    //           this.dialog.dataService
    //             .save((opt: RequestOption) => {
    //               opt.methodName = 'UpdateAsync';
    //               opt.className = 'CashPaymentsBusiness';
    //               opt.assemblyName = 'AC';
    //               opt.service = 'AC';
    //               opt.data = [data];
    //               return true;
    //             })
    //             .subscribe((res) => {});
    //         } else this.notification.notifyCode(result?.msgCodeError);
    //       });
    //   });
  }

  formatDate(date) {
    return new Date(date).toLocaleDateString();
  }

  loadjounal() {
    const options = new DataRequest();
    options.entityName = 'AC_Journals';
    options.predicates = 'JournalNo=@0';
    options.dataValues = this.journalNo;
    options.pageLoading = false;
    this.api
      .execSv<any>('AC', 'Core', 'DataBusiness', 'LoadDataAsync', options)
      .pipe(map((r) => r[0]))
      .subscribe((res) => {
        this.journal = res[0];
      });
  }

  loadTotal() {
    var totals = 0;
    this.cashpaymentline.forEach((element) => {
      totals = totals + element.dr;
    });
    this.total = totals.toLocaleString('it-IT');
  }

  loadCashbookName(data) {
    this.api
      .exec('AC', 'CashBookBusiness', 'LoadDataAsync')
      .subscribe((res: any) => {
        for (let index = 0; index < res.length; index++) {
          if (res[index].cashBookID == data.cashBookID) {
            this.cashbookName = res[index].cashBookName;
          }
        }
      });
  }

  loadReasonName(data) {
    this.api
      .exec('AC', 'CommonBusiness', 'GetReasonName', [data])
      .subscribe((res: any) => {
        this.reasonName = res;
      });
  }

  loadAccountName(accountID) {
    for (let index = 0; index < this.lsAccount.length; index++) {
      if (this.lsAccount[index].accountID == accountID) {
        return this.lsAccount[index].accountName.toLocaleString();
      }
    }
  }

  //#endregion
}
