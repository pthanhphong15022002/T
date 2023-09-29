import { ChangeDetectorRef, Component, Injector, Optional, ViewChild, ViewEncapsulation } from '@angular/core';
import { CodxFormComponent, DialogData, DialogModel, DialogRef, FormModel, NotificationsService, UIComponent } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { Subject, takeUntil } from 'rxjs';
import { PaymentOrder } from '../../models/PaymentOrder.model';
import { PaymentOrderLines } from '../../models/PaymentOrderLines.model';
import { CodxAcService } from '../../codx-ac.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { AdvancedPayment } from '../../models/AdvancedPayment.model';
import { AdvancedPaymentLinkComponent } from '../advanced-payment-link/advanced-payment-link.component';

@Component({
  selector: 'lib-payment-order-add',
  templateUrl: './payment-order-add.component.html',
  styleUrls: ['./payment-order-add.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class PaymentOrderAddComponent extends UIComponent
{
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('attachment') attachment: AttachmentComponent;

  private destroy$ = new Subject<void>();
  headerText: string = '';
  company: any;
  logosrc: any;
  dataCategory: any;
  formType: any;
  validate: any = 0;
  dialog!: DialogRef;
  isHaveFile: any = false;
  showLabelAttachment: any = false;
  advancedPayment: AdvancedPayment = new AdvancedPayment();
  paymentOrder: PaymentOrder = new PaymentOrder();
  paymentOrderLines: Array<PaymentOrderLines> = [];
  fmPaymentOrderLines: FormModel = {
    entityName: 'AC_PaymentOrderLines',
    formName: 'PaymentOrderLines',
    gridViewName: 'grvPaymentOrderLines',
  }
  fmAdvancedPayment: FormModel = {
    entityName: 'AC_AdvancedPayment',
    formName: 'AdvancedPayment',
    gridViewName: 'grvAdvancedPayment',
  }
  grvSetupPaymentOrderLines: any;
  grvSetupAdvancedPayment: any;
  constructor(
    inject: Injector,
    private notification: NotificationsService,
    private acService: CodxAcService,
    private shareService: CodxShareService,
    private dt: ChangeDetectorRef,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.paymentOrder = {...dialogData.data?.advancedPayment};
    this.company = dialogData.data?.company;
    this.paymentOrder.currencyID = this.company.baseCurr;
    this.formType = dialogData.data?.formType;
    this.headerText = dialogData.data?.headerText;
    this.advancedPayment.totalAmt = 0;
    
    this.loadPaymentOrderLines();
    if(this.paymentOrder.refNo)
    {
      this.loadAdvancedPayment();
    }

    this.cache.gridViewSetup(this.fmPaymentOrderLines.formName, this.fmPaymentOrderLines.gridViewName)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(res)
        this.grvSetupPaymentOrderLines = res;
    });
    this.cache.gridViewSetup(this.fmAdvancedPayment.formName, this.fmAdvancedPayment.gridViewName)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(res)
        this.grvSetupAdvancedPayment = res;
    });
  }

  onInit(): void {
    this.showLabelAttachment = this.paymentOrder?.attachments > 0 ? true : false;
  }

  ngAfterViewInit(){
    if(this.form?.data?.coppyForm) this.form.data._isEdit = true;

    //Loại bỏ requied khi VoucherNo tạo khi lưu
    if (!this.paymentOrder.voucherNo) {
      this.form.setRequire([{
        field: 'VoucherNo',
        isDisable: false,
        require: false
      }]);
    }
  }

  ngOnDestroy() {
    this.view.setRootNode('');
    this.onDestroy();
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onClose()
  {
    this.dialog.close();
  }

  valueChange(e: any){
    this.paymentOrder[e.field] = e.data;
    this.form.formGroup.patchValue({[e.field]: this.paymentOrder[e.field]});
  }

  dropdownChange(e: any)
  {
    switch(e.field)
    {
      case 'objectID':
        this.paymentOrder[e.field] = e.data[0];
        break;
      case 'reasonID':
        this.paymentOrder[e.field] = e.data[0];
        // if (e.itemData[0].ReasonID) {
        //   this.paymentOrder.reasonID = e.itemData[0].ReasonID;
        //   this.form.formGroup.patchValue({reasonID: this.paymentOrder.reasonID});
        // }
        break;
      case 'pmtMethodID':
        this.paymentOrder[e.field] = e.data[0];
        break;
    }
    this.form.formGroup.patchValue({[e.field]: this.paymentOrder[e.field]});
  }

  lineChange(e: any, i: any)
  {
    this.paymentOrderLines[i][e.field] = e.data
    if(e.field == 'dr')
    {
      this.calTotalAmt();
    }
  }

  onSave(){
    this.inputValidate();

    if (this.form.validation())
      return;
    
    if(this.validate != 0)
    {
      this.validate = 0;
      return;
    }

    if (this.paymentOrder.status == '7') {
      this.paymentOrder.status = '1';
      this.form.formGroup.patchValue({ status: this.paymentOrder.status });
    }

    this.form.save(null, 0, '', '', true)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res?.update?.error || res?.save?.error) {
          this.paymentOrder.status = '7';
          this.form.formGroup.patchValue({ status: this.paymentOrder.status });
        }
        else
        {
          if(res?.update?.data)
          {
            this.paymentOrder = res.update.data;
          }
          else if(!res?.save)
          {
            this.paymentOrder = res;
          }
          this.saveLine();
        }
      });
  }

  onSaveAndRelease(){
    if (this.form.validation())
      return;
    if (this.paymentOrder.status == '7') {
      this.paymentOrder.status = '1';
      this.form.formGroup.patchValue({ status: this.paymentOrder.status });
    }

    this.form.save(null, 0, '', '', true)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res?.update?.error || res?.save?.error) {
          this.paymentOrder.status = '7';
          this.form.formGroup.patchValue({ status: this.paymentOrder.status });
        }
        else
        {
          this.api
          .exec<any>('AC', 'PaymentOrderLinesBusiness', 'SaveListPaymentOrderAsync', [
            this.paymentOrderLines
          ])
          .pipe(takeUntil(this.destroy$))
          .subscribe((res) => {
            if (res) {
              this.saveFileUpload();
              if(res?.save?.data)
              {
                this.onRelease('', res.save.data);
              } else if(res?.update?.data)
              {
                this.onRelease('', res.update.data);
              }
              this.detectorRef.detectChanges();
            }
          });
        }
        this.dt.detectChanges();
      });
  }
  
  onRelease(text: any, data: any){
    this.acService
      .getCategoryByEntityName(this.form.formModel.entityName)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.dataCategory = res;
        this.shareService
          .codxRelease(
            'AC',
            data.recID,
            this.dataCategory.processID,
            this.form.formModel.entityName,
            this.form.formModel.funcID,
            '',
            '',
            ''
          )
          .pipe(takeUntil(this.destroy$))
          .subscribe((result: any) => {
            if (result?.msgCodeError == null && result?.rowCount) {
              data.status = result?.returnStatus;
              this.dialog.dataService.updateDatas.set(data['_uuid'], data);
              this.dialog.dataService
                .save(null, 0, '', '', false)
                .pipe(takeUntil(this.destroy$))
                .subscribe((res: any) => {
                  if (res && !res.update.error) {
                    this.notification.notifyCode('AC0029', 0, text);
                    this.dialog.close();
                  }
                });
            } else this.notification.notifyCode(result?.msgCodeError);
          });
      });
  }

  saveLine(){
    this.api
      .exec<any>('AC', 'PaymentOrderLinesBusiness', 'SaveListPaymentOrderAsync', [
        this.paymentOrderLines
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res) {
          this.saveFileUpload();
          // this.dialog.dataService.update(this.paymentOrder).subscribe();
          this.onDestroy();
          this.dialog.close();
          this.detectorRef.detectChanges();
        }
      });
  }

  addLine()
  {
    let data = new PaymentOrderLines();
    this.api
      .exec<any>('AC', 'PaymentOrderLinesBusiness', 'SetDefaultAsync', [
        this.paymentOrder,
        data,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res) {
          this.paymentOrderLines.push(res);
        }
      });
  }

  deleteLine(index: any){
    this.api
    .exec<any>('AC', 'PaymentOrderLinesBusiness', 'DeleteAsync', [
      this.paymentOrderLines[index]
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res) => {
      if (res) {
        this.paymentOrderLines.splice(index,1);
        this.detectorRef.detectChanges();
      }
    });
  }

  loadPaymentOrderLines()
  {
    this.api
    .exec<any>('AC', 'PaymentOrderLinesBusiness', 'LoadDataAsync', [
      this.paymentOrder.recID
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res) => {
      if (res) {
        this.paymentOrderLines = res;
        this.calTotalAmt();
      }
    });
  }

  inputValidate()
  {
    for (let line of this.paymentOrderLines) {
      if (line.note == null || line.note == '') {
        this.notification.notifyCode(
          'SYS009',
          0,
          '"' + this.grvSetupPaymentOrderLines.Note.headerText + '"'
        );
        this.validate ++;
      }
      if (line.dr == null || line.dr == '') {
        this.notification.notifyCode(
          'SYS009',
          0,
          '"' + this.grvSetupPaymentOrderLines.DR.headerText + '"'
        );
        this.validate ++;
      }
    }
    return null;
  }

  fileAdded(event: any) {
    this.paymentOrder.attachments = event.data.length;
    this.detectorRef.detectChanges();
  }

  fileCount(e) {
    if (e > 0 || e?.data?.length > 0) this.isHaveFile = true;
    else this.isHaveFile = false;
    this.showLabelAttachment = this.isHaveFile;
  }

  addFiles(evt){
    this.paymentOrder.attachments = evt.data.length;
    this.form.formGroup.patchValue({attachments: this.paymentOrder.attachments});
  }

  popupUploadFile() {
    this.attachment.uploadFile();
  }

  async saveFileUpload(){
    if (this.attachment.fileUploadList.length !== 0) {
      (await this.attachment.saveFilesObservable()).subscribe((file: any) => {
        if (file?.status == 0) {
          this.fileAdded(file);
        }
      });
    }
  }

  calTotalAmt()
  {
    if(this.paymentOrderLines.length > 0)
    {
      let total = 0;
      this.paymentOrderLines.forEach((line) => {
        if(line.dr)
        {
          total += line.dr;
        }
      });
      this.paymentOrder.totalAmt = total;
      this.form.formGroup.patchValue({totalAmt: this.paymentOrder.totalAmt});
      this.calTotalCR();
    }
  }

  calTotalCR()
  {
    if(this.paymentOrder?.totalAmt > this.advancedPayment?.totalAmt)
    {
      this.paymentOrder.totalCR = this.paymentOrder.totalAmt - this.advancedPayment.totalAmt;
      this.form.formGroup.patchValue({totalCR: this.paymentOrder.totalCR});
      this.dt.detectChanges();
    }
  }

  loadAdvancedPayment(){
    this.api
      .exec<any>('AC', 'AdvancedPaymentBusiness', 'LoadDataByVoucherNoAsync', [
        this.paymentOrder.refNo,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res) {
          this.advancedPayment = res;
          this.calTotalCR();
          this.dt.detectChanges();
        }
      });
  }

  openFormAdvancePayment() {
    let obj = {
      paymentOrder: this.form?.data,
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel = this.fmAdvancedPayment;
    opt.FormModel = dataModel;
    let dialog = this.callfc.openForm(
      AdvancedPaymentLinkComponent,
      '',
      null,
      null,
      '',
      obj,
      '',
      opt
    );
    dialog.closed.subscribe((res) => {
      if (res && res.event && res.event?.advancedPayment) {
        this.advancedPayment = res.event.advancedPayment;
        this.paymentOrder.refNo = this.advancedPayment.voucherNo;
        this.form.formGroup.patchValue({refNo: this.paymentOrder.refNo});
        this.calTotalCR();
        this.dt.detectChanges();
      }
    });
  }
}
