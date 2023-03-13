import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
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
import { TabModel } from 'projects/codx-ep/src/lib/models/tabControl.model';
import { CodxAcService } from '../../codx-ac.service';
import { CashReceipts } from '../../models/CashReceipts.model';
import { CashReceiptsLines } from '../../models/CashReceiptsLines.model';

@Component({
  selector: 'lib-pop-add-receipts',
  templateUrl: './pop-add-receipts.component.html',
  styleUrls: ['./pop-add-receipts.component.css'],
})
export class PopAddReceiptsComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('grid') public grid: CodxGridviewV2Component;
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('cardbodyRef') cardbodyRef: ElementRef;
  @ViewChild('cashRef') cashRef: ElementRef;
  @ViewChild('noteRef') noteRef: ElementRef;
  headerText: string;
  formModel: FormModel;
  cashreceipts: CashReceipts;
  cashreceiptslines: Array<CashReceiptsLines> = [];
  cashreceiptslinesDelete: Array<CashReceiptsLines> = [];
  dialog!: DialogRef;
  formType: any;
  gridViewSetup: any;
  validate: any = 0;
  gridHeight: any;
  parentID: string;
  fmCashReceiptsLines: FormModel = {
    formName: 'CashReceiptsLines',
    gridViewName: 'grvCashReceiptsLines',
    entityName: 'AC_CashReceiptsLines',
  };
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
    this.routerActive.queryParams.subscribe((res) => {
      if (res && res?.recID) this.parentID = res.recID;
    });
    this.headerText = dialogData.data?.headerText;
    this.formType = dialogData.data?.formType;
    this.cashreceipts = dialog.dataService!.dataSelected;
    this.cache
      .gridViewSetup('CashReceipts', 'grvCashReceipts')
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
    if (this.formType == 'edit') {
      if (this.cashreceipts?.voucherNo != null) {
        //#region  load CashReceiptsLines
        this.acService
          .loadData(
            'ERM.Business.AC',
            'CashReceiptsLinesBusiness',
            'LoadDataAsync',
            this.cashreceipts.recID
          )
          .subscribe((res: any) => {
            this.cashreceiptslines = res;
          });
        //#endregion
      }
    }
  }
  //#endregion

  //#region Init
  onInit(): void {}

  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    this.form.formGroup.patchValue(this.cashreceipts);
  }
  //#endregion

  //#region Event
  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.deleteRow(data);
        break;
    }
  }
  valueChange(e: any) {
    if (e.field.toLowerCase() === 'voucherdate' && e.data)
      this.cashreceipts[e.field] = e.data;
    else this.cashreceipts[e.field] = e.data;
    let sArray = [
      'currencyid',
      'voucherdate',
      'cashbookid',
      'journalno',
      'transactiontext',
    ];

    if (e.data && sArray.includes(e.field.toLowerCase())) {
      this.api
        .exec<any>('AC', 'CashReceiptsBusiness', 'ValueChangedAsync', [
          e.field,
          this.cashreceipts,
        ])
        .subscribe((res) => {
          if (res) {
            this.cashreceipts = res;
            this.form.formGroup.patchValue(this.cashreceipts);
          }
        });
    }

    if (e.data && e.field.toLowerCase() === 'bankaccount') {
      this.api
        .exec<any>(
          'BS',
          'BankAccountsBusiness',
          'GetAsync',
          this.cashreceipts.bankAccount
        )
        .subscribe((res) => {
          if (res) {
            this.cashreceipts.bankAcctNo = res.bankAcctNo;
            this.cashreceipts.bankID = res.bankID;
            this.form.formGroup.patchValue(this.cashreceipts);
          }
        });
    }
  }
  objectChanged(e: any) {}
  cellChanged(e: any) {
    const field = [
      'accountid',
      'offsetacctid',
      'objecttype',
      'objectid',
      'dr',
      'cr',
      'dr2',
      'cr2',
      'transactiontext',
      'referenceno',
    ];
    if (field.includes(e.field.toLowerCase())) {
      this.api
        .exec('AC', 'CashReceiptsLinesBusiness', 'ValueChangedAsync', [
          this.cashreceipts,
          e.data,
          e.field,
          e.data?.isAddNew,
        ])
        .subscribe((res) => {
          if (res) {
            console.log(e);
          }
        });
    }
  }
  gridCreated(e) {
    let hBody, hTab, hNote;
    if (this.cardbodyRef)
      hBody = this.cardbodyRef.nativeElement.parentElement.offsetHeight;
    if (this.cashRef) hTab = (this.cashRef as any).element.offsetHeight;
    if (this.noteRef) hNote = this.noteRef.nativeElement.clientHeight;

    this.gridHeight = hBody - (hTab + hNote + 120); //40 là header của tab
  }
  addRow() {
    let idx = this.grid.dataSource.length;
    let data = this.grid.formGroup.value;
    data.recID = Util.uid();
    data.write = true;
    data.delete = true;
    data.read = true;
    data.rowNo = idx + 1;
    data.transID = this.cashreceipts.recID;
    this.api
      .exec<any>('AC', 'CashReceiptsLinesBusiness', 'SetDefaultAsync', [
        this.cashreceipts,
        data,
      ])
      .subscribe((res) => {
        if (res) {
          this.grid.addRow(res, idx);
        }
      });
  }
  deleteRow(data) {
    this.cashreceiptslinesDelete.push(data);
    this.grid.deleteRow();
  }
  //#endregion

  //#region Function
  checkValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.cashreceipts);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.cashreceipts[keymodel[i]] === null ||
              String(this.cashreceipts[keymodel[i]]).match(/^ *$/) !== null
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
  setDefault(o) {
    return this.api.exec('AC', 'CashReceiptsBusiness', 'SetDefaultAsync', [
      this.parentID,
    ]);
  }
  clearCashrecipts() {
    this.cashreceiptslines = [];
  }
  //#endregion

  //#region Method
  onSaveAdd() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      this.cashreceiptslines = this.grid.dataSource;
      this.dialog.dataService
        .save((opt: RequestOption) => {
          opt.methodName = 'AddAsync';
          opt.className = 'CashReceiptsBusiness';
          opt.assemblyName = 'AC';
          opt.service = 'AC';
          opt.data = [this.cashreceipts];
          return true;
        })
        .subscribe((res) => {
          if (res.save) {
            this.acService
              .addData(
                'ERM.Business.AC',
                'CashReceiptsLinesBusiness',
                'AddAsync',
                [this.cashreceiptslines]
              )
              .subscribe((res) => {
                if (res) {
                  this.clearCashrecipts();
                  this.dialog.dataService.clear();
                  this.dialog.dataService
                    .addNew((o) => this.setDefault(o))
                    .subscribe((res) => {
                      this.form.formGroup.patchValue(res);
                      this.cashreceipts = this.dialog.dataService!.dataSelected;
                    });
                }
              });
          } else {
          }
        });
    }
  }
  onSave() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      if (this.formType == 'add') {
        this.cashreceiptslines = this.grid.dataSource;
        this.dialog.dataService
          .save((opt: RequestOption) => {
            opt.methodName = 'AddAsync';
            opt.className = 'CashReceiptsBusiness';
            opt.assemblyName = 'AC';
            opt.service = 'AC';
            opt.data = [this.cashreceipts];
            return true;
          })
          .subscribe((res) => {
            if (res.save) {
              this.acService
                .addData(
                  'ERM.Business.AC',
                  'CashReceiptsLinesBusiness',
                  'AddAsync',
                  [this.cashreceiptslines]
                )
                .subscribe((res) => {});
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
            opt.className = 'CashReceiptsBusiness';
            opt.assemblyName = 'AC';
            opt.service = 'AC';
            opt.data = [this.cashreceipts];
            return true;
          })
          .subscribe((res) => {
            if (res != null) {
              this.acService
                .addData(
                  'ERM.Business.AC',
                  'CashReceiptsLinesBusiness',
                  'UpdateAsync',
                  [this.cashreceiptslines, this.cashreceiptslinesDelete]
                )
                .subscribe((res) => {});
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
