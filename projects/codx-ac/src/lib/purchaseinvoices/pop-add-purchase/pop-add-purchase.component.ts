import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import {
  CacheService,
  CallFuncService,
  CodxFormComponent,
  CodxGridviewV2Component,
  CodxInplaceComponent,
  CRUDService,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  UIComponent,
  Util,
} from 'codx-core';
import { resolve } from 'dns';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { CodxAcService } from '../../codx-ac.service';
import { PurchaseInvoices } from '../../models/PurchaseInvoices.model';
import { PurchaseInvoicesLines } from '../../models/PurchaseInvoicesLines.model';
import { VATInvoices } from '../../models/VATInvoices.model';
import { PopAddLineComponent } from '../pop-add-line/pop-add-line.component';
declare var window: any;
@Component({
  selector: 'lib-pop-add-purchase',
  templateUrl: './pop-add-purchase.component.html',
  styleUrls: ['./pop-add-purchase.component.css'],
})
export class PopAddPurchaseComponent extends UIComponent implements OnInit {
  //#region Contructor
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
  gridViewSetup: any;
  gridViewLines: any;
  validate: any = 0;
  parentID: string;
  VATType: any;
  objectName: any;
  detailActive = 1;
  countDetail = 0;
  pageCount: any;
  itemName: any;
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
  page: any = 1;
  pageSize = 5;
  modegrid: any = 2;
  lsVatCode: any;
  journals: any;
  totalnet: any = 0;
  totalvat: any = 0;
  total: any = 0;
  constructor(
    private inject: Injector,
    cache: CacheService,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private notification: NotificationsService,
    private routerActive: ActivatedRoute,
    private ngxService: NgxUiLoaderService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.purchaseinvoices = dialog.dataService!.dataSelected;
    this.headerText = dialogData.data?.headerText;
    this.formType = dialogData.data?.formType;
    this.routerActive.queryParams.subscribe((res) => {
      if (res && res?.recID) this.parentID = res.recID;
    });
    if (this.purchaseinvoices.objectID != null) {
      this.api
        .exec<any>('PS', 'PurchaseInvoicesBusiness', 'GetVendorNameAsync', [
          this.purchaseinvoices.objectID,
        ])
        .subscribe((res) => {
          if (res) {
            this.objectName = res;
          }
        });
    }
    this.cache
      .gridViewSetup('PurchaseInvoices', 'grvPurchaseInvoices')
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
    this.cache
      .gridViewSetup('PurchaseInvoicesLines', 'grvPurchaseInvoicesLines')
      .subscribe((res) => {
        if (res) {
          this.gridViewLines = res;
          var keygrid = Object.keys(this.gridViewLines);
          for (let index = 0; index < keygrid.length; index++) {
            if (this.gridViewLines[keygrid[index]].isVisible == true) {
              var column = {
                field:
                  this.gridViewLines[keygrid[index]].fieldName.toLowerCase(),
                headerText: this.gridViewLines[keygrid[index]].headerText,
                columnOrder: this.gridViewLines[keygrid[index]].columnOrder,
              };
              this.columnGrids.push(column);
            }
          }
          this.columnGrids = this.columnGrids.sort(
            (a, b) => a.columnOrder - b.columnOrder
          );
        }
      });
    this.api
      .exec('AC', 'JournalsBusiness', 'GetDefaultAsync', [this.parentID])
      .subscribe((res: any) => {
        this.journals = res;
        this.VATType = res.vatType;
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
      });
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
              this.loadTotal();
              if (element.vatid != null) {
                this.countDetail++;
              }
            });
          }
        });
    }
    this.api
      .exec('IV', 'ItemsBusiness', 'LoadAllDataAsync')
      .subscribe((res: any) => {
        if (res != null) {
          this.itemName = res;
        }
      });
    this.api
      .exec('BS', 'VATCodesBusiness', 'LoadAllDataAsync')
      .subscribe((res: any) => {
        if (res != null) {
          this.lsVatCode = res;
        }
      });
  }
  //#endregion

  //#region Init
  onInit(): void {}

  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    this.form.formGroup.patchValue(this.purchaseinvoices);
    this.pageCount = '(' + this.purchaseInvoicesLines.length + ')';
    this.loadTotal();
  }
  //#endregion

  //#region Event
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
      this.api
        .exec<any>('PS', 'PurchaseInvoicesBusiness', 'GetVendorNameAsync', [
          e.data,
        ])
        .subscribe((res) => {
          if (res) {
            this.objectName = res;
          }
        });
    }
  }
  valueChangeVAT(e: any) {
    this.vatinvoices[e.field] = e.data;
  }
  gridCreated(e) {
    let hBody, hTab, hNote;
    if (this.cardbodyRef)
      hBody = this.cardbodyRef.nativeElement.parentElement.offsetHeight;
    if (this.cashRef) hTab = (this.cashRef as any).element.offsetHeight;
    if (this.noteRef) hNote = this.noteRef.nativeElement.clientHeight;
    this.gridHeight = hBody - (hTab + hNote + 100); //40 là header của tab
  }
  expandTab() {}
  cellChangedPurchase(e: any) {
    if (e.field == 'vatid' && e.data.vatid != null) {
      this.loadPurchaseInfo();
    }
    if (e.field == 'itemID') {
      this.loadItemID(e.value);
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
              .subscribe((res: any) => {});
          }
        });
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
  openPopupLine(data) {
    var obj = {
      headerText: this.headerText,
      data: data,
      journals: this.journals,
      type: 'add',
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
            650,
            800,
            '',
            obj,
            '',
            opt
          );
          dialogs.closed.subscribe((x) => {
            var dataline = JSON.parse(localStorage.getItem('dataline'));
            if (dataline != null) {
              this.purchaseInvoicesLines.push(dataline);
              this.keymodel = Object.keys(dataline);
              this.loadTotal();
              this.loadPageCount();
              if (dataline.vatid != null) {
                this.loadPurchaseInfo();
              }
            }
            window.localStorage.removeItem('dataline');
          });
        }
      });
  }
  addRow() {
    let idx = this.purchaseInvoicesLines.length;
    // if (this.detailActive == 1) {
    //   let idx = this.gridPurchase.dataSource.length;
    //   this.api
    //     .exec<any>('PS', 'PurchaseInvoicesLinesBusiness', 'SetDefaultAsync', [
    //       this.purchaseinvoices.recID,
    //     ])
    //     .subscribe((res) => {
    //       if (res) {
    //         res.rowNo = idx + 1;
    //         this.gridPurchase.addRow(res, idx);
    //       }
    //     });
    // } else {
    //   let idx = this.gridInvoices.dataSource.length;
    //   this.api
    //     .exec<any>('AC', 'VATInvoicesBusiness', 'SetDefaultAsync', [
    //       this.purchaseinvoices.recID,
    //     ])
    //     .subscribe((res) => {
    //       if (res) {
    //         res.rowNo = idx + 1;
    //         this.gridInvoices.addRow(res, idx);
    //       }
    //     });
    // }
    this.api
      .exec<any>('PS', 'PurchaseInvoicesLinesBusiness', 'SetDefaultAsync', [
        this.purchaseinvoices.recID,
      ])
      .subscribe((res) => {
        if (res) {
          res.rowNo = idx + 1;
          res.transID = this.purchaseinvoices.recID;
          this.openPopupLine(res);
        }
      });
  }
  close() {
    this.dialog.close();
  }
  //#endregion

  //#region Function
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
      'specifications',
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
        input.predicate = 'ItemID="' + value + '"';
        input.loadSetting();
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
  editPopupLine(data) {
    let index = this.purchaseInvoicesLines.findIndex(
      (x) => x.recID == data.recID
    );
    var obj = {
      headerText: this.headerText,
      data: { ...data },
      journals: this.journals,
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
            800,
            '',
            obj,
            '',
            opt
          );
          dialogs.closed.subscribe((x) => {
            var dataline = JSON.parse(localStorage.getItem('dataline'));
            if (dataline != null) {
              this.purchaseInvoicesLines[index] = dataline;
              this.loadTotal();
              if (dataline.vatid != null) {
                this.loadPurchaseInfo();
              }
            }
            window.localStorage.removeItem('dataline');
          });
        }
      });
  }
  loadPageCount() {
    this.pageCount = '(' + this.purchaseInvoicesLines.length + ')';
  }
  deleteRow(data) {
    // if (this.detailActive == 1) {
    //   if (data.vatid != null) {
    //     this.countDetail--;
    //     if (this.countDetail == 0) {
    //       this.purchaseinvoices.invoiceForm = '';
    //       this.purchaseinvoices.invoiceSeri = '';
    //       this.purchaseinvoices.invoiceNo = '';
    //       this.acService
    //         .addData(
    //           'ERM.Business.PS',
    //           'PurchaseInvoicesBusiness',
    //           'UpdateAsync',
    //           [this.purchaseinvoices]
    //         )
    //         .subscribe((res) => {});
    //     }
    //   }
    //   this.api
    //     .exec('PS', 'PurchaseInvoicesLinesBusiness', 'DeleteLineAsync', [
    //       data.recID,
    //     ])
    //     .subscribe((res: any) => {
    //       if (res) {
    //         this.api
    //           .exec('AC', 'VATInvoicesBusiness', 'DeleteVATfromPurchaseAsync', [
    //             this.purchaseinvoices.recID,
    //             data.recID,
    //           ])
    //           .subscribe((res: any) => {});
    //       }
    //     });
    //   this.gridPurchase.deleteRow(data);
    // } else {
    //   this.api
    //     .exec('AC', 'VATInvoicesBusiness', 'DeleteLineAsync', [data.recID])
    //     .subscribe((res: any) => {});
    //   this.gridInvoices.deleteRow(data);
    // }
    if (data.vatid != null) {
      this.countDetail--;
      if (this.countDetail == 0) {
        this.purchaseinvoices.invoiceForm = '';
        this.purchaseinvoices.invoiceSeri = '';
        this.purchaseinvoices.invoiceNo = '';
      }
    }
    let index = this.purchaseInvoicesLines.findIndex(
      (x) => x.recID == data.recID
    );
    this.purchaseInvoicesLines.splice(index, 1);
    if (this.purchaseInvoicesLines.length > 0) {
      for (let i = 0; i < this.purchaseInvoicesLines.length; i++) {
        this.purchaseInvoicesLines[i].rowNo = i + 1;
      }
    }
    this.purchaseInvoicesLinesDelete.push(data);
    this.loadTotal();
    this.loadPageCount();
  }
  checkValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.purchaseinvoices);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
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
                '"' + this.gridViewSetup[keygrid[index]].headerText + '"'
              );
              this.validate++;
            }
          }
        }
      }
    }
  }
  // checkValidateLine() {
  //   this.gridPurchase.dataSource.forEach((element) => {
  //     var keygrid = Object.keys(this.gridViewLines);
  //     var keymodel = Object.keys(element);
  //     for (let index = 0; index < keygrid.length; index++) {
  //       if (this.gridViewLines[keygrid[index]].isRequire == true) {
  //         for (let i = 0; i < keymodel.length; i++) {
  //           if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
  //             if (
  //               element[keymodel[i]] === null ||
  //               String(element[keymodel[i]]).match(/^ *$/) !== null
  //             ) {
  //               this.notification.notifyCode(
  //                 'SYS009',
  //                 0,
  //                 '"' + this.gridViewLines[keygrid[index]].headerText + '"'
  //               );
  //               this.validate++;
  //             }
  //           }
  //         }
  //       }
  //     }
  //   });
  // }
  detaiClick(e) {
    this.detailActive = e;
  }
  loadTotal() {
    var totalnet = 0;
    var totalvat = 0;
    this.purchaseInvoicesLines.forEach((element) => {
      totalnet = totalnet + element.netAmt;
      totalvat = totalvat + element.vatAmt;
    });
    this.total = totalnet + totalvat;
    this.purchaseinvoices.totalAmt = this.total;
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
  }
  //#endregion

  //#region Method
  saveVAT() {
    if (this.VATType == '1') {
      this.api
        .exec('AC', 'VATInvoicesBusiness', 'AddVATInvoiceAsync', [
          this.vatinvoices,
        ])
        .subscribe((res: any) => {});
    } else {
      this.objectvatinvoices = this.gridInvoices.dataSource;
      this.api
        .exec('AC', 'VATInvoicesBusiness', 'AddLineAsync', [
          this.objectvatinvoices,
        ])
        .subscribe((res: any) => {});
    }
  }
  updateVAT() {
    if (this.VATType == '1') {
      this.api
        .exec('AC', 'VATInvoicesBusiness', 'UpdateVATInvoiceAsync', [
          this.vatinvoices,
        ])
        .subscribe((res: any) => {});
    }
  }
  onSave() {
    this.checkValidate();
    // if (this.gridPurchase.dataSource.length > 0) {
    //   this.checkValidateLine();
    // }
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      if (this.formType == 'add' || this.formType == 'copy') {
        //this.purchaseInvoicesLines = this.gridPurchase.dataSource;
        this.dialog.dataService
          .save((opt: RequestOption) => {
            opt.methodName = 'AddAsync';
            opt.className = 'PurchaseInvoicesBusiness';
            opt.assemblyName = 'PS';
            opt.service = 'PS';
            opt.data = [this.purchaseinvoices];
            return true;
          })
          .subscribe((res) => {
            if (res.save) {
              this.acService
                .addData(
                  'ERM.Business.PS',
                  'PurchaseInvoicesLinesBusiness',
                  'AddAsync',
                  [this.purchaseinvoices, this.purchaseInvoicesLines]
                )
                .subscribe((res) => {
                  if (res) {
                    this.saveVAT();
                  }
                });
              this.dialog.close();
              this.dt.detectChanges();
            } else {
            }
          });
      }
      if (this.formType == 'edit') {
        this.dialog.dataService
          .save((opt: RequestOption) => {
            opt.methodName = 'UpdateAsync';
            opt.className = 'PurchaseInvoicesBusiness';
            opt.assemblyName = 'PS';
            opt.service = 'PS';
            opt.data = [this.purchaseinvoices];
            return true;
          })
          .subscribe((res) => {
            if (res != null) {
              this.api
                .exec('PS', 'PurchaseInvoicesLinesBusiness', 'UpdateAsync', [
                  this.purchaseinvoices,
                  this.purchaseInvoicesLines,
                  this.purchaseInvoicesLinesDelete
                ])
                .subscribe((res: any) => {
                  if (res) {
                    this.updateVAT();
                  }
                });
              this.dialog.close();
              this.dt.detectChanges();
            } else {
            }
          });
      }
    }
  }
  //#endregion
}
