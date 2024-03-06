import { ChangeDetectionStrategy, Component, Injector, Optional, ViewChild } from '@angular/core';
import { CRUDService, CodxFormComponent, CodxInputComponent, DataRequest, DialogData, DialogRef, FormModel, NotificationsService, RequestOption, UIComponent, Util } from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-approval/tab/model/tabControl.model';
import { Subject, map, takeUntil } from 'rxjs';
import { CodxAcService, fmVATInvoices} from '../../../codx-ac.service';
import { RoundService } from '../../../round.service';
import { FormGroup } from '@angular/forms';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';

@Component({
  selector: 'lib-cashtransfers-add',
  templateUrl: './cashtransfers-add.component.html',
  styleUrls: ['./cashtransfers-add.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashtransfersAddComponent extends UIComponent {
  //#region Constructor
  @ViewChild('formCashTranfer') public formCashTranfer: CodxFormComponent;
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
  cashbookname1:any='';
  cashbookname2:any='';
  feeVATID:any='';
  vatPct:any=0;
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private notification: NotificationsService,
    private roundService: RoundService,
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
    if(this.formCashTranfer?.data?.coppyForm) this.formCashTranfer.data._isEdit = true; //? test copy để tạm
    if (this.formCashTranfer?.data?.isEdit) {
      let option = new DataRequest();
      option.entityName = 'AC_VATInvoices';
      option.predicate = 'TransID=@0';
      option.pageLoading = false;
      option.dataValue = this.formCashTranfer?.data?.recID;
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
      if (this.formCashTranfer.data.vatControl) {
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
    this.formCashTranfer.setValue('updateColumns','',{});
    switch (field.toLowerCase()) {
      case 'cashbookid':
        let indexcb = this.eleCbxCashBook?.ComponentCurrent?.dataService?.data.findIndex((x) => x.CashBookID == this.eleCbxCashBook?.ComponentCurrent?.value);
        if(value == '' || value == null || indexcb == -1){
          this.isPreventChange = true;
          this.formCashTranfer.setValue(field,null,{});
          this.cashbookname1 = '';
          let memo = this.getMemoMaster();
          this.formCashTranfer.setValue('memo',memo,{});
          this.isPreventChange = false;
          this.detectorRef.detectChanges();
          return;
        } 
        this.cashbookname1 = this.eleCbxCashBook.ComponentCurrent.itemsSelected[0].CashBookName;
        this.cashBookIDChange(field);
        break;

      case 'cashbookid2':
        let indexcb2 = this.eleCbxCashBook2?.ComponentCurrent?.dataService?.data.findIndex((x) => x.CashBookID == this.eleCbxCashBook2?.ComponentCurrent?.value);
        if(value == '' || value == null || indexcb2 == -1){
          this.isPreventChange = true;
          this.formCashTranfer.setValue(field,null,{});
          this.cashbookname2 = '';
          let memo = this.getMemoMaster();
          this.formCashTranfer.setValue('memo',memo,{});
          this.isPreventChange = false;
          this.detectorRef.detectChanges();
          return;
        } 
        this.cashbookname2 = this.eleCbxCashBook2.ComponentCurrent.itemsSelected[0].CashBookName;
        this.cashBookID2Change(field)
        break;

      case 'currencyid':
        if(value == '' || value == null){
          this.isPreventChange = true;
          this.formCashTranfer.setValue(field, this.preData?.currencyID, {});
          if (this.preData?.currencyID != null) {
            var key = Util.camelize(field);
            var $error = (this.formCashTranfer as any).elRef.nativeElement?.querySelector('div[data-field="' + key + '"].errorMessage');
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
        if (this.formCashTranfer.data.vatControl){
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
    if (this.formCashTranfer && this.formCashTranfer.data._isEdit) {
      this.notification.alertCode('AC0010', null).subscribe((res) => {
        if (res.event.status === 'Y') {
          this.detectorRef.detectChanges();
          this.dialog.dataService
            .delete([this.formCashTranfer.data], false, null, '', '', null, null, false)
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
    this.formCashTranfer
      .save(null, 0, '', '', false, { allowCompare: false })
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (!res) return;
        if (res.hasOwnProperty('save')) {
          if (res.save.hasOwnProperty('data') && !res.save.data) return;
        }
        if (res.hasOwnProperty('update')) {
          if (res.update.hasOwnProperty('data') && !res.update.data) return;
        }
        this.saveVoucher(type);
      });
  }

  saveVoucher(type){
    this.api
      .exec('AC', 'CashTranfersBusiness', 'UpdateVoucherAsync', [
        this.formCashTranfer.data,
        this.formCashTranfer.data.vatControl ? this.fmVATInvoice.currentData : null,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res?.update) {
          this.dialog.dataService.update(res.data).subscribe();
          if (type == 'save') {
            this.onDestroy();
            this.dialog.close();
          } else {
            // this.api
            //   .exec('AC', 'CashPaymentsBusiness', 'SetDefaultAsync', [
            //     null,
            //     this.journal,
            //   ])
            //   .subscribe((res: any) => {
            //     if (res) {
            //       res.data.isAdd = true;
            //       this.formCashTranfer.refreshData({ ...res.data });             
            //       this.detectorRef.detectChanges();
            //     }
            //   });
          }
          if (this.formCashTranfer.data.isAdd || this.formCashTranfer.data.isCopy)
            this.notification.notifyCode('SYS006');
          else 
            this.notification.notifyCode('SYS007');
        }
      });
  }
  //#endregion Method

  //#region Function
  cashBookIDChange(field:any){
    let memo = this.getMemoMaster();
    this.formCashTranfer.setValue('memo',memo,{});
    this.api.exec('AC', 'CashTranfersBusiness', 'ValueChangedAsync', [
      field,
      this.formCashTranfer.data,
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (res) {
        this.isPreventChange = true;
        this.formCashTranfer.setValue('currencyID',res?.data?.currencyID,{});
        this.formCashTranfer.setValue('exchangeRate',(res?.data?.exchangeRate),{});
        this.formCashTranfer.setValue('cashAcctID',(res?.data?.cashAcctID),{});
        this.isPreventChange = false;
        this.preData = {...this.formCashTranfer?.data};
        this.detectorRef.detectChanges();
      }
    });
  }

  cashBookID2Change(field:any){
    let memo = this.getMemoMaster();
    this.formCashTranfer.setValue('memo',memo,{});
    this.api.exec('AC', 'CashTranfersBusiness', 'ValueChangedAsync', [
      field,
      this.formCashTranfer.data,
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (res) {
        this.isPreventChange = true;
        this.formCashTranfer.setValue('offsetAcctID',(res?.data?.offsetAcctID),{});
        this.isPreventChange = false;
        this.preData = {...this.formCashTranfer?.data};
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
      this.formCashTranfer.data,
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (res) {
        this.isPreventChange = true;
        this.formCashTranfer.setValue('exchangeRate',res?.data?.exchangeRate,{});
        this.preData = {...this.formCashTranfer?.data};
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

    let indexcb = this.eleCbxCashBook?.ComponentCurrent?.dataService?.data.findIndex((x) => x.CashBookID == this.eleCbxCashBook?.ComponentCurrent?.value);
    if (indexcb > -1) {
      cashbookName = 'Chuyển từ '+this.eleCbxCashBook?.ComponentCurrent?.dataService?.data[indexcb].CashBookName;
    }

    let indexcb2 = this.eleCbxCashBook2?.ComponentCurrent?.dataService?.data.findIndex((x) => x.CashBookID == this.eleCbxCashBook2?.ComponentCurrent?.value);
    if (indexcb2 > -1) {
      cashbookName2 = ' chuyển đến '+this.eleCbxCashBook2?.ComponentCurrent?.dataService?.data[indexcb2].CashBookName;
    }
    
    newMemo = cashbookName + cashbookName2;
    return newMemo;
  }

  VATChange(){
    this.api.exec('AC','CashTranfersBusiness','VATChangedAsync',[this.fmVATInvoice.currentData,this.formCashTranfer.data.fees]).subscribe((res: any) => {
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
