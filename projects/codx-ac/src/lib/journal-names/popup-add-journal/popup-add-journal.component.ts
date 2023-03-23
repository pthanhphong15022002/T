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
  UIComponent,
} from 'codx-core';
import { filter, map, Observable } from 'rxjs';
import { IJournal } from '../interfaces/IJournal.interface';
import { PopupSetupInvoiceComponent } from '../popup-setup-invoice/popup-setup-invoice.component';

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

  journal: IJournal = {} as IJournal;
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
  tempInvoice: {
    invoiceType: string;
    invoiceForm: string;
    invoiceSeriNo: string;
  };

  constructor(
    private injector: Injector,
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
    console.log(this.journal);

    if (
      this.journal.journalType == '0102' ||
      this.journal.journalType == '0302' ||
      this.journal.journalType == '0304'
    ) {
      this.journal.invoiceType = this.tempInvoice.invoiceType;
      this.journal.invoiceForm = this.tempInvoice.invoiceType;
      this.journal.invoiceSeriNo = this.tempInvoice.invoiceType;
    }
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

        this.tempInvoice = event;
      });
  }

  hidePopupCombobox(e): void {
    console.log(e);
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
  //#endregion
}
