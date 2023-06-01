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
import { ISalesInvoicesLine } from '../interfaces/ISalesInvoicesLine.interface';
import { SalesInvoiceService } from '../sales-invoices.service';
import { NameByIdPipe } from '../../../pipes/nameById.pipe';
import { Item } from '../../../settings/items/interfaces/Item.interface';

@Component({
  selector: 'lib-popup-add-sales-invoices-line',
  templateUrl: './popup-add-sales-invoices-line.component.html',
  styleUrls: ['./popup-add-sales-invoices-line.component.css'],
})
export class PopupAddSalesInvoicesLineComponent
  extends UIComponent
  implements AfterViewInit
{
  //#region Constructor
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('idiM0') idiM0: CodxInputComponent;
  @ViewChild('idiM1') idiM1: CodxInputComponent;
  @ViewChild('idiM2') idiM2: CodxInputComponent;
  @ViewChild('idiM3') idiM3: CodxInputComponent;
  @ViewChild('idiM5') idiM5: CodxInputComponent;
  @ViewChild('idiM6') idiM6: CodxInputComponent;
  @ViewChild('idiM7') idiM7: CodxInputComponent;

  salesInvoicesLine: ISalesInvoicesLine = {} as ISalesInvoicesLine;
  salesInvoicesLines: ISalesInvoicesLine[] = [];
  index: number;
  isEdit: boolean = false;
  gvs: any;
  formTitle: string;
  action: string;
  hiddenFields: string[] = [];
  dataService: CRUDService;
  transID: string;
  vats: any[];
  nameByIdPipe = new NameByIdPipe();

  constructor(
    injector: Injector,
    private acService: CodxAcService,
    private salesInvoiceService: SalesInvoiceService,
    @Optional() public dialogRef: DialogRef,
    @Optional() public dialogData: DialogData
  ) {
    super(injector);
    this.gvs = this.salesInvoiceService.gvsSalesInvoicesLines;
    this.vats = this.salesInvoiceService.vats;

    this.dataService = dialogRef.dataService;
    this.salesInvoicesLine = this.dataService.dataSelected;
    this.transID = this.salesInvoicesLine.transID;

    this.isEdit = dialogData.data.formType === 'edit';
    this.index = dialogData.data.index;
    this.action = dialogData.data.action;
    this.hiddenFields = dialogData.data.hiddenFields;
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.dialogRef.beforeClose.subscribe(
      (res) =>
        (res.event = !this.isEdit
          ? this.salesInvoicesLines
          : this.salesInvoicesLine)
    );

    const title$ = this.cache.valueList('AC070').pipe(
      tap((t) => console.log(t)),
      map((data) =>
        this.acService.toCamelCase(
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

  //#region Event
  onInputChange(e) {
    console.log(e);

    if (e.field === 'itemID') {
      this.form.formGroup.controls.idiM0.reset();
      this.form.formGroup.controls.idiM1.reset();
      this.form.formGroup.controls.idiM2.reset();
      this.form.formGroup.controls.idiM3.reset();
      this.form.formGroup.controls.idiM6.reset();
      this.form.formGroup.controls.idiM7.reset();
      (
        this.idiM0.ComponentCurrent as CodxComboboxComponent
      ).dataService.setPredicates(['ItemID=@0'], [e.data]);
      (
        this.idiM1.ComponentCurrent as CodxComboboxComponent
      ).dataService.setPredicates(['ItemID=@0'], [e.data]);
      (
        this.idiM2.ComponentCurrent as CodxComboboxComponent
      ).dataService.setPredicates(['ItemID=@0'], [e.data]);
      (
        this.idiM3.ComponentCurrent as CodxComboboxComponent
      ).dataService.setPredicates(['ItemID=@0'], [e.data]);
      (
        this.idiM6.ComponentCurrent as CodxComboboxComponent
      ).dataService.setPredicates(['ItemID=@0'], [e.data]);
      (
        this.idiM7.ComponentCurrent as CodxComboboxComponent
      ).dataService.setPredicates(['ItemID=@0'], [e.data]);

      this.form.formGroup.controls.umid.reset();
      const item: Item = this.salesInvoiceService.items.find(
        (i) => i.itemID === this.salesInvoicesLine.itemID
      );
      this.form.formGroup.patchValue({
        umid: item.umid,
      });
    }

    if (e.field === 'idiM4') {
      this.form.formGroup.controls.idiM5.reset();
      (
        this.idiM5.ComponentCurrent as CodxComboboxComponent
      ).dataService.setPredicates(['WarehouseID=@0'], [e.data]);
    }

    if (['costPrice', 'quantity'].includes(e.field)) {
      this.form.formGroup.patchValue({
        netAmt:
          this.salesInvoicesLine.costPrice * this.salesInvoicesLine.quantity,
      });
    }

    if (e.field === 'vatid') {
      const taxRate: number = this.nameByIdPipe.transform(
        this.vats,
        'VATID',
        'TaxRate',
        this.salesInvoicesLine.vatid
      );
      this.form.formGroup.patchValue({
        vatAmt: taxRate * this.salesInvoicesLine.netAmt,
      });
    }
  }

  onClickSave(closeAfterSave: boolean) {
    console.log(this.salesInvoicesLine);

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
        this.salesInvoicesLines.push({ ...this.salesInvoicesLine });
        this.index++;

        if (closeAfterSave) {
          this.dialogRef.close();
        } else {
          this.dataService.addNew().subscribe((res: ISalesInvoicesLine) => {
            console.log(res);

            res.rowNo = this.index + 1;
            res.transID = this.transID;
            this.salesInvoicesLine.recID = res.recID; // wtf ???

            this.form.formGroup.patchValue(res);

            // after implementing addNew(), both this.dataService.dataSelected and this.dataService.addDatas
            // no longer point to the object referenced by this.salesInvoicesLine,
            // so I reassign it here
            this.dataService.dataSelected = this.salesInvoicesLine;
            this.dataService.addDatas.set(
              this.salesInvoicesLine.recID,
              this.salesInvoicesLine
            );
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
