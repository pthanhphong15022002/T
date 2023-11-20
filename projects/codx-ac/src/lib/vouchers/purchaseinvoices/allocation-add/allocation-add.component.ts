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
  isStep: any = false;
  fromDate: any;
  toDate: any;
  objectID: any;
  recID: any;
  oPurchase: any;
  oPurchaseLine: any;
  fmPurchaseInvoicesAllocation: any = fmPurchaseInvoicesAllocation;
  fmPurchaseInvoicesLinesAllocation:any = fmPurchaseInvoicesLinesAllocation;
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

  }
  //#endregion Constructor

  //#region Init

  onInit(): void {
    this.acService.setPopupSize(this.dialog, '70%', '90%');
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
  onSelected(event: any) {

  }

  onDeselected(event: any) {

  }

  onSubmit() {
    this.api.exec('AC', 'PurchaseInvoicesBusiness', 'GetPurchaseInvoicesAsync', [this.fromDate, this.toDate, this.objectID, this.recID])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (res && res.length > 0) {
        if(JSON.stringify(this.oPurchase) == JSON.stringify(res)) return;
        this.oPurchase = [...res];
        this.gridPur.refresh();
      }else{
        this.notification.notifyCode('AC0027');
      }
    })
  }

  onAllocation() {

  }

  onNextStep() {
    this.isStep = true;
    this.detectorRef.detectChanges();
  }

  onBack() {
    this.isStep = false;
    this.detectorRef.detectChanges();
  }

  onAccept() {

  }
  //#endregion Function
}
