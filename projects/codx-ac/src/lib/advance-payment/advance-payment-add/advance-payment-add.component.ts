import { ChangeDetectorRef, Component, Injector, Optional, ViewChild, ViewEncapsulation } from '@angular/core';
import { CodxFormComponent, DialogData, DialogRef, FormModel, NotificationsService, UIComponent } from 'codx-core';
import { AdvancedPayment } from '../../models/AdvancedPayment.model';
import { Subject, takeUntil } from 'rxjs';

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
  columns: Array<any> = [];
  dialogRef!: DialogRef;
  advancedPayment: AdvancedPayment;
  vendorData: Object[] = [
    {
      detailName: 'Maria ',
      costPrice: 250000,
      friend: 'Maria ',
      totalPrice: 250000,
    },
    {
      detailName: 'Ana Trujillo ',
      costPrice: 250000,
      friend: 'Ana Trujillo ',
      totalPrice: 250000,
    },
  ];
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

  addNewDetail()
  {
    this.vendorData.push({
      detailName:'',
      costPrice:''
    });
    this.detectorRef.detectChanges();
  }

  onDelete(index: any)
  {
    this.vendorData.splice(index,1);
    this.detectorRef.detectChanges();
  }
  formatDate(date) {
    return new Date(date).toLocaleDateString();
  }

  onSave(isclose: any){
    if (this.advancedPayment.status == '7') {
      this.advancedPayment.status = '1';
      this.form.formGroup.patchValue({ status: this.advancedPayment.status });
    }

    this.dialogRef.dataService.save(null, 0, '', 'SYS006', true)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res?.update?.error || res?.save?.error) {
          this.advancedPayment.status = '7';
          this.form.formGroup.patchValue({ status: this.advancedPayment.status });
        }
        if (isclose) {
          if (res?.save?.data) {
            this.dialogRef.close({
              update: true,
              data: res.save,
            });
          }
          if (res?.update?.data) {
            this.dialogRef.close({
              update: true,
              data: res.update,
            });
          }
        }
        else {
          this.clearAdvancedPayment();
          this.dialogRef.dataService.clear();
          this.api.exec('AC', 'AdvancedPaymentBusiness', 'SetDefaultAsync')
            .pipe(takeUntil(this.destroy$))
            .subscribe((res: any) => {
              if (res) {
                this.dialogRef = res.data;
                this.form.formGroup.patchValue(this.advancedPayment);
                this.form.preData = { ...this.advancedPayment };
                this.detectorRef.detectChanges();
              }
            });
        }
        this.dt.detectChanges();
      });
  }

  clearAdvancedPayment(){

  }
}
