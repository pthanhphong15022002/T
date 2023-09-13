import {
  AfterViewInit,
  Component,
  Injector,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  CRUDService,
  CodxComboboxComponent,
  CodxFormComponent,
  CodxInputComponent,
  DialogData,
  DialogRef,
  UIComponent,
} from 'codx-core';
import { combineLatestWith, map, tap } from 'rxjs/operators';
import { CodxAcService } from '../../../codx-ac.service';
import { IJournal } from '../../../journals/interfaces/IJournal.interface';
import { JournalService } from '../../../journals/journals.service';
import { NameByIdPipe } from '../../../pipes/name-by-id.pipe';
import { ISalesInvoicesLine } from '../interfaces/ISalesInvoicesLine.interface';
import { SalesInvoiceService } from '../salesinvoices.service';
import { toCamelCase } from '../../../utils';

@Component({
  selector: 'lib-salesinvoiceslines-add',
  templateUrl: './salesinvoiceslines-add.component.html',
  styleUrls: ['./salesinvoiceslines-add.component.css'],
})
export class SalesinvoiceslinesAddComponent
  extends UIComponent
  implements AfterViewInit
{
  //#region Constructor
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('diM1') diM1: CodxInputComponent;
  @ViewChild('diM2') diM2: CodxInputComponent;
  @ViewChild('diM3') diM3: CodxInputComponent;
  @ViewChild('idiM0') idiM0: CodxInputComponent;
  @ViewChild('idiM1') idiM1: CodxInputComponent;
  @ViewChild('idiM2') idiM2: CodxInputComponent;
  @ViewChild('idiM3') idiM3: CodxInputComponent;
  @ViewChild('idiM5') idiM5: CodxInputComponent;
  @ViewChild('idiM6') idiM6: CodxInputComponent;
  @ViewChild('idiM7') idiM7: CodxInputComponent;

  line: ISalesInvoicesLine = {} as ISalesInvoicesLine;
  lines: ISalesInvoicesLine[] = [];
  index: number;
  isEdit: boolean = false;
  gvs: any;
  formTitle: string;
  action: string;
  hiddenFields: string[] = [];
  dataService: CRUDService;
  transID: string;
  nameByIdPipe = new NameByIdPipe();
  journalNo: string;
  journal: IJournal;

  constructor(
    injector: Injector,
    private acService: CodxAcService,
    private salesInvoiceService: SalesInvoiceService,
    private journalService: JournalService,
    @Optional() public dialogRef: DialogRef,
    @Optional() public dialogData: DialogData
  ) {
    super(injector);
    this.gvs = this.salesInvoiceService.gvsSalesInvoicesLines;
    this.journal = this.salesInvoiceService.journal;

    this.dataService = dialogRef.dataService;
    this.line = this.dataService.dataSelected;
    this.transID = this.line.transID;

    this.isEdit = dialogData.data.formType === 'edit';
    this.index = dialogData.data.index;
    this.action = dialogData.data.action;

    this.router.queryParams.subscribe((params) => {
      this.journalNo = params?.journalNo;
    });
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.hiddenFields = this.journalService.getHiddenFields(this.journal);

    this.journalService.loadComboboxBy067(
      this.journal,
      'diM1Control',
      'diM1',
      this.diM1,
      'DepartmentID',
      this.form.formGroup,
      'diM1',
      this.isEdit
    );
    this.journalService.loadComboboxBy067(
      this.journal,
      'diM2Control',
      'diM2',
      this.diM2,
      'CostCenterID',
      this.form.formGroup,
      'diM2',
      this.isEdit
    );
    this.journalService.loadComboboxBy067(
      this.journal,
      'diM3Control',
      'diM3',
      this.diM3,
      'CostItemID',
      this.form.formGroup,
      'diM3',
      this.isEdit
    );

    const title$ = this.cache.valueList('AC070').pipe(
      tap((t) => console.log(t)),
      map((data) =>
        toCamelCase(
          data?.datas.find((d) => d.value === '1')?.text
        )
      ),
      tap((t) => console.log(t))
    );

    this.cache
      .moreFunction('CoDXSystem', '')
      .pipe(combineLatestWith(title$))
      .subscribe(([actions, title]) => {
        let action: string = this.action;
        if (!action) {
          action = this.isEdit
            ? actions.find((a) => a.functionID === 'SYS03')?.customName
            : actions.find((a) => a.functionID === 'SYS01')?.defaultName;
        }

        this.formTitle = `${action} ${title}`;
      });
  }

  ngAfterViewInit(): void {}
  //#endregion

  // var cacheDIM={};
  //#region Event
  onInputChange(e) {
    console.log('onInputChange', e);

    if (!e.data && !e.crrValue) {
      return;
    }

    if (e.field === 'itemID') {
      this.form.formGroup.controls.idiM0.reset();
      this.form.formGroup.controls.idiM1.reset();
      this.form.formGroup.controls.idiM2.reset();
      this.form.formGroup.controls.idiM3.reset();
      this.form.formGroup.controls.idiM6.reset();
      this.form.formGroup.controls.idiM7.reset();
      (this.idiM0.ComponentCurrent as CodxComboboxComponent).dataService.data =
        [];
      (this.idiM1.ComponentCurrent as CodxComboboxComponent).dataService.data =
        [];
      (this.idiM2.ComponentCurrent as CodxComboboxComponent).dataService.data =
        [];
      (this.idiM3.ComponentCurrent as CodxComboboxComponent).dataService.data =
        [];
      (this.idiM6.ComponentCurrent as CodxComboboxComponent).dataService.data =
        [];
      (this.idiM7.ComponentCurrent as CodxComboboxComponent).dataService.data =
        [];
    }

    if (e.field === 'idiM4') {
      this.form.formGroup.controls.idiM5.reset();
      (this.idiM5.ComponentCurrent as CodxComboboxComponent).dataService.data =
        [];
    }

    const postFields: string[] = [
      'itemID',
      'costPrice',
      'quantity',
      'netAmt',
      'vatid',
      'vatAmt',
      'lineType',
      'umid',
      'idiM1',
    ];
    if (postFields.includes(e.field)) {
      this.api
        .exec('AC', 'SalesInvoicesLinesBusiness', 'ValueChangeAsync', [
          e.field,
          this.line,
        ])
        .subscribe((line) => {
          console.log(line);

          this.line = Object.assign(this.line, line);
          this.form.formGroup.patchValue(line);
        });
    }
  }

  onClickSave(closeAfterSave: boolean) {
    console.log(this.line);

    if (
      !this.acService.validateFormData(this.form.formGroup, this.gvs, [
        'UMID',
        'IDIM4',
        'VATID',
      ])
    ) {
      return;
    }

    this.dataService.save().subscribe((res: any) => {
      if (res.save.data || res.update.data) {
        this.lines.push({ ...this.line });
        this.index++;

        if (closeAfterSave) {
          this.dialogRef.close(!this.isEdit ? this.lines : this.line);
        } else {
          this.dataService.addNew().subscribe((res: ISalesInvoicesLine) => {
            console.log(res);

            res.rowNo = this.index + 1;
            res.transID = this.transID;
            this.line.recID = res.recID; // wtf ???

            this.form.formGroup.patchValue(res);

            // after implementing addNew(), both this.dataService.dataSelected and this.dataService.addDatas
            // no longer point to the object referenced by this.salesInvoicesLine,
            // so I reassign it here
            this.dataService.dataSelected = this.line;
            this.dataService.addDatas.set(this.line.recID, this.line);
          });
        }
      }
    });
  }
  //#endregion

  //#region Method
  //#endregion

  //#region Function
  //#endregion
}
