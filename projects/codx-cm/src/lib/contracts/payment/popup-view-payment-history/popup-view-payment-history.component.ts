import { Component, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';
import { CM_ContractsPayments } from '../../../models/cm_model';
import { CodxCmService } from '../../../codx-cm.service';

@Component({
  selector: 'lib-popup-view-payment-history',
  templateUrl: './popup-view-payment-history.component.html',
  styleUrls: ['./popup-view-payment-history.component.scss'],
})
export class PopupViewPaymentHistoryComponent {
  isSave = false;
  dialog: DialogRef;
  listPaymentHistory: CM_ContractsPayments[];
  listPaymentHistoryOfPayment: CM_ContractsPayments[];
  payment: CM_ContractsPayments;
  moreDefaut = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
  };
  columns: any;
  grvPayments: any;

  constructor(
    private cmService: CodxCmService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.payment = dt?.data?.payment;
    this.listPaymentHistory = dt?.data?.listPaymentHistory;
    this.isSave = dt?.data?.isSave || false;
  }

  ngOnInit(): void {
    this.listPaymentHistoryOfPayment = this.listPaymentHistory.filter(
      (paymentHistory) => paymentHistory.refLineID == this.payment?.recID
    ) || [];
    this.columns = [
      {
        field: 'rowNo',
        headerText: this.grvPayments?.ItemID?.RowNo ?? 'STT',
        width: 50,
        textAlign: 'center',
      },
      {
        field: 'scheduleDate',
        headerText:
          this.grvPayments?.ScheduleDate?.headerText ?? 'Ngày hẹn thanh toán',
        width: 150,
        textAlign: 'center',
      },
      {
        field: 'scheduleAmt',
        headerText:
          this.grvPayments?.ScheduleAmt?.headerText ?? 'Số tiền hẹn thanh toán',
        width: 150,
        textAlign: 'center',
      },
      {
        field: 'paidAmt',
        headerText: this.grvPayments?.PaidAmt?.headerText ?? 'Đã thanh toán',
        width: 150,
        textAlign: 'center',
      },
      {
        field: 'remainAmt',
        headerText: this.grvPayments?.RemainAmt?.headerText ?? 'Dư nợ còn lại',
        width: 150,
        textAlign: 'center',
      },
      {
        field: 'status',
        headerText: this.grvPayments?.Status?.headerText ?? 'Trạng thái',
        width: 90,
        textAlign: 'center',
      },
      {
        field: 'note',
        headerText: this.grvPayments?.Note?.headerText ?? 'Ghi chú',
        width: 90,
        textAlign: 'left',
      },
      // /template: this.columnVatid,
    ];
  }

  onClickMFPayment(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        console.log(data);

        // this.deleteContract(data);
        break;
      case 'SYS03':
        console.log(data);
        // this.editContract(data);
        break;
      case 'SYS04':
        console.log(data);
        // this.copyContract(data);
        break;
    }
  }
}
