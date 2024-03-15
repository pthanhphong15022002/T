import {
  ChangeDetectionStrategy,
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
import { DateTime } from '@syncfusion/ej2-angular-charts';
import {
  EditSettingsModel,
  SelectionSettingsModel,
} from '@syncfusion/ej2-angular-grids';
import { Subject, pipe, takeUntil } from 'rxjs';
import { CodxAcService } from '../../codx-ac.service';

@Component({
  selector: 'lib-suggestion-add',
  templateUrl: './suggestion-add.component.html',
  styleUrls: ['./suggestion-add.component.css'],
  changeDetection : ChangeDetectionStrategy.OnPush
})
export class SuggestionAdd  extends UIComponent implements OnInit {
  //#region Constructor
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('grid') public grid: CodxGridviewV2Component;
  dialog!: DialogRef;
  oData: any;
  dateNow: any = new Date();
  mapPredicates = new Map<string, string>();
  mapDataValues = new Map<string, string>();
  noEditSetting: EditSettingsModel = {
    allowEditing: false,
    allowAdding: false,
    allowDeleting: false,
    mode: 'Normal',
  };
  dataAdvance: any = [];
  objectName: any;
  dateSuggestion: any;
  voucherNo:any;
  isClick:any = false;
  type:any;
  headerText:any;
  selectionOptions:SelectionSettingsModel = { type: 'Single', checkboxMode: 'ResetOnRowClick'};;
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
    this.oData = dialogData.data?.oData;
    this.objectName = dialogData.data?.objectName;
    this.type = dialogData.data?.type;
    this.headerText = dialogData.data?.headerText;
  }
  //#endregion Constructor

  //#region Init
  onInit(): void {
    this.acService.setPopupSize(this.dialog, '80%', '90%');
    this.loadData(false);
  }
  ngAfterViewInit() {
    this.dt.detectChanges();
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  //#endregion Init

  //#region Event

  close() {
    this.onDestroy();
    this.dialog.close();
  }

  valueChange(e: any) {
    if (e && e.data) {
      switch(e.field.toLowerCase()){
        case 'datesuggestion':
          this.dateSuggestion = e.data.fromDate;
          break;
        case 'voucherno':
          this.voucherNo = e.data;
          break;
      }
      
    }
  }
  //#region Event

  //#region Function
  onSelected(event: any) {
    if (event) {
      if (this.isClick) {
        this.isClick = false;
        return;
      }
      this.isClick = true;
      this.grid.gridRef.clearSelection();
      this.grid.gridRef.selectRow(event?._rowIndex);
    }
  }
  loadData(showArlert:any=true) {
    let method = this.type === '1' ? 'LoadDataAdvancePaymentAsync' : 'LoadDataOrderPaymentAsync'
    this.api
      .exec('AC', 'ACBusiness', method, [
        this.oData.voucherDate,
        this.dateSuggestion,
        this.voucherNo,
        this.oData.objectID,
        this.oData.objectType
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res && res.length > 0) {
          this.dataAdvance = res;
          this.detectorRef.detectChanges();
        }else{
          if(showArlert) this.notification.notifyCode('AC0027');
        }
      });
  }
  //#endregion Function

  //#region Method
  onApply() {
    let className = (this.oData.journalType === 'CP' || this.oData.journalType === 'BP') ? 'CashPaymentsBusiness' : 'CashReceiptsBusiness';
    let method = this.type === '1' ? 'SaveAdvancePaymentAsync' : 'SaveOrderPaymentAsync'
    if (this.grid.arrSelectedRows.length > 0) {
      this.api
        .exec(
          'AC',
          className,
          method,
          [this.oData,this.grid.arrSelectedRows[0]]
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe((res:any) => {
          if (res) {
            this.onDestroy();
            this.dialog.close(res);
          }
        });
    }
  }
  //#endregion Method
}
