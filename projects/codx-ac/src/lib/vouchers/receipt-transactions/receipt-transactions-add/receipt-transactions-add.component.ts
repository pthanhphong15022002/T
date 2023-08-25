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

  keymodel: any = [];
  reason: Array<Reason> = [];
  warehouseName: any;
  headerText: string;
  dialog!: DialogRef;
  vouchers: Vouchers;
  formType: any;
  validate: any = 0;
  journalNo: any;
  modeGrid: any;
  dataUpdate: VouchersLines = new VouchersLines();
  hideFields = [];
  total: any = 0;
  hasSaved: any = false;
  vllReceipt: any = 'AC116';
  vllIssue: any = 'AC117';
  funcID: any;
  journal: IJournal;
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
  key: any;
  columnChange: string = '';
  vllWarehouse: any;
  authStore: AuthStore;
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
    this.authStore = inject.get(AuthStore);
    this.dialog = dialog;
    this.routerActive.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res && res?.journalNo) this.journalNo = res.journalNo;
      });
    this.headerText = dialogData.data?.headerText;
    this.formType = dialogData.data?.formType;
    this.journal = dialogData.data?.journal;
    this.vouchers = dialog.dataService.dataSelected;
    this.fmVouchers = dialogData.data?.formModelMaster;
    this.fmVouchersLines = dialogData.data?.formModelLine;
    if (dialogData?.data.hideFields && dialogData?.data.hideFields.length > 0) {
      this.hideFields = [...dialogData?.data.hideFields];
    }
    if (this.journal) {
      this.modeGrid = this.journal.addNewMode;
    }
    this.funcID = dialog.formModel.funcID;
  }

  //#endregion

  //#region Init
  //Init Master
  onInit(): void {
    this.loadInit();
  }

  ngAfterViewInit() {
    //Loại bỏ requied khi VoucherNo tạo khi lưu
    if(this.journal.assignRule == '2')
    {
      this.form.formGroup.controls['voucherNo'].removeValidators(
        Validators.required
      );
      this.form.formGroup.updateValueAndValidity();
    }
    this.form.formGroup.patchValue(this.vouchers);
    this.dt.detectChanges();
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
    if (this.vouchers.status == '0' && this.formType == 'edit') {
      this.hasSaved = true;
    }
  }
  //end Init Master

  //Init Line
  gridInit(eleGrid:CodxGridviewV2Component) {
    eleGrid.showHideColumns(this.hideFields);
    this.dt.detectChanges();
  }
  //end Init Line

  //#endregion

  //#region Event
  //Event Master
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
            this.setReason(field, text, 0);
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
    if (this.hasSaved) {
      this.dialog.close({
        update: true,
        data: this.vouchers,
      });
    } else {
      this.dialog.close();
    }
  }
  //end Event Master

  //Event Line
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

  lineChanged(e: any) {
    if (!this.checkDataUpdateFromBackEnd(e))
      return;
    this.updateFromFrontEnd(e);
    this.updateFromBackEnd(e);
    
  }

  updateFromFrontEnd(e: any)
  {
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
  }

  updateFromBackEnd(e: any)
  {
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
          }
        });
    }

  }

  endEdit(e: any) {
    switch (e.type) {
      case 'autoAdd':
        this.addVoucherLine();
        break;
      case 'add':
        if (this.grvVouchersLine.autoAddRow) {
          this.addVoucherLine();
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
    }
  }
  //end Event Line
  //#endregion Event

  //#region Method
  onSaveAdd() {
    if(this.form.formGroup?.invalid)
      return;
    this.checkTransLimit(true);
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      if (this.modeGrid == 1) {
        if (this.grvVouchersLine && !this.grvVouchersLine.gridRef.isEdit)
          this.save(false);
      }
      else {
        this.save(false);
      }
    }
  }

  onSave() {
    if(this.form.formGroup?.invalid)
      return;
    this.checkTransLimit(true);
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      if (this.modeGrid == 1) {
        if (this.grvVouchersLine && !this.grvVouchersLine.gridRef.isEdit)
          this.save(true);
      }
      else {
        this.save(true);
      }
    }
  }

  save(isclose: boolean) {
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
            .pipe(takeUntil(this.destroy$))
            .subscribe((res) => {
              if (res.update.error) {
                this.vouchers.status = '0';
              }
              if (res && res.update.data != null && res.update.error != true) {
                if (isclose) {
                  this.dialog.close({
                    update: true,
                    data: res.update,
                  });
                }
                else {
                  this.clearVouchers();
                  this.dialog.dataService.clear();
                  this.dialog.dataService
                    .addNew((o) => this.setDefault(o))
                    .pipe(takeUntil(this.destroy$))
                    .subscribe((res) => {
                      this.vouchers = res;
                      this.form.formGroup.patchValue(this.vouchers);
                      this.hasSaved = false;
                    });
                }
                this.dt.detectChanges();
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
              this.dialog.dataService.save()
                .pipe(takeUntil(this.destroy$))
                .subscribe((res) => {
                  if (res.save.error) {
                    this.vouchers.status = '0';
                  }
                  if (res && res.save.data != null && res.save.error != true) {
                    if (isclose) {
                      this.dialog.close();
                    }
                    else {
                      this.clearVouchers();
                      this.dialog.dataService.clear();
                      this.dialog.dataService
                        .addNew((o) => this.setDefault(o))
                        .pipe(takeUntil(this.destroy$))
                        .subscribe((res) => {
                          this.vouchers = res;
                          this.form.formGroup.patchValue(this.vouchers);
                        });
                    }
                    this.dt.detectChanges();
                  }
                  else {
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
            this.dialog.dataService.save(null, 0, '', '', true)
              .pipe(takeUntil(this.destroy$))
              .subscribe((res) => {
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
  //#endregion Method

  //#region Function
  //Function Master
  setDefault(o) {
    return this.api.exec('IV', 'VouchersBusiness', 'SetDefaultAsync', [
      this.journalNo,
    ]);
  }

  checkTransLimit(isShowNotify: boolean) {
    if (this.journal.transLimit && this.vouchers.totalAmt > this.journal.transLimit) {
      if (isShowNotify)
        this.notification.notifyCode('AC0016');
      this.validate++;
    }
  }

  clearVouchers() {
    this.grvVouchersLine.dataSource = [];
  }

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

  // setTabindex() {
  //   let ins = setInterval(() => {
  //     let eleInput = document
  //       ?.querySelector('.ac-form-master')
  //       ?.querySelectorAll('codx-input');
  //     if (eleInput) {
  //       clearInterval(ins);
  //       let tabindex = 0;
  //       for (let index = 0; index < eleInput.length; index++) {
  //         let elechildren = (
  //           eleInput[index] as HTMLElement
  //         ).getElementsByTagName('input')[0];
  //         if (elechildren.readOnly) {
  //           elechildren.setAttribute('tabindex', '-1');
  //         } else {
  //           tabindex++;
  //           elechildren.setAttribute('tabindex', tabindex.toString());
  //         }
  //       }
  //       // input refdoc
  //       let ref = document
  //         .querySelector('.ac-refdoc')
  //         .querySelectorAll('input');
  //       (ref[0] as HTMLElement).setAttribute('tabindex', '11');
  //     }
  //   }, 200);
  //   setTimeout(() => {
  //     if (ins) clearInterval(ins);
  //   }, 10000);
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

    if (e.key == 'Enter') {
      if ((e.target as any).closest('codx-input') != null) {
        let eleInput = document
          ?.querySelector('.ac-form-master')
          ?.querySelectorAll('codx-input');
        if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') {
          let nextIndex = (e.target as HTMLElement).tabIndex + 1;
          for (let index = 0; index < eleInput.length; index++) {
            let elechildren = (
              eleInput[index] as HTMLElement
            ).getElementsByTagName('input')[0];
            if (elechildren.tabIndex == nextIndex) {
              elechildren.focus();
              elechildren.select();
              break;
            }
          }
        }
      }
    }
  }

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
  //end Function Master

  //Function Line
  addVoucherLine() {
    if(this.form.formGroup?.invalid)
      return;
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
              .pipe(takeUntil(this.destroy$))
              .subscribe((res) => {
                if (res && res.update.data != null) {
                  this.onAddLine();
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
                  .pipe(takeUntil(this.destroy$))
                  .subscribe((res) => {
                    if (res && res.save.data != null) {
                      this.vouchers.voucherNo = res.save.data.voucherNo;
                      this.hasSaved = true;
                      this.onAddLine();
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
            .pipe(takeUntil(this.destroy$))
            .subscribe((res) => {
              if (res && res.update.data != false) {
                this.onAddLine();
              }
            });
          break;
      }
    }
  }

  onAddLine() {
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
                this.hasSaved = true;
              }
            });
        }
      });
  }

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
                    this.hasSaved = true;
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

  deleteRow(data) {
    this.grvVouchersLine.deleteRow(data);
  }

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
  //end Function Line
  //#endregion
}
