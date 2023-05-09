import {ChangeDetectorRef, Component, ElementRef, Injector, OnInit, Optional, ViewChild} from '@angular/core';
import { AuthStore, CodxComboboxComponent, CodxFormComponent, CodxGridviewV2Component, CodxInputComponent, DataRequest, DialogData, DialogModel, DialogRef, FormModel, NotificationsService, RequestOption, UIComponent } from 'codx-core';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { InventoryJournalLines } from '../../../models/InventoryJournalLines.model';
import { IJournal } from '../../../journals/interfaces/IJournal.interface';
import { Reason } from '../../../models/Reason.model';
import { EditSettingsModel, row } from '@syncfusion/ej2-angular-grids';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { CodxAcService } from '../../../codx-ac.service';
import { ActivatedRoute } from '@angular/router';
import { JournalService } from '../../../journals/journals.service';
import { Observable } from 'rxjs';
import { InventoryJournals } from '../../../models/InventoryJournals.model';
import { PopAddLineinventoryComponent } from '../pop-add-lineinventory/pop-add-lineinventory.component';


@Component({
  selector: 'lib-pop-add-receipt-transaction',
  templateUrl: './pop-add-receipt-transaction.component.html',
  styleUrls: ['./pop-add-receipt-transaction.component.css']
})
export class PopAddReceiptTransactionComponent extends UIComponent implements OnInit{

  //#region Constructor

  @ViewChild('gridInventoryJournalLine')
  public gridInventoryJournalLine: CodxGridviewV2Component;
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('cardbodyRef') cardbodyRef: ElementRef;
  @ViewChild('inventoryRef') inventoryRef: ElementRef;
  @ViewChild('noteRef') noteRef: ElementRef;
  @ViewChild('tabObj') tabObj: TabComponent;
  @ViewChild('warehouse') warehouse: CodxInputComponent;

  keymodel: any = [];
  headerText: string;
  dialog!: DialogRef;
  inventoryJournal: InventoryJournals;
  formType: any;
  gridViewSetup: any;
  validate: any;
  journalNo: any;
  modeGrid: any;
  inventoryJournalLines: Array<InventoryJournalLines> = [];
  inventoryJournalLinesDelete: Array<InventoryJournalLines> = [];
  lockFields = [];
  pageCount: any;
  tab: number = 0;
  total: any = 0;
  hasSaved: any = false;
  journal: IJournal;
  voucherNoPlaceholderText$: Observable<string>;
  fmInventoryJournalLines: FormModel = {
    formName: 'InventoryJournalLines',
    gridViewName: 'grvInventoryJournalLines',
    entityName: 'IV_InventoryJournalLines',
  };
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
  key: any;
  columnChange: string = '';
  vllWarehouse: any;
  authStore: AuthStore;

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
    this.authStore = inject.get(AuthStore);
    this.dialog = dialog;
    this.routerActive.queryParams.subscribe((res) => {
      if (res && res?.journalNo) this.journalNo = res.journalNo;
    });
    this.headerText = dialogData.data?.headerText;
    this.formType = dialogData.data?.formType;
    this.inventoryJournal = dialog.dataService.dataSelected;
    this.cache
      .gridViewSetup('InventoryJournals', 'grvInventoryJournals')
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
  }

  //#endregion

  //#region Init

  onInit(): void {
    this.loadInit();
    this.loadTotal();
    this.loadJournal();
  }

  ngAfterViewInit() {
    this.form.formGroup.patchValue(this.inventoryJournal);
  }

  //#endregion

  //#region Event

  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.deleteRow(data);
        break;
      case 'SYS03':
        //this.editPopupLine(data);
        break;
      case 'SYS04':
        //this.copyRow(data);
        break;
    }
  }

  valueChange(e: any){
    if(e.data)
    {
      switch(e)
      {
        case e.field.toLowerCase() === 'warehouseID':
          this.inventoryJournal.warehouseID = e.data;
          break;
        case e.field.toLowerCase() === 'objectid':
          this.inventoryJournal.objectID = e.data;
          break;
        case e.field.toLowerCase() === 'reasonid':
          this.inventoryJournal.reasonID = e.data;
          break;
        case e.field.toLowerCase() === 'memo':
          this.inventoryJournal.memo = e.data;
          break;
        case e.field.toLowerCase() === 'currencyid':
          this.inventoryJournal.currencyID = e.data;
          break;
        case e.field.toLowerCase() === 'voucherdate':
          this.inventoryJournal.voucherDate = e.data;
          break;
        case e.field.toLowerCase() === 'exchangerate':
          this.inventoryJournal.voucherDate = e.data;
          break;
      }
    }
  }

  gridCreated(e, grid) {
    let hBody, hTab, hNote;
    if (this.cardbodyRef)
      hBody = this.cardbodyRef.nativeElement.parentElement.offsetHeight;
    if (this.inventoryRef) hTab = (this.inventoryRef as any).element.offsetHeight;
    if (this.noteRef) hNote = this.noteRef.nativeElement.clientHeight;

    this.gridHeight = hBody - (hTab + hNote + 180);
    grid.disableField(this.lockFields);
  }

  lineChanged(e: any) {
    // if (e.field == 'itemID') {
    //   this.loadItemID(e.value);
    // }
    // if (e.data?.isAddNew == null) {
    //   this.api
    //     .exec(
    //       'PS',
    //       'PurchaseInvoicesLinesBusiness',
    //       'CheckExistPurchaseInvoicesLines',
    //       [e.data.recID]
    //     )
    //     .subscribe((res: any) => {
    //       if (res) {
    //         e.data.isAddNew = res;
    //       } else {
    //         this.api
    //           .exec('AC', 'VATInvoicesBusiness', 'UpdateVATfromPurchaseAsync', [
    //             this.purchaseinvoices,
    //             e.data,
    //           ])
    //           .subscribe(() => {});
    //       }
    //     });
    // }
  }

  addRow(){
    this.loadModegrid();
    // this.checkValidate();
    // if (this.validate > 0) {
    //   this.validate = 0;
    //   return;
    // } else {
    //   switch (this.formType) {
    //     case 'add':
    //       if (this.hasSaved) {
    //         this.dialog.dataService.updateDatas.set(
    //           this.inventoryJournal['_uuid'],
    //           this.inventoryJournal
    //         );
    //         this.dialog.dataService
    //           .save(null, 0, '', 'SYS006', true)
    //           .subscribe((res) => {
    //             if (res && res.update.data != null) {
    //               this.loadModegrid();
    //             }
    //           });
    //       } else {
    //         this.journalService.handleVoucherNoAndSave(
    //           this.journal,
    //           this.inventoryJournal,
    //           'IV',
    //           'IV_InventoryJournals',
    //           this.form,
    //           this.formType === 'edit',
    //           () => {
    //             this.dialog.dataService
    //               .save(null, 0, '', 'SYS006', true)
    //               .subscribe((res) => {
    //                 if (res && res.save.data != null) {
    //                   this.hasSaved = true;
    //                   this.loadModegrid();
    //                 }
    //               });
    //           }
    //         );
    //       }
    //       break;
    //     case 'edit':
    //       this.dialog.dataService.updateDatas.set(
    //         this.inventoryJournal['_uuid'],
    //         this.inventoryJournal
    //       );
    //       this.dialog.dataService
    //         .save(null, 0, '', '', false)
    //         .subscribe((res) => {
    //           if (res && res.update.data != null) {
    //             this.loadModegrid();
    //           }
    //         });
    //       break;
    //   }
    // }
  }

  openPopupLine(data) {
    var obj = {
      headerText: this.headerText,
      data: data,
      lockFields: this.lockFields,
      type: 'add',
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'InventoryJournalLines';
    dataModel.gridViewName = 'grvInventoryJournalLines';
    dataModel.entityName = 'IV_InventoryJournalLines';
    opt.FormModel = dataModel;
    this.cache
      .gridViewSetup('InventoryJournalLines', 'grvInventoryJournalLines')
      .subscribe((res) => {
        if (res) {
          var dialogs = this.callfc.openForm(
            PopAddLineinventoryComponent,
            '',
            900,
            850,
            '',
            obj,
            '',
            opt
          );
          dialogs.closed.subscribe(() => {
            var dataline = JSON.parse(localStorage.getItem('dataline'));
            if (dataline != null) {
              this.inventoryJournalLines.push(dataline);
              this.keymodel = Object.keys(dataline);
              this.loadTotal();
            }
            window.localStorage.removeItem('dataline');
          });
        }
      });
  }

  setDefault(o) {
    return this.api.exec('IV', 'InventoryJournalsBusiness', 'SetDefaultAsync', [
      this.journalNo,
    ]);
  }

  close() {
    this.dialog.close();
  }

  deleteRow(data){}

  //#endregion

  //#region Method

  onSaveAdd(){
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      this.inventoryJournal.status = '1';
      if (this.hasSaved) {
        this.dialog.dataService.updateDatas.set(
          this.inventoryJournal['_uuid'],
          this.inventoryJournal
        );
        this.dialog.dataService.save().subscribe((res) => {
          if (res && res.update.data != null) {
            this.clearInventoryJournal();
            this.dialog.dataService.clear();
            this.dialog.dataService
              .addNew((o) => this.setDefault(o))
              .subscribe((res) => {
                this.inventoryJournal = res;
                this.form.formGroup.patchValue(this.inventoryJournal);
                this.hasSaved = false;
              });
          }
        });
      } else {
        // nếu voucherNo đã tồn tại,
        // hệ thống sẽ đề xuất một mã mới theo thiệt lập đánh số tự động
        this.journalService.handleVoucherNoAndSave(
          this.journal,
          this.inventoryJournal,
          'IV',
          'IV_InventoryJournals',
          this.form,
          this.formType === 'edit',
          () => {
            this.dialog.dataService.save().subscribe((res) => {
              if (res && res.save.data != null) {
                this.clearInventoryJournal();
                this.dialog.dataService.clear();
                this.dialog.dataService
                  .addNew((o) => this.setDefault(o))
                  .subscribe((res) => {
                    this.inventoryJournal = res;
                    this.form.formGroup.patchValue(this.inventoryJournal);
                  });
              }
            });
          }
        );
      }
    }
  }

  onSave() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      switch (this.formType) {
        case 'add':
        case 'copy':
          this.inventoryJournal.status = '1';
          if (this.hasSaved) {
            this.dialog.dataService.updateDatas.set(
              this.inventoryJournal['_uuid'],
              this.inventoryJournal
            );
            this.dialog.dataService
              .save(null, 0, '', 'SYS006', true)
              .subscribe((res) => {
                if (res && res.update.data != null) {
                  this.dialog.close({
                    update: true,
                    data: res.update,
                  });
                  this.dt.detectChanges();
                }
              });
          } else {
            // nếu voucherNo đã tồn tại,
            // hệ thống sẽ đề xuất một mã mới theo thiệt lập đánh số tự động
            this.journalService.handleVoucherNoAndSave(
              this.journal,
              this.inventoryJournal,
              'IV',
              'IV_InventoryJournals',
              this.form,
              this.formType === 'edit',
              () => {
                this.dialog.dataService.save().subscribe((res) => {
                  if (res && res.save.data != null) {
                    this.dialog.close();
                    this.dt.detectChanges();
                  }
                });
              }
            );
          }
          break;
        case 'edit':
          this.journalService.handleVoucherNoAndSave(
            this.journal,
            this.inventoryJournal,
            'IV',
            'IV_InventoryJournals',
            this.form,
            this.formType === 'edit',
            () => {
              if (this.inventoryJournal.status == '0') {
                this.inventoryJournal.status = '1';
              }
              this.dialog.dataService.updateDatas.set(
                this.inventoryJournal['_uuid'],
                this.inventoryJournal
              );
              this.dialog.dataService.save().subscribe((res) => {
                if (res && res.update.data != null) {
                  this.dialog.close({
                    update: true,
                    data: res.update,
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

  //#endregion

  //#region Function

  loadTotal() {
    var totals = 0;
    this.inventoryJournalLines.forEach((element) => {
      totals = totals + element.costAmt;
    });
    this.total = totals.toLocaleString('it-IT', {
      style: 'currency',
      currency: 'VND',
    });
  }

  clearInventoryJournal() {
    this.inventoryJournalLines = [];
  }

  checkValidate() {
    // tu dong khi luu, khong check voucherNo
    let ignoredFields: string[] = [];
    if (this.journal.voucherNoRule === '2') {
      ignoredFields.push('VoucherNo');
    }
    ignoredFields = ignoredFields.map((i) => i.toLowerCase());

    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.inventoryJournal);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        if (ignoredFields.includes(keygrid[index].toLowerCase())) {
          continue;
        }

        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.inventoryJournal[keymodel[i]] == null ||
              String(this.inventoryJournal[keymodel[i]]).match(/^ *$/) !== null
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
  loadModegrid() {
    let data = new InventoryJournalLines();
    let idx;
    this.api
      .exec<any>('IV', 'InventoryJournalLinesBusiness', 'SetDefaultAsync', [
        this.inventoryJournal,
        data,
      ])
      .subscribe((res) => {
        if (res) {
          idx = this.inventoryJournalLines.length;
          res.rowNo = idx + 1;
          this.openPopupLine(res);
        }
      });
  }

  loadInit(){
    if (this.formType == 'edit') {
      this.api
        .exec('IV', 'InventoryJournalLinesBusiness', 'LoadDataAsync', [
          this.inventoryJournal.recID,
        ])
        .subscribe((res: any) => {
          if (res.length > 0) {
            this.keymodel = Object.keys(res[0]);
            this.inventoryJournalLines = res;
            this.inventoryJournalLines.forEach((element) => {
              this.loadTotal();
            });
          }
        });
    }
    if (
      this.inventoryJournal &&
      this.inventoryJournal.unbounds &&
      this.inventoryJournal.unbounds.lockFields &&
      this.inventoryJournal.unbounds.lockFields.length
    ) {
      this.lockFields = this.inventoryJournal.unbounds
        .lockFields as Array<string>;
    }
    if (this.inventoryJournal.status == '0' && this.formType == 'edit') {
      this.hasSaved = true;
    }
  }

  loadJournal(){
    const options = new DataRequest();
    options.entityName = 'AC_Journals';
    options.predicates = 'JournalNo=@0';
    options.dataValues = this.inventoryJournal.journalNo;
    options.pageLoading = false;
    this.acService.loadDataAsync('AC', options).subscribe((res) => {
      this.journal = res[0]?.dataValue
        ? { ...res[0], ...JSON.parse(res[0].dataValue) }
        : res[0];
      this.modeGrid = this.journal.inputMode;
    });
  }

  

  //#endregion
}
