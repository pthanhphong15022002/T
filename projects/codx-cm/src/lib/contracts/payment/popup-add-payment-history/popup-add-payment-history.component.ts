import { Component, Input, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';
import { CM_Contracts, CM_ContractsPayments } from '../../../models/cm_model';
import { CodxCmService } from '../../../codx-cm.service';

@Component({
  selector: 'lib-popup-add-payment-history',
  templateUrl: './popup-add-payment-history.component.html',
  styleUrls: ['./popup-add-payment-history.component.scss']
})
export class PopupAddPaymentHistoryComponent {
  action = '';
  payment: CM_ContractsPayments;
  listPayment: CM_ContractsPayments[];
  paymentHistory: CM_ContractsPayments;
  listPaymentHistory: CM_ContractsPayments[];

  listPaymentAdd: CM_ContractsPayments[];
  listPaymentEdit: CM_ContractsPayments[];
  listPaymentDelete: CM_ContractsPayments[];
  contract: CM_Contracts;

  listPaymentHistoryOfPayment: CM_ContractsPayments[]; //

  title = "Lịch sử thanh toán";
  dialog: DialogRef;
  constructor(
    private cmService: CodxCmService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.action = dt?.data?.action;
    this.contract = dt?.data?.contract;
    this.payment = dt?.data?.payment;
    this.listPayment = dt?.data?.listPayment;
    this.paymentHistory = dt?.data?.paymentHistory;
    this.listPaymentAdd = dt?.data?.listPaymentAdd;
    this.listPaymentEdit = dt?.data?.listPaymentEdit;
    this.listPaymentDelete = dt?.data?.listPaymentDelete;
    this.listPaymentHistory = dt?.data?.listPaymentHistory;
  }

  ngOnInit(): void {
    this.listPaymentHistoryOfPayment = this.listPaymentHistory.filter(paymentHistory => paymentHistory.refLineID == this.payment?.recID)
    this.setDataInput();
  }

  setDataInput(){
    if(this.action == 'add'){
      this.setPaymentHistory();
    }
    if(this.action == 'edit'){

    }
    if(this.action == 'copy'){

    }
  }

  setPaymentHistory(){
    let rowNo = this.listPaymentHistoryOfPayment?.length || 0;
    this.paymentHistory = new CM_ContractsPayments();
    this.paymentHistory.rowNo = rowNo + 1;
    this.paymentHistory.refNo = this.contract?.recID;
    this.paymentHistory.refLineID = this.payment?.recID;
    this.paymentHistory.scheduleDate = this.payment?.scheduleDate;
    this.paymentHistory.scheduleAmt = this.payment?.scheduleAmt;
    this.paymentHistory.remainAmt = this.payment?.remainAmt;
  }

  valueChangeText(event) {
    this.paymentHistory[event?.field] = event?.data;
  }

  valueChangeCombobox(event) {
    this.paymentHistory[event?.field] = event?.data;
  }

  valueChangeAlert(event) {
    this.paymentHistory[event?.field] = event?.data;
  }


  changeValueDate(event) {
    this.paymentHistory[event?.field] = new Date(event?.data?.fromDate);
  }

  save(){
    if(this.action == 'add' || this.action == 'copy'){
      this.addPaymentHistory(false);
    }
    if(this.action == 'edit'){
      this.editPayment(false);
    }
  }

  saveAndClose(){
    if(this.action == 'add' || this.action == 'copy'){
      this.addPaymentHistory(true);
    }
    if(this.action == 'edit'){
      this.editPayment(true);
    }
  }

  //Số tiền còn lại: remainAmt remainAmt
  // số tiền đã thanh toán: paidAmt

  addPaymentHistory(isClose) {
    this.listPaymentHistory.push(this.paymentHistory);
    this.listPaymentAdd.push(this.paymentHistory);
    this.listPaymentHistoryOfPayment.push(this.paymentHistory);
    
    this.payment.remainAmt = this.payment?.remainAmt - this.paymentHistory?.paidAmt || this.payment.remainAmt;
    this.payment.paidAmt += Number(this.paymentHistory.paidAmt || 0);
    let paymentFind = this.listPayment.find(payment => payment.recID == this.payment?.recID);
    if(paymentFind){
      paymentFind.remainAmt = this.payment?.remainAmt - this.paymentHistory?.paidAmt || this.payment.remainAmt;
      paymentFind.paidAmt += Number(this.paymentHistory.paidAmt || 0);
    }

    this.contract.paidAmt += Number(this.paymentHistory.paidAmt);
    this.contract.remainAmt = Number(this.contract.contractAmt) - Number(this.contract.paidAmt);
    if(isClose){
      this.dialog.close()
    }else{
      this.action = 'add'; 
      this.setPaymentHistory();
    }
    // this.cmService.addPayments(this.payment).subscribe( res => {
    //   if(res){
    //       this.dialog.close({ payment: res, action: this.action });
    //     }
    //   })
  }

  editPayment(isClose) {
    let payHistoryIndex = this.listPaymentHistory.findIndex(payment => payment.recID == this.paymentHistory?.recID);
    if(payHistoryIndex >= 0){
      this.listPaymentHistory.splice(payHistoryIndex,1,this.paymentHistory);
    }

    let paymentIndexAdd = this.listPaymentAdd.findIndex(payment => payment.recID == this.paymentHistory?.recID);
    if(paymentIndexAdd >= 0){ 
      this.listPaymentAdd.splice(paymentIndexAdd,1,this.paymentHistory);
    }else{
      let paymentIndexEdit = this.listPaymentEdit.findIndex(payment => payment.recID == this.paymentHistory?.recID);
      if(paymentIndexEdit >=0){
        this.listPaymentEdit.splice(paymentIndexAdd,1,this.paymentHistory);
      }else{
        this.listPaymentEdit.push(this.paymentHistory);
      }
    }

    if(isClose){
      this.dialog.close(true);
    }else{
      this.action = "add";
      this.setPaymentHistory();
    }
    // this.cmService.editPayments(this.payment).subscribe( res => {
    //   if(res){
    //       this.dialog.close({ payment: res, action: this.action });
    //     }
    //   })
  }
}
