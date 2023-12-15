import { ChangeDetectionStrategy, Component, Injector, Optional, ViewChild } from '@angular/core';
import { CRUDService, CodxFormComponent, CodxInputComponent, DataRequest, DialogData, DialogRef, FormModel, NotificationsService, UIComponent, Util } from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-approval/tab/model/tabControl.model';
import { Subject, map, takeUntil } from 'rxjs';
import { CodxAcService} from '../../../codx-ac.service';
import { RoundService } from '../../../round.service';
import { FormGroup } from '@angular/forms';

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
  headerText: string;
  dialog!: DialogRef;
  dialogData?: any;
  dataDefault: any;
  journal: any;
  fgVATInvoice:any;
  fmVATInvoices:FormModel;
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
  VATInvoiceSV:any;
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
    this.fmVATInvoices = dialogData.data?.fmVATInvoices;
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
        }
      })
  }

  ngAfterViewInit() {
    if(this.formCashTranfer?.data?.coppyForm) this.formCashTranfer.data._isEdit = true; //? test copy để tạm
    if (this.formCashTranfer?.data?.feeControl == "0") {
      this.formCashTranfer.setValue('feeControl',false,{});
    }else{
      this.formCashTranfer.setValue('feeControl',true,{});
    }
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
          let data = res[0][0];
          this.fmVATInvoices.currentData = data;
          this.fgVATInvoice.patchValue(data);
          this.detectorRef.detectChanges();
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
          this.eleCbxCashBook.ComponentCurrent.itemsSelected[0].CashBookName = "";
          let memo = this.getMemoMaster();
          this.formCashTranfer.setValue('memo',memo,{});
          this.isPreventChange = false;
          this.detectorRef.detectChanges();
          return;
        } 
        this.cashBookIDChange(field)
        break;

      case 'cashbookid2':
        let indexcb2 = this.eleCbxCashBook2?.ComponentCurrent?.dataService?.data.findIndex((x) => x.CashBookID == this.eleCbxCashBook2?.ComponentCurrent?.value);
        if(value == '' || value == null || indexcb2 == -1){
          this.isPreventChange = true;
          this.formCashTranfer.setValue(field,null,{});
          this.eleCbxCashBook2.ComponentCurrent.itemsSelected[0].CashBookName = "";
          let memo = this.getMemoMaster();
          this.formCashTranfer.setValue('memo',memo,{});
          this.isPreventChange = false;
          this.detectorRef.detectChanges();
          return;
        } 
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
    }
  }

  valueChangeVATInvoice(event: any) {
    if(this.isPreventChange){
      return;
    }
    let field = event?.field || event?.ControlName;
    let value = event?.data || event?.crrValue;
    let data = this.fmVATInvoices.currentData;
    data.updateColumns = '';
    if (field.toLowerCase() === 'goods') {
      data.itemID = event?.component?.itemsSelected[0]?.ItemID;
    }
    this.api.exec('AC', 'VATInvoicesBusiness', 'ValueChangeAsync', [
      'AC_CashTranfers',
      this.formCashTranfer.data,
      data,
      event.field
    ]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res) {
        this.isPreventChange = true;
        this.fmVATInvoices.currentData = res;
        this.fgVATInvoice.patchValue({...res});
        this.detectorRef.detectChanges();
        this.isPreventChange = false;
      }
    })
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
    if (this.formCashTranfer?.data?.feeControl) {
      this.formCashTranfer.setValue('feeControl','1',{});
    }else{
      this.formCashTranfer.setValue('feeControl','0',{});
    }
    this.formCashTranfer.save(null, 0, '', '', false)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(!res) return;
      if (res || res.save || res.update) {
        if (res || !res.save.error || !res.update.error) {
          this.fmVATInvoices.currentData.transID = this.formCashTranfer?.data?.recID;
          this.api
            .execAction(
              'AC_VATInvoices',
              [this.fmVATInvoices.currentData],
              (this.formCashTranfer?.data?.isAdd || this.formCashTranfer?.data?.isCopy) ? 'SaveAsync' : 'UpdateAsync'
            )
            .subscribe((res:any)=>{
              if (res) {
                if (type == 'save') {
                  this.onDestroy();
                  this.dialog.close();
                }else{
                  this.api
                    .exec('AC', 'CashTranfersBusiness', 'SetDefaultAsync', [
                      null,
                      this.journal,
                    ])
                    .subscribe((res: any) => {
                      if (res) {
                        res.data.isAdd = true;
                        this.formCashTranfer.refreshData({ ...res.data });
                        this.detectorRef.detectChanges();
                      }
                    });
                  
                    this.VATInvoiceSV.addNew().subscribe((res: any) => {
                      if (res) {
                        this.fgVATInvoice.patchValue(res);
                        this.fmVATInvoices.currentData = res;
                        this.detectorRef.detectChanges();
                      }
                    })
                }
              }
              if (this.formCashTranfer.data.isAdd || this.formCashTranfer.data.isCopy)
                this.notification.notifyCode('SYS006');
              else
                this.notification.notifyCode('SYS007');
            });
        }
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
  //#endregion Function

}
