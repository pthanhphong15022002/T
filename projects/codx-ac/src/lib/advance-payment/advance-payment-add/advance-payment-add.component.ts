import { ChangeDetectorRef, Component, HostListener, Injector, Optional, ViewChild, ViewEncapsulation } from '@angular/core';
import { CodxFormComponent, CodxGridviewV2Component, DialogData, DialogRef, FormModel, NotificationsService, UIComponent, Util } from 'codx-core';
import { AdvancedPayment } from '../../models/AdvancedPayment.model';
import { Subject, takeUntil } from 'rxjs';
import { AdvancedPaymentLines } from '../../models/AdvancedPaymentLines.model';

@Component({
  selector: 'lib-advance-payment-add',
  templateUrl: './advance-payment-add.component.html',
  styleUrls: ['./advance-payment-add.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AdvancePaymentAddComponent extends UIComponent
{
  @ViewChild('grvAdvancedPaymentLines')
  public grvAdvancedPaymentLines: CodxGridviewV2Component;
  @ViewChild('form') public form: CodxFormComponent;

  private destroy$ = new Subject<void>();
  headerText: string = '';
  company: any;
  logosrc: any;
  columns: Array<any> = [];
  dialogRef!: DialogRef;
  advancedPayment: AdvancedPayment;
  fmAdvancedPaymentLines: FormModel = {
    entityName: 'AC_AdvancedPaymentLines',
    formName: 'AdvancedPaymentLines',
    gridViewName: 'grvAdvancedPaymentLines',
  }
  constructor(
    inject: Injector,
    private notification: NotificationsService,
    private dt: ChangeDetectorRef,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialogRef = dialog;
    this.advancedPayment = dialogData.data?.advancedPayment;
    this.company = dialogData.data?.company;
    this.advancedPayment.currencyID = this.company.baseCurr;
  }

  onInit(): void {
  }

  ngAfterViewInit(){
    this.form.formGroup.patchValue(this.advancedPayment);

    //Loại bỏ requied khi VoucherNo tạo khi lưu
    if (!this.advancedPayment.voucherNo) {
      this.form.setRequire([{
        field: 'voucherNo',
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
  formatDate(date) {
    return new Date(date).toLocaleDateString();
  }

  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.deleteLine(data);
        break;
      case 'SYS04':
        this.copyLine(data);
        break;
    }
  }

  onSave(){
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
        if (res?.save?.data) {
          this.notification.notifyCode('SYS006');
          this.dialogRef.close({
            update: true,
            data: res.save.data,
          });
        }
        else if (res?.update?.data) {
          this.notification.notifyCode('SYS007');
          this.dialogRef.close({
            update: true,
            data: res.update.data,
          });
        }
        else
        {
          this.notification.notifyCode('SYS007');
          this.dialogRef.close({
            update: true,
            data: res,
          });
        }
        this.dt.detectChanges();
      });
  }

  saveMasterBeforeAddLine(){
    if (this.form.validation())
      return;
      this.dialogRef.dataService
      .save(null, 0, '', '', false)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res && ((!res?.save?.error) || (!res?.update?.error) || (res?._hasSaved))) {
          if (!this.advancedPayment.voucherNo && res?.save?.data?.voucherNo) {
            this.advancedPayment.voucherNo = res.save.data.voucherNo;
            this.form.formGroup?.patchValue({ voucherNo: this.advancedPayment.voucherNo });
          }
          this.addLine();
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
          idx = this.grvAdvancedPaymentLines.dataSource.length;
              res.rowNo = idx + 1;
              this.grvAdvancedPaymentLines.addRow(res, idx);
        }
      });
  }

  copyLine(data){
    let idx;
    this.api
      .exec<any>('AC', 'AdvancedPaymentLinesBusiness', 'SetDefaultAsync', [
        this.advancedPayment,
        data,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res) {
          idx = this.grvAdvancedPaymentLines.dataSource.length;
          res.rowNo = idx + 1;
          res.recID = Util.uid();
          this.grvAdvancedPaymentLines.addRow(res, idx);
        }
      });
  }

  deleteLine(data){
    this.grvAdvancedPaymentLines.deleteRow(data)
  }

  onEventAction(e: any) {
    switch (e.type) {
      case 'autoAdd':
        if (this.grvAdvancedPaymentLines.autoAddRow) {
          this.saveMasterBeforeAddLine();
        }
        break;
      case 'endEdit':
        if (!this.grvAdvancedPaymentLines.autoAddRow) {
          setTimeout(() => {
            let element = document.getElementById('btnadd');
            element.focus();
          }, 100);
        }
        break;
      case 'closeEdit':
        setTimeout(() => {
          let element = document.getElementById('btnadd');
          element.focus();
        }, 100);
        break;
    }
  }

  hideMF(event) {
    var mf = event.filter(
      (x) => x.functionID != 'SYS02' && x.functionID != 'SYS04'
    );
    mf.forEach((element) => {
      element.disabled = true;
    });
  }

  @HostListener('click', ['$event'])
  onClick(e) {
    if (
      e.target.closest('.e-grid') == null &&
      e.target.closest('.e-popup') == null &&
      e.target.closest('.edit-value') == null
    ) {
      if (this.grvAdvancedPaymentLines && this.grvAdvancedPaymentLines.gridRef.isEdit) {
        this.grvAdvancedPaymentLines.autoAddRow = false;
        this.grvAdvancedPaymentLines.endEdit();
      }
    }
  }
}
