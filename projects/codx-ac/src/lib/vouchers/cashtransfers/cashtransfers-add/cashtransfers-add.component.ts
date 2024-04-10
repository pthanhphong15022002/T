import { ChangeDetectionStrategy, Component, Injector, Optional, ViewChild } from '@angular/core';
import { CRUDService, CodxFormComponent, CodxInputComponent, DataRequest, DialogData, DialogRef, FormModel, NotificationsService, RequestOption, UIComponent, Util } from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-approval/tab/model/tabControl.model';
import { Subject, map, takeUntil } from 'rxjs';
import { CodxAcService, fmVATInvoices} from '../../../codx-ac.service';
import { RoundService } from '../../../round.service';
import { FormGroup } from '@angular/forms';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'lib-cashtransfers-add',
  templateUrl: './cashtransfers-add.component.html',
  styleUrls: ['./cashtransfers-add.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashtransfersAddComponent extends UIComponent {
  //#region Constructor
  @ViewChild('master') public master: CodxFormComponent;
  @ViewChild('eleCbxCashBook') eleCbxCashBook: CodxInputComponent;
  @ViewChild('eleCbxCashBook2') eleCbxCashBook2: CodxInputComponent;
  @ViewChild('elementTabDetail') elementTabDetail: any;
  headerText: string;
  dialog!: DialogRef;
  dialogData?: any;
  dataDefault: any;
  journal: any;
  fgVATInvoice: FormGroup;
  fmVATInvoice : FormModel = fmVATInvoices;
  VATInvoiceSV:CRUDService;
  tabInfo: TabModel[] = [ //? thiết lập footer
    { name: 'History', textDefault: 'Lịch sử', isActive: false },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'References', textDefault: 'Liên kết', isActive: false },
  ];
  baseCurr: any;
  preData:any;
  postDateControl:any;
  isload:any = false;
  isPreventChange:any = false;
  feeVATID:any='';
  vatPct:any=0;
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private notification: NotificationsService,
    private roundService: RoundService,
    private ngxLoader: NgxUiLoaderService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.dialogData = dialogData;
    this.headerText = dialogData.data?.headerText;
    this.dataDefault = { ...dialogData.data?.oData };
    this.preData = { ...dialogData.data?.oData };
    this.journal = { ...dialogData.data?.journal };
    this.baseCurr = dialogData.data?.baseCurr;
    this.fgVATInvoice = dialogData.data?.fgVATInvoice;
    this.fmVATInvoice = dialogData.data?.fmVATInvoice;
    this.VATInvoiceSV = dialogData.data?.VATInvoiceSV;
  }
  //#endregion Constructor

  //#region Init
  onInit(): void {
    this.acService.setPopupSize(this.dialog, '100%', '100%');
    this.cache
      .viewSettingValues('ACParameters')
      .pipe(
        takeUntil(this.destroy$),
        map((arr: any[]) => arr.find((a) => a.category === '1')),
        map((data) => JSON.parse(data.dataValue))
      ).subscribe((res:any)=>{
        if (res) {
          this.postDateControl = res?.PostedDateControl;
          this.feeVATID = res?.FeeVATID || '';
        }
      })
  }

  ngAfterViewInit() {
    if(this.master?.data?.coppyForm) this.master.data._isEdit = true; //? test copy để tạm
    if (this.master?.data?.isEdit) {
      let option = new DataRequest();
      option.entityName = 'AC_VATInvoices';
      option.predicate = 'TransID=@0';
      option.pageLoading = false;
      option.dataValue = this.master?.data?.recID;
      this.api
        .execSv(
          'AC',
          'ERM.Business.Core',
          'DataBusiness',
          'LoadDataAsync',
          option
        ).subscribe((res:any)=>{
          if (res && res[0].length) {
            let data = res[0][0];
            this.fmVATInvoice.currentData = data;
            this.fgVATInvoice.patchValue(data);
            this.detectorRef.detectChanges();
          }
        })
    }

  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }

  /**
   * *Hàm hủy các observable api
   */
  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  

  /**
   * *Hàm init sau khi form được vẽ xong
   * @param event
   */
  onAfterInitForm(event){
    this.detectorRef.detectChanges();
  }

  selecting(event){
    if (event.isSwiped) {
      event.cancel = true;
    }
  }

  createTabDetail(event: any, eleTab: TabComponent) {
    if (eleTab) {
      if (this.master.data.vatControl) {
        eleTab.hideTab(0,false);
      }else{
        eleTab.hideTab(0,true);
      }
    }
  }
  //#endregion Init

  //#region Event
  /**
   * *Hàm click nút đóng form
   */
  closeForm() {
    this.onDestroy();
    this.dialog.close();
  }

  /**
   * *Hàm xử lí khi change value trên master
   * @param event
   */
  valueChangeMaster(event: any) {
    if(this.isPreventChange){
      return;
    }
    let field = event?.field || event?.ControlName;
    let value = event?.data || event?.crrValue;
    this.master.setValue('updateColumns','',{});
    switch (field.toLowerCase()) {
      case 'cashbookid':
        // let indexcb = this.eleCbxCashBook?.ComponentCurrent?.dataService?.data.findIndex((x) => x.CashBookID == this.eleCbxCashBook?.ComponentCurrent?.value);
        // if(value == '' || value == null || indexcb == -1){
        //   this.isPreventChange = true;
        //   this.master.setValue(field,null,{});
        //   this.cashbookname1 = '';
        //   let memo = this.getMemoMaster();
        //   this.master.setValue('memo',memo,{});
        //   this.isPreventChange = false;
        //   this.detectorRef.detectChanges();
        //   return;
        // } 
        // this.cashbookname1 = this.eleCbxCashBook.ComponentCurrent.itemsSelected[0].CashBookName;
        this.cashBookIDChange(field);
        break;

      case 'cashbookid2':
        // let indexcb2 = this.eleCbxCashBook2?.ComponentCurrent?.dataService?.data.findIndex((x) => x.CashBookID == this.eleCbxCashBook2?.ComponentCurrent?.value);
        // if(value == '' || value == null || indexcb2 == -1){
        //   this.isPreventChange = true;
        //   this.master.setValue(field,null,{});
        //   this.cashbookname2 = '';
        //   let memo = this.getMemoMaster();
        //   this.master.setValue('memo',memo,{});
        //   this.isPreventChange = false;
        //   this.detectorRef.detectChanges();
        //   return;
        // } 
        // this.cashbookname2 = this.eleCbxCashBook2.ComponentCurrent.itemsSelected[0].CashBookName;
        this.cashBookID2Change(field)
        break;

      case 'currencyid':
        if(value == '' || value == null){
          this.isPreventChange = true;
          this.master.setValue(field, this.preData?.currencyID, {});
          if (this.preData?.currencyID != null) {
            var key = Util.camelize(field);
            var $error = (this.master as any).elRef.nativeElement?.querySelector('div[data-field="' + key + '"].errorMessage');
            if ($error) $error.classList.add('d-none');
          }
          this.isPreventChange = false;
          this.detectorRef.detectChanges();
          return;
        }
        this.currencyIDChange(field);
        break;
      case 'vatcontrol':
        if(value){
          this.VATInvoiceSV.addNew().subscribe((res: any) => {
            if (res) {
              this.fmVATInvoice.currentData = res;
              if (this.feeVATID != '' && this.feeVATID != null) {
                this.fmVATInvoice.currentData.vatid = this.feeVATID;
                this.VATChange();
              }
              this.elementTabDetail.hideTab(0,false);
            }
          })
        }else{
          this.api
            .execAction('AC_VATInvoices', [this.fmVATInvoice.currentData], 'DeleteAsync')
            .subscribe((res: any) => {});
          this.elementTabDetail.hideTab(0,true);
        }
        break;
      case 'fees':
        if (this.master.data.vatControl){
          this.VATChange();
        }
        break;
    }
  }

  valueChangeVATInvoice(event: any) {
    if(this.isPreventChange){
      return;
    }
    let field = event?.field || event?.ControlName;
    let value = event?.data || event?.crrValue;
    this.fmVATInvoice.currentData.updateColumns = '';
    switch (field.toLowerCase()) {
      case 'vatid':
        this.VATChange();
        break;
    }
  }

  //#endregion Event

  //#region Method

  /**
   * *Hàm hủy bỏ chứng từ
   */
  onDiscardVoucher() {
    if (this.master && this.master.data._isEdit) {
      this.notification.alertCode('AC0010', null).subscribe((res) => {
        if (res.event.status === 'Y') {
          this.detectorRef.detectChanges();
          this.dialog.dataService
            .delete([this.master.data], false, null, '', '', null, null, false)
            .pipe(takeUntil(this.destroy$))
            .subscribe((res) => {
              if (res.data != null) {
                this.notification.notifyCode('E0860');
                this.dialog.close({type:'discard'});
                this.onDestroy();
              }
            });
        }
      });
    }else{
      this.dialog.close();
      this.onDestroy();
    }
  }

  /**
   * *Hàm lưu chứng từ
   * @returns
   */
  onSaveVoucher(type) {
    this.ngxLoader.start();
    this.master
      .save(null, 0, '', '', false, { allowCompare: false })
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        let isError = false;
        if (!res) isError = true;
        if (res.hasOwnProperty('save')) {
          if (res.save.hasOwnProperty('data') && !res.save.data) isError = true;
        }
        if (res.hasOwnProperty('update')) {
          if (res.update.hasOwnProperty('data') && !res.update.data) isError = true;
        }
        if(isError){
          this.ngxLoader.stop();
          return;
        }
        this.saveVoucher(type);
      });
  }

  saveVoucher(type){
    this.api
      .exec('AC', 'CashTranfersBusiness', 'UpdateVoucherAsync', [
        this.master.data,
        this.master.data.vatControl ? this.fmVATInvoice.currentData : null,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:(res:any)=>{
          if (res?.update) {
            this.dialog.dataService.update(res.data,true).subscribe();
            if (type == 'save') {
              this.onDestroy();
              this.dialog.close();
            } else {
              this.api
                .exec('AC', 'CashPaymentsBusiness', 'SetDefaultAsync', [
                  null,
                  this.journal.journalNo,
                  ""
                ])
                .subscribe((res: any) => {
                  if (res) {
                    res.data.isAdd = true;
                    this.master.refreshData({ ...res.data });
                    this.detectorRef.detectChanges();
                  }
                });
            }
            if (this.master.data.isAdd || this.master.data.isCopy)
              this.notification.notifyCode('SYS006');
            else 
              this.notification.notifyCode('SYS007');
          }
        },
        complete:()=>{
          this.ngxLoader.stop();
        }
      });
  }
  //#endregion Method

  //#region Function
  cashBookIDChange(field:any){
    this.api.exec('AC', 'CashTranfersBusiness', 'ValueChangedAsync', [
      field,
      this.master.data,
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (res) {
        this.isPreventChange = true;
        this.master.setValue('accountID',(res?.data?.accountID),{});
        this.master.setValue('currencyID',(res?.data?.currencyID),{});
        this.master.setValue('exchangeRate',(res?.data?.exchangeRate),{});
        this.master.setValue('multi',(res?.data?.multi),{});
        this.master.setValue('transferAmt2',(res?.data?.transferAmt2),{});
        this.master.data.cashBook1Name = res?.data?.cashBook1Name;
        let memo = this.getMemoMaster();
        this.master.setValue('memo',memo,{});
        this.isPreventChange = false;
        this.preData = {...this.master?.data};
        this.detectorRef.detectChanges();
      }
    });
  }

  cashBookID2Change(field:any){
    this.api.exec('AC', 'CashTranfersBusiness', 'ValueChangedAsync', [
      field,
      this.master.data,
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (res) {
        this.isPreventChange = true;
        this.master.setValue('offsetAcctID',(res?.data?.offsetAcctID),{});
        this.master.setValue('currencyID',(res?.data?.currencyID),{});
        this.master.setValue('exchangeRate',(res?.data?.exchangeRate),{});
        this.master.setValue('multi',(res?.data?.multi),{});
        this.master.setValue('transferAmt2',(res?.data?.transferAmt2),{});
        this.master.data.cashBook2Name = res?.data?.cashBook2Name;
        let memo = this.getMemoMaster();
        this.master.setValue('memo',memo,{});
        this.isPreventChange = false;
        this.preData = {...this.master?.data};
        this.detectorRef.detectChanges();
      }
    });
  }

  /**
   * *Hàm thay đổi tiền tệ
   * @param field 
   */
  currencyIDChange(field:any){
    this.api.exec('AC', 'CashTranfersBusiness', 'ValueChangedAsync', [
      field,
      this.master.data,
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (res) {
        this.isPreventChange = true;
        this.master.setValue('exchangeRate',res?.data?.exchangeRate,{});
        this.preData = {...this.master?.data};
        this.isPreventChange = false;
      }
    });
  }
  /**
   * *Hàm get ghi chú 
   * @returns
   */
  getMemoMaster() {
    let newMemo = '';
    let cashbookName = '';
    let cashbookName2 = '';

    if (this.master.data.cashBookID) {
      cashbookName = 'Chuyển từ '+this.master.data.cashBook1Name;
    }

    if (this.master.data.cashBookID2) {
      cashbookName = 'Chuyển đến '+this.master.data.cashBook2Name;
    }
    newMemo = cashbookName + cashbookName2;
    return newMemo;
  }

  VATChange(){
    this.api.exec('AC','CashTranfersBusiness','VATChangedAsync',[this.fmVATInvoice.currentData,this.master.data]).subscribe((res: any) => {
      if (res) {
        this.fmVATInvoice.currentData = {...res};
        this.isPreventChange = true;
        this.fgVATInvoice.patchValue(res);
        this.isPreventChange = false;
      }
    });
  }
  //#endregion Function

}
