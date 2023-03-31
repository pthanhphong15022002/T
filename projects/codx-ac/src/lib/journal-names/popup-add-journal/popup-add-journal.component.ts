import {
  AfterViewInit,
  Component,
  Injector,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  CodxFormComponent,
  CodxInputComponent,
  CRUDService,
  DataRequest,
  DialogData,
  DialogModel,
  DialogRef,
  RequestOption,
  UIComponent,
} from 'codx-core';
import { PopupAddAutoNumberComponent } from 'projects/codx-es/src/lib/setting/category/popup-add-auto-number/popup-add-auto-number.component';
import { filter, map, Observable } from 'rxjs';
import { CodxAcService } from '../../codx-ac.service';
import { CustomizedMultiSelectPopupComponent } from '../customized-multi-select-popup/customized-multi-select-popup.component';
import { IJournal } from '../interfaces/IJournal.interface';
import { JournalService } from '../journal-names.service';
import { PopupSetupInvoiceComponent } from '../popup-setup-invoice/popup-setup-invoice.component';
import { SingleSelectPopupComponent } from '../single-select-popup/single-select-popup.component';

@Component({
  selector: 'lib-popup-add-journal',
  templateUrl: './popup-add-journal.component.html',
  styleUrls: ['./popup-add-journal.component.css'],
})
export class PopupAddJournalComponent
  extends UIComponent
  implements AfterViewInit
{
  //#region Constructor
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('periodID') periodID: CodxInputComponent;

  journal: IJournal = {
    mixedPayment: false,
    unpostControl: false,
    postControl: false,
    approval: false,
  } as IJournal;
  formTitle: string;
  gvs: any;
  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Common information' },
    {
      icon: 'icon-settings',
      text: 'Thiết lập',
      name: 'Settings',
    },
    {
      icon: 'icon-people',
      text: 'Phân quyền',
      name: 'Roles',
    },
  ];
  fiscalYears: any[] = [];
  isMultiSelectPopupDrHidden: boolean = true;
  isMultiSelectPopupCrHidden: boolean = true;
  isEdit: boolean = false;
  tempIDIMControls: any[] = [];

  vllDateFormat: any;
  vllStringFormat: any;

  constructor(
    private injector: Injector,
    private acService: CodxAcService,
    private journalService: JournalService,
    @Optional() public dialogRef: DialogRef,
    @Optional() private dialogData: DialogData
  ) {
    super(injector);

    this.journal = dialogRef.dataService?.dataSelected;
    this.journal.approval = this.journal.approval == '1' ? true : false;
    this.journal.postControl = ['1', '2'].includes(this.journal.postControl)
      ? true
      : false;
    this.journal.projectControl = this.journal.projectControl ? '1' : '0';
    this.journal.assetControl = this.journal.assetControl ? '1' : '0';
    this.journal.postSubControl = this.journal.postSubControl ? '1' : '0';

    if (dialogData.data.formType === 'edit') {
      this.isEdit = true;
      try {
        this.tempIDIMControls = JSON.parse(this.journal.idimControl);
        this.journal.creater = JSON.parse(this.journal.creater);
        this.journal.approver = JSON.parse(this.journal.approver);
        this.journal.poster = JSON.parse(this.journal.poster);
        this.journal.unposter = JSON.parse(this.journal.unposter);
        this.journal.sharer = JSON.parse(this.journal.sharer);
      } catch {}
    }
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.cache
      .gridViewSetup(
        this.dialogRef.formModel.formName,
        this.dialogRef.formModel.gridViewName
      )
      .subscribe((res) => {
        console.log(res);
        this.gvs = res;
      });

    this.acService
      .loadComboboxData('FiscalPeriods', 'AC')
      .subscribe((periods) => {
        this.fiscalYears = [...new Set(periods.map((p) => p.FiscalYear))];
      });

    this.dialogRef.closed.subscribe((res) => {
      console.log(res);

      if (!res.event && !this.isEdit) {
        this.journalService
          .deleteAutoNumber(this.journal.recID)
          .subscribe((res) => console.log(res));
      }
    });

    this.cache
      .gridViewSetup('ESCategories', 'grvESCategories')
      .subscribe((gv) => {
        if (gv) {
          this.cache
            .valueList(gv['DateFormat']?.referedValue ?? 'L0088')
            .subscribe((vllDFormat) => {
              this.vllDateFormat = vllDFormat.datas;
            });

          this.cache
            .valueList(gv['StringFormat']?.referedValue ?? 'L0089')
            .subscribe((vllSFormat) => {
              this.vllStringFormat = vllSFormat.datas;
            });
        }
      });
  }

  ngAfterViewInit(): void {
    this.formTitle = this.dialogData.data?.formTitle;
  }
  //#endregion

  //#region Event
  handleInputChange(e): void {
    console.log(e);

    const irFields = ['creater'];
    if (irFields.includes(e.field)) {
      this.journal[e.field] = e.data.map((d) => {
        const { dataSelected, ...rest } = d;
        return rest;
      });
    } else {
      this.journal[e.field] = e.data;
    }
  }

  handleChange(e): void {
    console.log(e);

    this.form.formGroup.controls.periodID.reset();
    (this.periodID.ComponentCurrent.dataService as CRUDService).setPredicates(
      ['FiscalYear=@0'],
      [e.itemData.value]
    );
  }

  handleClickSave(): void {
    console.log(this.journal);

    if (!this.acService.validateFormData(this.form.formGroup, this.gvs)) {
      return;
    }

    if (!['0102', '0302', '0304'].includes(this.journal.journalType)) {
      this.journal.invoiceType = null;
      this.journal.invoiceForm = null;
      this.journal.invoiceSeriNo = null;
    }

    let temp: IJournal = { ...this.journal };
    if (this.journal.approval) {
      temp.postControl = this.journal.postControl ? 1 : 0;
      temp.approval = 1;
    } else {
      temp.postControl = this.journal.postControl ? 2 : 0;
      temp.approval = 0;
    }
    temp.projectControl = this.journal.projectControl == '1' ? true : false;
    temp.assetControl = this.journal.assetControl == '1' ? true : false;
    temp.postSubControl = this.journal.postSubControl == '1' ? true : false;
    temp.creater = this.journal.creater
      ? JSON.stringify(this.journal.creater)
      : this.journal.creater;
    temp.approver = this.journal.approver
      ? JSON.stringify(this.journal.approver)
      : this.journal.approver;
    temp.poster = this.journal.poster
      ? JSON.stringify(this.journal.poster)
      : this.journal.poster;
    temp.unposter = this.journal.unposter
      ? JSON.stringify(this.journal.unposter)
      : this.journal.unposter;
    temp.sharer = this.journal.sharer
      ? JSON.stringify(this.journal.sharer)
      : this.journal.sharer;

    const { dataValue, ...rest } = temp;
    temp.dataValue = JSON.stringify(rest);

    console.log(temp);

    this.dialogRef.dataService
      .save((req: RequestOption) => {
        req.methodName = !this.isEdit
          ? 'AddJournalAsync'
          : 'UpdateJournalAsync';
        req.className = 'JournalsBusiness';
        req.assemblyName = 'ERM.Business.AC';
        req.service = 'AC';
        req.data = temp;

        return true;
      })
      .subscribe((res) => {
        if (res.save || res.update) {
          this.dialogRef.close(true);
        }
      });
  }

  openInvoiceForm(): void {
    const options = new DialogModel();
    options.FormModel = {
      entityName: 'AC_Journals',
      formName: 'Journals',
      gridViewName: 'grvJournals',
    };

    this.callfc
      .openForm(
        PopupSetupInvoiceComponent,
        'This param is not working',
        400,
        250,
        '',
        {
          journal: this.journal,
        },
        '',
        options
      )
      .closed.subscribe(({ event }) => {
        console.log(event);

        this.journal.invoiceType = event.invoiceType;
        this.journal.invoiceForm = event.invoiceForm;
        this.journal.invoiceSeriNo = event.invoiceSeriNo;
      });
  }

  openSelectPopup(type: string, acctControl: string): void {
    if (acctControl === '0' || acctControl === '1') {
      this.callfc
        .openForm(
          SingleSelectPopupComponent,
          'This param is not working',
          400,
          500,
          '',
          {
            selectedOption:
              type === 'dr' ? this.journal.drAcctID : this.journal.crAcctID,
          }
        )
        .closed.subscribe(({ event }) => {
          console.log(event);

          if (event) {
            type === 'dr'
              ? (this.journal.drAcctID = event)
              : (this.journal.crAcctID = event);
          }
        });
    }

    if (acctControl === '2') {
      type === 'dr'
        ? (this.isMultiSelectPopupDrHidden = false)
        : (this.isMultiSelectPopupCrHidden = false);
    }
  }

  hideMultiSelectPopup(e, prop: string): void {
    console.log(e);

    if (e) {
      this.journal[prop] = e.id;
    }

    this.isMultiSelectPopupDrHidden = true;
    this.isMultiSelectPopupCrHidden = true;
  }

  openCustomizedMultiSelectPopup(): void {
    this.callfc
      .openForm(
        CustomizedMultiSelectPopupComponent,
        'This param is not working',
        400,
        500,
        '',
        {
          selectedOptions: this.journal.idimControl,
        }
      )
      .closed.subscribe(({ event }) => {
        console.log(event);

        if (event) {
          this.journal.idimControl = event;
          this.tempIDIMControls = JSON.parse(event);
        }
      });
  }

  openAutoNumberPopup() {
    this.callfc
      .openForm(
        PopupAddAutoNumberComponent,
        '',
        550,
        (screen.width * 40) / 100,
        '',
        {
          autoNoCode: this.journal.recID,
          description: this.dialogRef.formModel?.entityName,
        }
      )
      .closed.subscribe((res) => {
        console.log(res);

        if (res.event) {
          this.form.formGroup.patchValue({
            voucherNoFormat: this.getAutoNumberFormat(res.event),
          });
        }
      });
  }
  //#endregion

  //#region Method
  //#endregion

  //#region Function
  getAutoNumberFormat(autoNumber): string {
    let autoNumberFormat: string = '';

    let dateFormat = '';
    if (autoNumber?.dateFormat != '0') {
      dateFormat =
        this.vllDateFormat.filter((p) => p.value == autoNumber?.dateFormat)[0]
          ?.text ?? '';
    }

    let lengthNumber;
    let strNumber = '';

    switch (autoNumber?.stringFormat) {
      // {value: '0', text: 'Chuỗi & Ngày - Số', default: 'Chuỗi & Ngày - Số', color: null, textColor: null, …}
      case '0': {
        autoNumberFormat =
          autoNumber?.fixedString + dateFormat + autoNumber?.separator;
        lengthNumber = autoNumber?.maxLength - autoNumberFormat.length;
        if (lengthNumber > 0) {
          strNumber = '#'.repeat(lengthNumber);
        }
        autoNumberFormat =
          autoNumber?.fixedString +
          dateFormat +
          autoNumber?.separator +
          strNumber;
        break;
      }
      // {value: '1', text: 'Chuỗi & Số - Ngày', default: 'Chuỗi & Số - Ngày', color: null, textColor: null, …}
      case '1': {
        autoNumberFormat =
          autoNumber?.fixedString + autoNumber?.separator + dateFormat;
        lengthNumber = autoNumber?.maxLength - autoNumberFormat.length;
        if (lengthNumber > 0) {
          strNumber = '#'.repeat(lengthNumber);
        }
        autoNumberFormat =
          autoNumber?.fixedString +
          strNumber +
          autoNumber?.separator +
          dateFormat;
        break;
      }
      // {value: '2', text: 'Số - Chuỗi & Ngày', default: 'Số - Chuỗi & Ngày', color: null, textColor: null, …}
      case '2': {
        autoNumberFormat =
          autoNumber?.fixedString + autoNumber?.separator + dateFormat;
        lengthNumber = autoNumber?.maxLength - autoNumberFormat.length;
        if (lengthNumber > 0) {
          strNumber = '#'.repeat(lengthNumber);
        }
        autoNumberFormat =
          strNumber +
          autoNumber?.separator +
          autoNumber?.fixedString +
          dateFormat;
        break;
      }
      // {value: '3', text: 'Số - Ngày & Chuỗi', default: 'Số - Ngày & Chuỗi', color: null, textColor: null, …}
      case '3': {
        autoNumberFormat =
          autoNumber?.fixedString + autoNumber?.separator + dateFormat;
        lengthNumber = autoNumber?.maxLength - autoNumberFormat.length;
        if (lengthNumber > 0) {
          strNumber = '#'.repeat(lengthNumber);
        }
        autoNumberFormat =
          strNumber +
          autoNumber?.separator +
          dateFormat +
          autoNumber?.fixedString;
        break;
      }
      // {value: '4', text: 'Ngày - Số & Chuỗi', default: 'Ngày - Số & Chuỗi', color: null, textColor: null, …}
      case '4': {
        autoNumberFormat =
          autoNumber?.fixedString + autoNumber?.separator + dateFormat;
        lengthNumber = autoNumber?.maxLength - autoNumberFormat.length;
        if (lengthNumber > 0) {
          strNumber = '#'.repeat(lengthNumber);
        }
        autoNumberFormat =
          dateFormat +
          autoNumber?.separator +
          strNumber +
          autoNumber?.fixedString;
        break;
      }
      // {value: '5', text: 'Ngày & Chuỗi & Số', default: 'Ngày & Chuỗi & Số', color: null, textColor: null, …}
      case '5': {
        autoNumberFormat = autoNumber?.fixedString + dateFormat;
        lengthNumber = autoNumber?.maxLength - autoNumberFormat.length;
        if (lengthNumber > 0) {
          strNumber = '#'.repeat(lengthNumber);
        }
        autoNumberFormat = dateFormat + autoNumber?.fixedString + strNumber;
        break;
      }
      // {value: '6', text: 'Chuỗi - Ngày', default: 'Chuỗi - Ngày', color: null, textColor: null, …}
      case '6': {
        autoNumberFormat =
          autoNumber?.fixedString + autoNumber?.separator + dateFormat;
        break;
      }
      // {value: '7', text: 'Ngày - Chuỗi', default: 'Ngày - Chuỗi', color: null, textColor: null, …}
      case '7': {
        autoNumberFormat =
          dateFormat + autoNumber?.separator + autoNumber?.fixedString;
        break;
      }
    }

    return autoNumberFormat.substring(0, autoNumber?.maxLength);
  }
  //#endregion
}
