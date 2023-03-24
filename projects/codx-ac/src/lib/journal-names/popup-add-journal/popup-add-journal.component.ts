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
import { filter, map, Observable } from 'rxjs';
import { CodxAcService } from '../../codx-ac.service';
import { IJournal } from '../interfaces/IJournal.interface';
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

  constructor(
    private injector: Injector,
    private acService: CodxAcService,
    @Optional() public dialogRef: DialogRef,
    @Optional() private dialogData: DialogData
  ) {
    super(injector);
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

    this.loadComboboxData('FiscalPeriods').subscribe((periods) => {
      console.log(periods);
      this.fiscalYears = [...new Set(periods.map((p) => p.FiscalYear))];
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

    (this.periodID.ComponentCurrent.dataService as CRUDService).setPredicates(
      ['FiscalYear=@0'],
      [e.itemData.value]
    );
  }

  handleClickSave(): void {
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
    } else {
      temp.postControl = this.journal.postControl ? 2 : 0;
    }

    console.log(temp);

    this.dialogRef.dataService
      .save((req: RequestOption) => {
        req.methodName = 'AddJournalAsync';
        req.className = 'JournalsBusiness';
        req.assemblyName = 'ERM.Business.AC';
        req.service = 'AC';
        req.data = temp;

        return true;
      })
      .subscribe((res) => {
        if (res.save || res.update) {
          this.dialogRef.close();
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
        {},
        '',
        options
      )
      .closed.subscribe(({ event }) => {
        console.log(event);

        this.journal.invoiceType = event.invoiceType;
        this.journal.invoiceForm = event.invoiceType;
        this.journal.invoiceSeriNo = event.invoiceType;
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
  //#endregion

  //#region Method
  loadComboboxData(name: string): Observable<any> {
    const dataRequest = new DataRequest();
    dataRequest.comboboxName = name;
    dataRequest.pageLoading = false;
    return this.api
      .execSv('AC', 'ERM.Business.Core', 'DataBusiness', 'LoadDataCbxAsync', [
        dataRequest,
      ])
      .pipe(
        filter((p) => !!p),
        map((p) => JSON.parse(p[0]))
      );
  }
  //#endregion

  //#region Function
  getDescription(pascalCase: string): string {
    return this.gvs[pascalCase].description;
  }

  toPascalCase(camelCase: string): string {
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
  }
  //#endregion
}
