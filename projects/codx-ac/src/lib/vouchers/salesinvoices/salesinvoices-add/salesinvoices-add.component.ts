import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Injector,
  Optional,
  ViewChild,
} from '@angular/core';
import { Validators } from '@angular/forms';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import {
  CRUDService,
  CodxFormComponent,
  CodxGridviewV2Component,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
  Util,
} from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { lastValueFrom } from 'rxjs';
import { CodxAcService } from '../../../codx-ac.service';
import {
  IJournal,
  Vll067,
  Vll075,
} from '../../../journals/interfaces/IJournal.interface';
import { JournalService } from '../../../journals/journals.service';
import { TableLineDetailComponent } from '../components/table-line-detail/table-line-detail.component';
import { ISalesInvoice } from '../interfaces/ISalesInvoice.interface';
import { ISalesInvoicesLine } from '../interfaces/ISalesInvoicesLine.interface';
import { SalesInvoiceService } from '../salesinvoices.service';

@Component({
  selector: 'lib-salesinvoices-add',
  templateUrl: './salesinvoices-add.component.html',
  styleUrls: ['./salesinvoices-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesinvoicesAddComponent
  extends UIComponent
  implements AfterViewInit
{
  //#region Constructor
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('grid') grid: CodxGridviewV2Component;
  @ViewChild('tableLineDetail') tableLineDetail: TableLineDetailComponent;

  initialMaster: ISalesInvoice;
  prevMaster: ISalesInvoice;
  master: ISalesInvoice = {} as ISalesInvoice;
  prevLine: ISalesInvoicesLine;
  masterService: CRUDService;
  gvsSalesInvoicesLines: any;
  fmSalesInvoicesLines: FormModel;

  baseCurr: string;
  journal: IJournal;
  hiddenFields: string[] = [];
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

  isEdit: boolean = false;
  isReturnInvoice: boolean;

  defaultLineData: ISalesInvoicesLine;

  constructor(
    injector: Injector,
    private journalService: JournalService,
    private salesInvoiceService: SalesInvoiceService,
    private notiService: NotificationsService,
    @Optional() public dialogRef: DialogRef,
    @Optional() public dialogData: DialogData
  ) {
    super(injector);
    this.fmSalesInvoicesLines = salesInvoiceService.fmSalesInvoicesLines;
    this.gvsSalesInvoicesLines = salesInvoiceService.gvsSalesInvoicesLines;
    this.journal = salesInvoiceService.journal;

    this.masterService = dialogRef.dataService;
    this.isEdit = dialogData.data.formType === 'edit';
    this.masterService.hasSaved = this.isEdit;
    this.master = this.dialogRef.dataService?.dataSelected;
    this.prevMaster = { ...this.master };
    this.initialMaster = { ...this.master };

    this.isReturnInvoice = dialogRef.formModel.funcID === 'ACT0701';
  }
  //#endregion

  //#region Init
  override onInit(): void {
    this.cache.companySetting().subscribe((res) => {
      this.baseCurr = res[0]?.baseCurr;
    });

    this.editSettings.mode =
      this.journal.addNewMode == '2' ? 'Dialog' : 'Normal';

    this.hiddenFields = this.journalService.getHiddenFields(this.journal);

    this.setDefaultLineData();
  }

  ngAfterViewInit(): void {
    if (this.journal.assignRule === Vll075.TuDongKhiLuu) {
      this.form.formGroup.controls['voucherNo'].removeValidators(
        Validators.required
      );
      this.form.formGroup.updateValueAndValidity();
    }
  }
  //#endregion

  //#region Event
  onGridInit(grid: CodxGridviewV2Component): void {
    if (this.journal.addNewMode === '2') {
      return;
    }

    grid.hideColumns(this.hiddenFields);

    const requiredFields: string[] = [];

    if (
      [Vll067.GiaTriCoDinh, Vll067.TrongDanhSach].includes(
        this.journal.diM1Control
      )
    ) {
      requiredFields.push('diM1');
      grid.setPredicates(
        'diM1',
        '@0.Contains(ProfitCenterID)',
        `[${this.journal.diM1}]`
      );
    }

    if (
      [Vll067.GiaTriCoDinh, Vll067.TrongDanhSach].includes(
        this.journal.diM2Control
      )
    ) {
      requiredFields.push('diM2');
      grid.setPredicates(
        'diM2',
        '@0.Contains(CostCenterID)',
        `[${this.journal.diM2}]`
      );
    }

    if (
      [Vll067.GiaTriCoDinh, Vll067.TrongDanhSach].includes(
        this.journal.diM3Control
      )
    ) {
      requiredFields.push('diM3');
      grid.setPredicates(
        'diM3',
        '@0.Contains(CostItemID)',
        `[${this.journal.diM3}]`
      );
    }

    grid.setRequiredFields(requiredFields, true);
  }

  onClickMF(e, data): void {
    switch (e.functionID) {
      case 'SYS02':
        this.grid.deleteRow(data);
        break;
      case 'SYS03':
        this.grid.gridRef.selectRow(Number(data.index));
        this.grid.gridRef.startEdit();
        break;
      case 'SYS04':
        this.grid.addRow(
          this.createNewSalesInvoiceLine(data),
          this.grid.dataSource.length
        );
        break;
    }
  }

  onInitMF(e): void {
    for (const mf of e) {
      if (['SYS003', 'SYS004', 'SYS001', 'SYS002'].includes(mf.functionID)) {
        mf.disabled = true;
      }
    }
  }

  onClickSave(closeAfterSave: boolean): void {
    if (this.form.formGroup.invalid) {
      return;
    }

    if (
      this.journal.transLimit &&
      this.master.totalAmt > this.journal.transLimit
    ) {
      this.notiService.notifyCode('AC0016');
      return;
    }

    this.journalService.checkVoucherNoBeforeSave(
      this.journal,
      this.master,
      'AC',
      'AC_SalesInvoices',
      this.form,
      this.masterService.hasSaved,
      () => this.save(closeAfterSave)
    );
  }

  onClickClose(): void {
    this.dialogRef.close();
  }

  onClickDiscard(): void {
    this.masterService
      .delete([this.master], true, null, '', 'AC0010', null, null, false)
      .subscribe((res: any) => {
        if (!res.error) {
          this.dialogRef.close();
        }
      });
  }

  onClickAddRow(): void {
    if (this.form.formGroup.invalid) {
      return;
    }

    this.journalService.checkVoucherNoBeforeSave(
      this.journal,
      this.master,
      'AC',
      'AC_SalesInvoices',
      this.form,
      this.masterService.hasSaved,
      async () => await this.addRow()
    );
  }

  @HostListener('click', ['$event.target'])
  onClick(e: HTMLElement): void {
    if (
      this.grid.gridRef.isEdit &&
      !e.closest('.edit-value') &&
      !e.closest('.e-gridcontent')
    ) {
      this.grid.endEdit();
    }

    if (!e.closest('.card-footer')) {
      const el = document.querySelector('#footer');
      el.classList.remove('expand');
      el.classList.add('collape');
    }
  }
  //#endregion

  //#region Event Master
  onSubTypeChange(e): void {
    this.master.subType = e.data[0];
  }

  onInputChange(e): void {
    console.log('onInputChange', e);

    // e.data for valueChange and e.crrValue for controlBlur
    if (!e.data && !e.crrValue) {
      return;
    }

    if (this.master[e.field] === this.prevMaster[e.field]) {
      return;
    }

    const postFields: string[] = [
      'objectID',
      'currencyID',
      'exchangeRate',
      'voucherDate',
    ];
    if (postFields.includes(e.field)) {
      this.api
        .exec('AC', 'SalesInvoicesBusiness', 'ValueChangeAsync', [
          e.field,
          this.master,
        ])
        .subscribe((res: any) => {
          console.log(res);

          Object.assign(this.master, res);
          this.prevMaster = { ...this.master };
          this.form.formGroup.patchValue(res);
        });
    } else {
      this.prevMaster = { ...this.master };
    }
  }
  //#endregion

  //#region Event SalesInvoicesLines
  onCellChange(e): void {
    console.log('onCellChange', e);

    if (!this.master) {
      return;
    }

    if (this.prevLine?.[e.field] == e.data[e.field]) {
      return;
    }

    const field: string = e.field.toLowerCase();
    const postFields: string[] = [
      'itemid',
      'quantity',
      'salesprice',
      'discpct',
      'discamt',
      'miscprice',
      'miscamt',
      'salestaxpct',
      'salestaxamt',
      'excisetaxpct',
      'excisetaxamt',
      'vatid',
      'vatbase',
      'vatamt',
      'commissionpct',
      'commissionamt',
      'costprice',
    ];
    if (postFields.includes(field)) {
      this.api
        .exec('AC', 'SalesInvoicesLinesBusiness', 'ValueChangeAsync', [
          field,
          this.master,
          e.data,
        ])
        .subscribe((line: any) => {
          this.prevLine = { ...line };
          Object.assign(e.data, line);
          this.detectorRef.markForCheck();
        });
    }
  }

  onActionEvent(e): void {
    console.log('onActionEvent', e);

    // add a new row after pressing tab on the last column
    if (e.type === 'autoAdd' && this.grid.autoAddRow) {
      this.grid.addRow(
        this.createNewSalesInvoiceLine(),
        this.grid.dataSource.length
      );
    }

    if (e.type === 'beginEdit') {
      this.prevLine = { ...e.data };
    }
  }
  //#endregion

  //#region Method
  save(closeAfterSave: boolean): void {
    this.master.status = '1';

    if (this.masterService.hasSaved) {
      this.masterService.updateDatas.set(this.master.recID, this.master);
    }

    this.masterService.save().subscribe((res: any) => {
      if (res.save.data || res.update.data) {
        if (closeAfterSave) {
          this.dialogRef.close();
        } else {
          this.resetForm();
        }
      }
    });
  }

  /** Save master before adding a new row */
  async addRow(): Promise<void> {
    const { updateColumns: a, updateColumn: b, ...rest1 } = this.master as any;
    const {
      updateColumns: c,
      updateColumn: d,
      ...rest2
    } = this.initialMaster as any;
    if (JSON.stringify(rest1) !== JSON.stringify(rest2)) {
      if (this.masterService.hasSaved) {
        this.masterService.updateDatas.set(this.master.recID, this.master);
      }

      const res: any = await lastValueFrom(
        this.masterService.save(null, null, null, null, false)
      );

      if (!res.save.data && !res.update.data) {
        return;
      }

      this.masterService.hasSaved = true;
      this.initialMaster = { ...this.master };
    }

    if (this.journal.addNewMode === '1') {
      this.grid.addRow(
        this.createNewSalesInvoiceLine(),
        this.grid.dataSource.length
      );
    } else {
      // error ??
      // const dialogModel = new DialogModel();
      // dialogModel.FormModel = this.fmSalesInvoicesLines;
      // dialogModel.DataService = this.detailService;
      // this.callfc
      //   .openForm(
      //     SalesinvoiceslinesAddComponent,
      //     'This param is not working',
      //     500,
      //     700,
      //     '',
      //     {
      //       formType: 'add',
      //       index: this.grid.dataSource.length,
      //     },
      //     '',
      //     dialogModel
      //   )
      //   .closed.subscribe(({ event }) => {
      //     if (event?.length > 0) {
      //       this.tableLineDetail.grid.refresh();
      //     }
      //   });
    }
  }

  resetForm(): void {
    this.masterService
      .addNew(() =>
        this.api.exec('AC', 'SalesInvoicesBusiness', 'GetDefaultAsync', [
          this.master.journalNo,
        ])
      )
      .subscribe((res: ISalesInvoice) => {
        this.master = this.form.formModel.currentData = res;
        this.form.formGroup.patchValue(res);

        this.initialMaster = { ...this.master };
        this.prevMaster = { ...this.master };
        this.form.formGroup.patchValue(res);
        this.masterService.hasSaved = false;
        this.grid.dataSource = [];

        this.setDefaultLineData();
      });
  }

  setDefaultLineData(): void {
    this.api
      .exec('AC', 'SalesInvoicesLinesBusiness', 'GetDefaultAsync', [
        this.master,
      ])
      .subscribe((res: any) => {
        this.defaultLineData = res.data;
      });
  }
  //#endregion

  //#region Function
  createNewSalesInvoiceLine(
    copiedData?: ISalesInvoicesLine
  ): ISalesInvoicesLine {
    return {
      ...this.defaultLineData,
      ...(copiedData || {}),
      recID: Util.uid(),
      idiM4: this.master.warehouseID,
      createdOn: new Date(),
    };
  }
  //#endregion
}
