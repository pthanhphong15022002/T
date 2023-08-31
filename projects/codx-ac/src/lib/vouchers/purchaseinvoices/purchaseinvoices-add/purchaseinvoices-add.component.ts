import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
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

  master: IPurchaseInvoice;
  prevMaster: IPurchaseInvoice;
  prevLine: IPurchaseInvoiceLine;
  prevVatInvoice: IVATInvoice;

  fmVATInvoices: FormModel;
  fmPurchaseInvoicesLines: FormModel;

  masterService: CRUDService;
  isEdit: boolean = false;
  journal: IJournal;
  hiddenFields: string[] = [];
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
    this.prevMaster = { ...this.master };
    this.isEdit = dialogData.data.formType === 'edit';
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.hiddenFields = this.journalService.getHiddenFields(this.journal);

    this.acService.getACParameters().subscribe((res) => {
      this.acParams = res;
    });

    this.setDefaultData();
  }

  ngAfterViewInit(): void {}
  //#endregion

  //#region Event
  onAfterFormInit(form: CodxFormComponent) {
    if (this.journal.assignRule === Vll075.TuDongKhiLuu) {
      form.setRequire([
        {
          field: 'voucherNo',
          require: false,
        },
      ]);
    }
  }

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

  onTabCreated(tab: TabComponent): void {
    tab.hideTab(1, this.master.subType !== '2');
  }

  onGridInit(grid: CodxGridviewV2Component): void {
    if (this.journal.addNewMode === '2') {
      return;
    }

    const requiredFields: string[] = [];
    grid.hideColumns(this.hiddenFields);

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

  onAfterValidation(o): void {
    if (
      this.journal.transLimit &&
      this.master.totalAmt > this.journal.transLimit
    ) {
      this.notiService.notifyCode('AC0016');
      o.cancle = true;
    }
  }

  onClickAddRow(): void {
    this.journalService.checkVoucherNoBeforeSave(
      this.journal,
      this.master,
      'AC',
      'AC_PurchaseInvoices',
      this.form,
      this.form.data._isEdit,
      () => {
        this.form.save(null, null, null, null, false).subscribe((res) => {
          if (res === false || res.save?.error || res.update?.error) {
            return;
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
        });
      }
    );
  }

  onClickSave(closeAfterSave: boolean): void {
    this.journalService.checkVoucherNoBeforeSave(
      this.journal,
      this.master,
      'AC',
      'AC_PurchaseInvoices',
      this.form,
      this.form.data._isEdit,
      () => {
        this.master.status = '1';
        this.form.save().subscribe((res: any) => {
          if (res === false || res.save?.error || res.update?.error) {
            return;
          }

          if (closeAfterSave) {
            this.dialog.close();
          } else {
            this.resetForm();
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

    if (e.type === 'autoAdd' && this.gridPurchaseInvoiceLines.autoAddRow) {
      this.gridPurchaseInvoiceLines.addRow(
        this.createNewPurchaseInvoiceLine(),
        this.gridPurchaseInvoiceLines.dataSource.length
      );
    }

    if (e.type === 'beginEdit') {
      this.prevLine = { ...e.data };
    }
  }
  //#endregion

  //#region Event VATInvoices
  onCellChange2(e: any) {
    console.log('onCellChange2', e);

    if (this.prevVatInvoice?.[e.field] == e.data[e.field]) {
      return;
    }

    const field: string = e.field.toLowerCase();
    const postFields: string[] = ['quantity', 'unitprice', 'vatid'];
    if (postFields.includes(field)) {
      this.api
        .exec('AC', 'VATInvoicesBusiness', 'ValueChangeAsync', [
          field,
          this.master,
          e.data,
        ])
        .subscribe((line: any) => {
          this.prevVatInvoice = { ...line };
          Object.assign(e.data, line);
          this.detectorRef.markForCheck();
        });
    }
  }

  onActionEvent2(e: any): void {
    console.log('onActionEvent2', e);

    if (e.type === 'add' && this.gridVatInvoices.autoAddRow) {
      this.gridVatInvoices.addRow(
        this.createNewVatInvoice(),
        this.gridVatInvoices.dataSource.length
      );
    }

    if (e.type === 'beginEdit') {
      this.prevVatInvoice = { ...e.data };
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

  resetForm(): void {
    this.masterService
      .addNew(() =>
        this.api.exec('AC', 'PurchaseInvoicesBusiness', 'GetDefaultAsync', [
          this.master.journalNo,
        ])
      )
      .subscribe((res: IPurchaseInvoice) => {
        this.form.data = this.master = this.form.formModel.currentData = res;
        this.form.formGroup.patchValue(res);

        this.prevMaster = { ...this.master };
        this.gridPurchaseInvoiceLines.dataSource = [];
        if (this.gridVatInvoices) {
          this.gridVatInvoices.dataSource = [];
        }

        this.setDefaultData();
      });
  }

  setDefaultData(): void {
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
      idiM4: this.master.warehouseID,
      createdOn: new Date(),
    };
  }

  createNewVatInvoice(copiedData?: IVATInvoice): IVATInvoice {
    return {
      ...this.defaultVatInvoiceData,
      ...(copiedData || {}),
      recID: Util.uid(),
      objectID: this.master.objectID,
      objectName: this.master.objectName,
      createdOn: new Date(),
    };
  }
  //#endregion
}
