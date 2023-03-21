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
  headerText: string;
  formModel: FormModel;
  dialog!: DialogRef;
  formType: any;
  gridViewSetup: any;
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
    this.routerActive.queryParams.subscribe((res) => {
      if (res && res?.recID) this.parentID = res.recID;
    });
    this.headerText = dialogData.data?.headerText;
    this.formType = dialogData.data?.formType;

    this.cache
      .gridViewSetup('PurchaseInvoices', 'grvPurchaseInvoices')
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
    this.api
      .exec('AC', 'JournalsBusiness', 'GetDefaultAsync', [this.parentID])
      .subscribe((res: any) => {
        this.VATType = res.vatType;
        if (this.VATType != '0' || this.VATType != null) {
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
                  });
              }
            });
        }
      });
  }

  onInit(): void {}

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
  valueChangeVATLine(e: any) {
    this.vatinvoices[e.field] = e.data;
    this.purchaseinvoices[e.field] = e.data;
  }
  gridCreated(e) {
    let hBody, hTab, hNote;
    if (this.cardbodyRef)
      hBody = this.cardbodyRef.nativeElement.parentElement.offsetHeight;
    if (this.cashRef) hTab = (this.cashRef as any).element.offsetHeight;
    if (this.noteRef) hNote = this.noteRef.nativeElement.clientHeight;
    this.gridHeight = hBody - (hTab + hNote + 100); //40 là header của tab
  }
  cellChangedPurchase(e: any) {}
  cellChangedInvoice(e: any) {
    if (e.field == 'vatid' && e.data.vatid != null) {
      e.data.isTaxDetail = true;
      this.loadInvoiceInfo();
    }
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
  loadInvoiceInfo() {
    this.countDetail = 0;
    this.gridInvoices.dataSource.forEach((element) => {
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
  deleteRow(data){
    if (this.detailActive == 1) {
      this.gridPurchase.deleteRow(data);
    }else{
      if (data.vatid != null) {
        this.countDetail --;
      }
      this.gridInvoices.deleteRow(data)
    }
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
  detaiClick(e) {
    this.detailActive = e;
  }
  saveVAT() {
    if (this.VATType == '1') {
      this.vatinvoices.isTaxDetail = false;
      this.api
        .exec('AC', 'VATInvoicesBusiness', 'AddVATInvoiceAsync', [
          this.vatinvoices,
        ])
        .subscribe((res: any) => {});
    } else {
      this.objectvatinvoices = this.gridInvoices.dataSource;
      this.api
        .exec('AC', 'VATInvoicesBusiness', 'AddVATInvoiceAsync', [
          this.vatinvoices,
          this.objectvatinvoices
        ])
        .subscribe((res: any) => {});
    }
  }
  onSave() {
    this.checkValidate();
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
                  [this.purchaseInvoicesLines]
                )
                .subscribe((res) => {
                  if (res) {
                    if (this.VATType == '1' || this.VATType == '2') {
                      this.saveVAT();
                    }
                  }
                });
              this.dialog.close();
              this.dt.detectChanges();
            } else {
            }
          });
      }
      // if (this.formType == 'edit') {
      //   this.dialog.dataService
      //     .save((opt: RequestOption) => {
      //       opt.methodName = 'UpdateAsync';
      //       opt.className = 'CashReceiptsBusiness';
      //       opt.assemblyName = 'AC';
      //       opt.service = 'AC';
      //       opt.data = [this.cashreceipts];
      //       return true;
      //     })
      //     .subscribe((res) => {
      //       if (res != null) {
      //         this.acService
      //           .addData(
      //             'ERM.Business.AC',
      //             'CashReceiptsLinesBusiness',
      //             'UpdateAsync',
      //             [this.cashreceiptslines, this.cashreceiptslinesDelete]
      //           )
      //           .subscribe((res) => {});
      //         this.dialog.close();
      //         this.dt.detectChanges();
      //       } else {
      //       }
      //     });
      // }
    }
  }
}
