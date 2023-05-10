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
import { EditSettingsModel, row } from '@syncfusion/ej2-angular-grids';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import {
  AuthStore,
  CallFuncService,
  CodxComboboxComponent,
  CodxFormComponent,
  CodxGridviewV2Component,
  CodxInputComponent,
  DataRequest,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  UIComponent,
  Util,
} from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { PopAddLinecashComponent } from '../pop-add-linecash/pop-add-linecash.component';
import { Observable, map } from 'rxjs';
import { CashPayment } from '../../../models/CashPayment.model';
import { CashPaymentLine } from '../../../models/CashPaymentLine.model';
import { IJournal } from '../../../journals/interfaces/IJournal.interface';
import { Reason } from '../../../models/Reason.model';
import { CodxAcService } from '../../../codx-ac.service';
import { JournalService } from '../../../journals/journals.service';
import { VoucherComponent } from '../../../popup/voucher/voucher.component';
import { SettledInvoices } from '../../../models/SettledInvoices.model';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Double } from '@syncfusion/ej2-angular-charts';
@Component({
  selector: 'lib-pop-add-cash',
  templateUrl: './pop-add-cash.component.html',
  styleUrls: ['./pop-add-cash.component.css'],
})
export class PopAddCashComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('gridCashPaymentLine')
  public gridCashPaymentLine: CodxGridviewV2Component;
  @ViewChild('gridSettledInvoices')
  public gridSettledInvoices: CodxGridviewV2Component;
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('cardbodyRef') cardbodyRef: ElementRef;
  @ViewChild('cashRef') cashRef: ElementRef;
  @ViewChild('noteRef') noteRef: ElementRef;
  @ViewChild('tabObj') tabObj: TabComponent;
  @ViewChild('cashBook') cashBook: CodxInputComponent;
  headerText: string;
  dialog!: DialogRef;
  cashpayment: any;
  formType: any;
  gridViewSetup: any;
  validate: any = 0;
  journalNo: string;
  modegrid: any;
  cashpaymentline: Array<CashPaymentLine> = [];
  settledInvoices: Array<SettledInvoices> = [];
  settledInvoicesDelete: Array<any> = [];
  cashpaymentlineDelete: Array<CashPaymentLine> = [];
  lockFields = [];
  pageCount: any;
  tab: number = 0;
  total: any = 0;
  totaldr2: any = 0;
  hasSaved: any = false;
  journal: IJournal;
  reason: Array<Reason> = [];
  fmCashPaymentsLines: FormModel = {
    formName: 'CashPaymentsLines',
    gridViewName: 'grvCashPaymentsLines',
    entityName: 'AC_CashPaymentsLines',
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
  columnChange: string = '';
  vllCashbook: any;
  baseCurr: any;
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
    this.cashpayment = dialog.dataService.dataSelected;
    this.cache
      .gridViewSetup('CashPayments', 'grvCashPayments')
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
    this.loadFuncid();
    this.loadReason();
    this.loadjounal();
    this.loadCompanySetting();
  }

  ngAfterViewInit() {
    this.form.formGroup.patchValue(this.cashpayment); 
  }

  //#endregion

  //#region Event
  close() {
    if (this.hasSaved) {
      this.dialog.close({
        update: true,
        data: this.cashpayment,
      });
    } else {
      this.dialog.close();
    }
  }

  loadTotal() {
    var totals = 0;
    var totalsdr = 0;
    this.cashpaymentline.forEach((element) => {
      totals = totals + element.dr;
      totalsdr = totalsdr + element.dR2;
    });
    this.total = totals.toLocaleString('it-IT');
    this.totaldr2 = totalsdr.toLocaleString('it-IT');
    this.cashpayment.totalAmt = totals;
  }

  created(e: any, ele: TabComponent) {
    this.changeType(null, ele);
  }

  select(e) {
    if (e.isSwiped) {
      e.cancel = true;
    }
  }

  changeType(e?: any, ele?: TabComponent) {
    let i;
    if (e) i = e.data;
    if (!e && this.cashpayment.subType) i = this.cashpayment.subType;
    if (!ele) ele = this.tabObj;
    switch (i) {
      case '1':
        ele.hideTab(0, false);
        ele.hideTab(1, true);
        this.cashpaymentline = [];
        this.loadFuncid();
        break;
      case '3':
        ele.hideTab(0, false);
        ele.hideTab(1, true);
        this.cashpaymentline = [];
        this.loadvll('AC093');
        break;
      default:
        ele.hideTab(0, true);
        ele.hideTab(1, false);
        this.settledInvoices = [];
        this.loadFuncid();
        break;
    }
  }

  valueChange(e: any) {
    this.cashpayment[e.field] = e.data;
    let field = e.field.toLowerCase();
    let sArray = [
      'currencyid',
      'voucherdate',
      'cashbookid',
      'journalno',
      'objectid',
    ];
    if (e.data) {
      switch (field) {
        case 'currencyid':
          if (this.columnChange.toLowerCase() == 'cashbookid') {
            this.columnChange = '';
            return;
          }
          break;
        case 'exchangerate':
          if (this.cashpaymentline.length) {
            this.api
              .exec<any>(
                'AC',
                'CashPaymentsLinesBusiness',
                'ChangeExchangeRateAsync',
                [this.cashpayment, this.cashpaymentline]
              )
              .subscribe((res) => {
                if (res) {
                  this.gridCashPaymentLine!.dataSource = res;
                  this.cashpaymentline = res;
                }
              });
          }
          break;
        case 'reasonid':
          let text = e?.component?.itemsSelected[0]?.ReasonName;
          this.setReason(field, text, 0);
          break;
        case 'objectid':
          let data = e.component.itemsSelected[0];
          this.cashpayment.objectType = data['ObjectType'];
          this.cashpayment.objectName = data['ObjectName'];
          this.setReason(field, data['ObjectName'], 1);
          break;
      }
      if (sArray.includes(field)) {
        this.api
          .exec<any>('AC', 'CashPaymentsBusiness', 'ValueChangedAsync', [
            e.field,
            this.cashpayment,
          ])
          .subscribe((res) => {
            if (res) {
              this.columnChange = res.updateColumns;
              this.form.formGroup.patchValue(res);
            }
          });
      }
    }
  }

  controlBlur(e: any) {
    this.cashpayment[e.ControlName] = e.crrValue;
    let text;
    switch (e.ControlName) {
      case 'payee':
        if (e.crrValue) {
          text = e.crrValue;
          this.setReason('payname', text, 2);
        } else {
          let index = this.reason.findIndex((x) => x.field == 'payname');
          if (index > -1) {
            this.reason.splice(index, 1);
          }
          this.cashpayment.memo = this.acService.setMemo(
            this.cashpayment,
            this.reason
          );
          this.form.formGroup.patchValue(this.cashpayment);
        }
        break;
    }
  }

  gridCreated(e, grid) {
    let hBody, hTab, hNote;
    if (this.cardbodyRef)
      hBody = this.cardbodyRef.nativeElement.parentElement.offsetHeight;
    if (this.cashRef) hTab = (this.cashRef as any).element.offsetHeight;
    if (this.noteRef) hNote = this.noteRef.nativeElement.clientHeight;

    this.gridHeight = hBody - (hTab + hNote + 140);
    grid.disableField(this.lockFields);
  }
  lineChanged(e: any) {
    const field = [
      'accountid',
      'offsetacctid',
      'objecttype',
      'objectid',
      'dr',
      'cr',
      'dr2',
      'cr2',
      'reasonid',
      'referenceno',
    ];
    if (field.includes(e.field.toLowerCase())) {
      this.api
        .exec('AC', 'CashPaymentsLinesBusiness', 'ValueChangedAsync', [
          this.cashpayment,
          e.data,
          e.field,
          e.data?.isAddNew,
        ])
        .subscribe((res: any) => {
          if (res && res.line)
            this.setDataGrid(res.line.updateColumns, res.line);
        });
    }

    if (e.field.toLowerCase() == 'sublgtype' && e.value) {
      if (e.value === '3') {
        //Set lock field
      } else {
        this.api
          .exec<any>(
            'AC',
            'AC',
            'CashPaymentsLinesBusiness',
            'SetLockFieldAsync'
          )
          .subscribe((res) => {
            if (res) {
              //Set lock field
            }
          });
      }
    }
    this.api
      .execAction<any>('AC_CashPaymentsLines', [e.data], 'UpdateAsync')
      .subscribe((res) => {});
  }

  voucherLineRefsChanged(e: any) {
    if (e.data) {
      const field = ['balanceamt', 'currencyid', 'exchangerate', 'settledamt'];
      if (field.includes(e.field.toLowerCase())) {
        this.api
          .exec('AC', 'VoucherLineRefsBusiness', 'ValueChangedAsync', [
            e.field,
            e.data,
          ])
          .subscribe((res: any) => {
            if (res) {
              this.gridSettledInvoices.rowDataSelected[e.field] = res[e.field];
              this.gridSettledInvoices.rowDataSelected = { ...res };
            }
          });
      }
    }
  }

  openVoucher(type:number) {
    if (!this.cashpayment.objectID) {
      this.notification.notifyCode(
        'SYS009',
        null,
        this.gridViewSetup['ObjectID'].headerText
      );
      return;
    }
    //this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      switch (this.formType) {
        case 'add':
          if (this.hasSaved) {
            this.dialog.dataService.updateDatas.set(
              this.cashpayment['_uuid'],
              this.cashpayment
            );
            this.dialog.dataService
              .save(null, 0, '', '', false)
              .subscribe((res) => {
                if (res && res.update.data != null) {
                  this.loadformSettledInvoices(type);
                }
              });
          } else {
            this.journalService.handleVoucherNoAndSave(
              this.journal,
              this.cashpayment,
              'AC',
              'AC_CashPayments',
              this.form,
              this.formType === 'edit',
              () => {
                this.dialog.dataService
                  .save(null, 0, '', '', false)
                  .subscribe((res) => {
                    if (res && res.save.data != null) {
                      this.hasSaved = true;
                      this.loadformSettledInvoices(type);
                    }
                  });
              }
            );
          }
          break;
        case 'edit':
          this.dialog.dataService.updateDatas.set(
            this.cashpayment['_uuid'],
            this.cashpayment
          );
          this.dialog.dataService
            .save(null, 0, '', '', false)
            .subscribe((res) => {
              if (res && res.update.data != null) {
                this.loadformSettledInvoices(type);
              }
            });
          break;
      }
    }
  }

  addRow() {
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
    //           this.cashpayment['_uuid'],
    //           this.cashpayment
    //         );
    //         this.dialog.dataService
    //           .save(null, 0, '', '', false)
    //           .subscribe((res) => {
    //             if (res && res.update.data != null) {
    //               this.loadModegrid();
    //             }
    //           });
    //       } else {
    //         this.journalService.handleVoucherNoAndSave(
    //           this.journal,
    //           this.cashpayment,
    //           'AC',
    //           'AC_CashPayments',
    //           this.form,
    //           this.formType === 'edit',
    //           () => {
    //             this.dialog.dataService
    //               .save(null, 0, '', '', false)
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
    //         this.cashpayment['_uuid'],
    //         this.cashpayment
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

  deleteRow(data) {
    this.notification.alertCode('SYS030', null).subscribe((res) => {
      if (res.event.status === 'Y') {
        if (this.cashpayment.subType == '1') {
          switch (this.modegrid) {
            case '1':
              this.gridCashPaymentLine.deleteRow(data);
              if (this.gridCashPaymentLine.dataSource.length > 0) {
                for (
                  let i = 0;
                  i < this.gridCashPaymentLine.dataSource.length;
                  i++
                ) {
                  this.gridCashPaymentLine.dataSource[i].rowNo = i + 1;
                }
              }
              this.cashpaymentline = this.gridCashPaymentLine.dataSource;
              break;
            case '2':
              let index = this.cashpaymentline.findIndex(
                (x) => x.recID == data.recID
              );
              this.cashpaymentline.splice(index, 1);
              for (let i = 0; i < this.cashpaymentline.length; i++) {
                this.cashpaymentline[i].rowNo = i + 1;
              }
              break;
          }
          this.api
            .execAction<any>('AC_CashPaymentsLines', [data], 'DeleteAsync')
            .subscribe((res) => {
              if (res) {
                this.hasSaved = true;
                this.api
                  .exec(
                    'AC',
                    'CashPaymentsLinesBusiness',
                    'UpdateAfterDelete',
                    [this.cashpaymentline]
                  )
                  .subscribe((res) => {});
              }
            });
        }
      }
    });
  }

  editRow(data) {
    switch (this.modegrid) {
      case '1':
        if (this.cashpayment.subType == '1')
          this.gridCashPaymentLine.updateRow(data.rowNo, data);
        if (this.cashpayment.subType == '2')
          this.gridSettledInvoices.updateRow(data.rowNo, data);
        break;
      case '2':
        let index = this.cashpaymentline.findIndex(
          (x) => x.recID == data.recID
        );
        var obj = {
          headerText: this.headerText,
          data: { ...data },
          datacash: this.cashpayment,
          type: 'edit',
          lockFields: this.lockFields,
          journal: this.journal,
        };
        let opt = new DialogModel();
        let dataModel = new FormModel();
        dataModel.formName = 'CashPaymentsLines';
        dataModel.gridViewName = 'grvCashPaymentsLines';
        dataModel.entityName = 'AC_CashPaymentsLines';
        opt.FormModel = dataModel;
        opt.Resizeable = false;
        this.cache
          .gridViewSetup('CashPaymentsLines', 'grvCashPaymentsLines')
          .subscribe((res) => {
            if (res) {
              var dialogs = this.callfc.openForm(
                PopAddLinecashComponent,
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
                  this.cashpaymentline[index] = dataline;
                  this.hasSaved = true;
                  this.loadTotal();
                  if ((Number(this.total) > this.cashpayment.paymentAmt)) {
                    this.notification.notifyCode(
                      'AC0012',
                    );
                  }
                }
              });
            }
          });
        break;
    }
  }

  setDefault(o) {
    return this.api.exec('AC', 'CashPaymentsBusiness', 'SetDefaultAsync', [
      this.journalNo,
    ]);
  }

  openPopupLine(data) {
    var obj = {
      headerText: this.headerText,
      data: { ...data },
      dataline: this.cashpaymentline,
      datacash: this.cashpayment,
      type: 'add',
      lockFields: this.lockFields,
      journal: this.journal,
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'CashPaymentsLines';
    dataModel.gridViewName = 'grvCashPaymentsLines';
    dataModel.entityName = 'AC_CashPaymentsLines';
    opt.FormModel = dataModel;
    this.cache
      .gridViewSetup('CashPaymentsLines', 'grvCashPaymentsLines')
      .subscribe((res) => {
        if (res) {
          var dialogs = this.callfc.openForm(
            PopAddLinecashComponent,
            '',
            650,
            null,
            '',
            obj,
            '',
            opt
          );
          dialogs.closed.subscribe((res) => {
            if (res.event != null) {
              var dataline = res.event['data'];
              this.cashpaymentline.push(dataline);
              this.loadTotal();
              if ((Number(this.total) > this.cashpayment.paymentAmt)) {
                this.notification.notifyCode(
                  'AC0012',
                );
              }
            }
          });
        }
      });
  }

  onEdit(e:any){

  }
  onAddNew(e:any){

  }
  //#endregion

  //#region Method
  onSave() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      switch (this.formType) {
        case 'add':
        case 'copy':
          this.cashpayment.status = '1';
          if (this.hasSaved) {
            this.dialog.dataService.updateDatas.set(
              this.cashpayment['_uuid'],
              this.cashpayment
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
              this.cashpayment,
              'AC',
              'AC_CashPayments',
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
            this.cashpayment,
            'AC',
            'AC_CashPayments',
            this.form,
            this.formType === 'edit',
            () => {
              if (this.cashpayment.status == '0') {
                this.cashpayment.status = '1';
              }
              this.dialog.dataService.updateDatas.set(
                this.cashpayment['_uuid'],
                this.cashpayment
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

  onSaveAdd() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      this.cashpayment.status = '1';
      if (this.hasSaved) {
        this.dialog.dataService.updateDatas.set(
          this.cashpayment['_uuid'],
          this.cashpayment
        );
        this.dialog.dataService.save().subscribe((res) => {
          if (res && res.update.data != null) {
            this.clearCashpayment();
            this.dialog.dataService.clear();
            this.dialog.dataService
              .addNew((o) => this.setDefault(o))
              .subscribe((res) => {
                this.cashpayment = res;
                this.form.formGroup.patchValue(this.cashpayment);
                this.hasSaved = false;
              });
          }
        });
      } else {
        // nếu voucherNo đã tồn tại,
        // hệ thống sẽ đề xuất một mã mới theo thiệt lập đánh số tự động
        this.journalService.handleVoucherNoAndSave(
          this.journal,
          this.cashpayment,
          'AC',
          'AC_CashPayments',
          this.form,
          this.formType === 'edit',
          () => {
            this.dialog.dataService.save().subscribe((res) => {
              if (res && res.save.data != null) {
                this.clearCashpayment();
                this.dialog.dataService.clear();
                this.dialog.dataService
                  .addNew((o) => this.setDefault(o))
                  .subscribe((res) => {
                    this.cashpayment = res;
                    this.form.formGroup.patchValue(this.cashpayment);
                  });
              }
            });
          }
        );
      }
    }
  }

  onDiscard() {
    this.dialog.dataService
      .delete([this.cashpayment], true, null, '', 'AC0010', null, null, false)
      .subscribe((res) => {
        if (res.data != null) {
          this.dialog.close();
          this.dt.detectChanges();
        }
      });
  }
  //#endregion

  //#region Function
  setDataGrid(updateColumn, data) {
    if (updateColumn) {
      var arrColumn = [];
      arrColumn = updateColumn.split(';');
      if (arrColumn && arrColumn.length) {
        arrColumn.forEach((e) => {
          if (e) {
            let field = Util.camelize(e);
            this.gridCashPaymentLine.rowDataSelected[field] = data[field];
            this.gridCashPaymentLine.rowDataSelected = {
              ...data,
            };
            this.gridCashPaymentLine.rowDataSelected.updateColumns = '';
          }
        });
      }
    }
  }

  checkValidate() {
    if (this.cashpaymentline.length == 0) {
      this.notification.notifyCode(
        'AC0013'
      );
      this.validate++;
      return;
    }
    // tu dong khi luu, khong check voucherNo
    let ignoredFields: string[] = [];
    if (this.journal.voucherNoRule === '2') {
      ignoredFields.push('VoucherNo');
    }
    ignoredFields = ignoredFields.map((i) => i.toLowerCase());
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.cashpayment);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        if (ignoredFields.includes(keygrid[index].toLowerCase())) {
          continue;
        }

        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.cashpayment[keymodel[i]] == null ||
              String(this.cashpayment[keymodel[i]]).match(/^ *$/) !== null
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

    this.cashpayment.memo = this.acService.setMemo(
      this.cashpayment,
      this.reason
    );
    this.form.formGroup.patchValue(this.cashpayment);
  }

  setVoucherRef(datas: Array<any> = []) {
    const t = this;
    datas.forEach((e, i) => {
      let data = { ...this.gridSettledInvoices.formGroup.value };

      Object.keys(e).forEach((key) => {
        data[key] = e[key];
      });

      data.transID = t.cashpayment.recID;
      data.lineType = t.cashpayment.subType;
      data.settledID = Util.uid();
      data.lineID = e.recID;
      data.recID = Util.uid();
      data.createdBy = this.authStore.get().userID;
      data['rowNo'] = i;

      let exits = this.settledInvoices.findIndex((x) => x.lineID == e.recID);

      if (exits == -1) {
        this.settledInvoices.push(data);
        this.api
          .execAction<any>('AC_SettledInvoices', [data], 'SaveAsync')
          .subscribe((res) => {});
      } else {
      }
    });
    this.gridSettledInvoices.gridRef.refresh();
  }

  clearCashpayment() {
    this.cashpaymentline = [];
    this.reason = [];
  }
  loadBookmark(e) {
    var bm = e.filter(
      (x: { functionID: string }) =>
        x.functionID == 'ACT041003' ||
        x.functionID == 'ACT041002' ||
        x.functionID == 'ACT041004'
    );
    for (var i = 0; i < bm.length; i++) {
      bm[i].disabled = true;
    }
  }

  loadFuncid() {
    switch (this.dialog.formModel.funcID) {
      case 'ACT0410':
      case 'ACT0401':
        this.loadvll('AC091');
        break;
      case 'ACT0429':
        this.loadvll('AC092');
        break;
    }
  }

  loadvll(vll) {
    this.cache.valueList(vll).subscribe((res) => {
      if (res.datas) {
        this.vllCashbook = res.datas[0];
        this.cashpayment.category = this.vllCashbook.value;
        if (this.formType == 'add' && this.cashBook != null) {
          (
            this.cashBook.ComponentCurrent as CodxComboboxComponent
          ).dataService.data = [];
          this.cashBook.crrValue = null;
          this.cashpayment.cashBookID = null;
          this.form.formGroup.patchValue(this.cashpayment);
        }
      }
    });
  }

  loadReason() {
    this.api
      .exec<any>('AC', 'CommonBusiness', 'LoadReason', [
        '1',
        this.reason,
        this.cashpayment,
      ])
      .subscribe((res) => {
        if (res) {
          this.reason = res;
        }
      });
  }

  loadModegrid() {
    let data = new CashPaymentLine();
    let idx;
    this.api
      .exec<any>('AC', 'CashPaymentsLinesBusiness', 'SetDefaultAsync', [
        this.cashpayment,
        data,
      ])
      .subscribe((res) => {
        if (res) {
          switch (this.modegrid) {
            case '1':
              idx = this.gridCashPaymentLine.dataSource.length;
              res.rowNo = idx + 1;
              // this.api
              //   .execAction<any>('AC_CashPaymentsLines', [res], 'SaveAsync')
              //   .subscribe((save) => {
              //     if (save) {
              //       this.gridCashPaymentLine.addRow(res, idx);
              //     }
              //   });
              this.gridCashPaymentLine.addRow(res, idx);

              break;
            case '2':
              idx = this.cashpaymentline.length;
              res.rowNo = idx + 1;
              this.openPopupLine(res);
              break;
          }
        }
      });
  }crea

  loadformSettledInvoices(type:number) {
    var obj = {
      cashpayment: this.cashpayment,
      type
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'SubLedgerOpen';
    dataModel.gridViewName = 'grvSubLedgerOpen';
    dataModel.entityName = 'AC_SubLedgerOpen';
    opt.FormModel = dataModel;
    opt.Resizeable = true;
    let voucherDialog = this.callfc.openForm(
      VoucherComponent,
      '',
      1200,
      800,
      '',
      obj,
      '',
      opt
    );
    voucherDialog.closed.subscribe((res) => {
      if (res && res.event && res.event.length) {
        // this.setVoucherRef(res.event);
        this.settledInvoices = res.event;
        this.gridSettledInvoices.gridRef.refresh();
      }
    });
  }

  loadInit(){
    switch (this.formType) {
      case 'add':
        if (
          this.cashpayment.unbounds &&
          this.cashpayment.unbounds.lockFields &&
          this.cashpayment.unbounds.lockFields.length
        ) {
          this.lockFields = this.cashpayment.unbounds
            .lockFields as Array<string>;
        }
        break;
      case 'edit':
        if (
          this.cashpayment?.subType == '1' ||
          this.cashpayment?.subType == '3'
        ) {
          //#region  load cashpaymentline
          this.acService
            .loadData(
              'ERM.Business.AC',
              'CashPaymentsLinesBusiness',
              'LoadDataAsync',
              this.cashpayment.recID
            )
            .subscribe((res: any) => {
              if (res.length > 0) {
                this.cashpaymentline = res;
                this.loadTotal();
              }
            });
          this.api
            .exec<any>('AC', 'JournalsBusiness', 'GetJournalAsync', [
              this.journalNo,
            ])
            .subscribe((res) => {
              this.lockFields = res[1];
            });
        }
        if (this.cashpayment?.subType == '2') {
          this.acService
            .loadData(
              'ERM.Business.AC',
              'SettledInvoicesBusiness',
              'LoadDataAsync',
              this.cashpayment.recID
            )
            .subscribe((res: any) => {
              this.settledInvoices = res;
            });

          //#endregion
        }
        break;
    }
    if (this.cashpayment.status == '0' && this.formType == 'edit') {
      this.hasSaved = true;
    }
  }

  loadjounal(){
    const options = new DataRequest();
    options.entityName = 'AC_Journals';
    options.predicates = 'JournalNo=@0';
    options.dataValues = this.cashpayment.journalNo;
    options.pageLoading = false;
    this.api
      .execSv<any>('AC','Core','DataBusiness', 'LoadDataAsync',options)
      .pipe(map((r) => r[0]))
      .subscribe((res) => {
        this.journal = res[0];
        this.modegrid = this.journal.inputMode;
      });
  }

  loadCompanySetting(){
    this.api
    .exec<any>('AC', 'CommonBusiness', 'GetCompanySettings')
    .subscribe((res) => {
      this.baseCurr = res.baseCurr;
    });
  }

  onDrop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }
  //#endregion
}
