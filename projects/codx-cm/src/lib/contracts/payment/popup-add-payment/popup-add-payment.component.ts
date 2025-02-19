import { Component, Input, OnInit, Optional } from '@angular/core';
import {
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { CM_Contracts, CM_ContractsPayments } from '../../../models/cm_model';
import { CodxCmService } from '../../../codx-cm.service';
import { firstValueFrom } from 'rxjs';
import { StepService } from 'projects/codx-dp/src/lib/share-crm/codx-step/step.service';

@Component({
  selector: 'lib-popup-add-payment',
  templateUrl: './popup-add-payment.component.html',
  styleUrls: ['./popup-add-payment.component.scss'],
})
export class PopupAddPaymentComponent {
  REQUIRE = ['scheduleDate', 'scheduleAmt'];
  view;
  isSave = false;
  action = '';
  contract: CM_Contracts;
  payment: CM_ContractsPayments;
  listPayment: CM_ContractsPayments[];
  listPaymentAdd: CM_ContractsPayments[];
  listPaymentEdit: CM_ContractsPayments[];
  listPaymentDelete: CM_ContractsPayments[];
  contractID = null;
  percent = 0;
  remaining = 0;
  sumScheduleAmt = 0;
  sumScheduleAmtAllPayment = 0;
  sumScheduleAmtAllPaymentEdit = 0;
  isErorrDate = true;
  percentChanged = true;
  valueChanged = true;

  fmContracts: FormModel = {
    formName: 'CMContracts',
    gridViewName: 'grvCMContracts',
    entityName: 'CM_Contracts',
    funcID: 'CM02042  ',
  };

  title = 'Lịch thanh toán';
  checkDate = 0;
  dialog: DialogRef;
  constructor(
    private cmService: CodxCmService,
    private notiService: NotificationsService,
    private stepService: StepService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.isSave = dt?.data?.isSave || false;
    this.action = dt?.data?.action;
    this.contract = dt?.data?.contract;
    this.payment = dt?.data?.payment;
    this.listPayment = dt?.data?.listPayment || [];
    this.listPaymentAdd = dt?.data?.listPaymentAdd || [];
    this.listPaymentEdit = dt?.data?.listPaymentEdit || [];
    this.listPaymentDelete = dt?.data?.listPaymentDelete || [];
    this.contractID = this.contract?.recID;
  }

  async ngOnInit(): Promise<void> {
    this.sumScheduleAmtAllPayment = this.listPayment?.reduce((sum, item) => {
      return sum + item?.scheduleAmt || 0;
    }, 0);
    this.sumScheduleAmt = this.sumScheduleAmtAllPayment;
    this.remaining = this.contract?.contractAmt - this.sumScheduleAmt;
    this.percent =
      (this.payment.scheduleAmt / this.contract?.contractAmt) * 100;
    this.setDataInput();
    this.view = await this.stepService.getFormModel(this.dialog.formModel);
  }

  setDataInput() {
    if (this.action == 'add') {
      this.setPayment();
    }
    if (this.action == 'edit') {
      this.payment = JSON.parse(JSON.stringify(this.payment));
      this.sumScheduleAmtAllPaymentEdit =
        this.sumScheduleAmtAllPayment - this.payment?.scheduleAmt || 0;
    }
    if (this.action == 'copy') {
    }
  }

  setPayment() {
    let rowNo = this.listPayment?.length || 0;
    this.payment = new CM_ContractsPayments();
    this.payment.rowNo = rowNo + 1;
    this.payment.refNo = this.contractID;
    this.payment.scheduleDate = new Date();
    this.payment.status = '1';
    this.payment.paidAmt = 0;
    this.payment.lineType = '0';
  }

  //#region change value
  valueChangePercent(e) {
    if (this.percentChanged) {
      this.percent = e?.value;
      this.payment.scheduleAmt = Number(
        ((this.percent * this.contract.contractAmt) / 100).toFixed(0)
      );
      this.checkRemaining(this.payment.scheduleAmt);
      this.valueChanged = false;
    }
  }

  valueChangeText(event) {
    this.payment[event?.field] = event?.data;
    if (event?.field == 'scheduleAmt' && this.valueChanged) {
      this.percent = Number(
        ((this.payment.scheduleAmt / this.contract?.contractAmt) * 100).toFixed(
          1
        )
      );
      this.checkRemaining(event?.data);
      this.percentChanged = false;
    }
  }

  checkRemaining(scheduleAmt) {
    if (this.action == 'edit') {
      this.sumScheduleAmt = this.sumScheduleAmtAllPaymentEdit + scheduleAmt;
    } else {
      this.sumScheduleAmt = this.sumScheduleAmtAllPayment + scheduleAmt; // đã thanh toán
    }
    this.remaining = this.contract?.contractAmt - this.sumScheduleAmt; // còn lại
    if (this.remaining < 0) {
      this.notiService.notifyCode('CM018');
    }
  }

  valueChangeCombobox(event) {
    this.payment[event?.field] = event?.data;
  }

  changeValueDate(event) {
    this.payment[event?.field] = new Date(event?.data?.fromDate);
    if (this.action == 'add') {
      this.checkDate = this.stepService.compareDates(
        this.payment?.scheduleDate,
        new Date(),
        'h'
      );
      if (this.checkDate < 0 && this.isErorrDate) {
        this.notiService.notifyCode('CM017', 0, [this.view?.scheduleDate]);
      }
      this.isErorrDate = !this.isErorrDate;
    }
  }

  clickTesk(event) {
    this[event] = true;
  }

  //#endregion
  //#region Save
  saveAndClose() {
    if (this.stepService.checkRequire(this.REQUIRE, this.payment, this.view)) {
      return;
    }
    if (this.checkDate < 0) {
      this.notiService.notifyCode('CM017', 0, [this.view?.scheduleDate]);
      return;
    }

    if (this.action == 'add' || this.action == 'copy') {
      this.addPayment(true);
    }
    if (this.action == 'edit') {
      this.editPayment(true);
    }
  }

  saveAndContinue() {
    if (this.stepService.checkRequire(this.REQUIRE, this.payment, this.view)) {
      return;
    }
    if (this.checkDate < 0) {
      this.notiService.notifyCode('CM017', 0, [this.view?.scheduleDate]);
      return;
    }

    if (this.action == 'add' || this.action == 'copy') {
      this.addPayment(false);
    }
    if (this.action == 'edit') {
      this.editPayment(false);
    }
  }

  //#endregion
  //#region Add
  async addPayment(isClose) {
    this.payment.remainAmt = this.payment?.scheduleAmt || 0;
    if (this.isSave) {
      let paymentOut = await firstValueFrom(
        this.cmService.addPayments(this.payment)
      );
      this.listPayment.push(paymentOut);
      this.notiService.notifyCode('SYS006');
    } else {
      this.listPayment.push(this.payment);
      this.listPaymentAdd.push(this.payment);
    }
    if (isClose) {
      this.dialog.close(true);
    } else {
      this.action = 'add';
      this.setPayment();
    }
  }
  //#endregion
  //#region Edit
  async editPayment(isClose) {
    if (this.isSave) {
      let paymentOut = await firstValueFrom(
        this.cmService.editPayments(this.payment)
      );
      if (paymentOut) {
        let paymentIndex = this.listPayment.findIndex(
          (payment) => payment.recID == this.payment?.recID
        );
        if (paymentIndex >= 0) {
          this.listPayment.splice(paymentIndex, 1, paymentOut);
        }
        this.notiService.notifyCode('SYS007');
      }
    } else {
      let paymentIndex = this.listPayment.findIndex(
        (payment) => payment.recID == this.payment?.recID
      );
      if (paymentIndex >= 0) {
        this.listPayment.splice(paymentIndex, 1, this.payment);
      }
      let paymentIndexAdd = this.listPaymentAdd.findIndex(
        (payment) => payment.recID == this.payment?.recID
      );
      if (paymentIndexAdd >= 0) {
        this.listPaymentAdd.splice(paymentIndexAdd, 1, this.payment);
      } else {
        let paymentIndexEdit = this.listPaymentEdit.findIndex(
          (payment) => payment.recID == this.payment?.recID
        );
        if (paymentIndexEdit >= 0) {
          this.listPaymentEdit.splice(paymentIndexAdd, 1, this.payment);
        } else {
          this.listPaymentEdit.push(this.payment);
        }
      }
    }
    if (isClose) {
      this.dialog.close(true);
    } else {
      this.action = 'add';
      this.setPayment();
    }
  }
  //#endregion
}
