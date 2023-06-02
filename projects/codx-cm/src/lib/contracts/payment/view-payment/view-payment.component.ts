import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { CM_Contracts, CM_ContractsPayments } from '../../../models/cm_model';
import { CacheService, CallFuncService, DialogModel, FormModel, NotificationsService } from 'codx-core';
import { CodxCmService } from '../../../codx-cm.service';
import { ContractsService } from '../../service-contracts.service';
import { PopupAddPaymentComponent } from '../popup-add-payment/popup-add-payment.component';
import { PopupViewPaymentHistoryComponent } from '../popup-view-payment-history/popup-view-payment-history.component';
import { PopupAddPaymentHistoryComponent } from '../popup-add-payment-history/popup-add-payment-history.component';
import { log } from 'console';

@Component({
  selector: 'view-payment',
  templateUrl: './view-payment.component.html',
  styleUrls: ['./view-payment.component.scss']
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
    funcID: 'CM02041 ',
  };
  fmContractsPaymentsHistory: FormModel = {
    formName: 'CMContractsPaymentsHistory',
    gridViewName: 'grvCMContractsPaymentsHistory',
    entityName: 'CM_ContractsPayments',
    funcID: 'CM02042  ',
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
    private contractService: ContractsService,
  ) {
  }
  
  ngOnInit(): void {
    this.columns = [
      {
        field: 'rowNo',
        headerText: this.grvPayments?.ItemID?.RowNo ?? 'STT',
        width: 70,
      },
      {
        field: 'scheduleDate',
        headerText: this.grvPayments?.ScheduleDate?.headerText ?? 'Ngày hẹn thanh toán',
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
        width: 90,
      },
      {
        field: 'note',
        headerText: this.grvPayments?.Note?.headerText ?? 'Ghi chú',
        width: 90,
      },
      // textAlign: 'left',
      // /template: this.columnVatid,
    ];
  }

  ngOnChanges(changes: SimpleChanges): void {
   if(changes?.contracts){
    console.log(this.listPayment);
    
   }
  }
  gridCreated(e, grid) {
    // let hBody
    // let d = grid?.nativeElement?.parentElement.offsetHeight;
    // if (this.cardbodyGeneral)
    //   hBody = this.cardbodyGeneral.nativeElement.parentElement.offsetHeight;
      //  this.gridHeight = hBody - (hTab + hNote + 120); //40 là header của tab
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

  addPayment() {
    let payment = new CM_ContractsPayments();
    payment.lineType = '0';
    this.openPopupPayment('add', payment);
  }
  editPayment(payment) {
    this.openPopupPayment('edit', payment);
  }

  deletePayment(payment) {
    this.notiService.alertCode('SYS030').subscribe((res) => {
      if (res.event.status === 'Y') {
        let indexPayDelete = this.listPayment.findIndex(
          (payFind) => payFind.recID == payment.recID
        );
        if (indexPayDelete >= 0) {
          this.listPayment.splice(indexPayDelete, 1);
          this.listPaymentDelete.push(payment);
          for (let index = indexPayDelete; index < this.listPayment.length; index++){
            this.listPayment[index].rowNo = index + 1;
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
      listPaymentDelet: this.listPaymentDelete,
      contract: this.contracts,
      isSave: this.isSave,
    };

    let option = new DialogModel();
    option.IsFull = false;
    option.zIndex = 2001;
    option.FormModel = this.fmContractsPayments;
    let popupPayment = this.callfunc.openForm(
      PopupAddPaymentComponent,
      '',
      600,
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
    payMentHistory.lineType = '1';
    this.openPopupPaymentHistory('add', payment, payMentHistory);
  }

  viewPayHistory(payment, width: number, height: number) {
    let dataInput = {
      payment,
      listPaymentHistory: this.listPaymentHistory,
      listPaymentAdd: this.listPaymentAdd,
      listPaymentEdit: this.listPaymentEdit,
      listPaymentDelet: this.listPaymentDelete,
      isSave: this.isSave,
    };

    let option = new DialogModel();
    option.IsFull = false;
    option.zIndex = 1001;
    option.FormModel = this.fmContractsPaymentsHistory;
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
      listPaymentDelet: this.listPaymentDelete,
      isSave: this.isSave,
    };

    let formModel = new FormModel();
    formModel.entityName = 'CM_ContractsPayments';
    formModel.formName = 'CMContractsPayments';
    formModel.gridViewName = 'grvCMContractsPayments';

    let option = new DialogModel();
    option.IsFull = false;
    option.zIndex = 1001;
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
