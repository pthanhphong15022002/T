import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Injector, OnInit, Optional, ViewChild, ViewEncapsulation } from '@angular/core';
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
import { Observable, Subject, takeUntil } from 'rxjs';
import { ReceiptTransactionsLineAddComponent } from '../receipt-transactions-line-add/receipt-transactions-line-add.component';
import { VouchersLines } from '../../../models/VouchersLines.model';
import { Vouchers } from '../../../models/Vouchers.model';
import { itemMove } from '@syncfusion/ej2-angular-treemap';
import { Validators } from '@angular/forms';


@Component({
  selector: 'lib-receipt-transactions-add',
  templateUrl: './receipt-transactions-add.component.html',
  styleUrls: ['./receipt-transactions-add.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceiptTransactionsAddComponent extends UIComponent implements OnInit {

  //#region Constructor

  @ViewChild('grvVouchersLine')
  public grvVouchersLine: CodxGridviewV2Component;
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('tab') tab: TabComponent;

  private destroy$ = new Subject<void>();

  reason: Array<Reason> = [];
  headerText: string;
  dialog!: DialogRef;
  vouchers: Vouchers = new Vouchers();
  formType: any;
  validate: any = 0;
  //totalAmt: any = 0;
  journalNo: any;
  modeGrid: any;
  dataUpdate: VouchersLines = new VouchersLines();
  hideFields = [];
  journal: IJournal;

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
    this.dialog = dialog;
    this.routerActive.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res && res?.journalNo) this.journalNo = res.journalNo;
      });

    this.headerText = dialogData.data?.headerText;
    this.formType = dialogData.data?.formType;
    this.journal = dialogData.data?.journal;
    this.fmVouchers = dialogData.data?.formModelMaster;
    this.fmVouchersLines = dialogData.data?.formModelLine;
    this.vouchers = Object.assign(this.vouchers, dialogData.data?.oData);

    if (dialogData?.data.hideFields && dialogData?.data.hideFields.length > 0) {
      this.hideFields = [...dialogData?.data.hideFields];
    }

    if (this.journal) {
      this.modeGrid = this.journal.addNewMode;
    }

    this.funcID = dialog.formModel.funcID;
  }

  //#endregion

  //#region Init Master
  onInit(): void {
    this.loadInit();
  }

  ngAfterViewInit() {
    this.form.formGroup.patchValue(this.vouchers);
    this.dt.detectChanges();
  }

  onAfterInit() {
    //Loại bỏ requied khi VoucherNo tạo khi lưu
    if (this.journal.assignRule == '2') {
      this.form.setRequire([{
        field: 'voucherNo',
        isDisable: false,
        require: false
      }]);
    }

    if (this.formType == 'add' || this.formType == 'copy') {
      this.form.preData = new Vouchers;
    }
  }

  ngOnDestroy() {
    this.view.setRootNode('');
    this.onDestroy();
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadInit() {
  }
  //endregion Init Master

  //#region Init Line
  gridInit(eleGrid: CodxGridviewV2Component) {
    eleGrid.showHideColumns(this.hideFields);
    this.dt.detectChanges();
  }
  //#endregion Init Line

  //#region Event Master

  /** Update dữ liệu master khi có trường đc thay đổi */
  valueChange(e: any) {
    let field = e.field.toLowerCase();
    if (e.data) {
      switch (field) {
        case 'warehouseid':
          {
            this.vouchers.warehouseID = e.data;
            this.vouchers.warehouseName = e?.component?.itemsSelected[0]?.WarehouseName;
            this.form.formGroup.patchValue({
              warehouseName: this.vouchers.warehouseName,
            });
          }
          break;
        case 'warehousename':
          this.vouchers.warehouseName = e.data;
          break;

        case 'reasonid':
          if (e?.component?.itemsSelected[0]?.ReasonID) {
            this.vouchers.reasonID = e?.component?.itemsSelected[0]?.ReasonID;
            let text = e?.component?.itemsSelected[0]?.ReasonName;
            this.setMemo(field, text, 0);
          }
          break;
        // case 'objectid':
        //   this.vouchers.objectID = e.data;
        //   if(e.component.itemsSelected.length > 0)
        //   {
        //     let data = e.component.itemsSelected[0];
        //     this.vouchers.objectType = data['ObjectType'];
        //     this.vouchers.objectName = data['ObjectName'];
        //     this.setReason(field, data['ObjectName'], 1);
        //   }
        //   break;
        case 'memo':
          this.vouchers.memo = e.data;
          break;
        case 'voucherdate':
          this.vouchers.voucherDate = e.data;
          break;
        case 'voucherno':
          this.vouchers.voucherNo = e.data;
          break;
        case 'diM1':
          this.vouchers.diM1 = e.data;
          break;
        case 'diM2':
          this.vouchers.diM2 = e.data;
          break;
        case 'diM3':
          this.vouchers.diM3 = e.data;
          break;
      }
    }
  }

  /** Update lại loại phiểu khi thay đổi subtype */
  subTypeChange(event: any) {
    if (event && event.data[0]) {
      this.vouchers.subType = event.data[0];
      this.dt.detectChanges();
    }
  }

  onDiscard() {
    this.dialog.dataService
      .delete([this.vouchers], true, null, '', 'AC0010', null, null, false)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res.data != null) {
          this.dialog.close();
          this.dt.detectChanges();
        }
      });
  }

  onClose() {
    this.dialog.close();
  }
  //#endregion Event Master

  //#region Event Line

  /** Hàm xử lí khi click more function */
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

  /** Update lại data khi dòng thay đổi */
  lineChanged(e: any) {
    if (!this.checkDataUpdateFromBackEnd(e))
      return;
    this.updateFromFrontEnd(e);
    this.updateFromBackEnd(e);

  }

  /** Update từ Front End */
  updateFromFrontEnd(e: any) {
    this.grvVouchersLine.startProcess();
    switch (e.field) {
      case 'costAmt':
        this.costAmt_Change(e.data);
        break;
      case 'costPrice':
        this.costPrice_Change(e.data);
        break;
      case 'reasonID':
        e.data.note = e.itemData.ReasonName;
        break;
    }
    this.grvVouchersLine.endProcess();
  }

  /** Update từ Back End */
  updateFromBackEnd(e: any) {
    this.grvVouchersLine.startProcess();
    e.data.updateColumns='';
    const postFields: string[] = [
      'itemID',
      'quantity',
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
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
          console.log(res);
          if (res) {
            var arrColumn = [];
            arrColumn = res.updateColumns.split(';');
            arrColumn.forEach((a) => {
              if (a) {
                let field = Util.camelize(a);
                e.data[field] = res[field];
              }
            });
            this.dt.detectChanges();
            this.dataUpdate = Object.assign(this.dataUpdate, e.data);
            this.grvVouchersLine.endProcess();
          }
        });
    }
    else
    {
      this.grvVouchersLine.endProcess();
    }
  }

  /** Nhận các event mà lưới trả về */
  onEventAction(e: any) {
    switch (e.type) {
      case 'autoAdd':
        if (this.grvVouchersLine.autoAddRow) {
          this.saveMasterBeforeAddLine();
        }
        break;
      case 'endEdit':
        if (!this.grvVouchersLine.autoAddRow) {
          setTimeout(() => {
            let element = document.getElementById('btnadd');
            element.focus();
          }, 100);
        }
        break;
      case 'closeEdit':
        setTimeout(() => {
          let element = document.getElementById('btnadd');
          element.focus();
        }, 100);
        break;
    }
  }
  //#endregion Event Line

  //#region Method

  /** Hàm lưu và thêm mới */
  // onSaveAdd() {
  //   if(this.form.formGroup?.invalid)
  //     return;
  //   this.checkTransLimit(true);
  //   if (this.validate > 0) {
  //     this.validate = 0;
  //     return;
  //   } else {
  //     if (this.modeGrid == 1) {
  //       if (this.grvVouchersLine && !this.grvVouchersLine.gridRef.isEdit)
  //         this.save(false);
  //     }
  //     else {
  //       this.save(false);
  //     }
  //   }
  // }

  /** Lưu và đóng form 
   * Hoặc
   * Lưu và thêm mới
  */
  onSave(isClose: any) {
    /** isClose = true => Lưu và đóng form
     * isClose = false => Lưu và thêm mới
     */

    if (this.form.validation())
      return;
    //this.checkTransLimit(true);
    // if (this.validate > 0) {
    //   this.validate = 0;
    //   return;
    // } else {

    // }
    if (this.modeGrid == 1) {
      if (this.grvVouchersLine && !this.grvVouchersLine.gridRef.isEdit)
        this.save(isClose);
    }
    else {
      this.save(isClose);
    }
  }

  /** Hàm lưu master */
  save(isclose: boolean) {
    if (this.vouchers.status == '7') {
      this.vouchers.status = '1';
      this.form.formGroup.patchValue({ status: this.vouchers.status });
    }

    this.form.save(null, 0, '', 'SYS006', true)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res?.update?.error || res?.save?.error) {
          this.vouchers.status = '7';
          this.form.formGroup.patchValue({ status: this.vouchers.status });
          this.vouchers.unbounds.isAddNew = true;
        }
        if (isclose) {
          if (res?.save?.data) {
            this.dialog.close({
              update: true,
              data: res.save.data,
            });
          }
          else if (res?.update?.data) {
            this.dialog.close({
              update: true,
              data: res.update.data,
            });
          }
          else
          {
            this.dialog.close({
              update: true,
              data: res,
            });
          }
        }
        else {
          this.clearVouchers();
          this.dialog.dataService.clear();
          this.api.exec('IV', 'VouchersBusiness', 'SetDefaultAsync', [
            this.journalNo,
          ])
            .pipe(takeUntil(this.destroy$))
            .subscribe((res: any) => {
              if (res) {
                this.vouchers = res.data;
                this.formType = 'add';
                this.form.formGroup.patchValue(this.vouchers);
                this.form.preData = { ...this.vouchers };
                this.detectorRef.detectChanges();
              }
            });
        }
        this.dt.detectChanges();
      });
  }
  //#endregion Method

  //#region Function Master

  /** Đặt lại giá trị mặc định sau khi lưu */
  setDefault(o) {
    return this.api.exec('IV', 'VouchersBusiness', 'SetDefaultAsync', [
      this.journalNo,
    ]);
  }

  /** Kiểm tra tổng tiền phải nhỏ hơn hạn mức giao dịch */
  // checkTransLimit(isShowNotify: boolean) {
  //   this.loadTotalAmt();
  //   if (this.journal.transLimit && this.totalAmt > this.journal.transLimit) {
  //     if (isShowNotify)
  //       this.notification.notifyCode('AC0016');
  //     this.validate++;
  //   }
  // }

  // loadTotalAmt()
  // {
  //   if(this.grvVouchersLine.dataSource.length > 0)
  //   {
  //     let total = 0
  //     this.grvVouchersLine.dataSource.forEach((voucherLine: any) => {
  //       total += voucherLine.costAmt;
  //     });
  //     this.totalAmt = total;
  //   }
  // }

  /** Xóa data lưới khi master thêm mới */
  clearVouchers() {
    this.grvVouchersLine.dataSource = [];
  }

  /** Đặt lại giá trị cho trường ghi chú */
  setMemo(field, text, idx) {
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

  /** Cho phép lưu dòng khi click bên ngoài lưới */
  @HostListener('click', ['$event'])
  onClick(e) {
    if (this.modeGrid != 1)
      return;
    if (
      e.target.closest('.e-grid') == null &&
      e.target.closest('.e-popup') == null &&
      e.target.closest('.edit-value') == null
    ) {
      if (this.grvVouchersLine && this.grvVouchersLine.gridRef.isEdit) {
        this.grvVouchersLine.autoAddRow = false;
        this.grvVouchersLine.endEdit();
      }
    }
  }
  //#endregion Function Master

  //#region Function Line
  saveMasterBeforeAddLine() {
    if (this.form.validation())
      return;
    this.form
      .save(null, 0, '', '', false)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res && ((!res?.save?.error) || (!res?.update?.error) || (res?._hasSaved))) {
          if (!this.vouchers.voucherNo && res?.save?.data?.voucherNo) {
            this.vouchers.voucherNo = res.save.data.voucherNo;
            this.form.formGroup?.patchValue({ voucherNo: this.vouchers.voucherNo });
          }
          this.checkModeGridBeforeAddLine();
        }
      });
  }

  /** Kiểm tra mode grid trước khi thêm dòng */
  checkModeGridBeforeAddLine() {
    let data = new VouchersLines();
    let idx;
    this.api
      .exec<any>('IV', 'VouchersLinesBusiness', 'SetDefaultAsync', [
        this.vouchers,
        data,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res) {
          switch (this.modeGrid) {
            case '1':
              idx = this.grvVouchersLine.dataSource.length;
              res.rowNo = idx + 1;
              this.grvVouchersLine.addRow(res, idx);
              break;
            case '2':
              idx = this.grvVouchersLine.dataSource.length;
              res.rowNo = idx + 1;
              this.openPopupLine(res, 'add');
              break;
          }
        }
      });
  }

  /** Mở popup thêm detail */
  openPopupLine(data, type: string) {
    var obj = {
      headerText: this.headerText,
      data: { ...data },
      dataline: this.grvVouchersLine.dataSource,
      dataVouchers: this.vouchers,
      hideFields: this.hideFields,
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
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res) {
          var dialogs = this.callfc.openForm(
            ReceiptTransactionsLineAddComponent,
            '',
            900,
            850,
            '',
            obj,
            '',
            opt
          );
          dialogs.closed
            .pipe(takeUntil(this.destroy$))
            .subscribe((res) => {
              if (res.event != null) {
                var dataline = res.event['data'];
                if (dataline) {
                  this.grvVouchersLine.dataSource.push(dataline);
                }
              }
            });
        }
      });
  }

  /** Chỉnh sửa detail tùy theo mode grid */
  editRow(data) {
    switch (this.modeGrid) {
      case '1':
        this.grvVouchersLine.gridRef.selectRow(Number(data.index));
        this.grvVouchersLine.gridRef.startEdit();
        break;
      case '2':
        let index = this.grvVouchersLine.dataSource.findIndex(
          (x) => x.recID == data.recID
        );
        var obj = {
          headerText: this.headerText,
          data: { ...data },
          dataVouchers: this.vouchers,
          type: 'edit',
          hideFields: this.hideFields,
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
          .pipe(takeUntil(this.destroy$))
          .subscribe((res) => {
            if (res) {
              var dialogs = this.callfc.openForm(
                ReceiptTransactionsLineAddComponent,
                '',
                650,
                600,
                '',
                obj,
                '',
                opt
              );
              dialogs.closed
                .pipe(takeUntil(this.destroy$))
                .subscribe((res) => {
                  if (res.event != null) {
                    var dataline = res.event['data'];
                    this.grvVouchersLine.dataSource[index] = dataline;
                  }
                });
            }
          });
        break;
    }
  }

  /** Sao chép detail dựa trên mode grid */
  copyRow(data) {
    let idx;
    this.api
      .exec<any>('IV', 'VouchersLinesBusiness', 'SetDefaultAsync', [
        this.vouchers,
        data,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res) {
          switch (this.modeGrid) {
            case '1':
              idx = this.grvVouchersLine.dataSource.length;
              res.rowNo = idx + 1;
              res.recID = Util.uid();
              this.grvVouchersLine.addRow(res, idx);
              break;
            case '2':
              idx = this.grvVouchersLine.dataSource.length;
              res.rowNo = idx + 1;
              res.recID = Util.uid();
              this.openPopupLine(res, 'copy');
              break;
          }
        }
      });
  }

  /** Xóa dòng */
  deleteRow(data) {
    this.grvVouchersLine.deleteRow(data);
  }

  /** Cập nhật thành tiền khi thay đổi đơn giá */
  costPrice_Change(line: any) {
    if (line) {
      if (line.quantity != 0) {
        setTimeout(() => {
          line.costAmt = line.costPrice * line.quantity;
          this.dt.detectChanges();
        }, 100);
      }
    }
  }

  /** Cập nhật đơn giá khi thay đổi thành tiền */
  costAmt_Change(line: any) {
    if (line) {
      if (line.quantity != 0) {
        setTimeout(() => {
          line.costPrice = line.costAmt / line.quantity;
          this.dt.detectChanges();
        }, 100);

      }
    }
  }

  /** Kiểm tra dữ liệu update dưới back end có bị trùng hay ko */
  checkDataUpdateFromBackEnd(e: any): boolean {
    if (this.dataUpdate) {
      if (this.dataUpdate.recID &&
        this.dataUpdate.recID == e.data.recID &&
        this.dataUpdate[e.field] == e.data[e.field]
      ) {
        return false;
      }
    }
    return true;
  }

  /** Ẩn các function không sử dụng */
  hideMF(event) {
    var mf = event.filter(
      (x) => x.functionID != 'SYS02' && x.functionID != 'SYS03' && x.functionID != 'SYS04'
    );
    mf.forEach((element) => {
      element.disabled = true;
    });
  }
  //#endregion Function Line
}
