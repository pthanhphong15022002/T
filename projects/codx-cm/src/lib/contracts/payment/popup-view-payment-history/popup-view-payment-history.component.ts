import { Component, Optional } from '@angular/core';
import {
  CallFuncService,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { CM_Contracts, CM_ContractsPayments } from '../../../models/cm_model';
import { CodxCmService } from '../../../codx-cm.service';
import { PopupAddPaymentHistoryComponent } from '../popup-add-payment-history/popup-add-payment-history.component';

@Component({
  selector: 'lib-popup-view-payment-history',
  templateUrl: './popup-view-payment-history.component.html',
  styleUrls: ['./popup-view-payment-history.component.scss'],
})
export class PopupViewPaymentHistoryComponent {
  isSave = false;
  dialog: DialogRef;
  listPaymentHistory: CM_ContractsPayments[];
  listPayHistoryOfPay: CM_ContractsPayments[];
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
  listPaymentDelete: CM_ContractsPayments[];
  listPaymentEdit: CM_ContractsPayments[];
  listPaymentAdd: CM_ContractsPayments[];
  listPayment: CM_ContractsPayments[];
  contracts: CM_Contracts;

  sumPaid = 0; // đã thanh toán
  remain = 0; //còn lại

  constructor(
    private cmService: CodxCmService,
    private callfunc: CallFuncService,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.payment = dt?.data?.payment;
    this.listPaymentHistory = dt?.data?.listPaymentHistory;
    this.isSave = dt?.data?.isSave || false;

    this.listPaymentDelete = dt?.data?.listPaymentDelete;
    this.listPaymentEdit = dt?.data?.listPaymentEdit;
    this.listPaymentAdd = dt?.data?.listPaymentAdd;
    this.listPayment = dt?.data?.listPayment;
    this.contracts = dt?.data?.contract;
  }

  ngOnInit(): void {
    this.listPayHistoryOfPay =
      this.listPaymentHistory.filter(
        (paymentHistory) => paymentHistory.refLineID == this.payment?.recID
      ) || [];
    if (this.listPayHistoryOfPay && this.listPayHistoryOfPay.length > 0) {
      this.listPayHistoryOfPay = this.listPayHistoryOfPay.sort(
        (a, b) => a.rowNo - b.rowNo
      );
      this.sumPaid = this.listPayHistoryOfPay.reduce(
        (sum, payHistory) => (sum += payHistory?.paidAmt || 0),
        0
      );
      this.remain = this.payment?.scheduleAmt - this.sumPaid;
    }

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
        this.deletePayHistory(data);
        break;
      case 'SYS03':
        this.openPopupPaymentHistory('edit', this.payment, data);
        break;
      case 'SYS04':
        console.log(data);
        // this.copyContract(data);
        break;
    }
  }

  async openPopupPaymentHistory(action, payment, paymentHistory) {
    let paymentHistoryClone = JSON.parse(JSON?.stringify(paymentHistory));
    let dataInput = {
      action,
      payment,
      paymentHistory: paymentHistoryClone,
      contract: this.contracts,
      listPayment: this.listPayment,
      listPaymentHistory: this.listPaymentHistory,
      listPaymentAdd: this.listPaymentAdd,
      listPaymentEdit: this.listPaymentEdit,
      listPaymentDelet: this.listPaymentDelete,
      isSave: this.isSave,
    };

    let formModel = new FormModel();
    formModel.entityName = 'CM_ContractsPayments';
    formModel.formName = 'CMContractsPayments';
    formModel.gridViewName = 'grvCMContractsPayments';

    let option = new DialogModel();
    option.IsFull = false;
    option.zIndex = 1021;
    option.FormModel = formModel;

    let popupPaymentHistory = this.callfunc.openForm(
      PopupAddPaymentHistoryComponent,
      '',
      600,
      400,
      '',
      dataInput,
      '',
      option
    );

    popupPaymentHistory.closed.subscribe((res) => {
      if (res?.event) {
        let payHisEdit = res?.event;
        let paidAmt = payHisEdit?.paidAmt - paymentHistory?.paidAmt;
        payment.paidAmt += paidAmt;
        payment.remainAmt += -paidAmt;
        this.contracts.paidAmt += paidAmt;
        this.contracts.remainAmt += -paidAmt;
        this.listPayment;
        this.findPayHistory(this.listPayment, payment, 'edit');
        this.findPayHistory(this.listPayHistoryOfPay, payHisEdit, 'edit');
        this.findPayHistory(this.listPaymentHistory, payHisEdit, 'edit');
        this.findPayHistory(this.listPaymentEdit, payHisEdit, 'edit');
        this.listPayHistoryOfPay = JSON.parse(
          JSON.stringify(this.listPayHistoryOfPay)
        );
      }
      // this.listPayment = JSON.parse(JSON.stringify(this.listPayment));
    });
  }

  deletePayHistory(payHistory: CM_ContractsPayments) {
    if (payHistory?.recID) {
      this.notiService.alertCode('SYS030').subscribe((x) => {
        if (x.event && x.event.status == 'Y') {
          this.listPayment, this.listPaymentHistory;
          this.listPayHistoryOfPay;
          this.findPayHistory(this.listPayHistoryOfPay, payHistory, 'delete');
          this.findPayHistory(this.listPaymentHistory, payHistory, 'delete');
          let index = this.listPaymentAdd?.findIndex(
            (pay) => pay?.recID == payHistory.recID
          );
          if (index >= 0) {
            this.listPaymentAdd.splice(index, 1);
          } else {
            this.listPaymentDelete.push(payHistory);
          }

          let listPayHisUpdate = this.listPayHistoryOfPay?.filter((pay) => pay?.rowNo > payHistory?.rowNo);
          listPayHisUpdate.forEach((pay) => { 
            pay.rowNo -= 1; 
            let index = this.listPaymentAdd?.findIndex((payFind) => payFind?.recID == pay.recID);
            if (index >= 0) {
              this.listPaymentAdd.splice(index, 1);
            } else {
              this.findPayHistory(this.listPaymentEdit, pay, 'edit');
            }
            this.findPayHistory(this.listPaymentEdit, pay, 'edit');
          })

          this.listPayHistoryOfPay = JSON.parse(
            JSON.stringify(this.listPayHistoryOfPay)
          );
          this.sumPaid -= payHistory?.paidAmt || 0;
          this.remain += payHistory?.paidAmt || 0;
          this.payment.paidAmt -= payHistory?.paidAmt || 0;
          this.payment.remainAmt += payHistory?.paidAmt || 0;
          this.findPayHistory(this.listPaymentEdit, this.payment, 'edit');
          this.findPayHistory(this.listPayment, this.payment, 'edit');
          this.findPayHistory(this.listPayment, this.payment, 'edit');
          this.contracts.paidAmt -= payHistory?.paidAmt;
          this.contracts.remainAmt += payHistory?.paidAmt;
        }
      });
    }
  }

  findPayHistory(listData = [], data, type) {
    if (listData?.length > 0) {
      let index = listData?.findIndex((x) => x.recID == data?.recID);
      if (index >= 0) {
        if (type == 'delete') {
          listData?.splice(index, 1);
        }
        if (type == 'edit') {
          listData?.splice(index, 1, data);
        }
      } else {
        listData?.push(data);
      }
    } else {
      listData?.push(data);
    }
  }
}
