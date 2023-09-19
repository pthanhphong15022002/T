import { Component, ElementRef, EventEmitter, Injector, Input, Output, SimpleChange, ViewChild } from '@angular/core';
import { extend } from '@syncfusion/ej2-angular-grids';
import { CallFuncService, DataRequest, DialogModel, FormModel, RequestOption, SidebarModel, TenantStore, UIComponent } from 'codx-core';
import { VouchersLines } from '../../../models/VouchersLines.model';
import { Vouchers } from '../../../models/Vouchers.model';
import { Subject, takeUntil } from 'rxjs';
import { AnimationModel } from '@syncfusion/ej2-angular-progressbar';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { IssueTransactionsAddComponent } from '../issue-transactions-add/issue-transactions-add.component';
import { CodxListReportsComponent } from 'projects/codx-share/src/lib/components/codx-list-reports/codx-list-reports.component';

@Component({
  selector: 'lib-issue-transactions-detail',
  templateUrl: './issue-transactions-detail.component.html',
  styleUrls: ['./issue-transactions-detail.component.css']
})
export class IssueTransactionsDetailComponent extends UIComponent {
  
  @Input() recID: any;
  @Input() dataItem: any;
  @Input() dataService: any;
  @Input() formModel: any;
  @Input() journal: any;
  @Input() journalNo: any;
  @Input() funcName: any;
  @Input() hideFields: any;
  @ViewChild('memoContent', { read: ElementRef })
  memoContent: ElementRef<HTMLElement>;
  public animation: AnimationModel = { enable: true, duration: 500, delay: 0 };
  public animationAcctTrans: AnimationModel = { enable: true, duration: 500, delay: 0 };
  vouchersLines: Array<VouchersLines> = [];
  voucher: Vouchers;
  loading: any = false;
  loadingAcct: any = false;
  isLoadDataAcct: any = true;
  acctTrans: any;
  totalacct: any = 0;
  totaloff: any = 0;
  totalQuantity: any = 0;
  totalAmt: any = 0;
  expanding: boolean = false;
  overflowed: boolean = false;
  voucherCopy: Vouchers = new Vouchers();
  private destroy$ = new Subject<void>();
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
  fmAccTrans: FormModel = {
    formName: 'AcctTrans',
    gridViewName: 'grvAcctTrans',
    entityName: 'AC_AcctTrans',
  };
  constructor(
    private inject: Injector,
    private callfunc: CallFuncService,
    private tenant: TenantStore,
  )
  {
    super(inject);
  }

  onInit(): void {
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }

  ngOnChanges(value: SimpleChange) {
    // this.loadDataLine(this.dataItem,this.recID);

    if(this.dataItem)
    {
      this.loadDataLine(this.dataItem);
    }
    else 
    {
      if(!this.recID)
        return;
      this.api
      .exec('IV', 'VouchersBusiness', 'LoadDataByRecIDAsync', [
        this.recID,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if(res)
        {
          this.dataItem = res;
          this.loadDataLine(this.dataItem);
        }
      });
    }
  }  

  ngAfterViewInit() {
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

  changeDataMF(e: any, data: any)
  {
    this.showHideMF(e, data);
  }

  edit(e, data) {
    if (data) {
      this.dataService.dataSelected = data;
    }
    this.dataService
      .edit(this.dataService.dataSelected)
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
          option.DataService = this.dataService;
          option.FormModel = this.formModel;
          option.isFull = true;
          let dialog = this.callfunc.openSide(
            IssueTransactionsAddComponent,
            obj,
            option,
            this.formModel.funcID
          );
          dialog.closed
          .pipe(takeUntil(this.destroy$))
          .subscribe((res) => {
            if (res.event != null) {
              if (res.event['update']) {
                this.dataItem = res.event['data'];
                this.loadDataLine(this.dataItem);
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
    this.dataService
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
          option.DataService = this.dataService;
          option.FormModel = this.formModel;
          option.isFull = true;
          let dialog = this.callfunc.openSide(
            IssueTransactionsAddComponent,
            obj,
            option,
            this.formModel.funcID
          );
          dialog.closed
          .pipe(takeUntil(this.destroy$))
          .subscribe((res) => {
            if (res.event != null) {
              if (res.event['update']) {
                this.dataItem = res.event['data'];
                this.loadDataLine(this.dataItem);
              }
            }
          });
        }
      });
  }

  delete(data) {
    if (data) {
      this.dataService.dataSelected = data;
    }
    this.dataService.delete([data], true)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {});
  }

  export(data) {
    var gridModel = new DataRequest();
    gridModel.formName = this.formModel.formName;
    gridModel.entityName = this.formModel.entityName;
    gridModel.funcID = this.formModel.funcID;
    gridModel.gridViewName = this.formModel.gridViewName;
    gridModel.page = this.dataService.request.page;
    gridModel.pageSize = this.dataService.request.pageSize;
    gridModel.predicate = this.dataService.request.predicates;
    gridModel.dataValue = this.dataService.request.dataValues;
    gridModel.entityPermission = this.formModel.entityPer;
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
      formModel:this.formModel
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

  loadDataLine(data) {
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

  onClickShowLess(): void {
    this.expanding = !this.expanding;
    this.detectorRef.detectChanges();
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

  formatDate(date) {
    return new Date(date).toLocaleDateString();
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

  setDefault(o) {
    return this.api.exec('IV', 'VouchersBusiness', 'SetDefaultAsync', [
      this.journalNo,
    ]);
  }
}
