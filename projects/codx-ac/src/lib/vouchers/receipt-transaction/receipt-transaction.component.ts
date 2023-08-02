import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
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
import { IJournal } from '../../journals/interfaces/IJournal.interface';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { ActivatedRoute } from '@angular/router';
import { CodxAcService } from '../../codx-ac.service';
import { PopAddReceiptTransactionComponent } from './pop-add-receipt-transaction/pop-add-receipt-transaction.component';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { VouchersLines } from '../../models/VouchersLines.model';
import { Subject, takeUntil } from 'rxjs';
import { CodxListReportsComponent } from 'projects/codx-share/src/lib/components/codx-list-reports/codx-list-reports.component';
import { AnimationModel } from '@syncfusion/ej2-angular-progressbar';

@Component({
  selector: 'lib-receipt-transaction',
  templateUrl: './receipt-transaction.component.html',
  styleUrls: ['./receipt-transaction.component.css'],
  changeDetection : ChangeDetectionStrategy.OnPush,
})
export class ReceiptTransactionComponent extends UIComponent {
  //#region Constructor

  views: Array<ViewModel> = [];
  @ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  @ViewChild('templateDetail') templateDetail?: TemplateRef<any>;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  @ViewChild('memoContent', { read: ElementRef })
  memoContent: ElementRef<HTMLElement>;
  public animation: AnimationModel = { enable: true, duration: 1000, delay: 0 };
  private destroy$ = new Subject<void>();
  dialog!: DialogRef;
  button?: ButtonModel = { id: 'btnAdd' };
  headerText: any;
  funcName: any;
  parentID: string;
  journalNo: string;
  totalacct: any = 0;
  totaloff: any = 0;
  totalQuantity: any = 0;
  totalAmt: any = 0;
  width: any;
  height: any;
  innerWidth: any;
  itemSelected: any;
  objectname: any;
  oData: any;
  lsVatCode: any;
  entityName: any;
  receiptsFormName: string = 'VouchersReceipts';
  receiptsGrvName: string = 'grvVouchersReceipts';
  issuesFormName: string = 'VouchersIssues';
  issuesGrvName: string = 'grvVouchersIssues';
  funcID: any;
  acctTrans: any;
  vllReceipt: any = 'AC116';
  vllIssue: any = 'AC117';
  overflowed: boolean = false;
  expanding: boolean = false;
  isLoadDataAcct: any = true;
  loading: any = false;
  loadingAcct: any = false;
  journal: IJournal;
  lockFields: Array<any> = [];
  fmVouchers: FormModel = {
    formName: '',
    gridViewName: '',
    entityName: 'IV_Vouchers',
  };
  fmVouchersLines: FormModel = {
    formName: '',
    gridViewName: '',
    entityName: 'IV_VouchersLines',
  };
  vouchersLines: Array<VouchersLines> = [];
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
  fmAccTrans: FormModel = {
    formName: 'AcctTrans',
    gridViewName: 'grvAcctTrans',
    entityName: 'AC_AcctTrans',
  };
  parent: any;
  constructor(
    private inject: Injector,
    private acService: CodxAcService,
    private notification: NotificationsService,
    private callfunc: CallFuncService,
    private routerActive: ActivatedRoute,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.routerActive.queryParams
    .pipe(takeUntil(this.destroy$))
    .subscribe((params) => {
      this.journalNo = params?.journalNo;
      if (params?.parent) {
        this.cache.functionList(params.parent)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res) => {
          if (res) this.parent = res;
        });
      }
    });
    this.funcID = this.routerActive.snapshot.params['funcID'];
    this.loadLockFields();
  }
  //#endregion

  //#region Init

  onInit(): void {}

  ngAfterViewInit() {

    this.loadFormModel();

    this.views = [
      {
        type: ViewType.grid,
        active: false,
        sameData: true,
        model: {
          template2: this.templateMore,
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
    this.view.setRootNode(this.parent?.customName);
  }

  ngOnDestroy() {
    this.view.setRootNode('');
    this.onDestroy();
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewChecked(): void {
    const element: HTMLElement = this.memoContent?.nativeElement;
    this.overflowed = element?.scrollWidth > element?.offsetWidth;
  }
  //#endregion

  //#region Event

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
      case 'SYS002':
        this.export(data);
        break;
      case 'ACT070808':
      case 'ACT071408':
        this.print(data, e.functionID);
        break;
    }
  }

  onClickShowLess(): void {
    this.expanding = !this.expanding;
    this.detectorRef.detectChanges();
  }
  //#endregion

  //#region Method

  setDefault(o) {
    return this.api.exec('IV', 'VouchersBusiness', 'SetDefaultAsync', [
      this.journalNo,
    ]);
  }
  add(e) {
    this.headerText = this.funcName;
    this.view.dataService
      .addNew((o) => this.setDefault(o))
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if(res)
        {
          var obj = {
            formType: 'add',
            headerText: this.headerText,
            formModelMaster: this.fmVouchers,
            formModelLine: this.fmVouchersLines,
            lockFields: this.lockFields,
          };
          let option = new SidebarModel();
          option.DataService = this.view.dataService;
          option.FormModel = this.view.formModel;
          option.isFull = true;
          this.dialog = this.callfunc.openSide(
            PopAddReceiptTransactionComponent,
            obj,
            option,
            this.view.funcID
          );
        }
      });
  }
  edit(e, data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if(res)
        {
          var obj = {
            formType: 'edit',
            headerText: this.funcName,
            formModelMaster: this.fmVouchers,
            formModelLine: this.fmVouchersLines,
            lockFields: this.lockFields,
          };
          let option = new SidebarModel();
          option.DataService = this.view.dataService;
          option.FormModel = this.view.formModel;
          option.isFull = true;
          this.dialog = this.callfunc.openSide(
            PopAddReceiptTransactionComponent,
            obj,
            option,
            this.view.funcID
          );
          this.dialog.closed
          .pipe(takeUntil(this.destroy$))
          .subscribe((res) => {
            if (res.event != null) {
              if (res.event['update']) {
                this.itemSelected = res.event['data'];
                this.loadDatadetail(this.itemSelected);
              }
            }
          });
        }
      });
  }
  copy(e, data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .copy((o) => this.setDefault(o))
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if(res)
        {
          var obj = {
            formType: 'copy',
            headerText: this.funcName,
            formModelMaster: this.fmVouchers,
            formModelLine: this.fmVouchersLines,
            lockFields: this.lockFields,
          };
          let option = new SidebarModel();
          option.DataService = this.view.dataService;
          option.FormModel = this.view.formModel;
          option.isFull = true;
          this.dialog = this.callfunc.openSide(
            PopAddReceiptTransactionComponent,
            obj,
            option,
            this.view.funcID
          );
        }
      });
  }
  delete(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.delete([data], true)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {});
  }
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
  //#endregion

  //#region Function

  beforeDelete(opt: RequestOption, data) {
    opt.methodName = 'DeleteAsync';
    opt.className = 'VouchersBusiness';
    opt.assemblyName = 'IV';
    opt.service = 'IV';
    opt.data = data;
    return true;
  }
  loadDatadetail(data) {
    this.loading = true;
    this.loadingAcct = true;
    this.acctTrans = [];
    this.api
      .exec('IV', 'VouchersLinesBusiness', 'LoadDataAsync', [
        data.recID,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.vouchersLines = res;
        this.loadTotal();
        this.loading = false;
        this.detectorRef.detectChanges();
      });
    this.api
      //.exec('AC', 'AcctTransBusiness', 'LoadDataAsync', 'e973e7b7-10a1-11ee-94b4-00155d035517')
      .exec('AC', 'AcctTransBusiness', 'LoadDataAsync', [data.recID])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if(res)
        {
          this.acctTrans = res;
          this.loadAcctTransTotal();
          this.isLoadDataAcct = false;
        }
        this.loadingAcct = false;
        this.detectorRef.detectChanges();
      });
  }
  changeItemDetail(event) {
    if (event?.data == null)
      return;
    if (event?.data.data || event?.data.error) {
      return;
    } else {
      if (this.itemSelected && this.itemSelected.recID == event?.data.recID) {
        return;
      } else {
        this.isLoadDataAcct = true;
        this.itemSelected = event?.data;
        this.loadDatadetail(this.itemSelected);
      }
    }
    this.expanding = false;
    this.detectorRef.detectChanges();
  }

  clickChange(data) {
    this.itemSelected = data;
    this.loadDatadetail(data);
  }

  formatDate(date) {
    return new Date(date).toLocaleDateString();
  }

  loadTotal(){
    this.totalAmt = 0;
    this.totalQuantity = 0;
    this.vouchersLines.forEach((item) => {
      if(item)
      {
        this.totalQuantity += item.quantity;
        this.totalAmt += item.costAmt;
      }
    });
  }

  loadAcctTransTotal() {
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

  createLine(item) {
    if (item.crediting) {
      var data = this.acctTrans.filter((x) => x.entryID == item.entryID);
      let index = data
        .filter((x) => x.crediting == item.crediting)
        .findIndex((x) => x.recID == item.recID);
      if (
        index ==
        data.filter((x) => x.crediting == item.crediting).length - 1
      ) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  loadLockFields() {
    this.acService
      .execApi('AC', 'JournalsBusiness', 'GetJournalAsync', [this.journalNo])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.journal = res[0];
        this.lockFields = res[2];
      });
  }

  changeDataMF(e: any, data: any)
  {
    if(this.funcID == 'ACT0708')
    {
      var bm = e.filter(
        (x: { functionID: string }) =>
          x.functionID == 'ACT070806' || // ghi sổ
          x.functionID == 'ACT070804' || // gửi duyệt
          x.functionID == 'ACT070805' || // hủy yêu cầu duyệt
          x.functionID == 'ACT070807' || // khôi phục
          x.functionID == 'ACT070808' || // in
          x.functionID == 'ACT070803' // kiểm tra tính hợp lệ
      );
    }
    if(this.funcID == 'ACT0714')
    {
      var bm = e.filter(
        (x: { functionID: string }) =>
          x.functionID == 'ACT071406' || // ghi sổ
          x.functionID == 'ACT071404' || // gửi duyệt
          x.functionID == 'ACT071405' || // hủy yêu cầu duyệt
          x.functionID == 'ACT071407' || // khôi phục
          x.functionID == 'ACT071408' || // in
          x.functionID == 'ACT071403' // kiểm tra tính hợp lệ
      );
    }
    if (bm.length > 0) {
      switch(data.status)
      {
        case '0':
          bm.forEach((morefunction) => {
            if(morefunction.functionID == 'ACT070803' || morefunction.functionID == 'ACT070808'
            || morefunction.functionID == 'ACT071403' || morefunction.functionID == 'ACT071408')
              morefunction.disabled = false;
            else
              morefunction.disabled = true;
          });
          break;
        case '1':
          if(this.journal.approvalControl == '1' || this.journal.approvalControl == '2')
          {
            bm.forEach((morefunction) => {
              if(morefunction.functionID == 'ACT070804' || morefunction.functionID == 'ACT070808'
              || morefunction.functionID == 'ACT071404' || morefunction.functionID == 'ACT071408')
                morefunction.disabled = false;
              else
                morefunction.disabled = true;
            });
          }
          else if(this.journal.approvalControl == '' || this.journal.approvalControl == '0')
          {
            bm.forEach((morefunction) => {
              if(morefunction.functionID == 'ACT070806' || morefunction.functionID == 'ACT070808'
              || morefunction.functionID == 'ACT071406' || morefunction.functionID == 'ACT071408')
                morefunction.disabled = false;
              else
                morefunction.disabled = true;
            });
          }
          break;
        case '3':
          bm.forEach((morefunction) => {
            if(morefunction.functionID == 'ACT070805' || morefunction.functionID == 'ACT070808'
            || morefunction.functionID == 'ACT071405' || morefunction.functionID == 'ACT071408')
              morefunction.disabled = false;
            else
              morefunction.disabled = true;
          });
          break;
        case '5':
          bm.forEach((morefunction) => {
            if(morefunction.functionID == 'ACT070806' || morefunction.functionID == 'ACT070808'
            || morefunction.functionID == 'ACT071406' || morefunction.functionID == 'ACT071408')
              morefunction.disabled = false;
            else
              morefunction.disabled = true;
          });
          break;
        case '6':
          bm.forEach((morefunction) => {
            if(morefunction.functionID == 'ACT070807' || morefunction.functionID == 'ACT070808'
            || morefunction.functionID == 'ACT071407' || morefunction.functionID == 'ACT071408')
              morefunction.disabled = false;
            else
              morefunction.disabled = true;
          });
          break;
        case '9':
          bm.forEach((morefunction) => {
            if(morefunction.functionID == 'ACT070806' || morefunction.functionID == 'ACT070808'
            || morefunction.functionID == 'ACT071406' || morefunction.functionID == 'ACT071408')
              morefunction.disabled = false;
            else
              morefunction.disabled = true;
          });
        break;
      }
    }
  }

  loadFormModel()
  {
    switch (this.funcID) {
      case 'ACT0708':
        this.cache.moreFunction(this.receiptsFormName, this.receiptsGrvName)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
          if (res && res.length) {
            let m = res.find((x) => x.functionID == 'ACT070801');
            if (m)
            {
              this.fmVouchers.formName = m.formName;
              this.fmVouchers.gridViewName = m.gridViewName;
              this.view!.formModel.formName = m.formName;
              this.view!.formModel.gridViewName = m.gridViewName;
            }

            let n = res.find((x) => x.functionID == 'ACT070800');
            if (n) this.funcName = n.defaultName;

            let o = res.find((x) => x.functionID == 'ACT070802');
            if(o)
            {
              this.fmVouchersLines.formName = 'VouchersLinesReceipts';
              this.fmVouchersLines.gridViewName = 'grvVouchersLinesReceipts';
            }
          }
        });
        break;
      case 'ACT0714':
        this.cache.moreFunction(this.issuesFormName, this.issuesGrvName)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
          if (res && res.length) {
            let m = res.find((x) => x.functionID == 'ACT071401');
            if (m)
            {
              this.fmVouchers.formName = m.formName;
              this.fmVouchers.gridViewName = m.gridViewName;
              this.view!.formModel.formName = m.formName;
              this.view!.formModel.gridViewName = m.gridViewName;
            }

            let n = res.find((x) => x.functionID == 'ACT071400');
            if (n) this.funcName = n.defaultName;

            let o = res.find((x) => x.functionID == 'ACT071402');
            if(o)
            {
              this.fmVouchersLines.formName = 'VouchersLinesIssues';
              this.fmVouchersLines.gridViewName = 'grvVouchersLinesIssues';
            }
          }
        });
        break;
    }
  }
  
  print(data: any, reportID: any, reportType: string = 'V') {
    this.api
      .execSv(
        'rptsys',
        'Codx.RptBusiniess.RP',
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
