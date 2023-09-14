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
  PageLink,
  PageTitleService,
  RequestOption,
  SidebarModel,
  TenantStore,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { IJournal } from '../../journals/interfaces/IJournal.interface';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { ActivatedRoute } from '@angular/router';
import { CodxAcService } from '../../codx-ac.service';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { VouchersLines } from '../../models/VouchersLines.model';
import { Subject, combineLatest, map, takeUntil } from 'rxjs';
import { CodxListReportsComponent } from 'projects/codx-share/src/lib/components/codx-list-reports/codx-list-reports.component';
import { AnimationModel } from '@syncfusion/ej2-angular-progressbar';
import { IssueTransactionsAddComponent } from './issue-transactions-add/issue-transactions-add.component';
import { Vouchers } from '../../models/Vouchers.model';

@Component({
  selector: 'lib-issue-transactions',
  templateUrl: './issue-transactions.component.html',
  styleUrls: ['./issue-transactions.component.css'],
  changeDetection : ChangeDetectionStrategy.OnPush,
})
export class IssueTransactionsComponent extends UIComponent {
  //#region Constructor

  views: Array<ViewModel> = [];
  @ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  @ViewChild('templateDetail') templateDetail?: TemplateRef<any>;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  @ViewChild('memoContent', { read: ElementRef })
  memoContent: ElementRef<HTMLElement>;
  public animation: AnimationModel = { enable: true, duration: 500, delay: 0 };
  public animationAcctTrans: AnimationModel = { enable: true, duration: 500, delay: 0 };
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
  acctTrans: any;
  vllReceipt: any = 'AC116';
  vllIssue: any = 'AC117';
  overflowed: boolean = false;
  expanding: boolean = false;
  isLoadDataAcct: any = true;
  loading: any = false;
  loadingAcct: any = false;
  journal: IJournal;
  voucherCopy: Vouchers = new Vouchers();
  hideFields: Array<any> = [];
  fmVouchers: FormModel = {
    formName: 'VouchersIssues',
    gridViewName: 'grvVouchersIssues',
    entityName: 'IV_Vouchers',
  };
  fmVouchersLines: FormModel = {
    formName: 'VouchersLinesIssues',
    gridViewName: 'grvVouchersLinesIssues',
    entityName: 'IV_VouchersLines',
  };
  vouchersLines: Array<VouchersLines> = [];
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
    private tenant: TenantStore,
    private pageTitleService: PageTitleService,
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
    this.loadhideFields();
  }
  //#endregion

  //#region Init

  onInit(): void {}

  ngAfterViewInit() {

    this.cache.functionList(this.view.funcID).pipe(takeUntil(this.destroy$)).subscribe((res) => {
      this.funcName = res.defaultName;
    });

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

    const options1 = new DataRequest();
    options1.entityName = 'SYS_FunctionList';
    options1.pageLoading = false;
    options1.predicates = 'ParentID=@0';
    options1.dataValues = 'ACT';

    const options2 = new DataRequest();
    options2.entityName = 'AC_Journals';
    options2.pageLoading = false;
    options2.predicates = 'Status=@0';
    options2.dataValues = '1';

    combineLatest({
      functionList: this.acService.loadDataAsync('SYS', options1),
      journals: this.acService.loadDataAsync('AC', options2),
      vll077: this.cache.valueList('AC077').pipe(map((v) => v.datas)),
    }).subscribe(({ functionList, journals, vll077 }) => {
      console.log(journals);
      const links: PageLink[] = [];
      for (const journal of journals as IJournal[]) {
        if (journal.journalNo === this.journalNo) {
          continue;
        }

        const functionId: string = vll077.find(
          (v) => v.value === journal.journalType
        )?.default;
        links.push({
          title: journal.journalDesc,
          path:
            functionList.find((f) => f.functionID === functionId)?.url +
            `?journalNo=${journal.journalNo}`,
        });
      }

      this.pageTitleService.setChildren(links);
    });
  }

  ngDoCheck(){
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
        this.copy(data);
        break;
      case 'SYS002':
        this.export(data);
        break;
      case 'ACT070808':
      case 'ACT071408':
        this.printVoucher(data, e.functionID);
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
            hideFields: this.hideFields,
            journal: this.journal,
            oData: res,
          };
          let option = new SidebarModel();
          option.DataService = this.view.dataService;
          option.FormModel = this.view.formModel;
          option.isFull = true;
          this.dialog = this.callfunc.openSide(
            IssueTransactionsAddComponent,
            obj,
            option,
            this.view.funcID
          );
          this.dialog.closed
          .pipe(takeUntil(this.destroy$))
          .subscribe((res) => {
            if (res.event != null) {
              if (res.event['update']) {
                this.itemSelected = res.event['data']?.data;
                this.loadDatadetail(this.itemSelected);
              }
            }
          });
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
            hideFields: this.hideFields,
            journal: this.journal,
            oData: res,
          };
          let option = new SidebarModel();
          option.DataService = this.view.dataService;
          option.FormModel = this.view.formModel;
          option.isFull = true;
          this.dialog = this.callfunc.openSide(
            IssueTransactionsAddComponent,
            obj,
            option,
            this.view.funcID
          );
          this.dialog.closed
          .pipe(takeUntil(this.destroy$))
          .subscribe((res) => {
            if (res.event != null) {
              if (res.event['update']) {
                this.itemSelected = res.event['data']?.data;
                this.loadDatadetail(this.itemSelected);
              }
            }
          });
        }
      });
  }

  copy(dataCopy) {
    if(dataCopy)
    {
      this.voucherCopy = Object.assign(this.voucherCopy, dataCopy);
    }
    this.view.dataService
      .copy((o) => this.setDefault(o))
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if(res)
        {
          this.voucherCopy.recID = res.recID;
          this.voucherCopy.voucherNo = res.voucherNo;
          this.voucherCopy.status = res.status;
          this.voucherCopy['_uuid'] = res['_uuid'];
          var obj = {
            formType: 'copy',
            headerText: this.funcName,
            formModelMaster: this.fmVouchers,
            formModelLine: this.fmVouchersLines,
            hideFields: this.hideFields,
            journal: this.journal,
            oData: { ...this.voucherCopy },
          };
          let option = new SidebarModel();
          option.DataService = this.view.dataService;
          option.FormModel = this.view.formModel;
          option.isFull = true;
          this.dialog = this.callfunc.openSide(
            IssueTransactionsAddComponent,
            obj,
            option,
            this.view.funcID
          );
          this.dialog.closed
          .pipe(takeUntil(this.destroy$))
          .subscribe((res) => {
            if (res.event != null) {
              if (res.event['update']) {
                this.itemSelected = res.event['data']?.data;
                this.loadDatadetail(this.itemSelected);
              }
            }
          });
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
        if(res)
        {
          this.vouchersLines = res;
          this.loadTotal();
        }
        this.loading = false;
        this.detectorRef.detectChanges();
      });
    this.api
      .exec('AC', 'AcctTransBusiness', 'GetAccountingAsync', [data.recID])
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

  loadhideFields() {
    this.acService
      .execApi('AC', 'ACBusiness', 'GetJournalAsync', [this.journalNo])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.journal = res.journal;
        this.hideFields = res.hideFields;
      });
  }

  changeDataMF(e: any, data: any)
  {
    this.showHideMF(e, data);
  }
  
  printVoucher(data: any, reportID: any, reportType: string = 'V') {
    this.api
      .execSv(
        'rptrp',
        'Codx.RptBusiness.RP',
        'ReportListBusiness',
        'GetListReportByIDandType',
        [reportID, reportType]
      )
      .subscribe((res: any) => {
        if (res != null) {
          if (res.length > 1) {
            this.openFormReportVoucher(data, res);
          } else if (res.length == 1) {
            window.open(
              '/' +
                this.tenant.getName() +
                '/' +
                'ac/report/detail/' +
                `${res[0].recID}`
            );
          }
        }
      });
  }

  openFormReportVoucher(data: any, reportList: any) {
    var obj = {
      data: data,
      reportList: reportList,
      url: 'ac/report/detail/',
      formModel:this.view.formModel
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

  showHideMF(e: any, data: any)
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
    if (bm.length > 0) {
      switch(data.status)
      {
        case '0':
          bm.forEach((morefunction) => {
            if(morefunction.functionID == 'ACT071403' || morefunction.functionID == 'ACT071408')
              morefunction.disabled = false;
            else
              morefunction.disabled = true;
          });
          break;
        case '1':
          if(this.journal.approvalControl == '1' || this.journal.approvalControl == '2')
          {
            bm.forEach((morefunction) => {
              if(morefunction.functionID == 'ACT071404' || morefunction.functionID == 'ACT071408')
                morefunction.disabled = false;
              else
                morefunction.disabled = true;
            });
          }
          else if(this.journal.approvalControl == '' || this.journal.approvalControl == '0' || this.journal.approvalControl == null)
          {
            bm.forEach((morefunction) => {
              if(morefunction.functionID == 'ACT071406' || morefunction.functionID == 'ACT071408')
                morefunction.disabled = false;
              else
                morefunction.disabled = true;
            });
          }
          break;
        case '3':
          bm.forEach((morefunction) => {
            if(morefunction.functionID == 'ACT071405' || morefunction.functionID == 'ACT071408')
              morefunction.disabled = false;
            else
              morefunction.disabled = true;
          });
          break;
        case '5':
          bm.forEach((morefunction) => {
            if(morefunction.functionID == 'ACT071406' || morefunction.functionID == 'ACT071408')
              morefunction.disabled = false;
            else
              morefunction.disabled = true;
          });
          break;
        case '6':
          bm.forEach((morefunction) => {
            if(morefunction.functionID == 'ACT071407' || morefunction.functionID == 'ACT071408')
              morefunction.disabled = false;
            else
              morefunction.disabled = true;
          });
          break;
        case '9':
          bm.forEach((morefunction) => {
            if(morefunction.functionID == 'ACT071406' || morefunction.functionID == 'ACT071408')
              morefunction.disabled = false;
            else
              morefunction.disabled = true;
          });
        break;
      }
    }
  }
  //#endregion
}
