import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import { AuthService, CodxFormComponent, CodxGridviewV2Component, DialogData, DialogRef, NotificationsService, UIComponent } from 'codx-core';
import { Subject, takeUntil } from 'rxjs';
import { CodxAcService } from '../../codx-ac.service';

@Component({
  selector: 'lib-advanced-payment-link',
  templateUrl: './advanced-payment-link.component.html',
  styleUrls: ['./advanced-payment-link.component.css'],
  changeDetection : ChangeDetectionStrategy.OnPush
})
export class AdvancedPaymentLinkComponent extends UIComponent implements OnInit {
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('grid') public grid: CodxGridviewV2Component;
  dialog!: DialogRef;
  dateNow: any = new Date();
  mapPredicates = new Map<string, string>();
  mapDataValues = new Map<string, string>();
  noEditSetting: EditSettingsModel = {
    allowEditing: false,
    allowAdding: false,
    allowDeleting: false,
    mode: 'Normal',
  };
  dataAdvanced: Array<any> = [];
  objectName: any;
  dateSuggestion: any;
  paymentOrder: any;
  voucherNo:any;
  private destroy$ = new Subject<void>();
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private notification: NotificationsService,
    private auth: AuthService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.paymentOrder = dialogData?.data?.paymentOrder;
  }
  onInit(): void {
    this.acService.setPopupSize(this.dialog, '80%', '90%');
  }
  ngAfterViewInit() {
    this.dt.detectChanges();
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  close() {
    this.onDestroy();
    this.dialog.close();
  }
  accept() {
    if (this.grid.arrSelectedRows.length > 0) {
      this.dialog.close({
        advancedPayment: this.grid.arrSelectedRows[0],
      });
    }
  }
  valueChange(e: any) {
    switch(e.field.toLowerCase()){
      case 'datesuggestion':
        this.dateSuggestion = e.data.fromDate;
        break;
      case 'voucherno':
        this.voucherNo = e.data;
        break;
    }
  }
  onSelected(e: any) {
    this.unCheck(e.rowIndex);
  }
  submit() {
    this.acService
      .execApi('AC', 'AdvancedPaymentBusiness', 'LoadDataByRequiedAsync', [
        this.paymentOrder.voucherDate,
        this.dateSuggestion,
        this.voucherNo,
        this.paymentOrder.currencyID,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res && res.length > 0) {
          this.dataAdvanced = res;
          this.grid.refresh();
          this.dt.detectChanges();
        }else{
          this.notification.notifyCode('AC0027');
        }
      });
  }
  unCheck(rowIndex) {
    let eleCheckbox = document
      .querySelector('.tabcash-content .e-content')
      .querySelectorAll('tr[aria-selected="true"]');
    if (eleCheckbox.length > 0) {
      eleCheckbox.forEach((element) => {
        if ((element as any).dataset.rowindex != rowIndex) {
          let idx = (element as any).dataset.rowindex;
          let eleInput = document
            .querySelector('.tabcash-content .e-content')
            .querySelectorAll('input')[idx];
          if (eleInput) {
            eleInput.click();
          }
        }
      });
    }
  }
}
