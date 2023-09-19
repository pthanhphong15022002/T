import { ChangeDetectorRef, Component, HostListener, Injector, Optional, ViewChild, ViewEncapsulation } from '@angular/core';
import { CodxFormComponent, CodxGridviewV2Component, DialogData, DialogRef, FormModel, NotificationsService, UIComponent, Util } from 'codx-core';
import { AdvancedPayment } from '../../models/AdvancedPayment.model';
import { Subject, takeUntil } from 'rxjs';
import { AdvancedPaymentLines } from '../../models/AdvancedPaymentLines.model';
import { CodxAcService } from '../../codx-ac.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'lib-advance-payment-add',
  templateUrl: './advance-payment-add.component.html',
  styleUrls: ['./advance-payment-add.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AdvancePaymentAddComponent extends UIComponent
{
  @ViewChild('form') public form: CodxFormComponent;

  private destroy$ = new Subject<void>();
  headerText: string = '';
  company: any;
  logosrc: any;
  dataCategory: any;
  formType: any;
  validate: any = 0;
  dialogRef!: DialogRef;
  advancedPayment: AdvancedPayment;
  advancedPaymentLines: Array<AdvancedPaymentLines> = [];
  fmAdvancedPaymentLines: FormModel = {
    entityName: 'AC_AdvancedPaymentLines',
    formName: 'AdvancedPaymentLines',
    gridViewName: 'grvAdvancedPaymentLines',
  }
  grvSetupAdvancedPaymentLines: any;
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
    this.dialogRef = dialog;
    this.advancedPayment = dialogData.data?.advancedPayment;
    this.company = dialogData.data?.company;
    this.advancedPayment.currencyID = this.company.baseCurr;
    this.formType = dialogData.data?.formType;
    if(this.formType == 'edit')
    {
      this.loadAdvancedPaymentLines();
    }
    this.cache.gridViewSetup(this.fmAdvancedPaymentLines.formName, this.fmAdvancedPaymentLines.gridViewName)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(res)
        this.grvSetupAdvancedPaymentLines = res;
    });
  }

  onInit(): void {
  }

  ngAfterViewInit(){
    this.form.formGroup.patchValue(this.advancedPayment);

    //Loại bỏ requied khi VoucherNo tạo khi lưu
    if (!this.advancedPayment.voucherNo) {
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
    this.dialogRef.close();
  }

  valueChange(e: any){
    this.advancedPayment[e.field] = e.data;
  }

  lineChange(e: any, i: any)
  {
    this.advancedPaymentLines[i][e.field] = e.data
  }

  formatDate(date) {
    return new Date(date).toLocaleDateString();
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

    if (this.advancedPayment.status == '7') {
      this.advancedPayment.status = '1';
      this.form.formGroup.patchValue({ status: this.advancedPayment.status });
    }

    this.dialogRef.dataService.save(null, 0, '', '', true)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res?.update?.error || res?.save?.error) {
          this.advancedPayment.status = '7';
          this.form.formGroup.patchValue({ status: this.advancedPayment.status });
        }
        else if (res?.save?.data) {
          this.saveLine();
          this.dialogRef.close({
            update: true,
            data: res.save.data,
          });
        }
        else if (res?.update?.data) {
          this.saveLine();
          this.dialogRef.close({
            update: true,
            data: res.update.data,
          });
        }
        else
        {
          this.saveLine();
          this.dialogRef.close({
            update: true,
            data: res,
          });
        }
        this.dt.detectChanges();
      });
  }

  onSaveAndRelease(){
    if (this.form.validation())
      return;
    if (this.advancedPayment.status == '7') {
      this.advancedPayment.status = '1';
      this.form.formGroup.patchValue({ status: this.advancedPayment.status });
    }

    this.dialogRef.dataService.save(null, 0, '', '', true)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res?.update?.error || res?.save?.error) {
          this.advancedPayment.status = '7';
          this.form.formGroup.patchValue({ status: this.advancedPayment.status });
        }
        else
        {
          if (res?.save?.data) {
            this.saveLine();
            this.onRelease('', res.save.data);
          }
          else if (res?.update?.data) {
            this.saveLine();
            this.onRelease('', res.update.data);
          }
        }
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
              this.dialogRef.dataService.updateDatas.set(data['_uuid'], data);
              this.dialogRef.dataService
                .save(null, 0, '', '', false)
                .pipe(takeUntil(this.destroy$))
                .subscribe((res: any) => {
                  if (res && !res.update.error) {
                    this.notification.notifyCode('AC0029', 0, text);
                    this.dialogRef.close();
                  }
                });
            } else this.notification.notifyCode(result?.msgCodeError);
          });
      });
  }

  saveLine(){
    this.api
      .exec<any>('AC', 'AdvancedPaymentLinesBusiness', 'SaveListAdvancePaymentAsync', [
        this.advancedPaymentLines
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res) {
        }
      });
  }

  addLine()
  {
    let data = new AdvancedPaymentLines();
    let idx;
    this.api
      .exec<any>('AC', 'AdvancedPaymentLinesBusiness', 'SetDefaultAsync', [
        this.advancedPayment,
        data,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res) {
          idx = this.advancedPaymentLines.length;
              res.rowNo = idx + 1;
              this.advancedPaymentLines.push(res);
        }
      });
  }

  deleteLine(index: any){
    this.api
    .exec<any>('AC', 'AdvancedPaymentLinesBusiness', 'DeleteAsync', [
      this.advancedPaymentLines[index]
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res) => {
      if (res) {
        this.advancedPaymentLines.splice(index,1);
        this.detectorRef.detectChanges();
      }
    });
  }

  loadAdvancedPaymentLines()
  {
    this.api
    .exec<any>('AC', 'AdvancedPaymentLinesBusiness', 'LoadDataAsync', [
      this.advancedPayment.recID
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res) => {
      if (res) {
        this.advancedPaymentLines = res;
      }
    });
  }

  inputValidate()
  {
    for (let line of this.advancedPaymentLines) {
      if (line.note == null || line.note == '') {
        this.notification.notifyCode(
          'SYS009',
          0,
          '"' + this.grvSetupAdvancedPaymentLines.Note.headerText + '"'
        );
        this.validate ++;
      }
      if (line.dr == null || line.dr == '') {
        this.notification.notifyCode(
          'SYS009',
          0,
          '"' + this.grvSetupAdvancedPaymentLines.DR.headerText + '"'
        );
        this.validate ++;
      }
    }
    return null;
  }
}
