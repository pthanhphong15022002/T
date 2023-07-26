import {ChangeDetectorRef, Component, ElementRef, HostListener, Injector, OnInit, Optional, ViewChild, ViewEncapsulation} from '@angular/core';
import { AuthStore, CodxComboboxComponent, CodxFormComponent, CodxGridviewV2Component, CodxInplaceComponent, CodxInputComponent, DataRequest, DialogData, DialogModel, DialogRef, FormModel, NotificationsService, RequestOption, UIComponent, Util } from 'codx-core';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import { Dialog, isCollide } from '@syncfusion/ej2-angular-popups';
import { IJournal } from '../../../journals/interfaces/IJournal.interface';
import { Reason } from '../../../models/Reason.model';
import { EditSettingsModel, row } from '@syncfusion/ej2-angular-grids';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { CodxAcService } from '../../../codx-ac.service';
import { ActivatedRoute } from '@angular/router';
import { JournalService } from '../../../journals/journals.service';
import { Observable } from 'rxjs';
import { PopAddLineReceiptTransactionComponent } from '../pop-add-line-receipt-transaction/pop-add-line-receipt-transaction.component';
import { VouchersLines } from '../../../models/VouchersLines.model';
import { Vouchers } from '../../../models/Vouchers.model';
import { itemMove } from '@syncfusion/ej2-angular-treemap';


@Component({
  selector: 'lib-pop-add-receipt-transaction',
  templateUrl: './pop-add-receipt-transaction.component.html',
  styleUrls: ['./pop-add-receipt-transaction.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class PopAddReceiptTransactionComponent extends UIComponent implements OnInit{

  //#region Constructor

  @ViewChild('gridVouchersLine')
  public gridVouchersLine: CodxGridviewV2Component;
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
  vouchers: Vouchers;
  formType: any;
  gridViewSetup: any;
  gridViewSetupLine: any;
  validate: any = 0;
  journalNo: any;
  modeGrid: any;
  vouchersLines: Array<VouchersLines> = [];
  vouchersLinesDelete: Array<VouchersLines> = [];
  dataUpdate: VouchersLines = new VouchersLines();
  lockFields = [];
  tab: number = 0;
  total: any = 0;
  hasSaved: any = false;
  isSaveMaster: any = false;
  vllReceipt: any = 'AC116';
  vllIssue: any = 'AC117';
  funcID: any;
  loading: any = false;
  loadingform: any = true;
  journal: IJournal;
  receiptsFormName: string = 'VouchersReceipts';
  receiptsGrvName: string = 'grvVouchersReceipts';
  issuesFormName: string = 'VouchersIssues';
  issuesGrvName: string = 'grvVouchersIssues';
  voucherNoPlaceholderText$: Observable<string>;
  fmVouchers: FormModel = {
    formName: '',
    gridViewName: '',
    entityName: '',
  };
  fmVouchersLines: FormModel = {
    formName: '',
    gridViewName: '',
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
    this.vouchers = dialog.dataService.dataSelected;
    this.fmVouchers = dialogData.data?.formModelMaster;
    this.fmVouchersLines = dialogData.data?.formModelLine;
    if (dialogData?.data.lockFields && dialogData?.data.lockFields.length > 0) {
      this.lockFields = [...dialogData?.data.lockFields];
    }
    this.funcID = dialog.formModel.funcID;
    this.cache
      .gridViewSetup(this.fmVouchers.formName, this.fmVouchers.gridViewName)
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
    this.cache
    .gridViewSetup(this.fmVouchersLines.formName, this.fmVouchersLines.gridViewName)
    .subscribe((res) => {
      if (res) {
        this.gridViewSetupLine = res;
      }
    });
  }

  //#endregion

  //#region Init

  onInit(): void {
    this.loadInit();
    this.loadTotal();
  }

  ngAfterViewInit() {
    this.form.formGroup.patchValue(this.vouchers);
    this.dt.detectChanges();
  }

  //#endregion

  //#region Event

  gridInit(columnsGrid)
  {
    this.setVisibleColumn(columnsGrid);
    this.setHideColumns(columnsGrid);
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
            this.vouchers.warehouseID = e.data;
            this.vouchers.warehouseName = e.component.itemsSelected[0].WarehouseName;
            this.form.formGroup.patchValue({
              warehouseID: this.vouchers.warehouseID,
              warehouseName: this.vouchers.warehouseName,
            });
          }
          break;
        case 'warehousename':
          this.vouchers.warehouseName = e.data;
          break;

          case 'reasonid':
            this.vouchers.reasonID = e.data;
          let text = e?.component?.itemsSelected[0]?.ReasonName;
          this.setReason(field, text, 0);
          break;
        case 'objectid':
          this.vouchers.objectID = e.data;
          let data = e.component.itemsSelected[0];
          this.vouchers.objectType = data['ObjectType'];
          this.vouchers.objectName = data['ObjectName'];
          this.setReason(field, data['ObjectName'], 1);
          break;
        case 'memo':
          this.vouchers.memo = e.data;
          break;
        case 'voucherdate':
          this.vouchers.voucherDate = e.data;
          break;
        case 'voucherno':
          this.vouchers.voucherNo = e.data;
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

    if(this.dataUpdate)
    {
      if(this.dataUpdate.recID &&
        this.dataUpdate.recID == e.data.recID &&
        this.dataUpdate[e.field] == e.data[e.field]
        )
        {
          return;
        }
    }

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
        .exec('IV', 'VouchersLinesBusiness', 'ValueChangedAsync', [
          e.field,
          this.vouchers,
          e.data,
        ])
        .subscribe((res: any) => {
          console.log(res);
          if(res)
          {
            var arrColumn = [];
            arrColumn = res.updateColumns.split(';');
            arrColumn.forEach((a) => {
              if (a) {
                let field = Util.camelize(a);
                e.data[field] = res[field];
              }
            });
            this.dataUpdate = Object.assign(this.dataUpdate, e.data);
          }
          
          // this.vouchersLines[e.idx] = Object.assign(this.vouchersLines[e.idx], res);
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
        .execAction<any>(this.fmVouchersLines.entityName, [e], 'SaveAsync')
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
        .execAction<any>(this.fmVouchersLines.entityName, [e], 'UpdateAsync')
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
    if(this.modeGrid == 1)
    {
      if(this.gridVouchersLine && !this.gridVouchersLine.gridRef.isEdit)
      {
        this.discard();
      }
    }
    else
    {
      this.discard();
    }
  }

  discard()
  {
    this.dialog.dataService
    .delete([this.vouchers], true, null, '', 'AC0010', null, null, false)
    .subscribe((res) => {
      if (res.data != null) {
        this.dialog.close();
        this.dt.detectChanges();
      }
    });
  }

  onDoubleClick(data)
  {
    // this.loadPredicate(this.gridVouchersLine.visibleColumns, data.rowData);
  }

  onClose()
  {
    if(this.modeGrid == 1)
    {
      if(this.gridVouchersLine && !this.gridVouchersLine.gridRef.isEdit)
      {
        this.close();
      }
    }
    else
    {
      this.close();
    }
  }

  close() {
    if (this.isSaveMaster ) {
      this.onSaveMaster();
    }
    if (this.hasSaved) {
      this.dialog.close({
        update: true,
        data: this.vouchers,
      });
    } else {
      this.dialog.close();
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
      if(this.modeGrid == 1)
      {
        if(this.gridVouchersLine && !this.gridVouchersLine.gridRef.isEdit)
          this.save(false);
      }
      else
      {
        this.save(false);
      }
    }
  }

  onSave() {
    this.checkValidate();
    this.checkTransLimit(true);
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      if(this.modeGrid == 1)
      {
        if(this.gridVouchersLine && !this.gridVouchersLine.gridRef.isEdit)
          this.save(true);
      }
      else
      {
        this.save(true);
      }
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
        this.vouchers['_uuid'],
        this.vouchers
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
    this.loading = true;
      switch (this.formType) {
        case 'add':
        case 'copy':
          this.vouchers.status = '1';
          if (this.hasSaved) {
            this.dialog.dataService.updateDatas.set(
              this.vouchers['_uuid'],
              this.vouchers
            );
            this.dialog.dataService
              .save(null, 0, '', 'SYS006', true)
              .subscribe((res) => {
                if(res.update.error)
                {
                  this.vouchers.status = '0';
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
                    this.clearVouchers();
                    this.dialog.dataService.clear();
                    this.dialog.dataService
                      .addNew((o) => this.setDefault(o))
                      .subscribe((res) => {
                      this.vouchers = res;
                      this.setWarehouseID();
                      this.form.formGroup.patchValue(this.vouchers);
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
            this.journalService.checkVoucherNoBeforeSave(
              this.journal,
              this.vouchers,
              'IV',
              this.fmVouchers.entityName,
              this.form,
              this.formType === 'edit',
              () => {
                this.dialog.dataService.save().subscribe((res) => {
                  if(res.save.error)
                  {
                    this.vouchers.status = '0';
                  }
                  if (res && res.save.data != null && res.save.error != true) {
                    if(isclose)
                    {
                      this.dialog.close();
                    }
                    else
                    {
                      this.clearVouchers();
                      this.dialog.dataService.clear();
                      this.dialog.dataService
                      .addNew((o) => this.setDefault(o))
                      .subscribe((res) => {
                        this.vouchers = res;
                        this.setWarehouseID();
                        this.form.formGroup.patchValue(this.vouchers);
                      });
                    }
                    this.dt.detectChanges();
                  }
                  else {
                    this.loading = false;
                    this.vouchers.unbounds.isAddNew = true;
                  }
                });
              }
            );
          }
          break;
        case 'edit':
          this.journalService.checkVoucherNoBeforeSave(
            this.journal,
            this.vouchers,
            'IV',
            this.fmVouchers.entityName,
            this.form,
            this.formType === 'edit',
            () => {
              if (this.vouchers.status == '0') {
                this.vouchers.status = '1';
              }
              this.dialog.dataService.updateDatas.set(
                this.vouchers['_uuid'],
                this.vouchers
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

  setDefault(o) {
    return this.api.exec('IV', 'VouchersBusiness', 'SetDefaultAsync', [
      this.journalNo,
    ]);
  }

  loadInit(){
    if (this.formType == 'edit') {
      this.api
        .exec('IV', 'VouchersLinesBusiness', 'LoadDataAsync', [
          this.vouchers.recID,
        ])
        .subscribe((res: any) => {
          if (res.length > 0) {
            this.keymodel = Object.keys(res[0]);
            this.vouchersLines = res;
            this.vouchersLines.forEach((element) => {
              this.loadTotal();
            });
          }
        });
    }
    // if(this.formType == 'copy' && this.vouchers.warehouseID)
    // {
    //   this.getWarehouseName(this.vouchers.warehouseID);
    // }
    // if(this.formType == 'add')
    // {
    //   this.setWarehouseID();
    // }

    if(this.vouchers.warehouseID)
    {
      this.getWarehouseName(this.vouchers.warehouseID);
    }

    // if (
    //   this.vouchers &&
    //   this.vouchers.unbounds &&
    //   this.vouchers.unbounds.lockFields &&
    //   this.vouchers.unbounds.lockFields.length
    // ){
    //   this.lockFields = this.vouchers.unbounds
    //     .lockFields as Array<string>;
    // }
    // else{
    //   this.api
    //     .exec('IV', 'VouchersBusiness', 'SetUnboundsAsync', [
    //       this.vouchers
    //     ])
    //     .subscribe((res: any) => {
    //       if (res.unbounds && res.unbounds.lockFields && res.unbounds.lockFields.length) {
    //         this.vouchers.unbounds = res.unbounds;
    //         this.lockFields = this.vouchers.unbounds
    //           .lockFields as Array<string>;
    //       }
    //     });
    // }
    if (this.vouchers.status == '0' && this.formType == 'edit') {
      this.hasSaved = true;
    }
    this.loadJournal();
  }

  loadJournal(){
    const options = new DataRequest();
    options.entityName = 'AC_Journals';
    options.predicates = 'JournalNo=@0';
    options.dataValues = this.vouchers.journalNo;
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
    this.vouchersLines.forEach((element) => {
      totals = totals + element.costAmt;
    });
    this.total = totals;
    this.vouchers.totalAmt = totals;
    this.total = totals.toLocaleString('it-IT');
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
              this.vouchers['_uuid'],
              this.vouchers
            );
            this.dialog.dataService
              .save(null, 0, '', '', false)
              .subscribe((res) => {
                if (res && res.update.data != null) {
                  this.loadModegrid();
                }
              });
          } else {
            this.journalService.checkVoucherNoBeforeSave(
              this.journal,
              this.vouchers,
              'IV',
              this.fmVouchers.entityName,
              this.form,
              this.formType === 'edit',
              () => {
                this.dialog.dataService
                  .save(null, 0, '', '', false)
                  .subscribe((res) => {
                    if (res && res.save.data != null) {
                      this.vouchers = res.save.data;
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
            this.vouchers['_uuid'],
            this.vouchers
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
    let data = new VouchersLines();
    let idx;
    this.api
      .exec<any>('IV', 'VouchersLinesBusiness', 'SetDefaultAsync', [
        this.vouchers,
        data,
      ])
      .subscribe((res) => {
        if (res) {
          switch (this.modeGrid) {
            case '1':
              idx = this.gridVouchersLine.dataSource.length;
              res.rowNo = idx + 1;
              this.gridVouchersLine.addRow(res, idx);
              // this.loadPredicate(this.gridVouchersLine.visibleColumns, res);
              break;
            case '2':
              idx = this.vouchersLines.length;
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
      dataline: this.vouchersLines,
      dataVouchers: this.vouchers,
      lockFields: this.lockFields,
      type: type,
      formModelLine: this.fmVouchersLines,
      funcID: this.funcID,
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = this.fmVouchersLines.formName;
    dataModel.gridViewName = this.fmVouchersLines.gridViewName;
    dataModel.entityName = this.fmVouchersLines.entityName;
    opt.FormModel = dataModel;
    this.cache
      .gridViewSetup('VouchersLines', 'grvVouchersLines')
      .subscribe((res) => {
        if (res) {
          var dialogs = this.callfc.openForm(
            PopAddLineReceiptTransactionComponent,
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
                this.vouchersLines.push(dataline);
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
        this.gridVouchersLine.gridRef.selectRow(Number(data.index));
        this.gridVouchersLine.gridRef.startEdit();
        // this.loadPredicate(this.gridVouchersLine.visibleColumns, data);
        break;
      case '2':
        let index = this.vouchersLines.findIndex(
          (x) => x.recID == data.recID
        );
        var obj = {
          headerText: this.headerText,
          data: { ...data },
          dataVouchers: this.vouchers,
          type: 'edit',
          lockFields: this.lockFields,
          journal: this.journal,
          formModelLine: this.fmVouchersLines,
          funcID: this.funcID,
        };
        let opt = new DialogModel();
        let dataModel = new FormModel();
        dataModel.formName = this.fmVouchersLines.formName;
        dataModel.gridViewName = this.fmVouchersLines.gridViewName;
        dataModel.entityName = this.fmVouchersLines.entityName;
        opt.FormModel = dataModel;
        opt.Resizeable = false;
        this.cache
          .gridViewSetup('VouchersLines', 'grvVouchersLines')
          .subscribe((res) => {
            if (res) {
              var dialogs = this.callfc.openForm(
                PopAddLineReceiptTransactionComponent,
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
                  this.vouchersLines[index] = dataline;
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
      .exec<any>('IV', 'VouchersLinesBusiness', 'SetDefaultAsync', [
        this.vouchers,
        data,
      ])
      .subscribe((res) => {
        if (res) {
          switch (this.modeGrid) {
            case '1':
              idx = this.gridVouchersLine.dataSource.length;
              res.rowNo = idx + 1;
              res.recID = Util.uid();
              this.gridVouchersLine.addRow(res, idx);
              // this.loadPredicate(this.gridVouchersLine.visibleColumns, data);
              break;
            case '2':
              idx = this.vouchersLines.length;
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
            this.gridVouchersLine.deleteRow(data);
            if (this.gridVouchersLine.dataSource.length > 0) {
              for (
                let i = 0;
                i < this.gridVouchersLine.dataSource.length;
                i++
              ) {
                this.gridVouchersLine.dataSource[i].rowNo = i + 1;
              }
            }
            this.vouchersLines = this.gridVouchersLine.dataSource;
            break;
          case '2':
            let index = this.vouchersLines.findIndex(
              (x) => x.recID == data.recID
            );
            this.vouchersLines.splice(index, 1);
            for (let i = 0; i < this.vouchersLines.length; i++) {
              this.vouchersLines[i].rowNo = i + 1;
            }
            break;
        }
        this.api
          .execAction<any>(this.fmVouchersLines.entityName, [data], 'DeleteAsync')
          .subscribe((res) => {
            if (res) {
              this.hasSaved = true;
              this.isSaveMaster = true;
              this.api
                .exec(
                  'IV',
                  'VouchersLinesBusiness',
                  'UpdateAfterDelete',
                  [this.vouchersLines]
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
    var keymodel = Object.keys(this.vouchers);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        if (ignoredFields.includes(keygrid[index].toLowerCase())) {
          continue;
        }

        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.vouchers[keymodel[i]] == null ||
              String(this.vouchers[keymodel[i]]).match(/^ *$/) !== null
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
    if(this.journal.transLimit && this.vouchers.totalAmt > this.journal.transLimit)
    {
      if(isShowNotify)
        this.notification.notifyCode('AC0016');
      this.validate++ ;
    }
  }

  clearVouchers() {
    this.vouchersLines = [];
  }

  // setDataGrid(updateColumn, data) {
  //   if (updateColumn) {
  //     var arrColumn = [];
  //     arrColumn = updateColumn.split(';');
  //     if (arrColumn && arrColumn.length) {
  //       arrColumn.forEach((e) => {
  //         if (e) {
  //           let field = Util.camelize(e);
  //           this.gridVouchersLine.rowDataSelected[field] = data[field];
  //           this.gridVouchersLine.rowDataSelected = {
  //             ...data,
  //           };
  //           this.gridVouchersLine.rowDataSelected.updateColumns = '';
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
      let idx = this.gridVouchersLine.visibleColumns.findIndex(
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

    this.vouchers.memo = this.acService.setMemo(
      this.vouchers,
      this.reason
    );
    this.form.formGroup.patchValue({
      memo: this.vouchers.memo,
    });
  }

  getWarehouseName(warehouseID: any){
    this.api.exec('IV', 'VouchersBusiness', 'GetWarehouseNameAsync', [warehouseID])
      .subscribe((res: any) => {
        if (res.length > 0) {
          this.vouchers.warehouseName = res;
          this.form.formGroup.patchValue({
            warehouseName: this.vouchers.warehouseName,
          });
        }
      });
  }

  setWarehouseID(){
    switch(this.funcID)
      {
        case 'ACT0708':
          if(this.vouchers.warehouseID)
          {
            // this.vouchers.warehouseID = this.vouchers.warehouseReceipt;
            this.getWarehouseName(this.vouchers.warehouseID);
          }
          break;
        case 'ACT0714':
          if(this.vouchers.warehouseID)
          {
            // this.vouchers.warehouseID = this.vouchers.warehouseIssue;
            this.getWarehouseName(this.vouchers.warehouseID);
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
    switch (e.type) {
      case 'autoAdd':
        this.addRow();
        break;
      case 'add':
        if (this.gridVouchersLine.autoAddRow) {
          this.addRow();
        }
        break;
    }
  }

  // setPredicatesByItemID(dataValue: string): void {
  //   for (const v of this.gridVouchersLine.visibleColumns) {
  //     if (
  //       ['idim0', 'idim1', 'idim2', 'idim3', 'idim6', 'idim7'].includes(
  //         v.fieldName?.toLowerCase()
  //       )
  //     ) {
  //       v.predicate = 'ItemID=@0';
  //       v.dataValue = dataValue;
  //     }
  //   }
  // }

  // setPredicateByIDIM4(dataValue: string): void {
  //   const idim5 = this.gridVouchersLine.visibleColumns.find(
  //     (v) => v.fieldName?.toLowerCase() === 'idim5'
  //   );
  //   if (idim5) {
  //     idim5.predicate = 'WarehouseID=@0';
  //     idim5.dataValue = dataValue;
  //   }
  // }

  @HostListener('keyup', ['$event'])
  onKeyUp(e: KeyboardEvent): void {
    if (e.key == 'Tab') {
      let element;
      if (document.activeElement.className == 'e-tab-wrap') {
        element = document.getElementById('btnadd');
        element.focus();
      }
    }
  }
  
  @HostListener('click', ['$event'])
  onClick(e) {
    if(this.modeGrid != 1)
      return;
    if (
      e.target.closest('.e-grid') == null &&
      e.target.closest('.e-popup') == null &&
      e.target.closest('.edit-value') == null
    ) {
      if (this.gridVouchersLine && this.gridVouchersLine.gridRef.isEdit) {
        this.gridVouchersLine.autoAddRow = false;
        this.gridVouchersLine.endEdit();
      }
    }
  }

  setVisibleColumn(columnsGrid)
  {
    let arr = [
      'IDIM0',
      'IDIM1',
      'IDIM2',
      'IDIM3',
      'IDIM4',
      'IDIM5',
      'IDIM6',
      'IDIM7',
      'IDIM8',
      'IDIM9',
    ];
    let visibleColumns = arr.filter((x) => !this.lockFields.includes(x));
    if(visibleColumns.length > 0)
    {
      visibleColumns.forEach((fieldName) => {
        let i = columnsGrid.findIndex((x) => x.fieldName == fieldName);
        if (i > -1) {
          columnsGrid[i].isVisible = true;
        }
      });
    }
  }

  setHideColumns(columnsGrid)
  {
    this.lockFields.forEach((fieldName) => {
      let i = columnsGrid.findIndex((x) => x.fieldName == fieldName);
      if (i > -1) {
        columnsGrid[i].isVisible = false;
      }
    });
    //this.gridVouchersLine.hideColumns(this.lockFields);
  }
  //#endregion
}
