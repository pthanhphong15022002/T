import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import {
  CRUDService,
  CodxFormComponent,
  CodxGridviewV2Component,
  CodxInplaceComponent,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
  Util,
} from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { CodxAcService } from '../../../codx-ac.service';
import { IJournal } from '../../../journals/interfaces/IJournal.interface';
import { JournalService } from '../../../journals/journals.service';
import { PurchaseInvoicesLines } from '../../../models/PurchaseInvoicesLines.model';
import { VATInvoices } from '../../../models/VATInvoices.model';
import { IPurchaseInvoice } from '../interfaces/IPurchaseInvoice.inteface';
import { IPurchaseInvoiceLine } from '../interfaces/IPurchaseInvoiceLine.interface';
import { PopAddLineComponent } from '../pop-add-line/pop-add-line.component';

@Component({
  selector: 'lib-pop-add-purchase',
  templateUrl: './pop-add-purchase.component.html',
  styleUrls: ['./pop-add-purchase.component.scss'],
  // encapsulation: ViewEncapsulation.None,
})
export class PopAddPurchaseComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('gridPurchaseInvoiceLines')
  public gridPurchaseInvoiceLines: CodxGridviewV2Component;
  @ViewChild('gridVatInvoices') public gridVatInvoices: CodxGridviewV2Component;
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;

  master: IPurchaseInvoice;
  lines: IPurchaseInvoiceLine[] = [];
  vatInvoices: VATInvoices[] = [];
  masterService: CRUDService;
  purchaseInvoiceLineService: CRUDService;
  vatInvoiceService: CRUDService;
  grvPurchaseInvoices: any;
  grvPurchaseInvoicesLines: any;

  isEdit: boolean = false;
  journal: IJournal;
  ignoredFields: string[] = [];
  hiddenFields: string[] = [];
  formTitle: string;
  formType: any;
  validate: any = 0;
  vatType: string;
  countDetail = 0;
  hasSaved: any = false;
  isSaveMaster: any = false;
  expanded: boolean = false;
  purchaseInvoicesLinesDelete: Array<PurchaseInvoicesLines> = [];
  vatinvoices: VATInvoices = new VATInvoices();

  fmVATInvoices: FormModel = {
    entityName: 'AC_VATInvoices',
    formName: 'VATInvoices',
    gridViewName: 'grvVATInvoices',
    entityPer: 'AC_VATInvoices',
  };
  fmPurchaseInvoicesLines: FormModel = {
    entityName: 'AC_PurchaseInvoicesLines',
    formName: 'PurchaseInvoicesLines',
    gridViewName: 'grvPurchaseInvoicesLines',
    entityPer: 'AC_PurchaseInvoicesLines',
  };
  fgVATInvoices: FormGroup;
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
  keymodel: any = [];
  lsVatCode: any;
  journals: any;
  totalnet: any = 0;
  totalvat: any = 0;
  total: any = 0;
  lockFields: string[];
  voucherNoPlaceholderText$: Observable<string>;
  journalStateSubject = new BehaviorSubject<boolean>(false);

  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private notification: NotificationsService,
    private journalService: JournalService,
    @Optional() public dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);

    this.formTitle = dialogData.data?.formTitle;
    this.formType = dialogData.data?.formType;

    this.masterService = dialog.dataService;
    this.master = dialog.dataService?.dataSelected;
    this.isEdit = dialogData.data.formType === 'edit';
    this.masterService.hasSaved = this.isEdit;

    this.purchaseInvoiceLineService = acService.createCrudService(
      inject,
      this.fmPurchaseInvoicesLines,
      'AC'
    );
    this.vatInvoiceService = acService.createCrudService(
      inject,
      this.fmVATInvoices,
      'AC'
    );
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.voucherNoPlaceholderText$ =
      this.journalService.getVoucherNoPlaceholderText();

    this.cache
      .gridViewSetup('PurchaseInvoices', 'grvPurchaseInvoices')
      .subscribe((res) => {
        if (res) {
          this.grvPurchaseInvoices = res;
        }
      });

    if (this.formType == 'edit') {
      this.api
        .exec('AC', 'PurchaseInvoicesLinesBusiness', 'GetAsync', [
          this.master.recID,
        ])
        .subscribe((res: any) => {
          if (res.length > 0) {
            this.keymodel = Object.keys(res[0]);
            this.lines = res;
            this.lines.forEach((element) => {
              if (element.vatid != null) {
                this.countDetail++;
              }
              this.loadTotal();
            });
          }
        });
    }

    if (this.master.status == '0' && this.formType == 'edit') {
      this.hasSaved = true;
    }

    this.api
      .exec('BS', 'VATCodesBusiness', 'LoadAllDataAsync')
      .subscribe((res: any) => {
        if (res != null) {
          this.lsVatCode = res;
        }
      });

    if (
      this.master &&
      this.master.unbounds &&
      this.master.unbounds.lockFields &&
      this.master.unbounds.lockFields.length
    ) {
      this.lockFields = this.master.unbounds.lockFields as Array<string>;
    } else {
      this.api
        .exec('AC', 'PurchaseInvoicesBusiness', 'SetUnboundsAsync', [
          this.master,
        ])
        .subscribe((res: any) => {
          if (
            res.unbounds &&
            res.unbounds.lockFields &&
            res.unbounds.lockFields.length
          ) {
            this.master.unbounds = res.unbounds;
            this.lockFields = this.master.unbounds.lockFields as Array<string>;
          }
        });
    }

    this.journalService.getJournal(this.master.journalNo).subscribe((res) => {
      this.journal = res;
      this.vatType = this.journal.subType;

      if (this.journal.assignRule === '2') {
        this.ignoredFields.push('VoucherNo');
      }

      this.hiddenFields = this.journalService.getHiddenFields(this.journal);

      this.journalStateSubject.next(true);
    });
  }

  ngAfterViewInit() {
    this.loadTotal();
    setTimeout(() => {
      this.focusInput();
    }, 500);
  }
  //#endregion

  //#region Event
  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.deleteRow(data);
        break;
      case 'SYS03':
        this.editRow(data);
        break;
      case 'SYS04':
        this.copyRow(data);
        break;
    }
  }

  onInputChange(e: any): void {
    console.log('onInputChange', e);

    // e.data for valueChange and e.crrValue for controlBlur
    if (!e.data && !e.crrValue) {
      return;
    }

    const postFields: string[] = [
      'objectID',
      'currencyID',
      'exchangeRate',
      'taxExchRate',
      'voucherDate',
    ];
    if (postFields.includes(e.field)) {
      this.api
        .exec('AC', 'PurchaseInvoicesBusiness', 'ValueChangedAsync', [
          e.field,
          this.master,
        ])
        .subscribe((res: any) => {
          console.log(res);

          this.master = Object.assign(this.master, res);
          this.form.formGroup.patchValue(res);
        });
    }
  }

  valueChangeVAT(e: any) {
    this.vatinvoices[e.field] = e.data;
  }

  onGridCreated(e, grid: CodxGridviewV2Component): void {
    this.journalStateSubject.subscribe((loaded) => {
      if (!loaded) {
        return;
      }

      if (this.journal.addNewMode === '2') {
        return;
      }

      // ❌ cache problem
      let toggleFields: string[] = [
        ...Array.from({ length: 3 }, (_, i) => 'DIM' + (i + 1)),
        ...Array.from({ length: 10 }, (_, i) => 'IDIM' + i),
      ];
      for (const c of grid.columnsGrid) {
        if (toggleFields.includes(c.fieldName)) {
          c.isVisible = true;
          grid.visibleColumns.push(c);
        }
      }
      grid.hideColumns(this.hiddenFields);

      for (const v of grid.visibleColumns) {
        if (v.fieldName === 'DIM1') {
          if (['1', '2'].includes(this.journal.diM1Control)) {
            v.predicate = '@0.Contains(DepartmentID)';
            v.dataValue = `[${this.journal.diM1}]`;
          }
        }

        if (v.fieldName === 'DIM2') {
          if (['1', '2'].includes(this.journal.diM2Control)) {
            v.predicate = '@0.Contains(CostCenterID)';
            v.dataValue = `[${this.journal.diM2}]`;
          }
        }

        if (v.fieldName === 'DIM3') {
          if (['1', '2'].includes(this.journal.diM3Control)) {
            v.predicate = '@0.Contains(CostItemID)';
            v.dataValue = `[${this.journal.diM3}]`;
          }
        }
      }
    });
  }

  onDoubleClick(data) {
    this.loadPredicate(
      this.gridPurchaseInvoiceLines.visibleColumns,
      data.rowData
    );
  }

  cellChangedPurchase(e: any) {
    if (e.field == 'vatid' && e.data.vatid != null) {
      this.loadPurchaseInfo();
    }
    if (e.data?.isAddNew == null) {
      this.api
        .exec(
          'AC',
          'PurchaseInvoicesLinesBusiness',
          'CheckExistPurchaseInvoicesLines',
          [e.data.recID]
        )
        .subscribe((res: any) => {
          if (res) {
            e.data.isAddNew = res;
          } else {
            this.api
              .exec('AC', 'VATInvoicesBusiness', 'UpdateVATfromPurchaseAsync', [
                this.master,
                e.data,
              ])
              .subscribe(() => {});
          }
        });
    }
    switch (e.field) {
      case 'quantity':
        if (e.value == null) e.data.quantity = 0;
        e.data.netAmt = this.calculateNetAmt(e.data.quantity, e.data.unitPrice);
        e.data.vatAmt = this.calculateVatAmt(e.data.netAmt, e.data.vatid);
        break;
      case 'unitPrice':
        if (e.value == null) e.data.unitPrice = 0;
        e.data.netAmt = this.calculateNetAmt(e.data.quantity, e.data.unitPrice);
        e.data.vatAmt = this.calculateVatAmt(e.data.netAmt, e.data.vatid);
        break;
      case 'netAmt':
        if (e.value == null) e.data.netAmt = 0;
        e.data.vatAmt = this.calculateVatAmt(e.data.netAmt, e.data.vatid);
        break;
      case 'vatAmt':
        if (e.value == null) e.data.vatAmt = 0;
        break;
      case 'vatid':
        e.data.vatAmt = this.calculateVatAmt(e.data.netAmt, e.data.vatid);
        break;
      case 'itemID':
        this.api
          .exec('IV', 'ItemsBusiness', 'LoadDataAsync', [e.data.itemID])
          .subscribe((res: any) => {
            if (res) {
              e.data.itemName = res.itemName;
              e.data.umid = res.umid;
            }
          });
        this.loadItemID(e.value);
        break;
      case 'idiM4':
        this.loadWarehouseID(e.value);
        break;
    }
  }

  cellChangedInvoice(e: any) {
    if (e.data?.isAddNew == null) {
      this.api
        .exec('AC', 'VATInvoicesBusiness', 'CheckExistVATInvoice', [
          e.data.recID,
        ])
        .subscribe((res: any) => {
          if (res) {
            e.data.isAddNew = res;
          }
        });
    }
  }

  close() {
    if (this.hasSaved) {
      this.dialog.close({
        update: true,
        data: this.master,
      });
    } else {
      this.dialog.close();
    }
  }

  onDiscard() {
    this.dialog.dataService
      .delete([this.master], true, null, '', 'AC0010', null, null, false)
      .subscribe((res) => {
        if (res.data != null) {
          this.dialog.close();
          this.dt.detectChanges();
        }
      });
  }

  onChangeMF(e): void {
    for (const mf of e) {
      if (['SYS003', 'SYS004', 'SYS001', 'SYS002'].includes(mf.functionID)) {
        mf.disabled = true;
      }
    }
  }

  onEndEdit(line: IPurchaseInvoiceLine): void {
    line.fixedDIMs = this.genFixedDims(line);
    this.purchaseInvoiceLineService.updateDatas.set(line.recID, line);
    this.purchaseInvoiceLineService
      .save(null, null, null, null, false)
      .subscribe((res: any) => {
        if (res.update?.error) {
          this.gridPurchaseInvoiceLines.gridRef.selectRow(
            Number(line._rowIndex)
          );
          this.gridPurchaseInvoiceLines.gridRef.startEdit();

          return;
        }
      });
  }

  onEndAddNew(line: IPurchaseInvoiceLine): void {
    line.fixedDIMs = this.genFixedDims(line);
    this.purchaseInvoiceLineService
      .save(null, null, null, null, false)
      .subscribe((res: any) => {
        if (res.save?.error) {
          this.gridPurchaseInvoiceLines.gridRef.selectRow(
            Number(line._rowIndex)
          );
          this.gridPurchaseInvoiceLines.gridRef.startEdit();

          return;
        }
      });
  }

  onActionEvent(e): void {
    console.log('onActionEvent', e);
  }

  onClickAddRow(): void {
    if (
      !this.acService.validateFormData(
        this.form.formGroup,
        this.grvPurchaseInvoices,
        [],
        this.ignoredFields
      )
    ) {
      return;
    }

    if (this.masterService.hasSaved) {
      this.masterService.updateDatas.set(this.master.recID, this.master);
    }
    this.journalService.checkVoucherNoBeforeSave(
      this.journal,
      this.master,
      'AC',
      'AC_PurchaseInvoices',
      this.form,
      this.masterService.hasSaved,
      () => this.addRow()
    );

    // switch (this.formType) {
    //   case 'add':
    //   case 'copy':
    //     if (this.hasSaved) {
    //       this.dialog.dataService.updateDatas.set(
    //         this.master['_uuid'],
    //         this.master
    //       );
    //       this.dialog.dataService
    //         .save(null, 0, '', '', false)
    //         .subscribe((res) => {
    //           if (res && res.update.data != null) {
    //             this.loadModegrid();
    //           }
    //         });
    //     } else {
    //       this.journalService.checkVoucherNoBeforeSave(
    //         this.journal,
    //         this.master,
    //         'AC',
    //         'AC_PurchaseInvoices',
    //         this.form,
    //         this.formType === 'edit',
    //         () => {
    //           this.dialog.dataService
    //             .save(null, 0, '', '', false)
    //             .subscribe((res) => {
    //               if (res && res.save.data != null) {
    //                 this.hasSaved = true;
    //                 this.loadModegrid();
    //               }
    //             });
    //         }
    //       );
    //     }
    //     break;
    //   case 'edit':
    //     this.dialog.dataService.updateDatas.set(
    //       this.master['_uuid'],
    //       this.master
    //     );
    //     this.dialog.dataService
    //       .save(null, 0, '', '', false)
    //       .subscribe((res) => {
    //         if (res && res.update.data != false) {
    //           this.loadModegrid();
    //         }
    //       });
    //     break;
    // }
  }
  //#endregion

  //#region Method
  addRow(): void {
    this.masterService
      .save(null, null, null, null, false)
      .subscribe((res: any) => {
        if (res.save.data || res.update.data) {
          this.masterService.hasSaved = true;

          this.purchaseInvoiceLineService
            .addNew(() =>
              this.api.exec<any>(
                'AC',
                'PurchaseInvoicesLinesBusiness',
                'GetDefaultAsync',
                [this.master]
              )
            )
            .subscribe((res: IPurchaseInvoiceLine) => {
              if (this.journal.addNewMode === '1') {
                this.gridPurchaseInvoiceLines.addRow(res, this.lines.length);
              } else {
                // later
              }
            });
        }
      });
  }

  saveVAT() {
    if (this.vatType == '1') {
      this.api
        .exec('AC', 'VATInvoicesBusiness', 'AddVATInvoiceAsync', [
          this.vatinvoices,
        ])
        .subscribe(() => {});
    } else {
      this.vatInvoices = this.gridVatInvoices.dataSource;
      this.api
        .exec('AC', 'VATInvoicesBusiness', 'AddLineAsync', [this.vatInvoices])
        .subscribe(() => {});
    }
  }
  updateVAT() {
    if (this.vatType == '1') {
      this.api
        .exec('AC', 'VATInvoicesBusiness', 'UpdateVATInvoiceAsync', [
          this.vatinvoices,
        ])
        .subscribe(() => {});
    }
  }

  onSaveMaster() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      this.dialog.dataService.updateDatas.set(
        this.master['_uuid'],
        this.master
      );
      this.dialog.dataService
        .save(null, 0, '', 'SYS006', false)
        .subscribe((res) => {
          if (res && res.update.data != null) {
            this.dt.detectChanges();
          }
        });
    }
  }

  onSave() {
    // tu dong khi luu, khong check voucherNo
    let ignoredFields = [];
    if (this.journal.assignRule === '2') {
      ignoredFields.push('VoucherNo');
    }

    this.checkValidate();
    this.checkTransLimit();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      switch (this.formType) {
        case 'add':
        case 'copy':
          this.master.status = '1';
          if (this.hasSaved) {
            this.dialog.dataService.updateDatas.set(
              this.master['_uuid'],
              this.master
            );
            this.dialog.dataService
              .save(null, 0, '', 'SYS006', true)
              .subscribe((res) => {
                if (
                  res &&
                  res.update.data != null &&
                  res.update.error != true
                ) {
                  this.dialog.close({
                    update: true,
                    data: res.update,
                  });
                  this.dt.detectChanges();
                }
                if (res.update.error) {
                  this.master.status = '0';
                }
              });
          } else {
            // nếu voucherNo đã tồn tại,
            // hệ thống sẽ đề xuất một mã mới theo thiệt lập đánh số tự động
            this.journalService.checkVoucherNoBeforeSave(
              this.journal,
              this.master,
              'AC',
              'AC_PurchaseInvoices',
              this.form,
              this.formType === 'edit',
              () => {
                this.dialog.dataService.save().subscribe((res) => {
                  if (res && res.save.data != null && res.save.error != true) {
                    this.updateVAT();
                    this.dialog.close();
                    this.dt.detectChanges();
                  }
                  if (res.save.error) {
                    this.master.status = '0';
                  }
                });
              }
            );
          }
          break;
        case 'edit':
          this.journalService.checkVoucherNoBeforeSave(
            this.journal,
            this.master,
            'AC',
            'AC_PurchaseInvoices',
            this.form,
            this.formType === 'edit',
            () => {
              if (this.master.status == '0') {
                this.master.status = '1';
              }
              this.dialog.dataService.updateDatas.set(
                this.master['_uuid'],
                this.master
              );
              this.dialog.dataService
                .save(null, 0, '', '', true)
                .subscribe((res) => {
                  if (res && res.update.data != null) {
                    this.updateVAT();
                    this.dialog.close({
                      update: true,
                      data: res.update.data,
                    });
                    this.dt.detectChanges();
                  }
                });
            }
          );
          break;
      }
    }
  }

  onSaveAdd() {
    this.checkValidate();
    this.checkTransLimit();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      this.master.status = '1';
      if (this.hasSaved) {
        this.dialog.dataService.updateDatas.set(
          this.master['_uuid'],
          this.master
        );
        this.dialog.dataService.save().subscribe((res) => {
          if (res.update.error) {
            this.master.status = '0';
          }
          if (res && res.update.data != null && res.update.error != true) {
            this.clearPurchaseInvoicesLines();
            this.dialog.dataService.clear();
            this.dialog.dataService
              .addNew((o) => this.setDefault(o))
              .subscribe((res) => {
                this.master = res;
                this.form.formGroup.patchValue(this.master);
                this.hasSaved = false;
                this.isSaveMaster = false;
              });
          }
        });
      } else {
        // nếu voucherNo đã tồn tại,
        // hệ thống sẽ đề xuất một mã mới theo thiệt lập đánh số tự động
        this.journalService.checkVoucherNoBeforeSave(
          this.journal,
          this.master,
          'AC',
          'AC_PurchaseInvoices',
          this.form,
          this.formType === 'edit',
          () => {
            this.dialog.dataService.save().subscribe((res) => {
              if (res.save.error) {
                this.master.status = '0';
              }
              if (res && res.save.data != null && res.save.error != true) {
                this.clearPurchaseInvoicesLines();
                this.dialog.dataService.clear();
                this.dialog.dataService
                  .addNew((o) => this.setDefault(o))
                  .subscribe((res) => {
                    this.master = res;
                    this.form.formGroup.patchValue(this.master);
                  });
              }
            });
          }
        );
      }
    }
  }

  focusInput() {
    var element = document.querySelectorAll('input');
    console.log(element[0]);
    (element[0] as HTMLInputElement).focus();
    (element[0] as HTMLInputElement).setSelectionRange(0, 2000);
  }
  //#endregion

  //#region Function
  openPopupLine(data, type: string) {
    var obj = {
      dataline: this.lines,
      dataPurchaseinvoices: this.master,
      headerText: this.formTitle,
      data: data,
      lockFields: this.lockFields,
      type: type,
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'PurchaseInvoicesLines';
    dataModel.gridViewName = 'grvPurchaseInvoicesLines';
    dataModel.entityName = 'AC_PurchaseInvoicesLines';
    opt.FormModel = dataModel;
    this.cache
      .gridViewSetup('PurchaseInvoicesLines', 'grvPurchaseInvoicesLines')
      .subscribe((res) => {
        if (res) {
          var dialogs = this.callfc.openForm(
            PopAddLineComponent,
            '',
            900,
            850,
            '',
            obj,
            '',
            opt
          );
          dialogs.closed.subscribe((res) => {
            if (res.event != null) {
              var dataline = res.event['data'];
              if (dataline) {
                this.lines.push(dataline);
              }
              this.hasSaved = true;
              this.isSaveMaster = true;
              this.loadTotal();
            }
          });
        }
      });
  }

  loadModegrid() {
    let idx;
    this.api
      .exec<any>('AC', 'PurchaseInvoicesLinesBusiness', 'SetDefaultAsync', [
        this.master,
      ])
      .subscribe((res) => {
        if (res) {
          switch (this.journal?.addNewMode) {
            case '1':
              idx = this.gridPurchaseInvoiceLines.dataSource.length;
              res.rowNo = idx + 1;
              this.gridPurchaseInvoiceLines.addRow(res, idx);
              this.loadPredicate(
                this.gridPurchaseInvoiceLines.visibleColumns,
                res
              );
              break;
            case '2':
              idx = this.lines.length;
              res.rowNo = idx + 1;
              res.transID = this.master.recID;
              this.openPopupLine(res, 'add');
              break;
          }
        }
      });
  }

  copyRow(data) {
    this.purchaseInvoiceLineService.dataSelected = { ...data };
    this.purchaseInvoiceLineService
      .copy()
      .subscribe((res: IPurchaseInvoiceLine) => {
        this.gridPurchaseInvoiceLines.addRow(res, this.lines.length);
      });
  }

  editRow(data) {
    this.gridPurchaseInvoiceLines.gridRef.selectRow(Number(data.index));
    this.gridPurchaseInvoiceLines.gridRef.startEdit();
  }

  deleteRow(data) {
    this.purchaseInvoiceLineService.delete([data]).subscribe((res: any) => {
      if (res.error === false) {
        this.gridPurchaseInvoiceLines.deleteRow(data, true);
      }
    });
  }

  loadPurchaseInfo() {
    this.countDetail = 0;
    this.lines.forEach((element) => {
      if (element.vatid != null) {
        this.countDetail++;
      }
    });
  }

  loadItemID(value) {
    let sArray = [
      'packingspecifications',
      'styles',
      'itemcolors',
      'itembatchs',
      'itemseries',
    ];
    var element = document
      .querySelector('.tabLine')
      .querySelectorAll('codx-inplace');
    element.forEach((e) => {
      var input = window.ng.getComponent(e) as CodxInplaceComponent;
      if (sArray.includes(input.dataService.comboboxName.toLowerCase())) {
        input.value = '';
        input.predicate = 'ItemID="' + value + '"';
        input.loadSetting();
      }
    });
  }

  loadWarehouseID(value) {
    let sArray = ['warehouselocations'];
    var element = document
      .querySelector('.tabLine')
      .querySelectorAll('codx-inplace');
    element.forEach((e) => {
      var input = window.ng.getComponent(e) as CodxInplaceComponent;
      if (sArray.includes(input.dataService.comboboxName.toLowerCase())) {
        input.value = '';
        input.predicate = 'WarehouseID="' + value + '"';
        input.loadSetting();
      }
    });
  }

  loadTotal() {
    var totalnet = 0;
    var totalvat = 0;
    this.lines.forEach((element) => {
      totalnet = totalnet + element.netAmt;
      totalvat = totalvat + element.vatAmt;
    });
    this.total = totalnet + totalvat;
    this.master.totalAmt = this.total;
    this.totalnet = totalnet.toLocaleString('it-IT', {
      style: 'currency',
      currency: 'VND',
    });
    this.totalvat = totalvat.toLocaleString('it-IT', {
      style: 'currency',
      currency: 'VND',
    });
    this.total = this.total.toLocaleString('it-IT', {
      style: 'currency',
      currency: 'VND',
    });
    if (this.isSaveMaster) {
      this.onSaveMaster();
    }
  }

  loadPredicate(visibleColumns, data) {
    var arr = ['IDIM0', 'IDIM1', 'IDIM2', 'IDIM3', 'IDIM5', 'IDIM6', 'IDIM7'];
    arr.forEach((fieldName) => {
      let idx = this.gridPurchaseInvoiceLines.visibleColumns.findIndex(
        (x) => x.fieldName == fieldName
      );
      if (idx > -1) {
        switch (fieldName) {
          case 'IDIM0':
            visibleColumns[idx].predicate = '@0.Contains(ItemID)';
            visibleColumns[idx].dataValue = `[${data?.itemID}]`;
            break;
          case 'IDIM1':
            visibleColumns[idx].predicate = '@0.Contains(ItemID)';
            visibleColumns[idx].dataValue = `[${data?.itemID}]`;
            break;
          case 'IDIM2':
            visibleColumns[idx].predicate = '@0.Contains(ItemID)';
            visibleColumns[idx].dataValue = `[${data?.itemID}]`;
            break;
          case 'IDIM3':
            visibleColumns[idx].predicate = '@0.Contains(ItemID)';
            visibleColumns[idx].dataValue = `[${data?.itemID}]`;
            break;
          case 'IDIM5':
            visibleColumns[idx].predicate = '@0.Contains(WarehouseID)';
            visibleColumns[idx].dataValue = `[${data?.idiM4}]`;
            break;
          case 'IDIM6':
            visibleColumns[idx].predicate = '@0.Contains(ItemID)';
            visibleColumns[idx].dataValue = `[${data?.itemID}]`;
            break;
          case 'IDIM7':
            visibleColumns[idx].predicate = '@0.Contains(ItemID)';
            visibleColumns[idx].dataValue = `[${data?.itemID}]`;
            break;
        }
      }
    });
  }

  searchName(e) {
    var filter, table, tr, td, i, txtValue, mySearch, myBtn;
    filter = e.toUpperCase();
    table = document.getElementById('myTable');
    tr = table.getElementsByTagName('tr');
    if (String(e).match(/^ *$/) !== null) {
      myBtn = document.getElementById('myBtn');
      myBtn.style.display = 'block';
      mySearch = document.getElementById('mySearch');
      mySearch.style.display = 'none';
      for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName('td')[2];
        if (td) {
          txtValue = td.textContent || td.innerText;
          tr[i].style.display = '';
        }
      }
    } else {
      for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName('td')[2];
        if (td) {
          txtValue = td.textContent || td.innerText;
          myBtn = document.getElementById('myBtn');
          myBtn.style.display = 'none';
          if (txtValue.toUpperCase().indexOf(filter) > -1) {
            tr[i].style.display = '';
            mySearch = document.getElementById('mySearch');
            mySearch.style.display = 'none';
          } else {
            tr[i].style.display = 'none';
            mySearch = document.getElementById('mySearch');
            mySearch.style.display = 'block';
          }
        }
      }
    }
  }

  checkValidate(ignoredFields: string[] = []) {
    ignoredFields = ignoredFields.map((i) => i.toLowerCase());
    var keygrid = Object.keys(this.grvPurchaseInvoices);
    var keymodel = Object.keys(this.master);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.grvPurchaseInvoices[keygrid[index]].isRequire == true) {
        if (ignoredFields.includes(keygrid[index].toLowerCase())) {
          continue;
        }

        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.master[keymodel[i]] === null ||
              String(this.master[keymodel[i]]).match(/^ *$/) !== null ||
              this.master[keymodel[i]] == 0
            ) {
              this.notification.notifyCode(
                'SYS009',
                0,
                '"' + this.grvPurchaseInvoices[keygrid[index]].headerText + '"'
              );
              this.validate++;
            }
          }
        }
      }
    }
  }

  checkValidateLine(e) {
    var keygrid = Object.keys(this.grvPurchaseInvoicesLines);
    var keymodel = Object.keys(e);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.grvPurchaseInvoicesLines[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              e[keymodel[i]] === null ||
              String(e[keymodel[i]]).match(/^ *$/) !== null
            ) {
              this.notification.notifyCode(
                'SYS009',
                0,
                '"' +
                  this.grvPurchaseInvoicesLines[keygrid[index]].headerText +
                  '"'
              );
              this.validate++;
            }
          }
        }
      }
    }
  }

  checkTransLimit() {
    if (
      this.journal.transLimit &&
      this.master.totalAmt > this.journal.transLimit
    ) {
      this.notification.notifyCode('AC0016');
      this.validate++;
    }
  }

  setDataGrid(updateColumn, data) {
    if (updateColumn) {
      var arrColumn = [];
      arrColumn = updateColumn.split(';');
      if (arrColumn && arrColumn.length) {
        arrColumn.forEach((e) => {
          if (e) {
            let field = Util.camelize(e);
            this.gridPurchaseInvoiceLines.rowDataSelected[field] = data[field];
            this.gridPurchaseInvoiceLines.rowDataSelected = {
              ...data,
            };
            this.gridPurchaseInvoiceLines.rowDataSelected.updateColumns = '';
          }
        });
      }
    }
  }

  clearPurchaseInvoicesLines() {
    this.lines = [];
  }

  setDefault(o) {
    return this.api.exec('AC', 'PurchaseInvoicesBusiness', 'SetDefaultAsync', [
      this.master.journalNo,
    ]);
  }

  getTaxRate(vatCodeID: any) {
    var vatCode = this.lsVatCode.filter((x) => x.vatid == vatCodeID);
    return vatCode[0].taxRate;
  }

  calculateNetAmt(quantity: any, unitPrice: any) {
    if (quantity == 0 || unitPrice == 0) return 0;
    var netAmt = quantity * unitPrice;
    return netAmt;
  }

  calculateVatAmt(netAmt: any, vatid: any) {
    if (vatid == null) return 0;
    var taxRate = this.getTaxRate(vatid);
    var vatAmt = netAmt * taxRate;
    return vatAmt;
  }

  genFixedDims(line: IPurchaseInvoiceLine): string {
    let fixedDims: string[] = Array(10).fill('0');
    for (let i = 0; i < 10; i++) {
      if (line['idiM' + i]) {
        fixedDims[i] = '1';
      }
    }
    return fixedDims.join('');
  }
  //#endregion
}
