import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import {
  CodxFormComponent,
  CodxGridviewV2Component,
  CodxInplaceComponent,
  DataRequest,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  UIComponent,
  Util,
} from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { PopAddLineComponent } from '../pop-add-line/pop-add-line.component';
import { IJournal } from '../../../journals/interfaces/IJournal.interface';
import { PurchaseInvoices } from '../../../models/PurchaseInvoices.model';
import { PurchaseInvoicesLines } from '../../../models/PurchaseInvoicesLines.model';
import { VATInvoices } from '../../../models/VATInvoices.model';
import { CodxAcService } from '../../../codx-ac.service';
import { JournalService } from '../../../journals/journals.service';
import { map } from 'rxjs';
declare var window: any;
@Component({
  selector: 'lib-pop-add-purchase',
  templateUrl: './pop-add-purchase.component.html',
  styleUrls: ['./pop-add-purchase.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class PopAddPurchaseComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('gridPurchaseInvoicesLine')
  public gridPurchaseInvoicesLine: CodxGridviewV2Component;
  @ViewChild('gridPurchase') public gridPurchase: CodxGridviewV2Component;
  @ViewChild('gridInvoices') public gridInvoices: CodxGridviewV2Component;
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('cardbodyRef') cardbodyRef: ElementRef;
  @ViewChild('cashRef') cashRef: ElementRef;
  @ViewChild('noteRef') noteRef: ElementRef;
  @ViewChild('tab') tab: ElementRef;
  @ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  headerText: string;
  formModel: FormModel;
  dialog!: DialogRef;
  formType: any;
  grvPurchaseInvoices: any;
  grvPurchaseInvoicesLines: any;
  validate: any = 0;
  journalNo: string;
  VATType: any;
  detailActive = 1;
  countDetail = 0;
  journal: IJournal;
  hasSaved: any = false;
  isSaveMaster: any = false;
  purchaseinvoices: PurchaseInvoices;
  purchaseInvoicesLines: Array<PurchaseInvoicesLines> = [];
  purchaseInvoicesLinesDelete: Array<PurchaseInvoicesLines> = [];
  vatinvoices: VATInvoices = new VATInvoices();
  objectvatinvoices: Array<VATInvoices> = [];
  fmVATInvoices: FormModel = {
    formName: 'VATInvoices',
    gridViewName: 'grvVATInvoices',
    entityName: 'AC_VATInvoices',
  };
  fmPurchaseInvoicesLines: FormModel = {
    formName: 'PurchaseInvoicesLines',
    gridViewName: 'grvPurchaseInvoicesLines',
    entityName: 'PS_PurchaseInvoicesLines',
  };
  fgVATInvoices: FormGroup;
  gridHeight: number;
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
  columnGrids = [];
  keymodel: any = [];
  modegrid: any;
  lsVatCode: any;
  journals: any;
  totalnet: any = 0;
  totalvat: any = 0;
  total: any = 0;
  lockFields: string[];
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private notification: NotificationsService,
    private routerActive: ActivatedRoute,
    private journalService: JournalService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.purchaseinvoices = dialog.dataService!.dataSelected;
    this.headerText = dialogData.data?.headerText;
    this.formType = dialogData.data?.formType;
    this.routerActive.queryParams.subscribe((res) => {
      if (res && res?.journalNo) this.journalNo = res.journalNo;
    });
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.loadInit();
  }

  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    this.form.formGroup.patchValue(this.purchaseinvoices);
    this.loadTotal();
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
  valueChange(e: any) {
    if (e.field.toLowerCase() === 'voucherdate' && e.data)
      this.purchaseinvoices[e.field] = e.data;
    else this.purchaseinvoices[e.field] = e.data;
    let sArray = ['currencyid', 'voucherdate', 'journalno'];
    if (e.data && sArray.includes(e.field.toLowerCase())) {
      this.api
        .exec<any>('PS', 'PurchaseInvoicesBusiness', 'ValueChangedAsync', [
          e.field,
          this.purchaseinvoices,
        ])
        .subscribe((res) => {
          if (res) {
            this.purchaseinvoices = res;
            this.form.formGroup.patchValue(this.purchaseinvoices);
          }
        });
    }
    if (e.data && e.field.toLowerCase() === 'objectid') {
      this.purchaseinvoices.objectID = e.data;
      this.api
        .exec<any>('PS', 'PurchaseInvoicesBusiness', 'GetVendorNameAsync', [
          e.data,
        ])
        .subscribe((res) => {
          if (res) {
            this.purchaseinvoices.invoiceName = res;
            this.form.formGroup.patchValue(this.purchaseinvoices);
          }
        });
    }
  }
  valueChangeVAT(e: any) {
    this.vatinvoices[e.field] = e.data;
  }
  gridCreated(e, grid) {
    this.gridPurchaseInvoicesLine.hideColumns(this.lockFields);
  }

  onDoubleClick(data)
  {
    this.loadPredicate(this.gridPurchaseInvoicesLine.visibleColumns, data.rowData);
  }

  expandTab() {}
  cellChangedPurchase(e: any) {
    if (e.field == 'vatid' && e.data.vatid != null) {
      this.loadPurchaseInfo();
    }
    if (e.data?.isAddNew == null) {
      this.api
        .exec(
          'PS',
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
                this.purchaseinvoices,
                e.data,
              ])
              .subscribe(() => {});
          }
        });
    }
    switch(e.field)
    {
      case "quantity":
        if(e.value == null)
          e.data.quantity = 0;
        e.data.netAmt = this.calculateNetAmt(e.data.quantity, e.data.unitPrice);
        e.data.vatAmt = this.calculateVatAmt(e.data.netAmt, e.data.vatid);
        break;
      case "unitPrice":
        if(e.value == null)
          e.data.unitPrice = 0;
        e.data.netAmt = this.calculateNetAmt(e.data.quantity, e.data.unitPrice);
        e.data.vatAmt = this.calculateVatAmt(e.data.netAmt, e.data.vatid);
        break;
      case "netAmt":
        if(e.value == null)
          e.data.netAmt = 0;
        e.data.vatAmt = this.calculateVatAmt(e.data.netAmt, e.data.vatid);
        break;
      case "vatAmt":
        if(e.value == null)
          e.data.vatAmt = 0;
        break;
      case "vatid":
        e.data.vatAmt = this.calculateVatAmt(e.data.netAmt, e.data.vatid);
        break;
      case 'itemID':
        this.api.exec('IV', 'ItemsBusiness', 'LoadDataAsync', [e.data.itemID])
          .subscribe((res: any) => {
            if (res)
            {
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
        data: this.purchaseinvoices,
      });
    } else {
      this.dialog.close();
    }
  }

  onDiscard(){
    this.dialog.dataService
      .delete([this.purchaseinvoices], true, null, '', 'AC0010', null, null, false)
      .subscribe((res) => {
        if (res.data != null) {
          this.dialog.close();
          this.dt.detectChanges();
        }
      });
  }

  onEdit(e: any) {
    this.checkValidateLine(e);
    if (this.validate > 0) {
      this.validate = 0;
      this.notification.notifyCode('SYS021', 0, '');
      return;
    } else {
      this.api
        .execAction<any>('PS_PurchaseInvoicesLines', [e], 'UpdateAsync')
        .subscribe((save) => {
          if (save) {
            this.updateVAT();
            this.notification.notifyCode('SYS007', 0, '');
            this.hasSaved = true;
            this.isSaveMaster = true;
            this.loadTotal();
          }
        });
    }
  }

  onAddNew(e: any) {
    this.checkValidateLine(e);
    if (this.validate > 0) {
      this.validate = 0;
      e.isAddNew = true;
      this.notification.notifyCode('SYS023', 0, '');
      return;
    } else {
      this.api
        .execAction<any>('PS_PurchaseInvoicesLines', [e], 'SaveAsync')
        .subscribe((save) => {
          if (save) {
            this.notification.notifyCode('SYS006', 0, '');
            this.hasSaved = true;
            this.isSaveMaster = true;
            this.loadTotal();
          }
        });
    }
  }

  //#endregion

  //#region Function

  openPopupLine(data, type: string) {
    var obj = {
      dataline: this.purchaseInvoicesLines,
      dataPurchaseinvoices: this.purchaseinvoices,
      headerText: this.headerText,
      data: data,
      lockFields: this.lockFields,
      type: type,
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'PurchaseInvoicesLines';
    dataModel.gridViewName = 'grvPurchaseInvoicesLines';
    dataModel.entityName = 'PS_PurchaseInvoicesLines';
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
              if(dataline)
              {
                this.purchaseInvoicesLines.push(dataline);
              }
              this.hasSaved = true;
              this.isSaveMaster = true;
              this.loadTotal();
            }
          });
        }
      });
  }

  loadModegrid(){
    let data = new PurchaseInvoicesLines();
    let idx;
    this.api
      .exec<any>('PS', 'PurchaseInvoicesLinesBusiness', 'SetDefaultAsync', [
        this.purchaseinvoices,
        data,
      ])
      .subscribe((res) => {
        if (res) {
          switch (this.modegrid) {
            case '1':
              idx = this.gridPurchaseInvoicesLine.dataSource.length;
              res.rowNo = idx + 1;
              this.gridPurchaseInvoicesLine.addRow(res, idx);
              this.loadPredicate(this.gridPurchaseInvoicesLine.visibleColumns, res);
              break;
            case '2':
              idx = this.purchaseInvoicesLines.length;
              res.rowNo = idx + 1;
              res.transID = this.purchaseinvoices.recID;
              this.openPopupLine(res, 'add');
              break;
          }
        }
      });
  }

  copyRow(data) {
    let idx;
    this.api
      .exec<any>('PS', 'PurchaseInvoicesLinesBusiness', 'SetDefaultAsync', [
        this.purchaseinvoices,
        data,
      ])
      .subscribe((res) => {
        if (res) {
          switch (this.modegrid) {
            case '1':
              idx = this.gridPurchaseInvoicesLine.dataSource.length;
              res.rowNo = idx + 1;
              res.recID = Util.uid();
              this.gridPurchaseInvoicesLine.addRow(res, idx);
              setTimeout(() => {
                this.gridPurchaseInvoicesLine.updateRow(idx, res);
              }, 500);
              
              break;
            case '2':
              idx = this.purchaseInvoicesLines.length;
              res.rowNo = idx + 1;
              res.recID = Util.uid();
              this.openPopupLine(res, 'copy');
              break;
          }
        }
      });
  }

  addRow(){
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      switch (this.formType) {
        case 'add':
        case 'copy':
          if (this.hasSaved) {
            this.dialog.dataService.updateDatas.set(
              this.purchaseinvoices['_uuid'],
              this.purchaseinvoices
            );
            this.dialog.dataService
              .save(null, 0, '', '', false)
              .subscribe((res) => {
                if (res && res.update.data != null) {
                  this.loadModegrid();
                }
              });
          } else {
            this.journalService.handleVoucherNoAndSave(
              this.journal,
              this.purchaseinvoices,
              'PS',
              'PS_PurchaseInvoices',
              this.form,
              this.formType === 'edit',
              () => {
                this.dialog.dataService
                  .save(null, 0, '', '', false)
                  .subscribe((res) => {
                    if (res && res.save.data != null) {
                      this.hasSaved = true;
                      this.loadModegrid();
                    }
                  });
              }
            );
          }
          break;
        case 'edit':
          this.dialog.dataService.updateDatas.set(
            this.purchaseinvoices['_uuid'],
            this.purchaseinvoices
          );
          this.dialog.dataService
            .save(null, 0, '', '', false)
            .subscribe((res) => {
              if (res && res.update.data != false) {
                this.loadModegrid();
              }
            });
          break;
      }
    }
  }

  editRow(data) {
    switch (this.modegrid) {
      case '1':
        this.gridPurchaseInvoicesLine.gridRef.selectRow(Number(data.index));
        this.gridPurchaseInvoicesLine.gridRef.startEdit();
        this.loadPredicate(this.gridPurchaseInvoicesLine.visibleColumns, data)
        break;
      case '2':
        let index = this.purchaseInvoicesLines.findIndex(
          (x) => x.recID == data.recID
        );
        var obj = {
          headerText: this.headerText,
          dataPurchaseinvoices: this.purchaseinvoices,
          data: { ...data },
          lockFields: this.lockFields,
          type: 'edit',
        };
        let opt = new DialogModel();
        let dataModel = new FormModel();
        dataModel.formName = 'PurchaseInvoicesLines';
        dataModel.gridViewName = 'grvPurchaseInvoicesLines';
        dataModel.entityName = 'PS_PurchaseInvoicesLines';
        opt.FormModel = dataModel;
        opt.Resizeable = false;
        this.cache
          .gridViewSetup('PurchaseInvoicesLines', 'grvPurchaseInvoicesLines')
          .subscribe((res) => {
            if (res) {
              var dialogs = this.callfc.openForm(
                PopAddLineComponent,
                '',
                650,
                850,
                '',
                obj,
                '',
                opt
              );
              dialogs.closed.subscribe((res) => {
                if (res.event != null) {
                  var dataline = res.event['data'];
                  this.purchaseInvoicesLines[index] = dataline;
                  this.hasSaved = true;
                  this.isSaveMaster = true;
                  if (dataline.vatid != null) {
                    this.loadPurchaseInfo();
                  }
                  this.loadTotal();
                }
              });
            }
          });
        break;
    }
  }

  deleteRow(data) {
    this.notification.alertCode('SYS030', null).subscribe((res) => {
      if (res.event.status === 'Y') {
        switch (this.modegrid) {
          case '1':
            this.gridPurchaseInvoicesLine.deleteRow(data);
            if (this.gridPurchaseInvoicesLine.dataSource.length > 0) {
              for (
                let i = 0;
                i < this.gridPurchaseInvoicesLine.dataSource.length;
                i++
              ) {
                this.gridPurchaseInvoicesLine.dataSource[i].rowNo = i + 1;
              }
            }
            this.purchaseInvoicesLines = this.gridPurchaseInvoicesLine.dataSource;
            break;
          case '2':
            let index = this.purchaseInvoicesLines.findIndex(
              (x) => x.recID == data.recID
            );
            this.purchaseInvoicesLines.splice(index, 1);
            for (let i = 0; i < this.purchaseInvoicesLines.length; i++) {
              this.purchaseInvoicesLines[i].rowNo = i + 1;
            }
            break;
        }
        this.api
          .execAction<any>('PS_PurchaseInvoicesLines', [data], 'DeleteAsync')
          .subscribe((res) => {
            if (res) {
              this.hasSaved = true;
              this.isSaveMaster = true;
              this.api
                .exec(
                  'PS',
                  'PurchaseInvoicesLinesBusiness',
                  'UpdateAfterDelete',
                  [this.purchaseInvoicesLines]
                )
                .subscribe((res) => {
                  this.notification.notifyCode('SYS008', 0, '');
                  this.loadTotal();
                });
            }
          });
      }
    });
  }

  loadPurchaseInfo() {
    this.countDetail = 0;
    this.purchaseInvoicesLines.forEach((element) => {
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
        input.value = "";
        input.predicate = 'ItemID="' + value + '"';
        input.loadSetting();
      }
    });
  }

  loadWarehouseID(value) {
    let sArray = [
      'warehouselocations',
    ];
    var element = document
      .querySelector('.tabLine')
      .querySelectorAll('codx-inplace');
    element.forEach((e) => {
      var input = window.ng.getComponent(e) as CodxInplaceComponent;
      if (sArray.includes(input.dataService.comboboxName.toLowerCase())) {
        input.value = "";
        input.predicate = 'WarehouseID="' + value + '"';
        input.loadSetting();
      }
    });
  }

  loadTotal() {
    var totalnet = 0;
    var totalvat = 0;
    this.purchaseInvoicesLines.forEach((element) => {
      totalnet = totalnet + element.netAmt;
      totalvat = totalvat + element.vatAmt;
    });
    this.total = totalnet + totalvat;
    if(this.journal && (this.total <= this.journal.transLimit || this.journal.transLimit == null))
      this.purchaseinvoices.totalAmt = this.total;
    this.totalnet = totalnet.toLocaleString('it-IT', {
      style: 'currency',
      currency: 'VND',
    });
    this.totalvat = totalvat.toLocaleString('it-IT', {
      style: 'currency',
      currency: 'VND',
    });
    if(this.isSaveMaster)
    {
      this.onSaveMaster();
    }
  }

  loadPredicate(visibleColumns, data)
  {
    var arr = [
      'IDIM0',
      'IDIM1',
      'IDIM2',
      'IDIM3',
      'IDIM5',
      'IDIM6',
      'IDIM7',
    ];
    arr.forEach((fieldName) => {
      let idx = this.gridPurchaseInvoicesLine.visibleColumns.findIndex(
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
    var keymodel = Object.keys(this.purchaseinvoices);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.grvPurchaseInvoices[keygrid[index]].isRequire == true) {
        if (ignoredFields.includes(keygrid[index].toLowerCase())) {
          continue;
        }

        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.purchaseinvoices[keymodel[i]] === null ||
              String(this.purchaseinvoices[keymodel[i]]).match(/^ *$/) !==
                null ||
              this.purchaseinvoices[keymodel[i]] == 0
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
                  '"' + this.grvPurchaseInvoicesLines[keygrid[index]].headerText + '"'
                );
                this.validate++;
              }
            }
          }
        }
      }
  }

  checkTransLimit(){
    if(this.journal.transLimit == null)
      this.purchaseinvoices.totalAmt = parseInt(this.total);
    if(this.journal.transLimit && this.total > this.journal.transLimit)
    {
      this.notification.notifyCode('AC0016');
      this.validate++ ;
    }
  }

  detaiClick(e) {
    this.detailActive = e;
  }

  setDataGrid(updateColumn, data) {
    if (updateColumn) {
      var arrColumn = [];
      arrColumn = updateColumn.split(';');
      if (arrColumn && arrColumn.length) {
        arrColumn.forEach((e) => {
          if (e) {
            let field = Util.camelize(e);
            this.gridPurchaseInvoicesLine.rowDataSelected[field] = data[field];
            this.gridPurchaseInvoicesLine.rowDataSelected = {
              ...data,
            };
            this.gridPurchaseInvoicesLine.rowDataSelected.updateColumns = '';
          }
        });
      }
    }
  }

  clearPurchaseInvoicesLines() {
    this.purchaseInvoicesLines = [];
  }

  setDefault(o) {
    return this.api.exec('PS', 'PurchaseInvoicesBusiness', 'SetDefaultAsync', [
      this.journalNo
    ]);
  }

  loadInit(){
    this.cache
      .gridViewSetup('PurchaseInvoices', 'grvPurchaseInvoices')
      .subscribe((res) => {
        if (res) {
          this.grvPurchaseInvoices = res;
        }
      });

    this.cache
      .gridViewSetup('PurchaseInvoicesLines', 'grvPurchaseInvoicesLines')
      .subscribe((res) => {
        if (res) {
          this.grvPurchaseInvoicesLines = res;
          var keygrid = Object.keys(this.grvPurchaseInvoicesLines);
          for (let index = 0; index < keygrid.length; index++) {
            if (this.grvPurchaseInvoicesLines[keygrid[index]].isVisible == true) {
              var column = {
                field:
                  this.grvPurchaseInvoicesLines[keygrid[index]].fieldName.toLowerCase(),
                headerText: this.grvPurchaseInvoicesLines[keygrid[index]].headerText,
                columnOrder: this.grvPurchaseInvoicesLines[keygrid[index]].columnOrder,
              };
              this.columnGrids.push(column);
            }
          }
          this.columnGrids = this.columnGrids.sort(
            (a, b) => a.columnOrder - b.columnOrder
          );
        }
      });

    if (this.purchaseinvoices.status == '0' && this.formType == 'edit') {
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
      this.purchaseinvoices &&
      this.purchaseinvoices.unbounds &&
      this.purchaseinvoices.unbounds.lockFields &&
      this.purchaseinvoices.unbounds.lockFields.length
    ) {
      this.lockFields = this.purchaseinvoices.unbounds
        .lockFields as Array<string>;
    }
    else{
      this.api
        .exec('PS', 'PurchaseInvoicesBusiness', 'SetUnboundsAsync', [
          this.purchaseinvoices
        ])
        .subscribe((res: any) => {
          if (res.unbounds && res.unbounds.lockFields && res.unbounds.lockFields.length) {
            this.purchaseinvoices.unbounds = res.unbounds;
            this.lockFields = this.purchaseinvoices.unbounds
              .lockFields as Array<string>;
          }
        });
    }

    const options = new DataRequest();
    options.entityName = 'AC_Journals';
    options.predicates = 'JournalNo=@0';
    options.dataValues = this.purchaseinvoices.journalNo;
    options.pageLoading = false;
    this.api
      .execSv<any>('AC', 'Core', 'DataBusiness', 'LoadDataAsync', options)
      .pipe(map((r) => r[0]))
      .subscribe((res) => {
        this.journal = res[0];
        this.modegrid = this.journal.inputMode;
        this.VATType = this.journal.vatType;
      if (this.VATType == '1' || this.VATType == '2') {
        this.cache
          .gridViewSetup('VATInvoices', 'grvVATInvoices')
          .subscribe((gv: any) => {
            if (gv) {
              var arrgv = Object.values(gv) as any[];
              const group: any = {};
              arrgv.forEach((element) => {
                var keytmp = Util.camelize(element.fieldName);
                var value = null;
                var type = element.dataType.toLowerCase();
                if (type === 'bool') value = false;
                if (type === 'datetime') value = null;
                if (type === 'int' || type === 'decimal') value = 0;
                group[keytmp] = element.isRequire
                  ? new FormControl(value, Validators.required)
                  : new FormControl(value);
              });
              group['updateColumn'] = new FormControl('');
              var formGroup = new FormGroup(group);
              this.fgVATInvoices = formGroup;
              this.api
                .exec('AC', 'VATInvoicesBusiness', 'SetDefaultAsync', [
                  this.purchaseinvoices.recID,
                ])
                .subscribe((res: any) => {
                  this.vatinvoices = res;
                  this.fmVATInvoices.currentData = res;
                  this.fgVATInvoices.patchValue(this.vatinvoices);
                  if (this.formType == 'edit') {
                    if (this.VATType == '1') {
                      this.api
                        .exec('AC', 'VATInvoicesBusiness', 'GetAsync', [
                          this.purchaseinvoices.recID,
                        ])
                        .subscribe((res: any) => {
                          if (res != null) {
                            this.vatinvoices = res[0];
                            this.fgVATInvoices.patchValue(this.vatinvoices);
                          }
                        });
                    } else {
                      this.api
                        .exec('AC', 'VATInvoicesBusiness', 'GetAsync', [
                          this.purchaseinvoices.recID,
                        ])
                        .subscribe((res: any) => {
                          if (res != null) {
                            this.objectvatinvoices = res;
                          }
                        });
                    }
                  }
                });
            }
          });
      }
      if (this.formType == 'edit') {
        this.api
          .exec('PS', 'PurchaseInvoicesLinesBusiness', 'GetAsync', [
            this.purchaseinvoices.recID,
          ])
          .subscribe((res: any) => {
            if (res.length > 0) {
              this.keymodel = Object.keys(res[0]);
              this.purchaseInvoicesLines = res;
              this.purchaseInvoicesLines.forEach((element) => {
                if (element.vatid != null) {
                  this.countDetail++;
                }
                this.loadTotal();
              });
            }
          });
      }
    });
  }

  getTaxRate(vatCodeID: any){
    var vatCode = this.lsVatCode.filter(x => x.vatid == vatCodeID)
    return vatCode[0].taxRate;
  }

  calculateNetAmt(quantity: any, unitPrice: any)
  {
    if(quantity == 0 || unitPrice == 0)
      return 0;
    var netAmt = quantity * unitPrice;
    return netAmt;
  }

  calculateVatAmt(netAmt: any, vatid: any)
  {
    if(vatid == null)
      return 0;
    var taxRate = this.getTaxRate(vatid)
    var vatAmt = netAmt * taxRate;
    return vatAmt;
  }
  //#endregion

  //#region Method

  saveVAT() {
    if (this.VATType == '1') {
      this.api
        .exec('AC', 'VATInvoicesBusiness', 'AddVATInvoiceAsync', [
          this.vatinvoices,
        ])
        .subscribe(() => {});
    } else {
      this.objectvatinvoices = this.gridInvoices.dataSource;
      this.api
        .exec('AC', 'VATInvoicesBusiness', 'AddLineAsync', [
          this.objectvatinvoices,
        ])
        .subscribe(() => {});
    }
  }
  updateVAT() {
    if (this.VATType == '1') {
      this.api
        .exec('AC', 'VATInvoicesBusiness', 'UpdateVATInvoiceAsync', [
          this.vatinvoices,
        ])
        .subscribe(() => {});
    }
  }

  onSaveMaster()
  {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      this.dialog.dataService.updateDatas.set(
        this.purchaseinvoices['_uuid'],
        this.purchaseinvoices
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
          this.purchaseinvoices.status = '1';
          if (this.hasSaved) {
            this.dialog.dataService.updateDatas.set(
              this.purchaseinvoices['_uuid'],
              this.purchaseinvoices
            );
            this.dialog.dataService
              .save(null, 0, '', 'SYS006', true)
              .subscribe((res) => {
                if (res && res.update.data != null && res.update.error != true) {
                  this.dialog.close({
                    update: true,
                    data: res.update,
                  });
                  this.dt.detectChanges();
                }
                if(res.update.error)
                {
                  this.purchaseinvoices.status = '0';
                }
              });
          } else {
            // nếu voucherNo đã tồn tại,
            // hệ thống sẽ đề xuất một mã mới theo thiệt lập đánh số tự động
            this.journalService.handleVoucherNoAndSave(
              this.journal,
              this.purchaseinvoices,
              'PS',
              'PS_PurchaseInvoices',
              this.form,
              this.formType === 'edit',
              () => {
                this.dialog.dataService.save().subscribe((res) => {
                  if (res && res.save.data != null && res.save.error != true) {
                    this.updateVAT();
                    this.dialog.close();
                    this.dt.detectChanges();
                  }
                  if(res.save.error)
                  {
                    this.purchaseinvoices.status = '0';
                  }
                });
              }
            );
          }
          break;
        case 'edit':
          this.journalService.handleVoucherNoAndSave(
            this.journal,
            this.purchaseinvoices,
            'PS',
            'PS_PurchaseInvoices',
            this.form,
            this.formType === 'edit',
            () => {
              if (this.purchaseinvoices.status == '0') {
                this.purchaseinvoices.status = '1';
              }
              this.dialog.dataService.updateDatas.set(
                this.purchaseinvoices['_uuid'],
                this.purchaseinvoices
              );
              this.dialog.dataService.save(null, 0, '', '', true).subscribe((res) => {
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

  onSaveAdd(){
    this.checkValidate();
    this.checkTransLimit();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      this.purchaseinvoices.status = '1';
      if (this.hasSaved) {
        this.dialog.dataService.updateDatas.set(
          this.purchaseinvoices['_uuid'],
          this.purchaseinvoices
        );
        this.dialog.dataService.save().subscribe((res) => {
          if(res.update.error)
          {
            this.purchaseinvoices.status = '0';
          }
          if (res && res.update.data != null && res.update.error != true) {
            this.clearPurchaseInvoicesLines();
            this.dialog.dataService.clear();
            this.dialog.dataService
              .addNew((o) => this.setDefault(o))
              .subscribe((res) => {
                this.purchaseinvoices = res;
                this.form.formGroup.patchValue(this.purchaseinvoices);
                this.hasSaved = false;
                this.isSaveMaster = false;
              });
          }
        });
      } else {
        // nếu voucherNo đã tồn tại,
        // hệ thống sẽ đề xuất một mã mới theo thiệt lập đánh số tự động
        this.journalService.handleVoucherNoAndSave(
          this.journal,
          this.purchaseinvoices,
          'PS',
          'PS_PurchaseInvoices',
          this.form,
          this.formType === 'edit',
          () => {
            this.dialog.dataService.save().subscribe((res) => {
              if(res.save.error)
              {
                this.purchaseinvoices.status = '0';
              }
              if (res && res.save.data != null && res.save.error != true) {
                this.clearPurchaseInvoicesLines();
                this.dialog.dataService.clear();
                this.dialog.dataService
                  .addNew((o) => this.setDefault(o))
                  .subscribe((res) => {
                    this.purchaseinvoices = res;
                    this.form.formGroup.patchValue(this.purchaseinvoices);
                  });
              }
            });
          }
        );
      }
    }
  }
  
  //#endregion
}
