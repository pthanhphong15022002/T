import { ChangeDetectionStrategy, Component, Injector, Optional } from '@angular/core';
import { CRUDService, DataRequest, DialogData, DialogModel, DialogRef, FormModel, NotificationsService, UIComponent } from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';
import { Subject, map, takeUntil } from 'rxjs';
import { CashreceiptsAddComponent } from '../../vouchers/cashreceipts/cashreceipts-add/cashreceipts-add.component';
import { CashPaymentAddComponent } from '../../vouchers/cashpayments/cashpayments-add/cashpayments-add.component';

@Component({
  selector: 'lib-choose-journal',
  templateUrl: './choose-journal.component.html',
  styleUrls: ['./choose-journal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChooseJournalComponent extends UIComponent {
  dialog!: DialogRef;
  type:any;
  model:any;
  journalNo:any;
  refID:any;
  refType:any;
  refNo:any;
  totalAmt:any = 0;
  cashRecieptSV:CRUDService;
  cashPaymentSV:CRUDService;
  fmcashReciept:FormModel={
    formName:'CashReceipts',
    gridViewName:'grvCashReceipts',
    entityName:'AC_CashReceipts',
    funcID:'ACT211'
  }
  fmcashPayment:FormModel={
    formName:'CashPayments',
    gridViewName:'grvCashPayments',
    entityName:'AC_CashPayments',
    funcID:'ACT213'
  }
  headerText:any;
  journal:any;
  baseCurr: any;
  isNext:any = false;
  private destroy$ = new Subject<void>();
  constructor(
    inject: Injector,
    private notification: NotificationsService,
    private acService: CodxAcService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.type = dialogData.data.type;
    this.refID = dialogData.data.refID;
    this.refType = dialogData.data.refType;
    this.refNo = dialogData.data.refNo;
    this.totalAmt = dialogData.data.totalAmt;
    this.model = {
      journalType:this.type
    }
    this.cashRecieptSV = this.acService.createCRUDService(
      inject,
      this.fmcashReciept,
      'AC'
    );
    this.cashPaymentSV = this.acService.createCRUDService(
      inject,
      this.fmcashPayment,
      'AC'
    );
  }
  onInit(): void {
    this.acService.setPopupSize(this.dialog, '350px', '150px');
    (this.dialog.dialog as any).properties.minHeight = 0;
    let funcID = this.type == 'CP' ? this.fmcashPayment.funcID : this.fmcashReciept.funcID;
    this.cache.functionList(funcID).subscribe((res) => {
      if (res) {
        this.headerText = res?.defaultName || res?.customName;
      }
    });
    this.cache
      .viewSettingValues('ACParameters')
      .pipe(map((data) => data.filter((f) => f.category === '1')?.[0]))
      .subscribe((res) => {
        let dataValue = JSON.parse(res.dataValue);
        this.baseCurr = dataValue?.BaseCurr || '';
      });
  }

  valueChange(event: any) {
    this.journalNo = event?.data;
    this.getJournal();
  }

  onSave() { 
    if(this.type == 'CR'){
      this.cashRecieptSV
        .addNew((o) => this.setDefault())
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next:(res:any)=>{
            if (res) {
              res.isAdd = true;
              res.totalAmt = this.totalAmt;
              res.refID = this.refID;
              res.refType = this.refType;
              res.refNo = this.refNo;
              let data = {
                headerText: this.headerText, //? tiêu đề voucher
                journal: { ...this.journal }, //?  data journal
                oData: { ...res }, //?  data của cashpayment
                baseCurr: this.baseCurr, //?  đồng tiền hạch toán
                isActive:false
              };
              let opt = new DialogModel();
              opt.DataService = this.cashRecieptSV;
              opt.FormModel = this.fmcashReciept;
              opt.IsFull = true;
              this.cache.gridViewSetup(this.fmcashReciept.formName,this.fmcashReciept.gridViewName).subscribe((res:any)=>{
                if (res) {
                  let dialog = this.callfc.openForm(
                    CashreceiptsAddComponent,
                    '',
                    null,
                    null,
                    this.fmcashReciept.funcID,
                    data,
                    '',
                    opt
                  );
                  dialog.closed.subscribe((res) => {
                    if (res && res?.event?.data) {
                      this.dialog.close(res.event);
                    }
                  });
                }
              })
            }
          },
        })
    }else{
      this.cashPaymentSV
        .addNew((o) => this.setDefault())
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next:(res:any)=>{
            if (res) {
              res.isAdd = true;
              res.totalAmt = this.totalAmt;
              res.refID = this.refID;
              res.refType = this.refType;
              res.refNo = this.refNo;
              let data = {
                headerText: this.headerText, //? tiêu đề voucher
                journal: { ...this.journal }, //?  data journal
                oData: { ...res }, //?  data của cashpayment
                baseCurr: this.baseCurr, //?  đồng tiền hạch toán
                isActive:false
              };
              let opt = new DialogModel();
              opt.DataService = this.cashPaymentSV;
              opt.FormModel = this.fmcashPayment;
              opt.IsFull = true;
              this.cache.gridViewSetup(this.fmcashPayment.formName,this.fmcashPayment.gridViewName).subscribe((res:any)=>{
                if (res) {
                  let dialog = this.callfc.openForm(
                    CashPaymentAddComponent,
                    '',
                    null,
                    null,
                    this.fmcashPayment.funcID,
                    data,
                    '',
                    opt
                  );
                  dialog.closed.subscribe((res) => {
                    if (res && res?.event?.data) {
                      this.dialog.close(res.event);
                    }
                  });
                }
              })
            }
          },
          complete:()=>{}
        })
    } 

  }

  setDefault() {
    let className = this.type == 'CP' ? 'CashPaymentsBusiness' : 'CashReceiptsBusiness';
    return this.api.exec('AC', className, 'SetDefaultAsync', [
      null,
      this.journalNo,
      "",
    ]);
  }

  getJournal() {
    let options = new DataRequest();
    options.entityName = 'AC_Journals';
    options.pageLoading = false;
    options.predicates = 'JournalNo=@0';
    options.dataValues = this.journalNo;
    this.api
      .execSv('AC', 'Core', 'DataBusiness', 'LoadDataAsync', options)
      .pipe(map((r) => r?.[0] ?? []))
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.journal = res[0];
        this.isNext = true;
        this.detectorRef.detectChanges();
      });
  }
}
