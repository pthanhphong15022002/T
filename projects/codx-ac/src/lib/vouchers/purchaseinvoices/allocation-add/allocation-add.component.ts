import { ChangeDetectionStrategy, Component, Injector, Optional, ViewChild } from '@angular/core';
import { CodxGridviewV2Component, DialogData, DialogRef, NotificationsService, UIComponent } from 'codx-core';
import { Subject, takeUntil } from 'rxjs';
import { CodxAcService, fmPurchaseInvoicesAllocation, fmPurchaseInvoicesLinesAllocation } from '../../../codx-ac.service';

@Component({
  selector: 'lib-allocation-add',
  templateUrl: './allocation-add.component.html',
  styleUrls: ['./allocation-add.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllocationAddComponent extends UIComponent {
  //#region Constructor
  @ViewChild('gridPur') public gridPur: CodxGridviewV2Component;
  dialog!: DialogRef;
  fromDate: any;
  toDate: any;
  objectID: any;
  recID: any;
  oPurchase: any;
  oPurchaseLine: any;
  oData:any;
  fmPurchaseInvoicesAllocation: any = fmPurchaseInvoicesAllocation;
  fmPurchaseInvoicesLinesAllocation:any = fmPurchaseInvoicesLinesAllocation;
  allocation:any = '1';
  lineID:any;
  private destroy$ = new Subject<void>();
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.oData = {...dialogData.data?.data};
    this.lineID = dialogData?.data?.lineID || '';
  }
  //#endregion Constructor

  //#region Init

  onInit(): void {
    this.acService.setPopupSize(this.dialog, '80%', '90%');
  }

  ngAfterViewInit() { }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  //#endregion Init

  //#region Event
  close() {
    this.dialog.close();
    this.onDestroy();
  }

  changeDate(event: any) {
    if (event) {
      this.fromDate = event?.fromDate;
      this.toDate = event?.toDate;
    }
  }

  valueChange(event: any) {
    if (event) {
      this[event.field] = event?.data;
    }
  }
  //#endregion Event

  //#region Function
  onDeselected(event: any) {
    let arrdata = [];
    if(event && !event?.data.length) return;
    arrdata = event?.data;
    arrdata.forEach(data => {
      let index = this.gridPur.arrSelectedRows.findIndex(
        (x) => x.recID == data.recID
      );
      if(index > -1) this.gridPur.arrSelectedRows.splice(index,1);
    });
    this.detectorRef.detectChanges();
  }

  onSubmit() {
    this.api.exec('AC', 'PurchaseInvoicesBusiness', 'GetPurchaseInvoicesAsync', [this.fromDate, this.toDate, this.objectID, this.recID,this.oData.recID])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (res && res.length > 0) {
        this.oPurchase = [...res];
        this.gridPur.refresh();
      }else{
        this.notification.notifyCode('AC0027');
      }
    })
  }

  onAllocation() {
    this.api.exec('AC', 'PurchaseInvoicesBusiness', 'AddAllocationAsync',[this.gridPur.arrSelectedRows,this.oData,this.lineID,this.allocation])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (res?.update) {
        this.dialog.close(res?.data);
      }
    })
  }
  //#endregion Function
}
