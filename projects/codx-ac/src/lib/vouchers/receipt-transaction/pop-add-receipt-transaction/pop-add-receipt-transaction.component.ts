import {ChangeDetectorRef, Component, ElementRef, Injector, OnInit, Optional, ViewChild, ViewEncapsulation} from '@angular/core';
import { AuthStore, CodxComboboxComponent, CodxFormComponent, CodxGridviewV2Component, CodxInplaceComponent, CodxInputComponent, DataRequest, DialogData, DialogModel, DialogRef, FormModel, NotificationsService, RequestOption, UIComponent, Util } from 'codx-core';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import { Dialog, isCollide } from '@syncfusion/ej2-angular-popups';
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
  styleUrls: ['./pop-add-receipt-transaction.component.css'],
  encapsulation: ViewEncapsulation.None,
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
  reason: Array<Reason> = [];
  warehouseName: any;
  headerText: string;
  dialog!: DialogRef;
  inventoryJournal: InventoryJournals;
  formType: any;
  gridViewSetup: any;
  gridViewSetupLine: any;
  validate: any = 0;
  journalNo: any;
  modeGrid: any;
  inventoryJournalLines: Array<InventoryJournalLines> = [];
  inventoryJournalLinesDelete: Array<InventoryJournalLines> = [];
  lockFields = [];
  tab: number = 0;
  total: any = 0;
  hasSaved: any = false;
  isSaveMaster: any = false;
  vllReceipt: any = 'AC116';
  vllIssue: any = 'AC117';
  funcID: any;
  entityMaster: any;
  loading: any = false;
  loadingform: any = true;
  journal: IJournal;
  voucherNoPlaceholderText$: Observable<string>;
  fmInventoryJournalLines: FormModel = {
    formName: 'InventoryJournalLines',
    gridViewName: 'grvInventoryJournalLines',
    entityName: '',
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
    private elementRef: ElementRef,
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
    this.entityMaster = dialogData.data?.entityMaster;
    this.funcID = dialog.formModel.funcID;
    this.cache
      .gridViewSetup('InventoryJournals', 'grvInventoryJournals')
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
    this.cache
    .gridViewSetup('InventoryJournalLines', 'grvInventoryJournalLines')
    .subscribe((res) => {
      if (res) {
        this.gridViewSetupLine = res;
        this.lockFields.forEach((field) => {
          this.gridViewSetupLine[field].isVisible = false;
        });
      }
    });
    switch(this.funcID)
    {
      case 'ACT0708':
        this.cache.valueList(this.vllReceipt).subscribe((res) => {
          this.fmInventoryJournalLines.entityName = res?.datas[1].value;
        });
        break;
      case 'ACT0714':
        this.cache.valueList(this.vllIssue).subscribe((res) => {
          this.fmInventoryJournalLines.entityName = res?.datas[1].value;
        });
        break;
    }
  }

  //#endregion

  //#region Init

  onInit(): void {
    this.loadInit();
    this.loadTotal();
  }

  ngAfterViewInit() {
    this.form.formGroup.patchValue(this.inventoryJournal);
    (this.elementRef.nativeElement as HTMLElement).addEventListener(
      'keyup',
      (e: KeyboardEvent) => {
        if (e.key == 'Tab') {
          if (this.gridInventoryJournalLine) {
            this.gridInventoryJournalLine.autoAddRow = true;
          }  
          if (document.activeElement.className == 'e-tab-wrap') {
            var element = document.getElementById('btnadd');
            element.focus();
          }
        }
      }
    );
    (document.body as HTMLElement).addEventListener(
      'click',
      (e: any) => {
        if (
          e.target.closest('.e-grid') == null &&
          e.target.closest('.e-popup') == null &&
          e.target.closest('.edit-value') == null
        ) {
          if ( this.modeGrid == "1" || this.gridInventoryJournalLine.gridRef.isEdit) {
            this.gridInventoryJournalLine.endEdit();
            this.gridInventoryJournalLine.autoAddRow = false;
          }
        }else{
          if (this.gridInventoryJournalLine) {
            this.gridInventoryJournalLine.autoAddRow = false;
          }
        }
      }
    );
    this.dt.detectChanges();
  }

  //#endregion

  //#region Event

  gridCreated() {
    this.gridInventoryJournalLine.hideColumns(this.lockFields);
    setTimeout(() => {
      this.loadingform = false;
    }, 1000);
  }

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

  valueChange(e: any){
    let field = e.field.toLowerCase();
    if(e.data)
    {
      switch(field)
      {
        case'warehouseid':
          {
            this.inventoryJournal.warehouseID = e.data;
            this.inventoryJournal.warehouseName = e.component.itemsSelected[0].WarehouseName;
            this.form.formGroup.patchValue(this.inventoryJournal);
          }
          break;
        case 'warehousename':
          this.inventoryJournal.warehouseName = e.data;
          break;

          case 'reasonid':
            this.inventoryJournal.reasonID = e.data;
          let text = e?.component?.itemsSelected[0]?.ReasonName;
          this.setReason(field, text, 0);
          break;
        case 'objectid':
          this.inventoryJournal.objectID = e.data;
          let data = e.component.itemsSelected[0];
          this.inventoryJournal.objectType = data['ObjectType'];
          this.inventoryJournal.objectName = data['ObjectName'];
          this.setReason(field, data['ObjectName'], 1);
          break;
        case 'memo':
          this.inventoryJournal.memo = e.data;
          break;
        case 'currencyid':
          {
            this.inventoryJournal.currencyID = e.data;
            this.api.exec('IV', 'InventoryJournalsBusiness', 'GetExchangeRateAsync', [this.inventoryJournal])
            .subscribe((res: any) => {
              this.inventoryJournal.exchangeRate = res.exchangeRate;
              this.form.formGroup.patchValue(this.inventoryJournal);
            });
          }
          break;
          break;
        case 'voucherdate':
          this.inventoryJournal.voucherDate = e.data;
          break;
        case 'exchangerate':
          this.inventoryJournal.exchangeRate = e.data;
          break;
      }
    }
  }

  lineChanged(e: any) {
    // if (!e.data[e.field]) {
    //   return;
    // }

    // if (e.field === 'itemID') {
    //   this.setPredicatesByItemID(e.data.itemID);
    // }

    // if (e.field.toLowerCase() === 'idim4') {
    //   this.setPredicateByIDIM4(e.data[e.field]);
    // }

    const postFields: string[] = [
      'itemID',
      'costPrice',
      'quantity',
      'costAmt',
      'lineType',
      'umid',
      'idiM0',
      'idiM1',
      'idiM2',
      'idiM3',
      'idiM4',
      'idiM5',
      'idiM6',
      'idiM7',
      'idiM8',
      'idiM9',
    ];
    if (postFields.includes(e.field)) {
      this.api
        .exec('IV', 'InventoryJournalLinesBusiness', 'ValueChangedAsync', [
          e.field,
          this.inventoryJournal,
          e.data,
        ])
        .subscribe((line) => {
          console.log(line);
          
          this.inventoryJournalLines[e.idx] = Object.assign(this.inventoryJournalLines[e.idx], line);
        });
    }
    // switch(e.field)
    // {
    //   case 'itemID':
    //     this.loadItemID(e.value);
    //     break;
    //   case 'idiM4':
    //     this.loadWarehouseID(e.value);
    //     break;
    // }
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
        .execAction<any>(this.fmInventoryJournalLines.entityName, [e], 'SaveAsync')
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

  onEdit(e: any) {
    this.checkValidateLine(e);
    if (this.validate > 0) {
      this.validate = 0;
      this.notification.notifyCode('SYS021', 0, '');
      return;
    } else {
      this.api
        .execAction<any>(this.fmInventoryJournalLines.entityName, [e], 'UpdateAsync')
        .subscribe((save) => {
          if (save) {
            this.notification.notifyCode('SYS007', 0, '');
            this.hasSaved = true;
            this.isSaveMaster = true;
            this.loadTotal();
          }
        });
    }
  }

  onDiscard(){
    this.dialog.dataService
      .delete([this.inventoryJournal], true, null, '', 'AC0010', null, null, false)
      .subscribe((res) => {
        if (res.data != null) {
          this.dialog.close();
          this.dt.detectChanges();
        }
      });
  }

  onDoubleClick(data)
  {
    // this.loadPredicate(this.gridInventoryJournalLine.visibleColumns, data.rowData);
  }

  close() {
    if (this.modeGrid == "2" || !this.gridInventoryJournalLine.gridRef.isEdit) {
      if (this.hasSaved) {
        this.dialog.close({
          update: true,
          data: this.inventoryJournal,
        });
      } else {
        this.dialog.close();
      }
    }
  }

  //#endregion

  //#region Method

  onSaveAdd(){
    this.checkValidate();
    this.checkTransLimit(true);
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      this.save(false);
    }
  }

  onSave() {
    this.checkValidate();
    this.checkTransLimit(true);
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      this.save(true);
    }
  }

  onSaveMaster(){
    this.checkValidate();
    this.checkTransLimit(false);
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      this.dialog.dataService.updateDatas.set(
        this.inventoryJournal['_uuid'],
        this.inventoryJournal
      );
      this.dialog.dataService.save(null, 0, '', '', false).subscribe((res) => {
        if (res && res.update.data != null) {
          this.dt.detectChanges();
        }
      });
    }
  }

  //#endregion

  //#region Function

  save(isclose: boolean)
  {
    if (this.modeGrid == "2" || !this.gridInventoryJournalLine.gridRef.isEdit)
    {
      this.loading = true;
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
                if(res.update.error)
                {
                  this.inventoryJournal.status = '0';
                }
                if (res && res.update.data != null && res.update.error != true) 
                {
                  if(isclose)
                  {
                    this.dialog.close({
                      update: true,
                      data: res.update,
                    });
                  }
                  else
                  {
                    this.clearInventoryJournal();
                    this.dialog.dataService.clear();
                    this.dialog.dataService
                      .addNew((o) => this.setDefault(o))
                      .subscribe((res) => {
                      this.inventoryJournal = res;
                      this.setWarehouseID();
                      this.form.formGroup.patchValue(this.inventoryJournal);
                      this.hasSaved = false;
                      this.isSaveMaster = false;
                      });
                      this.dt.detectChanges();
                  }
                  this.loading = false;
                }
                else{
                  this.loading = false;
                }
              });
          } else {
            // nếu voucherNo đã tồn tại,
            // hệ thống sẽ đề xuất một mã mới theo thiệt lập đánh số tự động
            this.journalService.handleVoucherNoAndSave(
              this.journal,
              this.inventoryJournal,
              'IV',
              this.entityMaster,
              this.form,
              this.formType === 'edit',
              () => {
                this.dialog.dataService.save().subscribe((res) => {
                  if(res.save.error)
                  {
                    this.inventoryJournal.status = '0';
                  }
                  if (res && res.save.data != null && res.save.error != true) {
                    if(isclose)
                    {
                      this.dialog.close();
                    }
                    else
                    {
                      this.clearInventoryJournal();
                      this.dialog.dataService.clear();
                      this.dialog.dataService
                      .addNew((o) => this.setDefault(o))
                      .subscribe((res) => {
                        this.inventoryJournal = res;
                        this.setWarehouseID();
                        this.form.formGroup.patchValue(this.inventoryJournal);
                      });
                    }
                    this.dt.detectChanges();
                  }
                  else {
                    this.loading = false;
                    this.inventoryJournal.unbounds.isAddNew = true;
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
            this.entityMaster,
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
              this.dialog.dataService.save(null, 0, '', '', true).subscribe((res) => {
                if (res && res.update.data != null) {
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

  setDefault(o) {
    return this.api.exec('IV', 'InventoryJournalsBusiness', 'SetDefaultAsync', [
      this.journalNo,
    ]);
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
    if(this.formType == 'copy' && this.inventoryJournal.warehouseID)
    {
      this.getWarehouseName(this.inventoryJournal.warehouseID);
    }
    if(this.formType == 'add')
    {
      this.setWarehouseID();
    }
    if (
      this.inventoryJournal &&
      this.inventoryJournal.unbounds &&
      this.inventoryJournal.unbounds.lockFields &&
      this.inventoryJournal.unbounds.lockFields.length
    ){
      this.lockFields = this.inventoryJournal.unbounds
        .lockFields as Array<string>;
    }
    else{
      this.api
        .exec('IV', 'InventoryJournalsBusiness', 'SetUnboundsAsync', [
          this.inventoryJournal
        ])
        .subscribe((res: any) => {
          if (res.unbounds && res.unbounds.lockFields && res.unbounds.lockFields.length) {
            this.inventoryJournal.unbounds = res.unbounds;
            this.lockFields = this.inventoryJournal.unbounds
              .lockFields as Array<string>;
          }
        });
    }
    if (this.inventoryJournal.status == '0' && this.formType == 'edit') {
      this.hasSaved = true;
    }
    this.loadJournal();
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
      this.modeGrid = this.journal.addNewMode;
    });
  }

  loadTotal() {
    var totals = 0;
    this.inventoryJournalLines.forEach((element) => {
      totals = totals + element.costAmt;
    });
    this.total = totals;
    this.inventoryJournal.totalAmt = totals;
    this.total = totals.toLocaleString('it-IT')
    if (this.isSaveMaster ) {
      this.onSaveMaster();
    }
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
              this.inventoryJournal['_uuid'],
              this.inventoryJournal
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
              this.inventoryJournal,
              'IV',
              this.entityMaster,
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
            this.inventoryJournal['_uuid'],
            this.inventoryJournal
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
          switch (this.modeGrid) {
            case '1':
              idx = this.gridInventoryJournalLine.dataSource.length;
              res.rowNo = idx + 1;
              this.gridInventoryJournalLine.addRow(res, idx);
              // this.loadPredicate(this.gridInventoryJournalLine.visibleColumns, res);
              break;
            case '2':
              idx = this.inventoryJournalLines.length;
              res.rowNo = idx + 1;
              this.openPopupLine(res, 'add');
              break;
          }
        }
      });
  }

  openPopupLine(data, type: string) {
    var obj = {
      headerText: this.headerText,
      data: { ...data },
      dataline: this.inventoryJournalLines,
      dataInventoryJournal: this.inventoryJournal,
      lockFields: this.lockFields,
      type: type,
      entityLine: this.fmInventoryJournalLines.entityName,
      funcID: this.funcID,
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'InventoryJournalLines';
    dataModel.gridViewName = 'grvInventoryJournalLines';
    dataModel.entityName = this.fmInventoryJournalLines.entityName;
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
          dialogs.closed.subscribe((res) => {
            if (res.event != null) {
              var dataline = res.event['data'];
              if(dataline)
              {
                this.inventoryJournalLines.push(dataline);
              }
              this.hasSaved = true;
              this.isSaveMaster = true;
              this.loadTotal();
            }
          });
        }
      });
  }

  editRow(data) {
    switch (this.modeGrid) {
      case '1':
        this.gridInventoryJournalLine.gridRef.selectRow(Number(data.index));
        this.gridInventoryJournalLine.gridRef.startEdit();
        // this.loadPredicate(this.gridInventoryJournalLine.visibleColumns, data);
        break;
      case '2':
        let index = this.inventoryJournalLines.findIndex(
          (x) => x.recID == data.recID
        );
        var obj = {
          headerText: this.headerText,
          data: { ...data },
          dataInventoryJournal: this.inventoryJournal,
          type: 'edit',
          lockFields: this.lockFields,
          journal: this.journal,
          entityLine: this.fmInventoryJournalLines.entityName,
          funcID: this.funcID,
        };
        let opt = new DialogModel();
        let dataModel = new FormModel();
        dataModel.formName = 'InventoryJournalLines';
        dataModel.gridViewName = 'grvInventoryJournalLines';
        dataModel.entityName = this.fmInventoryJournalLines.entityName;
        opt.FormModel = dataModel;
        opt.Resizeable = false;
        this.cache
          .gridViewSetup('InventoryJournalLines', 'grvInventoryJournalLines')
          .subscribe((res) => {
            if (res) {
              var dialogs = this.callfc.openForm(
                PopAddLineinventoryComponent,
                '',
                650,
                600,
                '',
                obj,
                '',
                opt
              );
              dialogs.closed.subscribe((res) => {
                if (res.event != null) {
                  var dataline = res.event['data'];
                  this.inventoryJournalLines[index] = dataline;
                  this.hasSaved = true;
                  this.isSaveMaster = true;
                  this.loadTotal();
                }
              });
            }
          });
        break;
    }
  }

  copyRow(data) {
    let idx;
    this.api
      .exec<any>('IV', 'InventoryJournalLinesBusiness', 'SetDefaultAsync', [
        this.inventoryJournal,
        data,
      ])
      .subscribe((res) => {
        if (res) {
          switch (this.modeGrid) {
            case '1':
              idx = this.gridInventoryJournalLine.dataSource.length;
              res.rowNo = idx + 1;
              res.recID = Util.uid();
              this.gridInventoryJournalLine.addRow(res, idx);
              // this.loadPredicate(this.gridInventoryJournalLine.visibleColumns, data);
              break;
            case '2':
              idx = this.inventoryJournalLines.length;
              res.rowNo = idx + 1;
              res.recID = Util.uid();
              this.openPopupLine(res, 'copy');
              break;
          }
        }
      });
  }
  
  deleteRow(data) {
    this.notification.alertCode('SYS030', null).subscribe((res) => {
      if (res.event.status === 'Y') {
        switch (this.modeGrid) {
          case '1':
            this.gridInventoryJournalLine.deleteRow(data);
            if (this.gridInventoryJournalLine.dataSource.length > 0) {
              for (
                let i = 0;
                i < this.gridInventoryJournalLine.dataSource.length;
                i++
              ) {
                this.gridInventoryJournalLine.dataSource[i].rowNo = i + 1;
              }
            }
            this.inventoryJournalLines = this.gridInventoryJournalLine.dataSource;
            break;
          case '2':
            let index = this.inventoryJournalLines.findIndex(
              (x) => x.recID == data.recID
            );
            this.inventoryJournalLines.splice(index, 1);
            for (let i = 0; i < this.inventoryJournalLines.length; i++) {
              this.inventoryJournalLines[i].rowNo = i + 1;
            }
            break;
        }
        this.api
          .execAction<any>(this.fmInventoryJournalLines.entityName, [data], 'DeleteAsync')
          .subscribe((res) => {
            if (res) {
              this.hasSaved = true;
              this.isSaveMaster = true;
              this.api
                .exec(
                  'IV',
                  'InventoryJournalLinesBusiness',
                  'UpdateAfterDelete',
                  [this.inventoryJournalLines]
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

  checkValidate() {
    // tu dong khi luu, khong check voucherNo
    let ignoredFields: string[] = [];
    if (this.journal.assignRule === '2') {
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

  checkValidateLine(e) {
    var keygrid = Object.keys(this.gridViewSetupLine);
    var keymodel = Object.keys(e);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetupLine[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              e[keymodel[i]] == null ||
              String(e[keymodel[i]]).match(/^ *$/) !== null
            ) {
              this.notification.notifyCode(
                'SYS009',
                0,
                '"' + this.gridViewSetupLine[keygrid[index]].headerText + '"'
              );
              this.validate++;
            }
          }
        }
      }
    }
  }

  checkTransLimit(isShowNotify : boolean){
    if(this.journal.transLimit && this.inventoryJournal.totalAmt > this.journal.transLimit)
    {
      if(isShowNotify)
        this.notification.notifyCode('AC0016');
      this.validate++ ;
    }
  }

  clearInventoryJournal() {
    this.inventoryJournalLines = [];
  }

  // setDataGrid(updateColumn, data) {
  //   if (updateColumn) {
  //     var arrColumn = [];
  //     arrColumn = updateColumn.split(';');
  //     if (arrColumn && arrColumn.length) {
  //       arrColumn.forEach((e) => {
  //         if (e) {
  //           let field = Util.camelize(e);
  //           this.gridInventoryJournalLine.rowDataSelected[field] = data[field];
  //           this.gridInventoryJournalLine.rowDataSelected = {
  //             ...data,
  //           };
  //           this.gridInventoryJournalLine.rowDataSelected.updateColumns = '';
  //         }
  //       });
  //     }
  //   }
  // }
  
  // loadItemID(value) {
  //   let isFocus = true;
  //   let id;
  //   let sArray = [
  //     'packingspecifications',
  //     'styles',
  //     'itemcolors',
  //     'itembatchs',
  //     'itemseries',
  //   ];
  //   var elements = document
  //     .querySelector('.tabLine')
  //     .querySelectorAll('codx-inplace');
  //   elements.forEach((e) => {
  //     var input = window.ng.getComponent(e) as CodxInplaceComponent;
  //     if (sArray.includes(input.dataService.comboboxName.toLowerCase())) {
  //       input.value = "";
  //       input.predicate = 'ItemID="' + value + '"';
  //       input.loadSetting();
  //       if(isFocus)
  //       {
  //         id = e.id;
  //         isFocus = false;
  //       }
  //     }
  //   });
  //   var element = document.getElementById(id);
  //   var codxInplace = window.ng.getComponent(element) as CodxInplaceComponent;
  //   setTimeout(() => {
  //     codxInplace.enableEditMode();
  //   }, 500);
  // }

  // loadItemID(value) {
  //   let sArray = [
  //     'packingspecifications',
  //     'styles',
  //     'itemcolors',
  //     'itembatchs',
  //     'itemseries',
  //   ];
  //   var elements = document
  //     .querySelector('.tabLine')
  //     .querySelectorAll('codx-inplace');
  //   elements.forEach((e) => {
  //     var input = window.ng.getComponent(e) as CodxInplaceComponent;
  //     if (sArray.includes(input.dataService.comboboxName.toLowerCase())) {
  //       input.value = "";
  //       input.predicate = 'ItemID="' + value + '"';
  //       input.loadSetting();
  //     }
  //   });
  // }

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
      let idx = this.gridInventoryJournalLine.visibleColumns.findIndex(
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

  // loadWarehouseID(value) {
  //   let sArray = [
  //     'warehouselocations',
  //   ];
  //   var element = document
  //     .querySelector('.tabLine')
  //     .querySelectorAll('codx-inplace');
  //   element.forEach((e) => {
  //     var input = window.ng.getComponent(e) as CodxInplaceComponent;
  //     if (sArray.includes(input.dataService.comboboxName.toLowerCase())) {
  //       input.value = "";
  //       input.predicate = 'WarehouseID="' + value + '"';
  //       input.loadSetting();
  //     }
  //   });
  // }

  setReason(field, text, idx) {
    if (!this.reason.some((x) => x.field == field)) {
      let transText = new Reason();
      transText.field = field;
      transText.value = text;
      transText.index = idx;
      this.reason.push(transText);
    } else {
      let iTrans = this.reason.find((x) => x.field == field);
      if (iTrans) iTrans.value = text;
    }

    this.inventoryJournal.memo = this.acService.setMemo(
      this.inventoryJournal,
      this.reason
    );
    this.form.formGroup.patchValue(this.inventoryJournal);
  }

  getWarehouseName(warehouseID: any){
    this.api.exec('IV', 'InventoryJournalsBusiness', 'GetWarehouseNameAsync', [warehouseID])
      .subscribe((res: any) => {
        if (res.length > 0) {
          this.inventoryJournal.warehouseName = res;
          this.form.formGroup.patchValue(this.inventoryJournal);
        }
      });
  }

  setWarehouseID(){
    switch(this.funcID)
      {
        case 'ACT0708':
          if(this.inventoryJournal.warehouseReceipt)
          {
            this.inventoryJournal.warehouseID = this.inventoryJournal.warehouseReceipt;
            this.getWarehouseName(this.inventoryJournal.warehouseID);
          }
          break;
        case 'ACT0714':
          if(this.inventoryJournal.warehouseIssue)
          {
            this.inventoryJournal.warehouseID = this.inventoryJournal.warehouseIssue;
            this.getWarehouseName(this.inventoryJournal.warehouseID);
          }
          break;
      }
  }

  calculateNetAmt(quantity: any, costPrice: any)
  {
    if(quantity == 0 || costPrice == 0)
      return 0;
    var costAmt = quantity * costPrice;
    return costAmt;
  }

  autoAddRowSet(e: any) {
    setTimeout(() => {
      if (!this.loadingform || !this.loading) {
        switch (e.type) {
          case 'autoAdd':
            this.addRow();
            break;
          case 'add':
            if (this.gridInventoryJournalLine.autoAddRow) {
              this.addRow();
            }
            break;
          case 'closeEdit':
            this.gridInventoryJournalLine.autoAddRow = true;
            break;
        }
      }
    }, 500);
  }

  setPredicatesByItemID(dataValue: string): void {
    for (const v of this.gridInventoryJournalLine.visibleColumns) {
      if (
        ['idim0', 'idim1', 'idim2', 'idim3', 'idim6', 'idim7'].includes(
          v.fieldName?.toLowerCase()
        )
      ) {
        v.predicate = 'ItemID=@0';
        v.dataValue = dataValue;
      }
    }
  }

  setPredicateByIDIM4(dataValue: string): void {
    const idim5 = this.gridInventoryJournalLine.visibleColumns.find(
      (v) => v.fieldName?.toLowerCase() === 'idim5'
    );
    if (idim5) {
      idim5.predicate = 'WarehouseID=@0';
      idim5.dataValue = dataValue;
    }
  }
  //#endregion
}
