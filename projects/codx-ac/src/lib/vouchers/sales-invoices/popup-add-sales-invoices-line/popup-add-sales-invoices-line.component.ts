import {
  AfterViewInit,
  Component,
  Injector,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  CodxFormComponent,
  DialogData,
  DialogRef,
  RequestOption,
  UIComponent,
} from 'codx-core';
import { ISalesInvoicesLine } from '../interfaces/ISalesInvoicesLine.interface';
import { combineLatestWith, map, tap } from 'rxjs/operators';
import { CodxAcService } from '../../../codx-ac.service';

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

  salesInvoicesLine: ISalesInvoicesLine = {} as ISalesInvoicesLine;
  salesInvoicesLines: ISalesInvoicesLine[] = [];
  index: number;
  isEdit: boolean = false;
  gvs: any;
  formTitle: string;

  constructor(
    private injector: Injector,
    private acService: CodxAcService,
    @Optional() public dialogRef: DialogRef,
    @Optional() public dialogData: DialogData
  ) {
    super(injector);

    this.isEdit = dialogData.data.formType === 'edit';
    this.salesInvoicesLine = dialogData.data.salesInvoicesLine;
    this.index = dialogData.data.index;
    this.gvs = dialogData.data.gvs;
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
        const action = this.isEdit
          ? actions.find((a) => a.functionID === 'SYS03')?.customName
          : actions.find((a) => a.functionID === 'SYS01')?.defaultName;

        this.formTitle = `${action} ${title}`;
      });
  }

  ngAfterViewInit(): void {}
  //#endregion

  //#region Event
  handleClickSave(closeAfterSaving: boolean) {
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

    this.salesInvoicesLines.push({ ...this.salesInvoicesLine }); // wtf ???
    this.index++;

    if (closeAfterSaving) {
      this.dialogRef.close();
    } else {
      delete this.salesInvoicesLine.recID;

      this.api
        .exec('SM', 'SalesInvoicesLinesBusiness', 'GetDefault')
        .subscribe((res: ISalesInvoicesLine) => {
          res.rowNo = this.index + 1;

          this.form.formGroup.patchValue(res);
        });
    }
  }
  //#endregion

  //#region Method
  //#endregion

  //#region Function
  //#endregion
}
