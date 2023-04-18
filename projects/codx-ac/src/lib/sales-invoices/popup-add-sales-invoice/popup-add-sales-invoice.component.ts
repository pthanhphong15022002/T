import { Component, Injector, Optional, ViewChild } from '@angular/core';
import {
  CodxFormComponent,
  DataRequest,
  DialogData,
  DialogRef,
  FormModel,
  UIComponent,
} from 'codx-core';
import { ISalesInvoice } from '../interfaces/ISalesInvoice.interface';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { JournalService } from '../../journals/journals.service';
import { CodxAcService } from '../../codx-ac.service';
import { Observable } from 'rxjs';
import { IJournal } from '../../journals/interfaces/IJournal.interface';
import { EditSettingsModel, row } from '@syncfusion/ej2-angular-grids';

@Component({
  selector: 'lib-popup-add-sales-invoice',
  templateUrl: './popup-add-sales-invoice.component.html',
  styleUrls: ['./popup-add-sales-invoice.component.css'],
})
export class PopupAddSalesInvoiceComponent extends UIComponent {
  //#region Constructor
  @ViewChild('form') form: CodxFormComponent;

  salesInvoice: ISalesInvoice = {} as ISalesInvoice;
  formTitle: string;
  isEdit: boolean = false;
  voucherNoPlaceholderText$: Observable<string>;
  journal: IJournal;
  customerName: string;
  tabs: TabModel[] = [
    { name: 'history', textDefault: 'Lịch sử', isActive: false },
    { name: 'comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'link', textDefault: 'Liên kết', isActive: false },
  ];
  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Normal',
  };
  fmSalesInvoicesLines: FormModel = {
    entityName: 'SM_SalesInvoicesLines',
    formName: 'SalesInvoicesLines',
    gridViewName: 'grvSalesInvoicesLines',
  };

  constructor(
    private injector: Injector,
    private acService: CodxAcService,
    private journalService: JournalService,
    @Optional() public dialogRef: DialogRef,
    @Optional() public dialogData: DialogData
  ) {
    super(injector);

    this.formTitle = dialogData.data.formTitle;
    this.isEdit = dialogData.data.formType === 'edit';
    this.salesInvoice = this.dialogRef.dataService?.dataSelected;
  }
  //#endregion

  //#region Init
  override onInit(): void {
    this.voucherNoPlaceholderText$ =
      this.journalService.getVoucherNoPlaceholderText();

    const options = new DataRequest();
    options.entityName = 'AC_Journals';
    options.predicates = 'JournalNo=@0';
    options.dataValues = this.salesInvoice.journalNo;
    options.pageLoading = false;
    this.acService.loadDataAsync('AC', options).subscribe((res) => {
      this.journal = res[0]?.dataValue
        ? { ...res[0], ...JSON.parse(res[0].dataValue) }
        : res[0];

      // this.journalService.setAccountCbxDataSourceByJournal(
      //   this.journal,
      //   this.cbxCashAcctID,
      //   this.cbxOffsetAcctID
      // );

      // if (this.isEdit) {
      //   this.hiddenFields = this.journalService.getHiddenFields(this.journal);
      // }
    });
  }
  //#endregion

  //#region Event
  handleClickSave(closeAfterSaving: boolean): void {}

  close(): void {
    this.dialogRef.close();
  }

  handleInputChange(e): void {}

  handleCreate(e): void {}

  handleCellChange(e): void {

  }

  deleteRow(data): void {}
  //#endregion

  //#region Method
  //#endregion

  //#region Function
  //#endregion
}
