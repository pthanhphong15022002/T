import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  UIComponent,
  CodxFormComponent,
  DialogRef,
  NotificationsService,
  AuthService,
  DialogData,
  CodxGridviewV2Component,
} from 'codx-core';
import { CodxAcService } from '../../../codx-ac.service';
import { DateTime } from '@syncfusion/ej2-angular-charts';
import {
  EditSettingsModel,
  SelectionSettingsModel,
} from '@syncfusion/ej2-angular-grids';
import { Subject, pipe, takeUntil } from 'rxjs';

@Component({
  selector: 'lib-pop-up-cash',
  templateUrl: './pop-up-cash.component.html',
  styleUrls: ['./pop-up-cash.component.css'],
})
export class PopUpCashComponent extends UIComponent implements OnInit {
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('grid') public grid: CodxGridviewV2Component;
  dialog!: DialogRef;
  cashpayment: any;
  dateNow: any = new Date();
  mapPredicates = new Map<string, string>();
  mapDataValues = new Map<string, string>();
  noEditSetting: EditSettingsModel = {
    allowEditing: false,
    allowAdding: false,
    allowDeleting: false,
    mode: 'Normal',
  };
  dataCash: Array<any> = [];
  objectName: any;
  dateSuggestion: any;
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
    this.cashpayment = dialogData.data?.cashpayment;
    this.objectName = dialogData.data?.objectName;
  }
  onInit(): void {}
  ngAfterViewInit() {
    this.acService.setPopupSize(this.dialog, '80%', '80%');
    this.dt.detectChanges();
  }
  close() {
    this.destroy$.next();
    this.destroy$.complete();
    this.dialog.close();
  }
  accept() {
    if (this.grid.arrSelectedRows.length > 0) {
      this.acService
        .execApi('AC', 'CashPaymentsLinesBusiness', 'LoadDataReferenceAsync', [
          this.grid.arrSelectedRows[0],
        ])
        .pipe(takeUntil(this.destroy$))
        .subscribe((res) => {
          if (res) {
            this.destroy$.next();
            this.destroy$.complete();
            this.dialog.close({
              oCashRef: this.grid.arrSelectedRows[0],
              oLineRef: res,
            });
          }
        });
    } else {
      this.dialog.close();
    }
  }
  valueChange(e: any) {
    if (e && e.data) {
      this.dateSuggestion = e.data.fromDate;
    }
  }
  onSelected(e: any) {
    this.unCheck(e.rowIndex);
  }
  submit() {
    this.acService
      .execApi('AC', 'CashPaymentsBusiness', 'LoadDataCashSuggestAsync', [
        this.cashpayment.voucherDate,
        this.dateSuggestion,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.dataCash = res;
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
