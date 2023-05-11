import {ChangeDetectorRef, Component, ElementRef, Injector, OnInit, Optional, ViewChild} from '@angular/core';
import { AuthStore, CodxComboboxComponent, CodxFormComponent, CodxGridviewV2Component, CodxInplaceComponent, CodxInputComponent, DataRequest, DialogData, DialogModel, DialogRef, FormModel, NotificationsService, RequestOption, UIComponent, Util } from 'codx-core';
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
  gridViewSetupLine: any;
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
    const field = [
      'itemid',
      'idim0',
      'idim1',
      'idim2',
      'idim3',
      'idim4',
      'idim5',
      'idim6',
      'idim7',
      'idim8',
      'idim9',
      'umid',
      'quantity',
      'costprice',
      'costamt'
    ];
    if (field.includes(e.field.toLowerCase())) {
      this.api
        .exec('IV', 'InventoryJournalLinesBusiness', 'ValueChangedAsync', [
          this.inventoryJournal,
          e.data,
          e.field,
          e.data?.isAddNew,
        ])
        .subscribe((res: any) => {
          if (res && res.line)
          {
            res.line.isAddNew = e.data?.isAddNew;
            this.setDataGrid(res.line.updateColumns, res.line);
          }
        });
    }
    if (e.field == 'itemID') {
      this.loadItemID(e.value);
    }
  }

  addRow(){
    //this.loadModegrid();
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
              .save(null, 0, '', 'SYS006', false)
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
              'IV_InventoryJournals',
              this.form,
              this.formType === 'edit',
              () => {
                this.dialog.dataService
                  .save(null, 0, '', 'SYS006', false)
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
            .save(null, 0, '', '', true)
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
    switch (this.modeGrid) {
      case '1':
        this.gridInventoryJournalLine.updateRow(data.rowNo, data);
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
        };
        let opt = new DialogModel();
        let dataModel = new FormModel();
        dataModel.formName = 'InventoryJournalLines';
        dataModel.gridViewName = 'grvInventoryJournalLines';
        dataModel.entityName = 'IV_InventoryJournalLines';
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
            this.loadTotal();
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
          .execAction<any>('IV_InventoryJournalLines', [data], 'DeleteAsync')
          .subscribe((res) => {
            if (res) {
              this.hasSaved = true;
              this.api
                .exec(
                  'IV',
                  'InventoryJournalLinesBusiness',
                  'UpdateAfterDelete',
                  [this.inventoryJournalLines]
                )
                .subscribe((res) => {
                  this.loadTotal();
                });
            }
          });
      }
    });
  }

  openPopupLine(data) {
    var obj = {
      headerText: this.headerText,
      data: { ...data },
      dataline: this.inventoryJournalLines,
      dataInventoryJournal: this.inventoryJournal,
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
          dialogs.closed.subscribe((res) => {
            if (res.event != null) {
              var dataline = res.event['data'];
              this.inventoryJournalLines.push(dataline);
              this.loadTotal();
            }
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

  onEdit(e: any) {
    this.checkValidateLine(e);
    if (this.validate > 0) {
      this.validate = 0;
      this.notification.notifyCode('SYS021', 0, '');
      return;
    } else {
      this.api
        .execAction<any>('IV_InventoryJournalLines', [e], 'UpdateAsync')
        .subscribe((save) => {
          if (save) {
            this.notification.notifyCode('SYS007', 0, '');
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
        .execAction<any>('IV_InventoryJournalLines', [e], 'SaveAsync')
        .subscribe((save) => {
          if (save) {
            this.notification.notifyCode('SYS006', 0, '');
            this.loadTotal();
          }
        });
    }
  }

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

              break;
            case '2':
              idx = this.inventoryJournalLines.length;
              res.rowNo = idx + 1;
              this.openPopupLine(res);
              break;
          }
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

  setDataGrid(updateColumn, data) {
    if (updateColumn) {
      var arrColumn = [];
      arrColumn = updateColumn.split(';');
      if (arrColumn && arrColumn.length) {
        arrColumn.forEach((e) => {
          if (e) {
            let field = Util.camelize(e);
            this.gridInventoryJournalLine.rowDataSelected[field] = data[field];
            this.gridInventoryJournalLine.rowDataSelected = {
              ...data,
            };
            this.gridInventoryJournalLine.rowDataSelected.updateColumns = '';
          }
        });
      }
    }
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
        input.value = "";
        input.predicate = 'ItemID="' + value + '"';
        input.loadSetting();
      }
    });
  }
  //#endregion
}
