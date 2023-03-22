import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  OnInit,
  Optional,
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
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  UIComponent,
  Util,
} from 'codx-core';
import { resolve } from 'dns';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { CodxAcService } from '../../codx-ac.service';
import { PurchaseInvoices } from '../../models/PurchaseInvoices.model';
import { PurchaseInvoicesLines } from '../../models/PurchaseInvoicesLines.model';
import { VATInvoices } from '../../models/VATInvoices.model';
declare var window:any;
@Component({
  selector: 'lib-pop-add-purchase',
  templateUrl: './pop-add-purchase.component.html',
  styleUrls: ['./pop-add-purchase.component.css'],
})
export class PopAddPurchaseComponent extends UIComponent implements OnInit {
  @ViewChild('gridPurchase') public gridPurchase: CodxGridviewV2Component;
  @ViewChild('gridInvoices') public gridInvoices: CodxGridviewV2Component;
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('cardbodyRef') cardbodyRef: ElementRef;
  @ViewChild('cashRef') cashRef: ElementRef;
  @ViewChild('noteRef') noteRef: ElementRef;
  @ViewChild('tab') tab: ElementRef;
  headerText: string;
  formModel: FormModel;
  dialog!: DialogRef;
  formType: any;
  gridViewSetup: any;
  gridViewSetupLines: any;
  validate: any = 0;
  parentID: string;
  VATType: any;
  objectName: any;
  detailActive = 1;
  countDetail = 0;
  purchaseinvoices: PurchaseInvoices;
  purchaseInvoicesLines: Array<PurchaseInvoicesLines> = [];
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
  constructor(
    private inject: Injector,
    cache: CacheService,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private notification: NotificationsService,
    private routerActive: ActivatedRoute,
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
          this.gridViewSetupLines = res;
        }
      });
    this.api
      .exec('AC', 'JournalsBusiness', 'GetDefaultAsync', [this.parentID])
      .subscribe((res: any) => {
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
                            this.purchaseinvoices.recID
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
          if (res != null) {
            this.purchaseInvoicesLines = res;
            this.purchaseInvoicesLines.forEach((element) => {
              if (element.vatid != null) {
                this.countDetail++;
              }
            });
          }
        });
    }
  }

  onInit(): void {
  }

  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    this.form.formGroup.patchValue(this.purchaseinvoices);
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
  valueChangeVATformPurchase(e: any) {
    this.purchaseinvoices[e.field] = e.data;
    if (this.formType == 'edit')
      this.api
        .exec('PS', 'PurchaseInvoicesBusiness', 'UpdateAsync', [
          this.purchaseinvoices,
        ])
        .subscribe((res: any) => {
          if (res) {
            this.api
              .exec('AC', 'VATInvoicesBusiness', 'UpdateVATfromPurchaseAsync', [
                this.purchaseinvoices,
                null,
                this.purchaseInvoicesLines,
              ])
              .subscribe((res: any) => {});
          }
        });
  }
  gridCreated(e) {
    let hBody, hTab, hNote;
    if (this.cardbodyRef)
      hBody = this.cardbodyRef.nativeElement.parentElement.offsetHeight;
    if (this.cashRef) hTab = (this.cashRef as any).element.offsetHeight;
    if (this.noteRef) hNote = this.noteRef.nativeElement.clientHeight;
    this.gridHeight = hBody - (hTab + hNote + 100); //40 là header của tab
  }
  expandTab(){
    
  }
  cellChangedPurchase(e: any) {
    if (e.field == 'vatid' && e.data.vatid != null) {
      this.loadPurchaseInfo();
    }
    if (e.field == 'itemID') {
      var element = window.ng.getComponent(document.querySelector('form').querySelectorAll('codx-inplace')[11]);
      //element.dataService.setPredicates(["UMID=@0"],["100M2"]).subscribe();
      element.dataService.predicates = 'UMID=@0';
      element.dataService.dataValues = '100M2'
      console.log(element.dataService);
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
  loadPurchaseInfo() {
    this.countDetail = 0;
    this.gridPurchase.dataSource.forEach((element) => {
      if (element.vatid != null) {
        this.countDetail++;
      }
    });
  }
  addRow() {
    if (this.detailActive == 1) {
      let idx = this.gridPurchase.dataSource.length;
      this.api
        .exec<any>('PS', 'PurchaseInvoicesLinesBusiness', 'SetDefaultAsync', [
          this.purchaseinvoices.recID,
        ])
        .subscribe((res) => {
          if (res) {
            res.rowNo = idx + 1;
            this.gridPurchase.addRow(res, idx);
          }
        });
    } else {
      let idx = this.gridInvoices.dataSource.length;
      this.api
        .exec<any>('AC', 'VATInvoicesBusiness', 'SetDefaultAsync', [
          this.purchaseinvoices.recID,
        ])
        .subscribe((res) => {
          if (res) {
            res.rowNo = idx + 1;
            this.gridInvoices.addRow(res, idx);
          }
        });
    }
  }
  deleteRow(data) {
    if (this.detailActive == 1) {
      if (data.vatid != null) {
        this.countDetail--;
        if (this.countDetail == 0) {
          this.purchaseinvoices.invoiceForm = '';
          this.purchaseinvoices.invoiceSeri = '';
          this.purchaseinvoices.invoiceNo = '';
          this.acService
            .addData(
              'ERM.Business.PS',
              'PurchaseInvoicesBusiness',
              'UpdateAsync',
              [this.purchaseinvoices]
            )
            .subscribe((res) => {});
        }
      }
      this.api
        .exec('PS', 'PurchaseInvoicesLinesBusiness', 'DeleteLineAsync', [
          data.recID,
        ])
        .subscribe((res: any) => {
          if (res) {
            this.api
              .exec('AC', 'VATInvoicesBusiness', 'DeleteVATfromPurchaseAsync', [
                this.purchaseinvoices.recID,
                data.recID,
              ])
              .subscribe((res: any) => {});
          }
        });
      this.gridPurchase.deleteRow(data);
    } else {
      this.api
        .exec('AC', 'VATInvoicesBusiness', 'DeleteLineAsync', [data.recID])
        .subscribe((res: any) => {});
      this.gridInvoices.deleteRow(data);
    }
    this.notification.notifyCode('SYS008', 0, '');
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
  checkValidateLine() {
    this.gridPurchase.dataSource.forEach((element) => {
      var keygrid = Object.keys(this.gridViewSetupLines);
      var keymodel = Object.keys(element);
      for (let index = 0; index < keygrid.length; index++) {
        if (this.gridViewSetupLines[keygrid[index]].isRequire == true) {
          for (let i = 0; i < keymodel.length; i++) {
            if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
              if (
                element[keymodel[i]] === null ||
                String(element[keymodel[i]]).match(/^ *$/) !== null
              ) {
                this.notification.notifyCode(
                  'SYS009',
                  0,
                  '"' + this.gridViewSetupLines[keygrid[index]].headerText + '"'
                );
                this.validate++;
              }
            }
          }
        }
      }
    });
  }
  detaiClick(e) {
    this.detailActive = e;
  }
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
          this.objectvatinvoices
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
    if (this.gridPurchase.dataSource.length > 0) {
      this.checkValidateLine();
    }
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      if (this.formType == 'add') {
        this.purchaseInvoicesLines = this.gridPurchase.dataSource;
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
}
