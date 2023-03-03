import { Component, Injector, Optional, ViewChild } from '@angular/core';
import {
  CodxFormComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { ICashTransfer } from '../interfaces/ICashTransfer.interface';
import { IVoucherLineInvoice } from '../interfaces/IVoucherLineInvoice.interface';

@Component({
  selector: 'lib-popup-add-cash-transfer',
  templateUrl: './popup-add-cash-transfer.component.html',
  styleUrls: ['./popup-add-cash-transfer.component.css'],
})
export class PopupAddCashTransferComponent extends UIComponent {
  //#region Constructor
  @ViewChild('form') form: CodxFormComponent;
  cashTransfer: ICashTransfer = {} as ICashTransfer;
  voucherLineInvoice: IVoucherLineInvoice = {} as IVoucherLineInvoice;
  formTitle: string;
  hasInvoice: boolean = false;
  tabs: TabModel[] = [
    { name: 'history', textDefault: 'Lịch sử', isActive: false },
    { name: 'comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'link', textDefault: 'Liên kết', isActive: false },
  ];
  fmVoucherLineInvoice: FormModel = {
    entityName: 'AC_VoucherLineInvoices',
    formName: 'VoucherLineInvoices',
    gridViewName: 'grvVoucherLineInvoices',
    entityPer: 'VoucherLineInvoices',
  };

  constructor(
    private injector: Injector,
    private notiService: NotificationsService,
    @Optional() public dialogRef: DialogRef,
    @Optional() public dialogData: DialogData
  ) {
    super(injector);

    this.formTitle = dialogData.data.formTitle;
  }
  //#endregion

  //#region Init
  onInit(): void {}
  //#endregion

  //#region Event
  handleInputChange(e, prop: string = 'cashTransfer') {
    this[prop][e.field] = e.data;
  }
  //#endregion

  //#region Method
  //#endregion

  //#region Function
  //#endregion
}
