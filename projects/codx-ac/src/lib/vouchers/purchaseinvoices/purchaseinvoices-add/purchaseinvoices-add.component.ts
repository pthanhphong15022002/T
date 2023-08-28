import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { Validators } from '@angular/forms';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
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
import { IPurchaseInvoice } from '../interfaces/IPurchaseInvoice.inteface';
import { IPurchaseInvoiceLine } from '../interfaces/IPurchaseInvoiceLine.interface';
import { IVATInvoice } from '../interfaces/IVATInvoice.interface';
import { PurchaseInvoiceService } from '../purchaseinvoices.service';

@Component({
  selector: 'lib-purchaseinvoices-add',
  templateUrl: './purchaseinvoices-add.component.html',
  styleUrls: ['./purchaseinvoices-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseinvoicesAddComponent
  extends UIComponent
  implements OnInit
{
  //#region Constructor
  @ViewChild('gridPurchaseInvoiceLines')
  public gridPurchaseInvoiceLines: CodxGridviewV2Component;
  @ViewChild('gridVatInvoices') public gridVatInvoices: CodxGridviewV2Component;
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('tab') tab: TabComponent;

  initialMaster: IPurchaseInvoice;
  master: IPurchaseInvoice;
  prevMaster: IPurchaseInvoice;
  prevLine: IPurchaseInvoiceLine;

  masterService: CRUDService;

  fmVATInvoices: FormModel;
  fmPurchaseInvoicesLines: FormModel;

  isEdit: boolean = false;
  journal: IJournal;
  hiddenFields: string[] = [];
  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Normal',
  };
  tabInfo: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Link', textDefault: 'Liên kết', isActive: false },
  ];
  acParams: any;

  defaultLineData: IPurchaseInvoiceLine;
  defaultVatInvoiceData: IVATInvoice;

  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private notiService: NotificationsService,
    private journalService: JournalService,
    purchaseInvoiceService: PurchaseInvoiceService,
    @Optional() public dialog?: DialogRef,
    @Optional() public dialogData?: DialogData
  ) {
    super(inject);

    this.fmPurchaseInvoicesLines =
      purchaseInvoiceService.fmPurchaseInvoicesLines;
    this.fmVATInvoices = purchaseInvoiceService.fmVATInvoices;
    this.journal = purchaseInvoiceService.journal;

    this.masterService = dialog.dataService;
    this.master = this.masterService?.dataSelected;
    this.initialMaster = { ...this.master };
    this.prevMaster = { ...this.master };
    this.isEdit = dialogData.data.formType === 'edit';
    this.masterService.hasSaved = this.isEdit;
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.hiddenFields = this.journalService.getHiddenFields(this.journal);

    this.acService.getACParameters().subscribe((res) => {
      this.acParams = res;
    });

    this.api
      .exec(
        'AC',
        'PurchaseInvoicesLinesBusiness',
        'GetDefault2Async',
        this.master
      )
      .subscribe((res: any) => {
        this.defaultLineData = res.purchaseInvoiceLine.data;
        this.defaultVatInvoiceData = res.vatInvoice.data;
      });
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
  onClickMF(e, data) {
    const grid: CodxGridviewV2Component =
      this.tab.selectedItem === 0
        ? this.gridPurchaseInvoiceLines
        : this.gridVatInvoices;

    switch (e.functionID) {
      case 'SYS02':
        grid.deleteRow(data);
        break;
      case 'SYS03':
        grid.gridRef.selectRow(Number(data.index));
        grid.gridRef.startEdit();
        break;
      case 'SYS04': {
        const copiedData =
          this.tab.selectedItem === 0
            ? this.createNewPurchaseInvoiceLine(data)
            : this.createNewVatInvoice(data);
        grid.addRow(copiedData, grid.dataSource.length);
        break;
      }
    }
  }

  /** Hide some mfs */
  onInitMF(e): void {
    for (const mf of e) {
      if (['SYS003', 'SYS004', 'SYS001', 'SYS002'].includes(mf.functionID)) {
        mf.disabled = true;
      }
    }
  }

  onTabCreated(e, tab: TabComponent): void {
    tab.hideTab(1, this.master.subType !== '2');
  }

  /**
   * @param columns grid.columnsGrid
   */
  onGridInit(grid: CodxGridviewV2Component): void {
    if (this.journal.addNewMode === '2') {
      return;
    }

    console.log(this.hiddenFields);
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

  onClickAddRow(): void {
    if (this.form.formGroup.invalid) {
      return;
    }

    this.journalService.checkVoucherNoBeforeSave(
      this.journal,
      this.master,
      'AC',
      'AC_PurchaseInvoices',
      this.form,
      this.masterService.hasSaved,
      async () => await this.addRow()
    );
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
      'AC_PurchaseInvoices',
      this.form,
      this.masterService.hasSaved,
      () => {
        this.master.status = '1';

        if (this.masterService.hasSaved) {
          this.masterService.updateDatas.set(this.master.recID, this.master);
        }

        this.masterService.save().subscribe((res: any) => {
          if (res.save.data || res.update.data) {
            if (closeAfterSave) {
              this.dialog.close();
            } else {
              this.resetForm();
            }
          }
        });
      }
    );
  }

  onClickClose(): void {
    this.dialog.close();
  }

  onClickDiscard(): void {
    this.masterService
      .delete([this.master], true, null, '', 'AC0010', null, null, false)
      .subscribe((res: any) => {
        if (!res.error) {
          this.dialog.close();
        }
      });
  }

  @HostListener('click', ['$event.target'])
  onClick(e: HTMLElement): void {
    if (
      this.gridPurchaseInvoiceLines?.gridRef?.isEdit &&
      !e.closest('.edit-value') &&
      !e.closest('.e-gridcontent')
    ) {
      this.gridPurchaseInvoiceLines.endEdit();
    }

    if (!e.closest('.card-footer')) {
      const el = document.querySelector('#footer');
      el.classList.remove('expand');
      el.classList.add('collape');
    }
  }
  //#endregion

  //#region Event Master
  onInputChange(e: any): void {
    console.log('onInputChange', e);

    // e.data for valueChange and e.crrValue for controlBlur
    if (!e.data && !e.crrValue) {
      return;
    }

    if (this.master[e.field] === this.prevMaster[e.field]) {
      return;
    }

    const field: string = e.field.toLowerCase();
    if (
      field === 'exchangerate' &&
      this.acParams.BaseCurr === this.acParams.TaxCurr
    ) {
      this.notiService.alertCode('AC0022').subscribe(({ event }) => {
        this.master.unbounds = {
          requiresTaxUpdate: event.status === 'Y',
        };
        this.changeMaster(field);
      });

      return;
    }

    const postFields: string[] = [
      'objectid',
      'currencyid',
      'voucherdate',
      'taxexchrate',
    ];
    if (postFields.includes(field)) {
      this.changeMaster(field);
    } else {
      this.prevMaster = { ...this.master };
    }
  }

  onSubTypeChange(e: any): void {
    this.master.subType = e.data[0];
    this.tab.hideTab(1, this.master.subType !== '2');
  }
  //#endregion

  //#region Event PurchaseInvoicesLines
  onCellChange(e: any) {
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
      'purcprice',
      'vatid',
      'netamt',
      'discpct',
      'discamt',
      'vatbase',
      'vatamt',
      'miscprice',
      'miscamt',
      'salestaxpct',
      'salestaxamt',
      'excisetaxpct',
      'excisetaxamt',
    ];
    if (postFields.includes(field)) {
      this.api
        .exec('AC', 'PurchaseInvoicesLinesBusiness', 'ValueChangeAsync', [
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

  onActionEvent(e: any): void {
    console.log('onActionEvent', e);

    if (e.type === 'add' && this.gridPurchaseInvoiceLines.autoAddRow) {
      this.gridPurchaseInvoiceLines.addRow(
        this.createNewPurchaseInvoiceLine(),
        this.gridPurchaseInvoiceLines.dataSource.length
      );
    }

    if (e.type === 'beginEdit') {
      this.prevLine = { ...e.data };

      this.api
        .exec('AC', 'PurchaseInvoicesLinesBusiness', 'BeginEditAsync', e.data)
        .subscribe();
    }
  }
  //#endregion

  //#region Event VATInvoices
  onActionEvent2(e: any): void {
    console.log('onActionEvent2', e);

    if (e.type === 'add' && this.gridVatInvoices.autoAddRow) {
      this.gridVatInvoices.addRow(
        this.createNewVatInvoice(),
        this.gridVatInvoices.dataSource.length
      );
    }
  }
  //#endregion

  //#region Method
  changeMaster(field: string): void {
    this.api
      .exec('AC', 'PurchaseInvoicesBusiness', 'ValueChangedAsync', [
        field,
        this.master,
      ])
      .subscribe((res: any) => {
        console.log(res);

        Object.assign(this.master, res);
        this.prevMaster = { ...this.master };
        this.form.formGroup.patchValue(res);
      });
  }

  async addRow(): Promise<void> {
    // check if master data is changed
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

    if (this.tab.selectedItem === 0) {
      if (this.journal.addNewMode === '1') {
        this.gridPurchaseInvoiceLines.addRow(
          this.createNewPurchaseInvoiceLine(),
          this.gridPurchaseInvoiceLines.dataSource.length
        );
      } else {
        // later
      }
    } else {
      if (this.journal.addNewMode === '1') {
        this.gridVatInvoices.addRow(
          this.createNewVatInvoice(),
          this.gridVatInvoices.dataSource.length
        );
      } else {
        // later
      }
    }
  }

  resetForm(): void {
    this.masterService
      .addNew(() =>
        this.api.exec('AC', 'PurchaseInvoicesBusiness', 'SetDefaultAsync', [
          this.master.journalNo,
        ])
      )
      .subscribe((res: IPurchaseInvoice) => {
        Object.assign(this.master, res);
        this.initialMaster = { ...this.master };
        this.prevMaster = { ...this.master };
        this.form.formGroup.patchValue(res);

        this.masterService.hasSaved = false;

        this.masterService.dataSelected = this.master;
        this.masterService.addDatas.set(this.master.recID, this.master);
      });
  }
  //#endregion

  //#region Function
  createNewPurchaseInvoiceLine(
    copiedData?: IPurchaseInvoiceLine
  ): IPurchaseInvoiceLine {
    return {
      ...this.defaultLineData,
      ...(copiedData || {}),
      recID: Util.uid(),
      note: this.master.memo,
      createdOn: new Date(),
    };
  }

  createNewVatInvoice(copiedData?: IVATInvoice): IVATInvoice {
    return {
      ...this.defaultVatInvoiceData,
      ...(copiedData || {}),
      recID: Util.uid(),
      createdOn: new Date(),
    };
  }
  //#endregion
}
