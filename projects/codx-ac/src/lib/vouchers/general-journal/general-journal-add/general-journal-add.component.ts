import { ChangeDetectionStrategy, Component, HostListener, Injector, Optional, ViewChild } from '@angular/core';
import { CodxFormComponent, CodxGridviewV2Component, DialogData, DialogModel, DialogRef, FormModel, NotificationsService, SubModel, UIComponent, Util } from 'codx-core';
import { CodxAcService, fmGeneralJournalsLines, fmGeneralJournalsLinesOne, fmSettledInvoices, fmVATInvoices } from '../../../codx-ac.service';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-approval/tab/model/tabControl.model';
import { RoundService } from '../../../round.service';
import { Subject, takeUntil } from 'rxjs';
import { AC_GeneralJournalsLines } from '../../../models/AC_GeneralJournalsLines.model';
import { SettledInvoicesAdd } from '../../../share/settledinvoices-add/settledinvoices-add.component';

@Component({
  selector: 'lib-general-journal-add',
  templateUrl: './general-journal-add.component.html',
  styleUrls: ['./general-journal-add.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralJournalAddComponent extends UIComponent {
  //#region Constructor
  @ViewChild('eleGridGeneral') eleGridGeneral: CodxGridviewV2Component; //? element codx-grv2 lưới
  @ViewChild('eleGridSettledInvoices') eleGridSettledInvoices: CodxGridviewV2Component; //? element codx-grv2 lưới SettledInvoices
  @ViewChild('eleGridVatInvoices') eleGridVatInvoices: CodxGridviewV2Component; //? element codx-grv2 lưới VatInvoices
  @ViewChild('formGeneral') public formGeneral: CodxFormComponent; //? element codx-form
  @ViewChild('elementTabDetail') elementTabDetail: any; //? element object các tab detail(chi tiết,hóa đơn công nợ,hóa đơn GTGT)
  @ViewChild('eleCbxReasonID') eleCbxReasonID: any; //? element codx-input cbx của lý do chi
  @ViewChild('eleCbxObjectID') eleCbxObjectID: any; //? element codx-input cbx của đối tượng
  headerText: string; //? tên tiêu đề
  dialog!: DialogRef; //? dialog truyền vào
  dialogData?: any; //? dialog hứng data truyền vào
  dataDefault: any; //? data của cashpayment
  journal: any; //? data sổ nhật kí
  bankAcctIDPay: any = null;
  bankNamePay: any;
  bankAcctIDReceive: any = null;
  bankReceiveName: any;
  ownerReceive: any;
  isload:any = true;
  fmGeneralJournalsLines: any = fmGeneralJournalsLines;
  fmGeneralJournalsLinesOne :any = fmGeneralJournalsLinesOne
  //fmCashpaymentLineOne: any = fmCashPaymentsLinesOneAccount;
  fmSettledInvoices:any = fmSettledInvoices;
  fmVATInvoices:any = fmVATInvoices;
  tabInfo: TabModel[] = [ //? thiết lập footer
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'References', textDefault: 'Liên kết', isActive: false },
  ];
  childModelCashPayment: SubModel = {
    gridviewName:'grvVATInvoices',
    formName:'VATInvoices',
    entityName:'AC_VATInvoices',
    service:'AC',
    predicates:'LineID=@0',
    rowNoField:'rowNo',
  }
  baseCurr: any; //? đồng tiền hạch toán
  vatAccount: any; //? tài khoản thuế của hóa đơn GTGT (xử lí cho chi khác)?
  isPreventChange:any = false;
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private notification: NotificationsService,
    private roundService: RoundService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog; //? dialog truyền vào
    this.dialogData = dialogData; //? data dialog truyền vào
    this.headerText = dialogData.data?.headerText; //? get tên tiêu đề
    this.dataDefault = { ...dialogData.data?.oData }; //? get data của Cashpayments
    this.journal = { ...dialogData.data?.journal }; //? get data sổ nhật kí
    this.baseCurr = dialogData.data?.baseCurr; //? get đồng tiền hạch toán
  }
  //#endregion Constructor

  //#region Init
  onInit(): void {
    
  }

  ngAfterViewInit() {
    if(this.formGeneral?.data?.coppyForm) this.formGeneral.data._isEdit = true; //? test copy để tạm
  }

  /**
   * *Hàm init sau khi form được vẽ xong
   * @param event
   */
  onAfterInitForm(event){
    this.setValidateForm();
    this.detectorRef.detectChanges();
  }

  beforeInitGridGeneral(eleGrid:CodxGridviewV2Component){
    //* Thiết lập format number theo đồng tiền hạch toán
    this.settingFormatGridCashPayment(eleGrid)

    //* Thiết lập datasource combobox theo sổ nhật ký
    let preAccountID = '';
    let dtvAccountID = '';
    let preOffsetAcctID = '';
    let dtvOffsetAcctID = '';
    let preDIM1 = '';
    let dtvDIM1 = '';
    let preDIM2 = '';
    let dtvDIM2 = '';
    let preDIM3 = '';
    let dtvDIM3 = '';
    let hideFields = [];

    if (this.journal.drAcctControl == '1' || this.journal.drAcctControl == '2') { //? nếu tài khoản nợ là mặc định hoặc trong danh sách
      preAccountID = '@0.Contains(AccountID)';
      dtvAccountID = `[${this.journal?.drAcctID}]`;
    }
    eleGrid.setPredicates('accountID',preAccountID,dtvAccountID);

    if ((this.journal.crAcctControl == '1' || this.journal.crAcctControl == '2') && this.journal.entryMode == '1') { //? nếu tài khoản có là mặc định hoặc trong danh sách
      preOffsetAcctID = '@0.Contains(AccountID)';
      dtvOffsetAcctID = `[${this.journal?.crAcctID}]`;
    }
    eleGrid.setPredicates('offsetAcctID',preOffsetAcctID,dtvOffsetAcctID);

    if (this.journal.diM1Control == '1' || this.journal.diM1Control == '2') { //? nếu phòng ban là mặc định hoặc trong danh sách
      preDIM1 = '@0.Contains(DepartmentID)';
      dtvDIM1 = `[${this.journal?.diM1}]`;
    }
    eleGrid.setPredicates('diM1',preDIM1,dtvDIM1);

    if (this.journal.diM2Control == '1' || this.journal.diM2Control == '2') { //? nếu TTCP là mặc định hoặc trong danh sách
      preDIM2 = '@0.Contains(CostCenterID)';
      dtvDIM2 = `[${this.journal?.diM2}]`;
    }
    eleGrid.setPredicates('diM2',preDIM2,dtvDIM2);

    if (this.journal.diM3Control == '1' || this.journal.diM3Control == '2') { //? nếu mục phí là mặc định hoặc trong danh sách
      preDIM3 = '@0.Contains(CostItemID)';
      dtvDIM3 = `[${this.journal?.diM3}]`;
    }
    eleGrid.setPredicates('diM3',preDIM3,dtvDIM3);

    //* Thiết lập ẩn hiện các cột theo sổ nhật ký
    if (this.dialogData?.data.hideFields && this.dialogData?.data.hideFields.length > 0) {
      hideFields = [...this.dialogData?.data.hideFields]; //? get danh sách các field ẩn được truyền vào từ dialogdata
    }
    if (!hideFields.includes('Settlement') && this.formGeneral?.data?.subType == '1') { //? nếu chứng từ loại chi thanh toán nhà cung cấp(ko theo hóa đơn)
      hideFields.push('Settlement'); //? => ẩn field phương pháp cấn trừ
    }

    //* Thiết lập các field ẩn cho 2 mode tài khoản
    if (this.journal.entryMode == '1') {
      if (this.formGeneral?.data?.currencyID == this.baseCurr) { //? nếu chứng từ có tiền tệ = đồng tiền hạch toán
        hideFields.push('DR2'); //? => ẩn field tiền Nợ,HT
      }
    } else { //? nếu loại mode 1 tài khoản trên nhiều dòng
      if (this.formGeneral?.data?.currencyID == this.baseCurr) {
        //? nếu chứng từ có tiền tệ = đồng tiền hạch toán
        hideFields.push('DR2'); //? => ẩn field tiền Có,HT
        hideFields.push('CR2'); //? => ẩn field tiền Nợ,HT
      }
    }
    eleGrid.showHideColumns(hideFields);
  }

  /**
   * *Hàm khởi tạo trước khi init của lưới SettledInvoices (Ẩn hiện các cột theo đồng tiền hạch toán)
   * @param columnsGrid danh sách cột của lưới
   */
  beforeInitGridSettledInvoices(eleGrid) {
    //* Thiết lập các field ẩn theo đồng tiền hạch toán
    let hideFields = [];
    if (this.formGeneral?.data?.currencyID == this.baseCurr) { //? nếu chứng từ có tiền tệ = đồng tiền hạch toán
      hideFields.push('BalAmt2'); //? ẩn cột tiền Số dư, HT của SettledInvoices
      hideFields.push('SettledAmt2'); //? ẩn cột tiền thanh toán,HT của SettledInvoices
      hideFields.push('SettledDisc2'); //? ẩn cột chiết khấu thanh toán, HT của SettledInvoices
    }
    eleGrid.showHideColumns(hideFields);
  }

  /**
   * *Hàm hủy các observable api
   */
  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  //#endregion Init

  //#region Event

  /**
   * *Hàm click nút đóng form
   */
  closeForm() {
    this.onDestroy();
    this.dialog.close();
  }

  /**
   * *Hàm click các morefunction của CashpaymentLines
   * @param event
   * @param data
   */
  clickMF(event: any, data) {
    switch (event.functionID) {
      case 'SYS104':
        this.copyRow(data);
        break;
      case 'SYS102':
        this.deleteRow(data);
        break;
    }
  }

  /**
   * *Hàm xử lí khi change value trên master
   * @param event
   */
  valueChangeMaster(event: any) {
    let field = event?.field || event?.ControlName;
    let value = event?.data || event?.crrValue;
    if (event && value && this.formGeneral.hasChange(this.formGeneral.preData,this.formGeneral.data)) {
      this.formGeneral.data.updateColumns = '';
      switch (field.toLowerCase()) {
        case 'reasonid':
          let memos = this.getMemoMaster();
          this.formGeneral.setValue('memo',memos,{});
          break;
        case 'objectid':
          let objectType = event?.component?.itemsSelected[0]?.ObjectType || '';
          this.formGeneral.setValue('objectType',objectType,{});
          let memo = this.getMemoMaster();
          this.formGeneral.setValue('memo',memo,{});
          break;
      }
    }
  }

  /**
   * *Hàm xử lí change value trên detail
   * @param event
   */
  valueChangeLine(event: any) {
    let oLine = event.data;
    let oAccount = this.acService.getCacheValue('account',oLine.accountID);
    let oOffsetAccount = this.acService.getCacheValue('account',oLine.offsetAcctID);
    switch (event.field.toLowerCase()) {
      case 'accountid':
        this.setLockAndRequireFields(oLine, oAccount, oOffsetAccount);
        break;
      case 'offsetacctid':
        if (oOffsetAccount) {
          oLine.isBrigdeAcct = false;
        } else {
          oLine.isBrigdeAcct =
            (oOffsetAccount as any)?.accountType == '5' ? true : false;
        }
        this.setLockAndRequireFields(oLine, oAccount, oOffsetAccount);
        break;
      case 'dr':
        this.eleGridGeneral.startProcess();
        if (oLine.dr != 0 && oLine.cR2 != 0) {
          oLine.cr = 0;
          oLine.cR2 = 0;
        }
        setTimeout(() => {
          oLine = this.calcAmt2(this.formGeneral.data, oLine, true);
          if (this.journal.entryMode == '2') {
            this.setLockAndRequireFields(oLine, oAccount, oOffsetAccount);
          }
          this.detectorRef.detectChanges();   
          this.eleGridGeneral.endProcess();
        }, 200);
        break;
      case 'cr':
        this.eleGridGeneral.startProcess();
        if ((oLine.cr! = 0 && oLine.dR2 != 0)) {
          oLine.dr = 0;
          oLine.dR2 = 0;
        }
        setTimeout(() => {
          oLine = this.calcAmt2(this.formGeneral.data, oLine, false);
          if (this.journal.entryMode == '2') {
            this.setLockAndRequireFields(oLine, oAccount, oOffsetAccount);
          }
          this.detectorRef.detectChanges();
          this.eleGridGeneral.endProcess();
        }, 200);
        break;
      case 'dr2':
        this.eleGridGeneral.startProcess();
        if (oLine.dR2 != 0 && oLine.cR2 != 0) {
          oLine.cr = 0;
          oLine.cR2 = 0;
        }
        if (oLine.dr == 0 && (oOffsetAccount as any)?.multiCurrency) {
          setTimeout(() => {
            if (this.formGeneral.data.multi) {
              oLine.dr = this.formGeneral.data.exchangeRate != 0 ? this.roundService.amount(oLine.cR2 / this.formGeneral.data.exchangeRate,this.formGeneral.data.currencyID) : oLine.cR2;
            } else {
              oLine.dr = this.roundService.amount(oLine.cR2 * this.formGeneral.data.exchangeRate,this.formGeneral.data.currencyID);
            }
            if(oLine.updateColumns && !oLine.updateColumns.includes('DR')) oLine.updateColumns += 'DR;';
            if(oLine.updateColumns && !oLine.updateColumns.includes('CR')) oLine.updateColumns += 'CR;';
            if(oLine.updateColumns && !oLine.updateColumns.includes('CR2')) oLine.updateColumns += 'CR2;';
            this.eleGridGeneral.endProcess();
          }, 200);
        }
        this.eleGridGeneral.endProcess();
        break;
      case 'cr2':
        this.eleGridGeneral.startProcess();
        if (oLine.cR2 != 0 && oLine.dR2 != 0) {
          oLine.dr = 0;
          oLine.dR2 = 0;
        }
        if (oLine.cr == 0 && (oOffsetAccount as any)?.multiCurrency) {
          setTimeout(() => {
            if (this.formGeneral.data.multi) {
              oLine.cr = this.formGeneral.data.exchangeRate != 0 ? this.roundService.amount(oLine.cR2 / this.formGeneral.data.exchangeRate,this.formGeneral.data.currencyID) : oLine.cR2;
            } else {
              oLine.cr = this.roundService.amount(oLine.cR2 * this.formGeneral.data.exchangeRate,this.formGeneral.data.currencyID);
            }
            if(oLine.updateColumns && !oLine.updateColumns.includes('DR')) oLine.updateColumns += 'DR;';
            if(oLine.updateColumns && !oLine.updateColumns.includes('DR2')) oLine.updateColumns += 'DR2;';
            if(oLine.updateColumns && !oLine.updateColumns.includes('CR')) oLine.updateColumns += 'CR;';
            this.eleGridGeneral.endProcess();
          }, 200);
        }
        break;
      case 'note':
        oLine.reasonID = event?.itemData?.ReasonID;
        if(oLine.updateColumns && !oLine.updateColumns.includes('AccountID')) oLine.updateColumns += 'AccountID;';
        setTimeout(() => {
          oLine.accountID = event?.itemData?.OffsetAcctID;
          this.detectorRef.detectChanges();
          oAccount = this.acService.getCacheValue('account',oLine.accountID);
          this.setLockAndRequireFields(oLine,oAccount,oOffsetAccount);
        }, 200);
        break;
    }
  }

  /**
   * *Hàm xử lí change value của hóa đơn công nợ (tab hóa đơn công nợ)
   * @param e
   */
  valueChangeLineSettledInvoices(e: any) {
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
              this.eleGridSettledInvoices.rowDataSelected[e.field] =
                res[e.field];
              this.eleGridSettledInvoices.rowDataSelected = { ...res };
            }
          });
      }
    }
  }

  /**
   * *Hàm xử lí change value của hóa đơn GTGT (tab hóa đơn GTGT)
   * @param event
   */
  valueChangeLineVATInvoices(event: any) {
    let oLine = event.data;
    if (event.field.toLowerCase() === 'goods') {
      this.formGeneral.data.unbounds = {
        itemID: event?.itemData?.ItemID,
      };
    }
    this.eleGridVatInvoices.startProcess();
    this.api.exec('AC', 'VATInvoicesBusiness', 'ValueChangeAsync', [
      'AC_CashPayments',
      this.formGeneral.data,
      oLine,
      event.field
    ]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res) {
        Object.assign(oLine, res);
        this.vatAccount = res?.vatAccount;
        this.detectorRef.detectChanges();
        this.eleGridVatInvoices.endProcess();
      }
    })
  }

  /**
   * *Hàm thêm dòng cho các lưới
   * @returns
   */
  onAddLine(typeBtn) {
    this.formGeneral.save(null, 0, '', '', false)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if(!res) return;
        if (res || res.save || res.update) {
          if (res || !res.save.error || !res.update.error) {
            if (this.eleGridGeneral && this.elementTabDetail?.selectingID == '0') { //? nếu lưới cashpayment có active hoặc đang edit
              this.eleGridGeneral.saveRow((res:any)=>{ //? save lưới trước
                if(res){
                  this.addRowDetailByType(typeBtn);
                }
              })
              return;
            }
            if (this.eleGridSettledInvoices && this.elementTabDetail?.selectingID == '1') { //? nếu lưới SettledInvoices có active hoặc đang edit
              this.eleGridSettledInvoices.saveRow((res:any)=>{ //? save lưới trước
                if(res){
                  this.addRowDetailByType(typeBtn);
                }
              })
              return;
            }
            if (this.eleGridVatInvoices && this.elementTabDetail?.selectingID == '2') { //? nếu lưới VatInvoices có active hoặc đang edit
              this.eleGridVatInvoices.saveRow((res:any)=>{ //? save lưới trước
                if(res){
                  this.addRowDetailByType(typeBtn);
                }
              })
              return;
            }
          }
        }
      });
  }

  /**
   * *Hàm xử lí các tab detail
   * @param event
   */
  onTabSelectedDetail(event) {
    // if (event.selectedIndex == 0 && this.formGeneral.data.subType == '9') {
    //   this.eleGridGeneral.refresh();
    // }
  }

  //#endregion Event

  //#region Method
  /**
   * *Hàm hủy bỏ chứng từ
   */
  onDiscardVoucher() {
    if (this.formGeneral && this.formGeneral.data._isEdit) {
      this.notification.alertCode('AC0010', null).subscribe((res) => {
        if (res.event.status === 'Y') {
          this.detectorRef.detectChanges();
          this.dialog.dataService
            .delete([this.formGeneral.data], false, null, '', '', null, null, false)
            .pipe(takeUntil(this.destroy$))
            .subscribe((res) => {
              if (res.data != null) {
                this.notification.notifyCode('E0860');
                this.dialog.close();
                this.onDestroy();
              }
            });
        }
      });
    }else{
      this.dialog.close();
      this.onDestroy();
    }
  }

  /**
   * *Hàm lưu chứng từ
   * @returns
   */
  onSaveVoucher(type) {
    this.formGeneral.save(null, 0, '', '', false)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(!res) return;
      if (res || res.save || res.update) {
        if (res || !res.save.error || !res.update.error) {
          if ((this.eleGridGeneral || this.eleGridGeneral?.isEdit) && this.elementTabDetail?.selectingID == '0') { //? nếu lưới cashpayment có active hoặc đang edit
            this.eleGridGeneral.saveRow((res:any)=>{ //? save lưới trước
              if(res){
                this.saveVoucher(type);
              }
            })
            return;
          }
          if ((this.eleGridSettledInvoices || this.eleGridSettledInvoices?.isEdit) && this.elementTabDetail?.selectingID == '1') { //? nếu lưới SettledInvoices có active hoặc đang edit
            this.eleGridSettledInvoices.saveRow((res:any)=>{ //? save lưới trước
              if(res){
                this.saveVoucher(type);
              }
            })
            return;
          }
          if ((this.eleGridVatInvoices || this.eleGridVatInvoices?.isEdit) && this.elementTabDetail?.selectingID == '2') { //? nếu lưới VatInvoices có active hoặc đang edit
            this.eleGridVatInvoices.saveRow((res:any)=>{ //? save lưới trước
              if(res){
                this.saveVoucher(type);
              }
            })
            return;
          }
        }
      }
    });
  }

  /**
   * lưu chứng từ
   */
  saveVoucher(type){
    this.api
      .exec('AC', 'GeneralJournalsBusiness', 'UpdateVoucherAsync', [
        this.formGeneral.data,
        this.journal,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res?.update) {
          this.dialog.dataService.update(res.data).subscribe();
          if (type == 'save') {
            this.onDestroy();
            this.dialog.close();
          }else{
            this.api
            .exec('AC', 'GeneralJournalsBusiness', 'SetDefaultAsync', [
              null,
              this.journal,
            ])
            .subscribe((res: any) => {
              if (res) {
                res.data.isAdd = true;
                this.formGeneral.refreshData({...res.data});
                setTimeout(() => {
                  this.refreshGrid();
                }, 100);
                this.detectorRef.detectChanges();
              }
            });
          }
          if (this.formGeneral.data.isAdd || this.formGeneral.data.isCopy)
            this.notification.notifyCode('SYS006');
          else 
            this.notification.notifyCode('SYS007');
          
        }
        if(this.eleGridGeneral && this.eleGridGeneral?.isSaveOnClick) this.eleGridGeneral.isSaveOnClick = false;
        if(this.eleGridSettledInvoices && this.eleGridSettledInvoices.isSaveOnClick) this.eleGridSettledInvoices.isSaveOnClick = false;
        if(this.eleGridVatInvoices && this.eleGridVatInvoices.isSaveOnClick) this.eleGridVatInvoices.isSaveOnClick = false;
      });
  }
  //#endregion Method

  //#region Function

   /**
   * *Hàm thêm dòng theo loại nút
   */
   addRowDetailByType(typeBtn) {
    switch (typeBtn) {
      case '1':
        this.addLine();
        break;
      case '2':
        this.openFormSettledInvoices();
        break;
      case '3':
        //this.addLineVatInvoices();
        break;
    }
  }

  /**
   * *Hàm thêm mới dòng cashpayments
   */
  addLine() {
    let oLine = this.setDefaultLine();
    this.eleGridGeneral.addRow(oLine,this.eleGridGeneral.dataSource.length);
  }

  /**
   * *Hàm set data mặc định từ master khi thêm dòng mới
   */
  setDefaultLine() {
    let cAcctID = null;
    let rAcctID = null;
    let oOffsetAcct = null;
    let oAccount = null;
    let model = new AC_GeneralJournalsLines();
    let oLine = Util.camelizekeyObj(model);
    oLine.transID = this.formGeneral.data.recID;
    oLine.objectID = this.formGeneral.data.objectID;
    oLine.reasonID = this.formGeneral.data.reasonID;

    let indexReason = this.eleCbxReasonID?.ComponentCurrent?.dataService?.data.findIndex((x) => x.ReasonID == this.eleCbxReasonID?.ComponentCurrent?.value);
    if (indexReason > -1) {
      rAcctID = this.eleCbxReasonID?.ComponentCurrent?.dataService?.data[indexReason].OffsetAcctID;
      oLine.note = this.eleCbxReasonID?.ComponentCurrent?.dataService?.data[indexReason].ReasonName;
    }

    if (this.journal?.entryMode == '1') {
      if (cAcctID) {
        switch (this.journal?.crAcctControl) {
          case '1':
            if (cAcctID == this.journal?.crAcctID) {
              oLine.offsetAcctID = cAcctID;
            } else {
              oLine.offsetAcctID = this.journal.crAcctID;
            }
            break;
          default:
            oLine.offsetAcctID = cAcctID;
            break;
        }
      }
    } else {
      oLine.offsetAcctID = null;
    }

    if (rAcctID) {
      switch (this.journal?.drAcctControl) {
        case '1':
          if (rAcctID == this.journal?.drAcctID) {
            oLine.accountID = rAcctID;
          } else {
            oLine.accountID = this.journal.drAcctID;
          }
          break;
        default:
          oLine.accountID = rAcctID;
          break;
      }
    }

    let dicSetting = JSON.parse(this.journal.extras);
    if (dicSetting) {
      if (
        dicSetting?.diM1Control &&
        dicSetting?.diM1Control != '2' &&
        dicSetting?.diM1Control != '9'
      ) {
        oLine.diM1 = this.journal.diM1;
      }
      if (
        dicSetting?.diM2Control &&
        dicSetting?.diM2Control != '2' &&
        dicSetting?.diM2Control != '9'
      ) {
        oLine.diM2 = this.journal.diM2;
      }
      if (
        dicSetting?.diM3Control &&
        dicSetting?.diM3Control != '2' &&
        dicSetting?.diM3Control != '9'
      ) {
        oLine.diM3 = this.journal.diM3;
      }
    }

    oAccount = this.acService.getCacheValue('account', oLine?.accountID);
    oOffsetAcct = this.acService.getCacheValue('account',oLine?.offsetAcctID);
    if (oLine?.offsetAcctID) {
      if (oOffsetAcct && oOffsetAcct?.accountType == '5') {
        oLine.isBrigdeAcct = true;
      }
    }
    if (oLine?.accountID) {
      if (oAccount) {
        oLine.singleEntry = oAccount?.accountType == '0' ? true : false;
        let bSubLGControl = oAccount?.subLGControl;
        if (!bSubLGControl && !oLine?.offsetAcctID) {
          bSubLGControl = oOffsetAcct?.subLGControl;
        }
      }
    }
    // this.oLine.createdBy = this.userID;
    let dRAmt = this.calcRemainAmt(this.formGeneral.data?.totalAmt);
    if (dRAmt > 0) {
      oLine.dr = dRAmt;
      oLine = this.calcAmt2(this.formGeneral.data,oLine,true);
    }
    return oLine;
  }

  /**
   * *Hàm tính số tiền khi thêm dòng
   * @param totalAmt
   * @returns
   */
  calcRemainAmt(totalAmt) {
    if (totalAmt == 0) {
      return 0;
    }
    let dRemainAmt = totalAmt;
    let dPayAmt = this.eleGridGeneral.dataSource.reduce((sum, data:any) => sum + data?.dr,0);
    dRemainAmt = dRemainAmt - dPayAmt;
    return dRemainAmt;
  }

  /**
   * *Hàm tính tiền theo tỷ giá
   * @param master
   * @param line
   * @param isdr
   * @returns
   */
  calcAmt2(master, line, isdr) {
    if (isdr) {
      let dDR2 = 0;
      if (master.multi) {
        dDR2 = this.roundService.baseCurr(line.dr * master.exchangeRate);
      } else {
        dDR2 =
          master.exchangeRate != 0
            ? this.roundService.baseCurr(line.dr / master.exchangeRate)
            : line.dr;
      }
      if (line.dR2 != dDR2) {
        line.dR2 = dDR2;
        if(line.updateColumns && !line.updateColumns.includes('DR2')) line.updateColumns += 'DR2;';
      }
      if (line.cR2 != 0) {
        line.cR2 = 0;
        if(line.updateColumns && !line.updateColumns.includes('CR2')) line.updateColumns += 'CR2;';
      }
    } else {
      let dCR2 = 0;
      if (master.multi) {
        dCR2 = this.roundService.baseCurr(line.cr * master.exchangeRate);
      } else {
        dCR2 =
          master.exchangeRate != 0
            ? this.roundService.baseCurr(line.cr / master.exchangeRate)
            : line.cr;
      }
      if (line.cR2 != dCR2) {
        line.cR2 = dCR2;
        if(line.updateColumns && !line.updateColumns.includes('CR2')) line.updateColumns += 'CR2;';
      }
      if (line.dR2 != 0) {
        line.dR2 = 0;
        if(line.updateColumns && !line.updateColumns.includes('DR2')) line.updateColumns += 'DR2;';
      }
    }
    return line;
  }

  /**
   * *Hàm ràng buộc không được bỏ trống phòng ban,mục phí,ttcp của tài khoản
   * @param oLine
   * @param oAccount
   * @param oOffsetAcct
   * @returns
   */
  setLockAndRequireFields(oLine, oAccount, oOffsetAcct) {
    if ((oAccount == null && oOffsetAcct == null) || (this.journal.entryMode == '2' && oLine.dr == 0 && oLine.cr == 0)) {
      return;
    } else {
      let rDIM1 = false;
      let rDIM2 = false;
      let rDIM3 = false;

      let lDIM1 = true;
      let lDIM2 = true;
      let lDIM3 = true;

      //* Set require field
      if (this.journal.entryMode == '1' && (oAccount?.diM1Control == '1' || oAccount?.diM1Control == '3' || oOffsetAcct?.diM1Control == '2' || oOffsetAcct?.diM1Control == '3'))
        rDIM1 = true;
      if (this.journal.entryMode == '2' && ((oAccount?.diM1Control == '1' && oLine.dr > 0) || (oAccount?.diM1Control == '2' && oLine.cr > 0) || oAccount?.diM1Control == '3'))
        rDIM1 = true;
      this.eleGridGeneral.setRequiredFields(['diM1'],rDIM1);

      if (this.journal.entryMode == '1' && (oAccount?.diM2Control == '1' || oAccount?.diM2Control == '3' || oOffsetAcct?.diM2Control == '2' || oOffsetAcct?.diM2Control == '3'))
        rDIM2 = true;
      if (this.journal.entryMode == '2' && ((oAccount?.diM2Control == '1' && oLine.dr > 0) || (oAccount?.diM2Control == '2' && oLine.cr > 0) || oAccount?.diM2Control == '3'))
        rDIM2 = true;
        this.eleGridGeneral.setRequiredFields(['diM2'],rDIM2);

      if (this.journal.entryMode == '1' && (oAccount?.diM3Control == '1' || oAccount?.diM3Control == '3' || oOffsetAcct?.diM3Control == '2' || oOffsetAcct?.diM3Control == '3'))
        rDIM3 = true;
      if (this.journal.entryMode == '2' && ((oAccount?.diM3Control == '1' && oLine.dr > 0) || (oAccount?.diM3Control == '2' && oLine.cr > 0) || oAccount?.diM3Control == '3'))
        rDIM3 = true;
        this.eleGridGeneral.setRequiredFields(['diM3'],rDIM3);

      //* Set lock field
      if (this.journal.entryMode == '1' && (oAccount?.diM1Control == '4' || oOffsetAcct?.diM1Control == '5'))
        lDIM1 = false;
      if (this.journal.entryMode == '2' && ((oAccount?.diM1Control == '4' && oLine.dr > 0) || (oAccount?.diM1Control == '5' && oLine.cr > 0)))
        lDIM1 = false;
      this.eleGridGeneral.setEditableFields(['diM1'],lDIM1);

      if (this.journal.entryMode == '1' && (oAccount?.diM2Control == '4' || oOffsetAcct?.diM2Control == '5'))
        lDIM2 = false;
      if (this.journal.entryMode == '2' && ((oAccount?.diM2Control == '4' && oLine.dr > 0) || (oAccount?.diM2Control == '5' && oLine.cr > 0)))
        lDIM2 = false;
      this.eleGridGeneral.setEditableFields(['diM2'],lDIM2);

      if (this.journal.entryMode == '1' && (oAccount?.diM3Control == '4' || oOffsetAcct?.diM3Control == '5'))
        lDIM3 = false;
      if (this.journal.entryMode == '2' && ((oAccount?.diM3Control == '4' && oLine.dr > 0) || (oAccount?.diM3Control == '5' && oLine.cr > 0)))
        lDIM3 = false;
      this.eleGridGeneral.setEditableFields(['diM3'],lDIM3);
    }
  }

  /**
   * *Hàm mở form chọn hóa đơn (Đề xuất thanh toán,Cấn trừ tự động)
   * @param typeSettledInvoices
   */
  openFormSettledInvoices() {
    let objectName = '';
    let indexObject =
      this.eleCbxObjectID?.ComponentCurrent?.dataService?.data.findIndex(
        (x) => x.ObjectID == this.formGeneral.data.objectID
      );
    if (indexObject > -1) {
      objectName =
        this.eleCbxObjectID?.ComponentCurrent?.dataService?.data[indexObject]
          .ObjectName;
    }
    let obj = {
      cashpayment: this.formGeneral.data,
      objectName: objectName,
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'AC_SubInvoices';
    dataModel.gridViewName = 'grvAC_SubInvoices';
    dataModel.entityName = 'AC_SubInvoices';
    opt.FormModel = dataModel;
    let dialog = this.callfc.openForm(
      SettledInvoicesAdd,
      '',
      null,
      null,
      '',
      obj,
      '',
      opt
    );
    dialog.closed.subscribe((res) => {
      if (res && res.event && res.event.length) {
        this.eleGridSettledInvoices.refresh();
        this.dialog.dataService.update(this.formGeneral.data).subscribe();
        this.detectorRef.detectChanges();
      }
    });
  }


  /**
   * *Hàm các sự kiện của lưới cashpayment
   * @param event
   */
  onActionGridGeneral(event: any) {
    switch (event.type) {
      case 'autoAdd': //? tự động thêm dòng
        this.onAddLine('1');
        break;
      case 'add':
      case 'update': //? sau khi thêm dòng thành công
        
        break;
      case 'closeEdit': //? khi thoát dòng
      if (this.eleGridGeneral && this.eleGridGeneral.rowDataSelected) {
        this.eleGridGeneral.rowDataSelected = null;
      }
      if(this.eleGridGeneral.isSaveOnClick) this.eleGridGeneral.isSaveOnClick = false;
      setTimeout(() => {
        let element = document.getElementById('btnAddCash'); //? focus lại nút thêm dòng
        element.focus();
      }, 100);
        break;
      case 'beginEdit': //? trước khi thêm dòng
        // if (event?.data.dr == 0) { //? khi số tiền < 0
        //   this.eleGridGeneral.startProcess(); //? ko cho lưu dòng
        // }
        let oAccount = this.acService.getCacheValue('account', event?.data.accountID);
        let oOffsetAccount = this.acService.getCacheValue('account',event?.data.offsetAcctID);
        this.setLockAndRequireFields(event?.data,oAccount,oOffsetAccount);
        break;
    }
  }

  /**
   * *Hàm các sự kiện của lưới VatInvoice
   * @param event
   */
  onActionGridVatInvoice(event: any) {
    switch (event.type) {
      case 'autoAdd':
        this.onAddLine('3');
        break;
      case 'closeEdit': //? khi thoát dòng
      if (this.eleGridVatInvoices && this.eleGridVatInvoices.rowDataSelected) {
        this.eleGridVatInvoices.rowDataSelected = null;
      }
      if(this.eleGridVatInvoices.isSaveOnClick) this.eleGridVatInvoices.isSaveOnClick = false; 
      setTimeout(() => {
        let element = document.getElementById('btnAddVAT');
        element.focus();
      }, 100);
        break;
    }
  }

  /**
   * *Hàm check validate trước khi save line (cashpayment)
   * @param data 
   * @returns 
   */
  beforeSaveRowGeneral(event:any){
    if (event.rowData) {
      if (event.rowData.dr == 0 && event.rowData.dR2 == 0) {
        this.eleGridGeneral.showErrorField('dr','E0094');
        event.cancel = true;
        return;
      }
    }
  }

  /**
   * *Hàm check validate trước khi save line (VATInvoice)
   * @param data 
   * @returns 
   */
  beforeSaveRowVATInvoice(event:any){
    if (event.rowData) {
      if (event.rowData.quantity == 0 || event.rowData.quantity < 0) {
        this.eleGridVatInvoices.showErrorField('quantity','E0341');
        event.cancel = true;
        return;
      }
      if (event.rowData.unitPrice == 0 || event.rowData.unitPrice < 0) {
        this.eleGridVatInvoices.showErrorField('unitPrice','E0730');
        event.cancel = true;
        return;
      }
    }
  }

  /**
   * *Hàm setting format tiền theo đồng tiền hạch toán
   * @param eleGrid
   */
  settingFormatGridCashPayment(eleGrid){
    let setting = eleGrid.systemSetting;
    if (this.formGeneral.data.currencyID == this.baseCurr) { //? nếu chứng từ có tiền tệ = đồng tiền hạch toán
      eleGrid.setFormatField('dr','n'+(setting.dBaseCurr || 0));
      eleGrid.setFormatField('cr','n'+(setting.dBaseCurr || 0));
      eleGrid.setFormatField('dr2','n'+(setting.dBaseCurr || 0));
      eleGrid.setFormatField('cr2','n'+(setting.dBaseCurr || 0));
    } else { //? nếu chứng từ có tiền tệ != đồng tiền hạch toán
      eleGrid.setFormatField('dr','n'+(setting.dSourceCurr || 0));
      eleGrid.setFormatField('cr','n'+(setting.dSourceCurr || 0));
      eleGrid.setFormatField('dR2','n'+(setting.dBaseCurr || 0));
      eleGrid.setFormatField('cR2','n'+(setting.dBaseCurr || 0));
    }
  }

  /**
   * *Hàm ẩn các morefunction trong lưới
   * @param event
   */
  changeMF(event,type = '') {
    if (type === 'gridgeneral') {
      event.forEach((element) => {
        if (element.functionID == 'SYS104' || element.functionID == 'SYS102') {
          element.disabled = false;
          element.isbookmark = false;
        }else{
          element.disabled = true;
        }
      });
    }else{
      event.forEach((element) => {
        if (element.functionID == 'SYS102') {
          element.disabled = false;
          element.isbookmark = false;
        }else{
          element.disabled = true;
        }
      });
    }
  }

  /**
   * *Hàm xóa dòng trong lưới
   * @param data
   */
  deleteRow(data) {
    if (this.eleGridGeneral && this.elementTabDetail?.selectingID == '0') {
      this.eleGridGeneral.saveRow((res:any)=>{ //? save lưới trước
        if(res){
          this.eleGridGeneral.deleteRow(data);
        }
      })
    }
    if (this.eleGridSettledInvoices && this.elementTabDetail?.selectingID == '1') {
      this.eleGridSettledInvoices.saveRow((res:any)=>{ //? save lưới trước
        if(res){
          this.eleGridSettledInvoices.deleteRow(data);
        }
      })
    }
    if (this.eleGridVatInvoices && this.elementTabDetail?.selectingID == '2') {
      this.eleGridVatInvoices.saveRow((res:any)=>{ //? save lưới trước
        if(res){
          this.eleGridVatInvoices.deleteRow(data);
        }
      })
    }
  }

  /**
   * *Hàm sao chép dòng trong lưới
   * @param data
   */
  copyRow(data) {
    if (this.eleGridGeneral && this.elementTabDetail?.selectingID == '0') {
      this.eleGridGeneral.saveRow((res:any)=>{ //? save lưới trước
        if(res){
          data.recID = Util.uid();
          data.index = this.eleGridGeneral.dataSource.length;
          delete data?._oldData;
          this.eleGridGeneral.addRow(data, this.eleGridGeneral.dataSource.length);
        }
      })
    }
    if (this.eleGridVatInvoices && this.elementTabDetail?.selectingID == '2') {
      this.eleGridVatInvoices.saveRow((res:any)=>{ //? save lưới trước
        if(res){
          data.recID = Util.uid();
          data.index = this.eleGridVatInvoices.dataSource.length;
          delete data?._oldData;
          this.eleGridVatInvoices.addRow(data, this.eleGridVatInvoices.dataSource.length);
        }
      })
    }
  }

  /**
   * *Hàm set validate cho form
   */
  setValidateForm(){
    let lstRequire :any = [];
    if (this.journal.assignRule == '2') {
      lstRequire.push({field : 'VoucherNo',isDisable : false,require:false});
    }
    this.formGeneral.setRequire(lstRequire);
  }

  /**
   * *Hàm get ghi chú từ lí do chi + đối tượng + tên người nhận
   * @returns
   */
  getMemoMaster() {
    let newMemo = ''; //? tên ghi chú mới
    let reasonName = ''; //? tên nghiep vu
    let objectName = ''; //? tên đối tượng

    let indexReason =
      this.eleCbxReasonID?.ComponentCurrent?.dataService?.data.findIndex(
        (x) => x.ReasonID == this.eleCbxReasonID?.ComponentCurrent?.value
      );
    if (indexReason > -1) {
      reasonName = this.eleCbxReasonID?.ComponentCurrent?.dataService?.data[indexReason].ReasonName + ' - ';
    }

    let indexObject = this.eleCbxObjectID?.ComponentCurrent?.dataService?.data.findIndex((x) => x.ObjectID == this.eleCbxObjectID?.ComponentCurrent?.value);
    if (indexObject > -1) {
      objectName = this.eleCbxObjectID?.ComponentCurrent?.dataService?.data[indexObject].ObjectName + ' - ';
    }

    newMemo = reasonName + objectName;
    return newMemo.substring(0, newMemo.lastIndexOf(' - ') + 1);
  }

  /**
   * *Hàm refresh tất cả dữ liệu chi tiết của tab detail
   */
  refreshGrid() {
    if(this.eleGridGeneral && this.elementTabDetail?.selectingID == '0'){
      this.eleGridGeneral.dataSource = [];
      this.eleGridGeneral.refresh();
      return;
    }
    if(this.eleGridSettledInvoices && this.elementTabDetail?.selectingID == '1'){
      this.eleGridSettledInvoices.dataSource = [];
      this.eleGridSettledInvoices.refresh();
      return;
    }
    if(this.eleGridVatInvoices && this.elementTabDetail?.selectingID == '2'){
      this.eleGridVatInvoices.dataSource = [];
      this.eleGridVatInvoices.refresh();
      return;
    }
  }

  @HostListener('click', ['$event']) //? focus out grid
  onClick(e) {
    if (
      (e.target.closest('.e-grid') == null &&
      e.target.closest('.e-popup') == null &&
      e.target.closest('.edit-value') == null) && 
      e.target.closest('button') == null
    ) {
      if (this.eleGridGeneral && this.eleGridGeneral?.gridRef?.isEdit) {
        this.eleGridGeneral.saveRow((res:any)=>{ //? save lưới trước
          if(res){
            this.eleGridGeneral.isSaveOnClick = false;
            setTimeout(() => {
              if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') {
                e.target.focus();
                e.target.select();
              }
            }, 100);
          }
        })
      }
      if (this.eleGridSettledInvoices && this.eleGridSettledInvoices?.gridRef?.isEdit) {
        this.eleGridSettledInvoices.saveRow((res:any)=>{ //? save lưới trước
          if(res){
            this.eleGridSettledInvoices.isSaveOnClick = false;
            setTimeout(() => {
              if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') {
                e.target.focus();
                e.target.select();
              }
            }, 100);
          }
        })
      }
      if (this.eleGridVatInvoices && this.eleGridVatInvoices?.gridRef?.isEdit) {
        this.eleGridVatInvoices.saveRow((res:any)=>{ //? save lưới trước
          if(res){
            this.eleGridVatInvoices.isSaveOnClick = false;
            setTimeout(() => {
              if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') {
                e.target.focus();
                e.target.select();
              }
            }, 100);
          }
        })
      }
    }
  }
  
  //#endregion Function

}
