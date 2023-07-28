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
  DialogModel,
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
import { CodxAcService } from '../../codx-ac.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import {
  AnimationModel,
  ProgressBar,
} from '@syncfusion/ej2-angular-progressbar';
import { CodxListReportsComponent } from 'projects/codx-share/src/lib/components/codx-list-reports/codx-list-reports.component';
import { Subject, interval, takeUntil } from 'rxjs';
@Component({
  selector: 'lib-cash-payments',
  templateUrl: './cash-payments.component.html',
  styleUrls: ['./cash-payments.component.css'],
})
export class CashPaymentsComponent extends UIComponent {
  //#region Constructor
  views: Array<ViewModel> = [];
  @ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  @ViewChild('listTemplate') listTemplate?: TemplateRef<any>;
  @ViewChild('templateDetail') templateDetail?: TemplateRef<any>;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  @ViewChild('accountRef') accountRef: ElementRef;
  @ViewChild('tabObj') tabObj: TabComponent;
  @ViewChild('pgbAcctranst') pgbAcctranst: ProgressBar;
  @ViewChild('pgbSet') pgbSet: ProgressBar;
  @ViewChild('pgbVat') pgbVat: ProgressBar;
  @ViewChild('annotationsave') annotationsave: ProgressBar;
  button?: ButtonModel = {
    id: 'btnAdd',
    icon: 'icon-i-file-earmark-plus',
  };
  headerText: any;
  funcName: any;
  journalNo: string;
  itemSelected: any;
  userID: any;
  dataCategory: any;
  journal: IJournal;
  totalacct: any = 0;
  totaloff: any = 0;
  totalsettledAmt: any = 0;
  totalbalAmt: any = 0;
  className: any;
  classNameLine: any;
  entityName: any;
  settledInvoices: any;
  acctTrans: any;
  baseCurr: any;
  oCash: any;
  isLoadDataAcct: any = true;
  hideFields: Array<any> = [];
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
  //Bo
  tabInfo: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'References', textDefault: 'Liên kết', isActive: false },
  ];
  parent: any;
  authStore: AuthStore;
  fmAccTrans: FormModel = {
    formName: 'AcctTrans',
    gridViewName: 'grvAcctTrans',
    entityName: 'AC_AcctTrans',
  };
  public animation: AnimationModel = { enable: true, duration: 1000, delay: 0 };
  private destroy$ = new Subject<void>();
  constructor(
    private inject: Injector,
    private callfunc: CallFuncService,
    private routerActive: ActivatedRoute,
    private acService: CodxAcService,
    private shareService: CodxShareService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.authStore = inject.get(AuthStore);
    this.userID = this.authStore.get().userID;
    acService
      .getCompanySetting()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.baseCurr = res[0].baseCurr;
      });
    this.routerActive.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.journalNo = params?.journalNo;
      });
    this.loadjounal();
  }
  //#endregion
  //#region Init

  onInit(): void {}

  ngAfterViewInit() {
    this.acService
      .getFunctionList(this.view.funcID)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res) this.funcName = res.defaultName;
      });
    this.views = [
      {
        type: ViewType.listdetail,
        active: true,
        sameData: true,

        model: {
          template: this.itemTemplate,
          panelRightRef: this.templateDetail,
        },
      },
      {
        type: ViewType.list,
        active: true,
        sameData: true,

        model: {
          template: this.listTemplate,
        },
      },
      {
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {
          frozenColumns: 1,
          template2: this.templateMore,
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
    this.routerActive.queryParams.subscribe((params) => {
      this.journalNo = params?.journalNo;
      if (params?.parent) {
        this.cache.functionList(params.parent).subscribe((res) => {
          if (res) {
            this.view.setRootNode(res?.customName);
          }
        });
      }
    });
    this.detectorRef.detectChanges();
  }

  ngOnDestroy() {
    this.view.setRootNode('');
    this.onDestroy();
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
      case 'ACT041004':
        this.cancelRelease(data);
        break;
      case 'ACT041009':
        this.validateVourcher(data);
        break;
      case 'ACT041003':
        this.post(data);
        break;
      case 'ACT041010':
        this.print(data, e.functionID);
        break;
    }
  }
  //#endregion

  //#region Method
  setDefault(o) {
    return this.api.exec('AC', this.className, 'SetDefaultAsync', [
      this.journal,
    ]);
  }

  add() {
    let ins = setInterval(() => {
      if (this.journal) {
        clearInterval(ins);
        this.headerText = this.funcName;
        this.view.dataService.dataSelected = { ...this.oCash };
        // this.view.dataService
        //   .addNew((o) => this.setDefault(o))
        //   .subscribe((res: any) => {

        //   });
        let obj = {
          formType: 'add',
          headerText: this.headerText,
          journal: { ...this.journal },
          hideFields: [...this.hideFields],
          baseCurr : this.baseCurr
        };
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.isFull = true;
        let dialog = this.callfunc.openSide(
          PopAddCashComponent,
          obj,
          option,
          this.view.funcID
        );
      }
      setTimeout(() => {
        if (ins) clearInterval(ins);
      }, 10000);
    });
  }

  edit(e, data) {
    let ins = setInterval(() => {
      if (data && this.journal) {
        clearInterval(ins);
        this.view.dataService.dataSelected = data;
        this.view.dataService
          .edit(this.view.dataService.dataSelected)
          .subscribe((res: any) => {
            var obj = {
              formType: 'edit',
              headerText: this.funcName,
              journal: { ...this.journal },
              hideFields: [...this.hideFields],
              baseCurr : this.baseCurr
            };
            let option = new SidebarModel();
            option.DataService = this.view.dataService;
            option.FormModel = this.view.formModel;
            option.isFull = true;
            var dialog = this.callfunc.openSide(
              PopAddCashComponent,
              obj,
              option,
              this.view.funcID
            );
          });
      }
      setTimeout(() => {
        if (ins) clearInterval(ins);
      }, 10000);
    });
  }

  copy(e, data) {
    let ins = setInterval(() => {
      if (data && this.journal) {
        clearInterval(ins);
        this.view.dataService.dataSelected = data;
        this.view.dataService
          .copy()
          .subscribe((res: any) => {
            var obj = {
              formType: 'copy',
              headerText: this.funcName,
              journal: { ...this.journal },
            };
            let option = new SidebarModel();
            option.DataService = this.view.dataService;
            option.FormModel = this.view.formModel;
            option.isFull = true;
            var dialog = this.callfunc.openSide(
              PopAddCashComponent,
              obj,
              option,
              this.view.funcID
            );
          });
      }
      setTimeout(() => {
        if (ins) clearInterval(ins);
      }, 10000);
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

  changeDataMF(e: any, data: any) {
    //Bookmark
    var bm = e.filter(
      (x: { functionID: string }) =>
        x.functionID == 'ACT041003' || // ghi sổ
        x.functionID == 'ACT041002' || // gửi duyệt
        x.functionID == 'ACT041004' || // hủy yêu cầu duyệt
        x.functionID == 'ACT041008' || // khôi phục
        x.functionID == 'ACT042901' || // chuyển tiền điện tử
        x.functionID == 'ACT041010' || // in
        x.functionID == 'ACT041009' // kiểm tra tính hợp lệ
    );
    if (bm.length > 0) {
      switch (data?.status) {
        case '0':
          bm.forEach((element) => {
            if (
              element.functionID == 'ACT041009' ||
              element.functionID == 'ACT041010'
            ) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
        case '1':
          if (this.journal.approvalControl == '0') {
            bm.forEach((element) => {
              if (
                element.functionID == 'ACT041003' ||
                element.functionID == 'ACT041010'
              ) {
                element.disabled = false;
              } else {
                element.disabled = true;
              }
            });
          } else {
            bm.forEach((element) => {
              if (
                element.functionID == 'ACT041002' ||
                element.functionID == 'ACT041010'
              ) {
                element.disabled = false;
              } else {
                element.disabled = true;
              }
            });
          }
          break;
        case '2':
        case '4':
          bm.forEach((element) => {
            element.disabled = true;
          });
          break;
        case '3':
          bm.forEach((element) => {
            if (
              element.functionID == 'ACT041004' ||
              element.functionID == 'ACT041010'
            ) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
        case '5':
          bm.forEach((element) => {
            if (
              element.functionID == 'ACT041003' ||
              element.functionID == 'ACT041010'
            ) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
        case '6':
          bm.forEach((element) => {
            if (
              element.functionID == 'ACT041008' ||
              element.functionID == 'ACT041010'
            ) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
        case '9':
          bm.forEach((element) => {
            if (
              element.functionID == 'ACT041003' ||
              element.functionID == 'ACT041010'
            ) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
      }
    }
  }

  changeMF(e: any, data: any) {
    var bm = e.filter(
      (x: { functionID: string }) =>
        x.functionID == 'ACT041003' || // ghi sổ
        x.functionID == 'ACT041002' || // gửi duyệt
        x.functionID == 'ACT041004' || // hủy yêu cầu duyệt
        x.functionID == 'ACT041008' || // khôi phục
        x.functionID == 'ACT042901' || // chuyển tiền điện tử
        x.functionID == 'ACT041010' || // in
        x.functionID == 'ACT041009' // kiểm tra tính hợp lệ
    );
    if (bm.length > 0) {
      bm.forEach((element) => {
        element.isbookmark = false;
      });
      switch (data?.status) {
        case '0':
          bm.forEach((element) => {
            if (
              element.functionID == 'ACT041009' ||
              element.functionID == 'ACT041010'
            ) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
        case '1':
          if (this.journal.approvalControl == '0') {
            bm.forEach((element) => {
              if (
                element.functionID == 'ACT041003' ||
                element.functionID == 'ACT041010'
              ) {
                element.disabled = false;
              } else {
                element.disabled = true;
              }
            });
          } else {
            bm.forEach((element) => {
              if (
                element.functionID == 'ACT041002' ||
                element.functionID == 'ACT041010'
              ) {
                element.disabled = false;
              } else {
                element.disabled = true;
              }
            });
          }
          break;
        case '2':
        case '4':
          bm.forEach((element) => {
            element.disabled = true;
          });
          break;
        case '3':
          bm.forEach((element) => {
            if (
              element.functionID == 'ACT041004' ||
              element.functionID == 'ACT041010'
            ) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
        case '5':
          bm.forEach((element) => {
            if (
              element.functionID == 'ACT041003' ||
              element.functionID == 'ACT041010'
            ) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
        case '6':
          bm.forEach((element) => {
            if (
              element.functionID == 'ACT041008' ||
              element.functionID == 'ACT041010'
            ) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
        case '9':
          bm.forEach((element) => {
            if (
              element.functionID == 'ACT041003' ||
              element.functionID == 'ACT041010'
            ) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          });
          break;
      }
    }
  }

  changeItemDetail(event) {
    if (typeof event.data !== 'undefined') {
      if (event?.data.data || event?.data.error) {
        return;
      } else {
        this.isLoadDataAcct = true;
        this.itemSelected = event?.data;
        this.loadDatadetail(this.itemSelected);
        // if (this.itemSelected && this.itemSelected.recID == event?.data.recID) {
        //   this.itemSelected = event?.data;
        //   return;
        // } else {

        // }
      }
    }
  }

  loadDatadetail(data) {
    this.acctTrans = [];
    this.settledInvoices = [];
    switch (data.subType) {
      case '9':
      case '2':
        this.acService
          .execApi('AC', 'SettledInvoicesBusiness', 'LoadDataAsync', [
            data.recID,
          ])
          .pipe(takeUntil(this.destroy$))
          .subscribe((res) => {
            if (res) {
              this.settledInvoices = res;
              this.loadTotalSet();
            }       
          });
        break;
    }
    this.acService
      .execApi('AC', 'AcctTransBusiness', 'LoadDataAsync', [data.recID])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res) {
          this.acctTrans = res;
          this.loadTotal();
          this.isLoadDataAcct = false;
        }    
      });
    this.changeTab(data.subType);
  }

  release(data: any) {
    this.acService
      .getCategoryByEntityName(this.view.formModel.entityName)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.dataCategory = res;
        this.shareService
          .codxRelease(
            'AC',
            data.recID,
            this.dataCategory.processID,
            this.view.formModel.entityName,
            this.view.formModel.funcID,
            '',
            '',
            ''
          )
          .pipe(takeUntil(this.destroy$))
          .subscribe((result) => {
            if (result?.msgCodeError == null && result?.rowCount) {
              this.notification.notifyCode('ES007');
              data.status = '3';
              this.itemSelected = { ...data };
              this.loadDatadetail(this.itemSelected);
              this.view.dataService.update(data).subscribe((res) => {});
              this.detectorRef.detectChanges();
            } else this.notification.notifyCode(result?.msgCodeError);
          });
      });
  }

  cancelRelease(data: any) {
    this.shareService
      .codxCancel('AC', data?.recID, this.view.formModel.entityName, null, null)
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: any) => {
        if (result && result?.msgCodeError == null) {
          this.notification.notifyCode('SYS034');
          this.acService.loadData('AC','CashPaymentsBusiness','UpdateStatusAsync',[data,'1'])
          .pipe(takeUntil(this.destroy$))
          .subscribe((res => {
            if (res) {
              this.itemSelected = res;
              this.loadDatadetail(this.itemSelected);
              this.view.dataService
                .update(this.itemSelected)
                .subscribe((res) => {});
              this.detectorRef.detectChanges();
            }
          }))
        } else this.notification.notifyCode(result?.msgCodeError);
      });
  }

  validateVourcher(data: any) {
    this.acService
      .execApi('AC', 'CashPaymentsBusiness', 'ValidateVourcherAsync', [data])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res) {
          data.status = '1';
          this.itemSelected = data;
          this.loadDatadetail(this.itemSelected);
          this.view.dataService
            .update(this.itemSelected)
            .subscribe();
        }
      });
  }

  post(data: any) {
    // this.acService.postVourcher(data).subscribe((res =>{

    // }))
  }

  loadjounal() {
    this.acService
      .execApi('AC', 'JournalsBusiness', 'GetJournalAsync', [this.journalNo])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.journal = res[0];
        this.oCash = res[1].data;
        this.hideFields = res[2];
      });
  }

  loadTotal() {
    this.totalacct = 0;
    this.totaloff = 0;
    for (let index = 0; index < this.acctTrans.length; index++) {
      if (!this.acctTrans[index].crediting) {
        this.totalacct = this.totalacct + this.acctTrans[index].transAmt;
      } else {
        this.totaloff = this.totaloff + this.acctTrans[index].transAmt;
      }
    }
  }

  loadTotalSet() {
    this.totalbalAmt = 0;
    this.totalsettledAmt = 0;
    for (let index = 0; index < this.settledInvoices.length; index++) {
      this.totalbalAmt = this.totalbalAmt + this.settledInvoices[index].balAmt;
      this.totalsettledAmt =
        this.totalsettledAmt + this.settledInvoices[index].settledAmt;
    }
  }

  setStyles(color): any {
    let styles = {
      backgroundColor: color,
      color: 'white',
    };
    return styles;
  }

  createLine(item) {
    if (item.crediting) {
      var data = this.acctTrans.filter((x) => x.entryID == item.entryID);
      let index = data.filter((x) => x.crediting == item.crediting).findIndex((x) => x.recID == item.recID);
      if (index == data.filter((x) => x.crediting == item.crediting).length - 1) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  created(e: any, ele: TabComponent) {
    this.changeTab(this.itemSelected.subType, ele);
  }
  changeTab(e?: any, ele?: TabComponent) {
    ele = this.tabObj;
    if (ele) {
      ele.hideTab(0, false);
      switch (e) {
        case '1':
        case '3':
        case '4':
        case '11':
          ele.hideTab(1, true);
          ele.hideTab(2, true);
          break;
        case '2':
          ele.hideTab(1, false);
          ele.hideTab(2, true);
          break;
        case '9':
          ele.hideTab(1, false);
          ele.hideTab(2, false);
          break;
      }
    }
  }

  print(data: any, reportID: any, reportType: string = 'V') {
    this.api
      .execSv(
        'rptsys',
        'Codx.RptBusiniess.SYS',
        'ReportListBusiness',
        'GetListReportByIDandType',
        [reportID, reportType]
      )
      .subscribe((res: any) => {
        if (res != null) {
          if (res.length > 1) {
            this.openPopupCashReport(data, res);
          } else if (res.length == 1) {
            this.codxService.navigate(
              '',
              'ac/report/detail/' + `${res[0].recID}`
            );
          }
        }
      });
  }

  openPopupCashReport(data: any, reportList: any) {
    var obj = {
      data: data,
      reportList: reportList,
      url: 'ac/report/detail/',
    };
    let opt = new DialogModel();
    var dialog = this.callfunc.openForm(
      CodxListReportsComponent,
      '',
      400,
      600,
      '',
      obj,
      '',
      opt
    );
  }
  //#endregion
}
