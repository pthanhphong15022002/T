import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CM_Contracts, CM_ContractsPayments } from '../../../models/cm_model';
import {
  CacheService,
  CallFuncService,
  DialogModel,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { CodxCmService } from '../../../codx-cm.service';
import { ContractsService } from '../../service-contracts.service';
import { PopupAddPaymentComponent } from '../popup-add-payment/popup-add-payment.component';
import { PopupViewPaymentHistoryComponent } from '../popup-view-payment-history/popup-view-payment-history.component';
import { PopupAddPaymentHistoryComponent } from '../popup-add-payment-history/popup-add-payment-history.component';
import { log } from 'console';

@Component({
  selector: 'view-payment',
  templateUrl: './view-payment.component.html',
  styleUrls: ['./view-payment.component.scss'],
})
export class ViewPaymentComponent implements OnInit, OnChanges {
  @ViewChild('cardbodyGeneral') cardbodyGeneral: ElementRef;
  @ViewChild('scheduleDate') scheduleDateTem: ElementRef;
  @Input() contracts: CM_Contracts;
  @Input() listPayment: CM_ContractsPayments[];
  @Input() listPaymentHistory: CM_ContractsPayments[];
  @Input() listPaymentAdd: CM_ContractsPayments[];
  @Input() listPaymentEdit: CM_ContractsPayments[];
  @Input() listPaymentDelete: CM_ContractsPayments[];
  @Input() isSave = false;

  fmContractsPayments: FormModel = {
    formName: 'CMContractsPayments',
    gridViewName: 'grvCMContractsPayments',
    entityName: 'CM_ContractsPayments',
    funcID: 'CM02041',
  };
  fmContractsPaymentsHistory: FormModel = {
    formName: 'CMContractsPaymentsHistory',
    gridViewName: 'grvCMContractsPaymentsHistory',
    entityName: 'CM_ContractsPayments',
    funcID: 'CM02042',
  };
  moreDefaut = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
  };
  columns: any;
  grvPayments: any;
  gridHeight: number = 300;
  constructor(
    private cache: CacheService,
    private callfunc: CallFuncService,
    private notiService: NotificationsService,
    private cmService: CodxCmService,
    private contractService: ContractsService
  ) {}

  ngOnInit(): void {
    this.columns = [
      {
        field: 'rowNo',
        headerText: this.grvPayments?.ItemID?.RowNo ?? 'STT',
        width: 80,
      },
      {
        field: 'scheduleDate',
        headerText:
          this.grvPayments?.ScheduleDate?.headerText ?? 'Ngày hẹn thanh toán',
        template: this.scheduleDateTem,
        width: 150,
      },
      {
        field: 'scheduleAmt',
        headerText:
          this.grvPayments?.ScheduleAmt?.headerText ?? 'Số tiền hẹn thanh toán',
        width: 150,
      },
      {
        field: 'paidAmt',
        headerText: this.grvPayments?.PaidAmt?.headerText ?? 'Đã thanh toán',
        width: 150,
      },
      {
        field: 'remainAmt',
        headerText: this.grvPayments?.RemainAmt?.headerText ?? 'Dư nợ còn lại',
        width: 150,
      },
      {
        field: 'status',
        headerText: this.grvPayments?.Status?.headerText ?? 'Trạng thái',
        width: 100,
      },
      {
        field: 'note',
        headerText: this.grvPayments?.Note?.headerText ?? 'Ghi chú',
        width: 100,
      },
      // textAlign: 'left',
      // /template: this.columnVatid,
    ];
    if (this.listPayment && this.listPayment?.length > 0) {
      this.listPayment = this.listPayment?.sort((a, b) => a?.rowNo - b?.rowNo);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.contracts) {
    }
  }

  onClickMFPayment(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.deletePayment(data);
        break;
      case 'SYS03':
        this.editPayment(data);
        break;
      case 'SYS04':
        console.log(data);
        // this.copyContract(data);
        break;
      case 'CM02041_1': //xem lịch sử
        this.viewPayHistory(data, 1200, 500);
        break;
      case 'CM02041_2': // thêm lịch sử
        this.addPayHistory(data);
        break;
    }
  }

  changeDataMF(event) {
    if (event != null) {
      event.forEach((res) => {
        switch (res.functionID) {
          case 'SYS003':
          case 'SYS004':
          case 'CM0204_4':
            res.disabled = true;
            break;
        }
      });
    }
  }

  addPayment() {
    if (!this.contracts?.contractAmt) {
      this.notiService.notifyCode('CM023');
      return;
    }
    let payment = new CM_ContractsPayments();
    payment.lineType = '0';
    this.openPopupPayment('add', payment);
  }
  editPayment(payment) {
    this.openPopupPayment('edit', payment);
  }

  deletePayment(paymentDel) {
    let payHistory = this.listPaymentHistory?.find(
      (paymentHis) => paymentHis.refLineID == paymentDel.recID
    );
    if (payHistory) {
      this.notiService.notifyCode('Đã có lịch sử thanh toán');
      return;
    }
    this.notiService.alertCode('SYS030').subscribe((res) => {
      if (res.event.status === 'Y') {
        let indexPayDelete = this.listPayment.findIndex(
          (payFind) => payFind.recID == paymentDel.recID
        );
        if (indexPayDelete >= 0) {
          this.listPayment.splice(indexPayDelete, 1);
          let indexAdd = this.listPaymentAdd?.findIndex(
            (payAdd) => payAdd.recID == paymentDel.recID
          );
          if (indexAdd >= 0) {
            this.listPaymentAdd?.splice(indexAdd, 1);
          } else {
            this.listPaymentDelete.push(paymentDel);
          }
          for (
            let index = indexPayDelete;
            index < this.listPayment.length;
            index++
          ) {
            this.listPayment[index].rowNo = index + 1;
            let indexFind = this.listPaymentAdd.findIndex(
              (payAdd) => payAdd.recID == this.listPayment[index]?.recID
            );
            if (indexFind >= 0) {
              this.listPaymentAdd?.splice(
                indexFind,
                1,
                this.listPayment[index]
              );
            } else {
              let indexFindEdit = this.listPaymentEdit.findIndex(
                (payAdd) => payAdd.recID == this.listPayment[index]?.recID
              );
              if (indexFindEdit >= 0) {
                this.listPaymentEdit?.splice(
                  indexFindEdit,
                  1,
                  this.listPayment[index]
                );
              } else {
                this.listPaymentEdit?.push(this.listPayment[index]);
              }
            }
          }
          this.listPayment = JSON.parse(JSON.stringify(this.listPayment));
        }
      }
    });
  }

  async openPopupPayment(action, payment) {
    let dataInput = {
      action,
      payment,
      listPayment: this.listPayment,
      listPaymentAdd: this.listPaymentAdd,
      listPaymentEdit: this.listPaymentEdit,
      listPaymentDelete: this.listPaymentDelete,
      contract: this.contracts,
      isSave: this.isSave,
    };

    let option = new DialogModel();
    option.IsFull = false;
    option.zIndex = 1021;
    option.FormModel = this.fmContractsPayments;
    let popupPayment = this.callfunc.openForm(
      PopupAddPaymentComponent,
      '',
      550,
      400,
      '',
      dataInput,
      '',
      option
    );

    popupPayment.closed.subscribe((res) => {
      this.listPayment = JSON.parse(JSON.stringify(this.listPayment));
    });
  }

  addPayHistory(payment) {
    let payMentHistory = new CM_ContractsPayments();
    let countPayMent = this.listPayment.length;
    payMentHistory.rowNo = countPayMent + 1;
    payMentHistory.refNo = this.contracts?.recID;
    payMentHistory.remainAmt = payment?.remainAmt;
    payMentHistory.lineType = '1';
    this.openPopupPaymentHistory('add', payment, payMentHistory);
  }

  viewPayHistory(payment, width: number, height: number) {
    let dataInput = {
      payment,
      listPaymentHistory: this.listPaymentHistory,
      listPaymentAdd: this.listPaymentAdd,
      listPaymentEdit: this.listPaymentEdit,
      listPaymentDelete: this.listPaymentDelete,
      listPayment: this.listPayment,
      isSave: this.isSave,
      contract: this.contracts,
    };

    let option = new DialogModel();
    option.IsFull = false;
    option.zIndex = 1021;
    option.FormModel = this.fmContractsPayments;
    let popupPayHistory = this.callfunc.openForm(
      PopupViewPaymentHistoryComponent,
      '',
      width,
      height,
      '',
      dataInput,
      '',
      option
    );
    popupPayHistory.closed.subscribe((res) => {
      this.listPayment = JSON.parse(JSON.stringify(this.listPayment));
    });
  }

  async openPopupPaymentHistory(action, payment, paymentHistory) {
    let dataInput = {
      action,
      payment,
      paymentHistory,
      contract: this.contracts,
      listPayment: this.listPayment,
      listPaymentHistory: this.listPaymentHistory,
      listPaymentAdd: this.listPaymentAdd,
      listPaymentEdit: this.listPaymentEdit,
      listPaymentDelete: this.listPaymentDelete,
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
      this.listPayment = JSON.parse(JSON.stringify(this.listPayment));
    });
  }
}
