import { ChangeDetectionStrategy, Component, HostListener, Injector, Optional, ViewChild } from '@angular/core';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import { CRUDService, CodxFormComponent, CodxGridviewV2Component, DataRequest, DialogData, DialogModel, DialogRef, FormModel, NotificationsService, UIComponent } from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-approval/tab/model/tabControl.model';
import { Subject, map, takeUntil } from 'rxjs';
import { CodxAcService } from '../../../codx-ac.service';
import { RoundService } from '../../../round.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ChooseJournalComponent } from '../../../share/choose-journal/choose-journal.component';
import { CashreceiptsAddComponent } from '../../cashreceipts/cashreceipts-add/cashreceipts-add.component';
import { CashPaymentAddComponent } from '../../cashpayments/cashpayments-add/cashpayments-add.component';
import { InventoryAddComponent } from '../../inventory/inventory-add/inventory-add.component';

@Component({
  selector: 'lib-cash-countings-add',
  templateUrl: './cash-countings-add.component.html',
  styleUrls: ['./cash-countings-add.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashCountingsAddComponent extends UIComponent {
  //#region Contructor
  @ViewChild('eleGridCounting') eleGridCounting: CodxGridviewV2Component;
  @ViewChild('eleGridMember') eleGridMember: CodxGridviewV2Component;
  @ViewChild('eleGridItems') eleGridItems: CodxGridviewV2Component;
  @ViewChild('eleGridAsset') eleGridAsset: CodxGridviewV2Component;
  @ViewChild('master') public master: CodxFormComponent;
  @ViewChild('elementTabMaster') elementTabMaster: any;
  @ViewChild('elementTabDetail') elementTabDetail: any;
  headerText: string;
  dialog!: DialogRef;
  dialogData?: any;
  dataDefault: any;
  journal: any;
  tabInfo: TabModel[] = [ //? thiết lập footer
    { name: 'History', textDefault: 'Lịch sử', isActive: false },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'References', textDefault: 'Liên kết', isActive: false },
  ];
  editSettings: EditSettingsModel = {
    allowAdding: false,
    allowEditing: false,
    allowDeleting: false,
    allowEditOnDblClick: false,
    allowNextRowEdit: false
  }
  baseCurr: any;
  isPreventChange: any = false;
  postDateControl: any;
  nextTabIndex: number;
  refNo: any;
  preData: any;
  isload: any = false;
  cashRecieptSV:CRUDService;
  cashPaymentSV:CRUDService;
  IRVoucherSV:CRUDService;
  IIVoucherSV:CRUDService;
  fmcashReciept:FormModel={
    formName:'CashReceipts',
    gridViewName:'grvCashReceipts',
    entityName:'AC_CashReceipts',
    funcID:'ACT211'
  }
  fmcashPayment:FormModel={
    formName:'CashPayments',
    gridViewName:'grvCashPayments',
    entityName:'AC_CashPayments',
    funcID:'ACT213'
  }
  fmIRVoucher:FormModel={
    formName:'InventoryReceipts',
    gridViewName:'grvInventoryReceipts',
    entityName:'IV_InventoryReceipts',
    funcID:'ACT511'
  }
  fmIIVoucher:FormModel={
    formName:'InventoryIssues',
    gridViewName:'grvInventoryIssues',
    entityName:'IV_InventoryIssues',
    funcID:'ACT521'
  }
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private notification: NotificationsService,
    private roundService: RoundService,
    private ngxLoader: NgxUiLoaderService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.dialogData = dialogData;
    this.headerText = dialogData.data?.headerText;
    this.dataDefault = { ...dialogData.data?.oData };
    this.preData = { ...dialogData.data?.oData };
    this.journal = { ...dialogData.data?.journal };
    if (dialog.formModel.funcID === 'ACT281') {
      this.cashRecieptSV = this.acService.createCRUDService(
        inject,
        this.fmcashReciept,
        'AC'
      );
      this.cashPaymentSV = this.acService.createCRUDService(
        inject,
        this.fmcashPayment,
        'AC'
      );
    }
    if (dialog.formModel.funcID === 'ACT581') {
      this.IRVoucherSV = this.acService.createCRUDService(
        inject,
        this.fmIRVoucher,
        'IV'
      );
      this.IIVoucherSV = this.acService.createCRUDService(
        inject,
        this.fmIIVoucher,
        'IV'
      );
    }
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.acService.setPopupSize(this.dialog, '100%', '100%');
    this.cache
      .viewSettingValues('ACParameters')
      .pipe(
        map((arr: any[]) => arr.find((a) => a.category === '1')),
        map((data) => JSON.parse(data.dataValue))
      ).subscribe((res: any) => {
        if (res) {
          this.postDateControl = res?.PostedDateControl;
        }
      })
  }

  ngAfterViewInit() {
    if (this.master?.data?.coppyForm) this.master.data._isEdit = true;
  }

  /**
   * *Hàm hủy các observable api
   */
  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnDestroy() {
    this.onDestroy();
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }
  //#endregion

  //#region Event
  /**
   * *Hàm click nút đóng form
   */
  closeForm() {
    this.onDestroy();
    this.dialog.close();
  }

  clickMF(event: any) {
    switch (event.event.functionID) {
      case 'SYS104':
        //this.copyRow(event.data);
        break;
      case 'SYS102':
        //this.deleteRow(event.data);
        break;
    }
  }

  selecting(event){
    if (event.isSwiped) {
      event.cancel = true;
    }
  }

  valueChangeMaster(event: any) {
    if (this.isPreventChange) {
      return;
    }
    let field = event?.field || event?.ControlName;
    this.master.setValue('updateColumns', '', {});
    switch (field.toLowerCase()) {
      case 'objectid':
        this.objectIDChange(field);
        break;
    }
  }

  /**
   * *Hàm xử lí change value trên detail
   * @param event
   */
  valueChangeLine(event: any) {
    let oLine = event.data;
    let field = event.field;
    this.eleGridCounting.startProcess();
    this.api.exec('AC','CountingFundsBusiness','ValueChangedAsync',[oLine,field]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      Object.assign(oLine, res);
      oLine.updateColumns = '';
      this.detectorRef.detectChanges();
      this.eleGridCounting.endProcess();
    })
  }

  /**
   * *Hàm xử lí change value trên detail
   * @param event
   */
  valueChangeLineItems(event: any) {
    let oLine = event.data;
    let field = event.field;
    this.eleGridItems.startProcess();
    this.api.exec('AC','CountingItemsBusiness','ValueChangedAsync',[oLine,field]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      Object.assign(oLine, res);
      oLine.updateColumns = '';
      this.detectorRef.detectChanges();
      this.eleGridItems.endProcess();
    })
  }

  valueChangeLineAsset(event: any) {
    let oLine = event.data;
    let field = event.field;
    this.eleGridAsset.startProcess();
    this.api.exec('AC','CountingAssetsBusiness','ValueChangedAsync',[oLine,field]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      Object.assign(oLine, res);
      oLine.updateColumns = '';
      this.detectorRef.detectChanges();
      this.eleGridAsset.endProcess();
    })
  }

  /**
   * *Hàm thêm dòng cho các lưới
   * @returns
   */
  onAddLine(type) {
    this.master.save(null, 0, '', '', false, { allowCompare: false ,skipHasChange:true})
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (!res) return;
        if (res.hasOwnProperty('save')) {
          if (res.save.hasOwnProperty('data') && !res.save.data) return;
        }
        if (res.hasOwnProperty('update')) {
          if (res.update.hasOwnProperty('data') && !res.update.data) return;
        }
        // if (this.eleGridMember && this.elementTabMaster?.selectingID == '1') {
        //   this.eleGridMember.saveRow((res: any) => { //? save lưới trước
        //     if (res && res.type != 'error') this.addRowDetail(type);
        //   })
        //   return;
        // }
        if (this.eleGridCounting && this.elementTabDetail?.selectingID == '0' && this.dialog.formModel.funcID === 'ACT281') {
          this.eleGridCounting.saveRow((res: any) => { //? save lưới trước
            if (res && res.type != 'error') this.addRowDetail(type);
          })
          return;
        }
        if (this.eleGridItems && this.elementTabDetail?.selectingID == '0' && this.dialog.formModel.funcID === 'ACT581') {
          this.eleGridItems.saveRow((res: any) => { //? save lưới trước
            if (res && res.type != 'error') this.addRowDetail(type);
          })
          return;
        }
        if (this.eleGridAsset && this.elementTabDetail?.selectingID == '0' && this.dialog.formModel.funcID === 'ACT881') {
          this.eleGridAsset.saveRow((res: any) => { //? save lưới trước
            if (res && res.type != 'error') this.addRowDetail(type);
          })
          return;
        }
      })
  }

  onAddLineMember() {
    this.master.save(null, 0, '', '', false, { allowCompare: false ,skipHasChange:true})
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (!res) return;
      if (res.hasOwnProperty('save')) {
        if (res.save.hasOwnProperty('data') && !res.save.data) return;
      }
      if (res.hasOwnProperty('update')) {
        if (res.update.hasOwnProperty('data') && !res.update.data) return;
      }
      if (this.eleGridMember && this.elementTabMaster?.selectingID == '1') {
        this.eleGridMember.saveRow((res: any) => { //? save lưới trước
          if (res && res.type != 'error') this.addLineMember();
        })
        return;
      }
    })
  }

  addRowDetail(type) {
    switch(type){
      case '1':
        this.addLineCounting();
        break;
      case '2':
        this.addLineCountingItems();
        break;
      case '3':
        this.addLineCountingAssets();
        break;
      case '4':
        this.addLineItemsProposal();
        break;
      case '5':
        this.addLineAssetProposal();
        break;
    }
  }

  addLineMember() {
    this.api.exec('AC','CountingMembersBusiness','SetDefaultAsync',[this.master.data]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res) {
        this.eleGridMember.addRow(res, this.eleGridMember.dataSource.length);
      }
      this.onDestroy();
    })
  }

  addLineCounting() {
    if (this.eleGridCounting && this.eleGridCounting.dataSource.length) {
      this.notification.alertCode('AC014', null).subscribe((res) => {
        if (res.event.status === 'Y') {
          this.api.exec('AC','CountingFundsBusiness','SetDefaultAsync',[this.master.data]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
            if (res) {
              this.eleGridCounting.refresh();
            }
            this.onDestroy();
          })
        }
      })
    }else{
      this.api.exec('AC','CountingFundsBusiness','SetDefaultAsync',[this.master.data]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
        if (res) {
          this.eleGridCounting.refresh();
        }
        this.onDestroy();
      })
    }
  }

  addLineCountingItems() {
    this.api.exec('AC','CountingItemsBusiness','SetDefaultAsync',[this.master.data]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res) {
        this.eleGridItems.addRow(res, this.eleGridItems.dataSource.length);
      }
      this.onDestroy();
    })
  }

  addLineCountingAssets() {
    this.api.exec('AC','CountingAssetsBusiness','SetDefaultAsync',[this.master.data]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res) {
        this.eleGridAsset.addRow(res, this.eleGridAsset.dataSource.length);
      }
      this.onDestroy();
    })
  }

  addLineItemsProposal() {
    if (this.eleGridItems && this.eleGridItems.dataSource.length) {
      this.notification.alertCode('AC014', null).subscribe((res) => {
        if (res.event.status === 'Y') {
          this.api.exec('AC','CountingItemsBusiness','SetDefaultProposalAsync',[this.master.data]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
            if (res) {
              this.eleGridItems.refresh();
            }
            this.onDestroy();
          })
        }
      })
    }else{
      this.api.exec('AC','CountingItemsBusiness','SetDefaultProposalAsync',[this.master.data]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
        if (res) {
          this.eleGridItems.refresh();
        }
        this.onDestroy();
      })
    }
  }

  addLineAssetProposal() {
    if (this.eleGridAsset && this.eleGridAsset.dataSource.length) {
      this.notification.alertCode('AC014', null).subscribe((res) => {
        if (res.event.status === 'Y') {
          this.api.exec('AC','CountingAssetsBusiness','SetDefaultProposalAsync',[this.master.data]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
            if (res) {
              this.eleGridAsset.refresh();
            }
            this.onDestroy();
          })
        }
      })
    }else{
      this.api.exec('AC','CountingAssetsBusiness','SetDefaultProposalAsync',[this.master.data]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
        if (res) {
          this.eleGridAsset.refresh();
        }
        this.onDestroy();
      })
    }
  }
  //#endregion

  //#region Method
  /**
   * *Hàm lưu chứng từ
   * @returns
   */
  onSaveVoucher(type) {
    this.ngxLoader.start();
    this.master.save(null, 0, '', '', false, { allowCompare: false })
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        let isError = false;
        if (!res) isError = true;
        if (res.hasOwnProperty('save')) {
          if (res.save.hasOwnProperty('data') && !res.save.data) isError = true;
        }
        if (res.hasOwnProperty('update')) {
          if (res.update.hasOwnProperty('data') && !res.update.data) isError = true;
        }
        if(isError){
          this.ngxLoader.stop();
          return;
        } 
        if ((this.eleGridMember || this.eleGridMember?.isEdit) && this.elementTabMaster?.selectingID == '1') {
          this.eleGridMember.saveRow((res: any) => { //? save lưới trước
            if (res && res.type == 'error') {
              this.ngxLoader.stop();
              return;
            }
          })
        }
        if ((this.eleGridCounting || this.eleGridCounting?.isEdit) && this.elementTabDetail?.selectingID == '0') {
          this.eleGridCounting.saveRow((res: any) => { //? save lưới trước
            if (res && res.type != 'error') {
              this.saveVoucher(type);
            }
          })
          return;
        }
        if ((this.eleGridItems || this.eleGridItems?.isEdit) && this.elementTabDetail?.selectingID == '0') {
          this.eleGridItems.saveRow((res: any) => { //? save lưới trước
            if (res && res.type != 'error') {
              this.saveVoucher(type);
            }
          })
          return;
        }
        if ((this.eleGridAsset || this.eleGridAsset?.isEdit) && this.elementTabDetail?.selectingID == '0') {
          this.eleGridAsset.saveRow((res: any) => { //? save lưới trước
            if (res && res.type != 'error') {
              this.saveVoucher(type);
            }
          })
          return;
        }
      });
  }

  /**
   * lưu chứng từ
   */
  saveVoucher(type) {
    this.api
      .exec('AC', 'CountingsBusiness', 'UpdateVoucherAsync', [
        this.master.data,
        this.journal,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:(res: any) => {
          if (res?.update) {
            this.dialog.dataService.update(res.data,true).subscribe();
            if (type == 'save') {
              this.onDestroy();
              this.dialog.close();
            } else {
              this.api
                .exec('AC', 'CountingsBusiness', 'SetDefaultAsync', [
                  null,
                  this.journal.journalNo,
                  ""
                ])
                .subscribe((res: any) => {
                  if (res) {
                    res.data.isAdd = true;
                    this.master.refreshData({ ...res.data });
                    setTimeout(() => {
                      this.refreshGrid();
                    }, 100);
                    this.detectorRef.detectChanges();
                  }
                });
            }
            if (this.master.data.isAdd || this.master.data.isCopy)
              this.notification.notifyCode('SYS006');
            else
              this.notification.notifyCode('SYS007');
  
          }
        },
        complete:()=>{
          this.ngxLoader.stop();
          if (this.eleGridCounting && this.eleGridCounting?.isSaveOnClick) this.eleGridCounting.isSaveOnClick = false;
          if (this.eleGridItems && this.eleGridItems.isSaveOnClick) this.eleGridItems.isSaveOnClick = false;
          if (this.eleGridAsset && this.eleGridAsset.isSaveOnClick) this.eleGridAsset.isSaveOnClick = false;
          this.onDestroy();
        }
      });
  }

  /**
   * *Hàm hủy bỏ chứng từ
   */
  onDiscardVoucher() {
    if (this.master && this.master.data._isEdit) {
      this.notification.alertCode('AC0010', null).subscribe((res) => {
        if (res.event.status === 'Y') {
          this.ngxLoader.start();
          this.detectorRef.detectChanges();
          this.dialog.dataService
            .delete([this.master.data], false, null, '', '', null, null, false)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next:(res:any)=>{
                if (res.data != null) {
                  this.notification.notifyCode('E0860');
                  this.api
                    .exec('AC', 'CountingsBusiness', 'SetDefaultAsync', [
                      null,
                      this.journal.journalNo,
                      ""
                    ])
                    .subscribe((res: any) => {
                      if (res) {
                        res.data.isAdd = true;
                        this.master.refreshData({ ...res.data });
                        setTimeout(() => {
                          this.refreshGrid();
                        }, 100);
                      }
                      this.ngxLoader.stop();
                      this.detectorRef.detectChanges();
                    });
                }
              },
              complete:()=>{
                this.ngxLoader.stop();
                this.onDestroy();
              }
            });
        }
      });
    }
  }

  /**
   * Xu li chenh lech
   */
  onHandle() {
    this.master.save(null, 0, '', '', false, { allowCompare: false })
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        let isError = false;
        if (!res) isError = true;
        if (res.hasOwnProperty('save')) {
          if (res.save.hasOwnProperty('data') && !res.save.data) isError = true;
        }
        if (res.hasOwnProperty('update')) {
          if (res.update.hasOwnProperty('data') && !res.update.data) isError = true;
        }
        if (isError) {
          return;
        }
        if (this.master.data?.diffValue == 0) {
          this.notification.notify('Không có chênh lệch để xử lý', '2');
          return;
        }
        let type = '';
        let totalAmt = 0;
        if (this.master.data?.diffValue < 0) {
          type = 'CR';
          totalAmt = -(this.master.data?.diffValue);
        }
        if (this.master.data?.diffValue > 0) {
          type = 'CP';
          totalAmt = this.master.data?.diffValue;
        }
        let data = {
          type: type,
        };
        let opt = new DialogModel();
        let dialog = this.callfc.openForm(
          ChooseJournalComponent,
          '',
          null,
          null,
          '',
          data,
          '',
          opt
        );
        dialog.closed.subscribe((res) => {
          if (res && res?.event?.journalNo) {
            this.ngxLoader.start();
            let journalNo = res?.event.journalNo;
            let headerText = '';
            let journal = res?.event?.journal;
            let funcID = type == 'CP' ? this.fmcashPayment.funcID : this.fmcashReciept.funcID;
            this.cache.functionList(funcID).subscribe((res) => {
              if (res) {
                headerText = res?.defaultName || res?.customName;
              }
              if (type == 'CR') {
                this.cashRecieptSV
                  .addNew((o) => this.setDefault(type,journalNo))
                  .pipe(takeUntil(this.destroy$))
                  .subscribe({
                    next: (res: any) => {
                      if (res) {
                        res.isAdd = true;
                        res.totalAmt = totalAmt;
                        res.refID = this.master.data.recID;
                        res.refType = this.journal.journalType;
                        res.refNo = this.master.data.voucherNo;
                        let data = {
                          headerText: headerText,
                          journal: { ...journal },
                          oData: { ...res },
                          baseCurr: this.baseCurr,
                          isActive: false
                        };
                        let opt = new DialogModel();
                        opt.DataService = this.cashRecieptSV;
                        opt.FormModel = this.fmcashReciept;
                        opt.IsFull = true;
                        this.cache.gridViewSetup(this.fmcashReciept.formName, this.fmcashReciept.gridViewName).subscribe((res: any) => {
                          let dialog = this.callfc.openForm(
                            CashreceiptsAddComponent,
                            '',
                            null,
                            null,
                            this.fmcashReciept.funcID,
                            data,
                            '',
                            opt
                          );
                          dialog.closed.subscribe((res) => {
                            if (res && res?.event.data && res?.event.data?.unbounds) {
                              if (res?.event.data?.unbounds['oCouting']) {
                                this.master.setValue('status',res?.event.data?.unbounds['oCouting'].status,{});
                                this.dialog.dataService.update(res?.event.data?.unbounds['oCouting'],true).subscribe();
                                this.detectorRef.detectChanges();
                              }
                            }
                          });
                        })
                      }
                    },
                    complete:()=>{
                      this.ngxLoader.stop();
                    }
                  })
              } else {
                this.cashPaymentSV
                  .addNew((o) => this.setDefault(type,journalNo))
                  .pipe(takeUntil(this.destroy$))
                  .subscribe({
                    next: (res: any) => {
                      if (res) {
                        res.isAdd = true;
                        res.totalAmt = totalAmt;
                        res.refID = this.master.data.recID;
                        res.refType = this.journal.journalType;
                        res.refNo = this.master.data.voucherNo;
                        let data = {
                          headerText: this.headerText,
                          journal: { ...journal },
                          oData: { ...res },
                          baseCurr: this.baseCurr,
                          isActive: false
                        };
                        let opt = new DialogModel();
                        opt.DataService = this.cashPaymentSV;
                        opt.FormModel = this.fmcashPayment;
                        opt.IsFull = true;
                        this.cache.gridViewSetup(this.fmcashPayment.formName, this.fmcashPayment.gridViewName).subscribe((res: any) => {
                          let dialog = this.callfc.openForm(
                            CashPaymentAddComponent,
                            '',
                            null,
                            null,
                            this.fmcashPayment.funcID,
                            data,
                            '',
                            opt
                          );
                          dialog.closed.subscribe((res) => {
                            if (res && res?.event.data && res?.event.data?.unbounds) {
                              if (res?.event.data?.unbounds['oCouting']) {
                                this.master.setValue('status',res?.event.data?.unbounds['oCouting'].status,{});
                                this.dialog.dataService.update(res?.event.data?.unbounds['oCouting'],true).subscribe();
                                this.detectorRef.detectChanges();
                              }
                            }
                          });
                        })
                      }
                    },
                    complete:()=>{
                      this.ngxLoader.stop();
                    }
                  })
              }
            });
          }
        });
      })
  }

  onCreateVoucher(type){
    let lstline:any = [];
    if (this.eleGridItems) {
      if (type == 'IR') {
        lstline = this.eleGridItems.dataSource.filter(x => x.diffQty < 0);
        if (lstline.length == 0) {
          this.notification.notify("Không có chênh lệch để tạo phiếu nhập kho", "2");
          return;
        }
      }else{
        lstline = this.eleGridItems.dataSource.filter(x => x.diffQty > 0);
        if (lstline.length == 0) {
          this.notification.notify("Không có chênh lệch để tạo phiếu xuất kho", "2");
          return;
        }
      }
      
      let data = {
        type: type,
      };
      let opt = new DialogModel();
      let dialog = this.callfc.openForm(
        ChooseJournalComponent,
        '',
        null,
        null,
        '',
        data,
        '',
        opt
      );
      dialog.closed.subscribe((res) => {
        if (res && res?.event?.journalNo) {
          let journal = res?.event?.journal;
          this.ngxLoader.start();
          this.api.exec('AC','CountingsBusiness','CreateVoucherAsync',[res?.event?.journalNo,this.master.data,lstline]).subscribe({
            next:(result:any)=>{
              if (result) {
                let headerText = '';
                let oData = {...result};
                oData.isAdd = true;
                oData._isEdit = true;
                let funcID = type == 'IR' ? this.fmIRVoucher.funcID : this.fmIIVoucher.funcID;
                this.cache.functionList(funcID).subscribe((result2) => {
                  if(result2){
                    headerText = result2?.defaultName || result2?.customName;
                  }
                  let data = {
                    headerText: headerText,
                    journal: { ...journal },
                    oData: { ...oData },
                    baseCurr: this.baseCurr,
                    isActive: false
                  };
                  let opt = new DialogModel();
                  opt.DataService = type == 'IR' ? this.IRVoucherSV : this.IIVoucherSV;
                  opt.FormModel = type == 'IR' ? this.fmIRVoucher : this.fmIIVoucher;
                  opt.IsFull = true;
                  let formName = type == 'IR' ? this.fmIRVoucher.formName : this.fmIIVoucher.formName;
                  let gridViewName = type == 'IR' ? this.fmIRVoucher.gridViewName : this.fmIIVoucher.gridViewName;
                  this.cache.gridViewSetup(formName, gridViewName).subscribe((res: any) => {
                    let dialog = this.callfc.openForm(
                      InventoryAddComponent,
                      '',
                      null,
                      null,
                      type == 'IR' ? this.fmIRVoucher.funcID : this.fmIIVoucher.funcID,
                      data,
                      '',
                      opt
                    );
                    dialog.closed.subscribe((res) => {
                      if (res && res?.event.data && res?.event.data?.unbounds) {
                        if (res?.event.data?.unbounds['oCouting']) {
                          this.master.setValue('status',res?.event.data?.unbounds['oCouting'].status,{});
                          this.dialog.dataService.update(res?.event.data?.unbounds['oCouting'],true).subscribe();
                          this.detectorRef.detectChanges();
                        }
                      }
                    });
                  })
                })
              }
            },
            complete:()=>{
              this.ngxLoader.stop();
            }
          })
        }
      })
    }
  }

  onCreateAssetLiquidations(){
    if (this.eleGridAsset) {
      let lstline = this.eleGridAsset.dataSource.filter(x => x.countedQty > 0);
      if (lstline.length == 0) {
        this.notification.notify("Không có chênh lệch để tạo phiếu thanh lý", "2");
        return;
      }
      if (lstline.length > 0) {
        let isError = false;
        for (let index = 0; index < lstline.length; index++) {
          let item = lstline[index];
          if (item?.processMethod == '' || item?.processMethod == null) {
            this.notification.notify(item?.assetID+' chưa có phương án xử lý', "2");
            isError = true;
            break;
          }
        }
        if(isError) return;
        let lstline2 = lstline.filter(x => x.processMethod === '1');
        if (lstline2.length == 0) {
          this.notification.notify("Không có tài sản cần thanh lý", "2");
          return;
        }
        console.log(lstline2);
      }
    }
  }
  //#endregion

  //#region Function
  onActionGridCounting(event: any) {
    switch (event.type) {
      case 'autoAdd':
        this.onAddLine('1');
        break;
      case 'add':
      case 'update':
      case 'delete':
        if(event.data.unbounds['master']){
          this.master.setValue('countValue',event.data.unbounds['master']?.countValue,{});
          this.master.setValue('diffValue',event.data.unbounds['master']?.diffValue,{});
          this.dialog.dataService.update(event.data.unbounds['master'],true).subscribe();
          this.detectorRef.detectChanges();
        }
        break;
      case 'closeEdit':
        if (this.eleGridCounting && this.eleGridCounting.rowDataSelected) {
          this.eleGridCounting.rowDataSelected = null;
        }
        if (this.eleGridCounting.isSaveOnClick) this.eleGridCounting.isSaveOnClick = false;
        setTimeout(() => {
          let element = document.getElementById('btnAddCash');
          element.focus();
        }, 100);
        break;
    }
  }
  /**
   * *Hàm refresh tất cả dữ liệu chi tiết của tab detail
   */
  refreshGrid() {
    if (this.eleGridCounting && this.elementTabDetail?.selectingID == '0') {
      this.eleGridCounting.dataSource = [];
      this.eleGridCounting.refresh();
      return;
    }
    if (this.eleGridItems && this.elementTabDetail?.selectingID == '0') {
      this.eleGridItems.dataSource = [];
      this.eleGridItems.refresh();
      return;
    }
    if (this.eleGridAsset && this.elementTabDetail?.selectingID == '0') {
      this.eleGridAsset.dataSource = [];
      this.eleGridAsset.refresh();
      return;
    }
  }

  objectIDChange(field: any) {
    this.api.exec('AC', 'CountingsBusiness', 'ValueChangedAsync', [
      field,
      this.master.data,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.isPreventChange = true;
          this.master.setValue('actualValue', res?.data?.actualValue, {});
          if (res.isUpdate) {
            this.master.setValue('countValue', res?.data?.countValue, {});
            this.master.setValue('diffValue', res?.data?.diffValue, {});
            this.dialog.dataService.update(res.data,true).subscribe();
          }
          this.isPreventChange = false;
          this.detectorRef.detectChanges();
        }
        this.onDestroy();
      });
  }

  setDefault(type,journalNo) {
    let className = type == 'CP' ? 'CashPaymentsBusiness' : 'CashReceiptsBusiness';
    return this.api.exec('AC', className, 'SetDefaultAsync', [
      null,
      journalNo,
      "",
    ]);
  }

  @HostListener('click', ['$event']) //? focus out grid
  onClick(e) {
    if (
      (e.target.closest('.e-grid') == null &&
        e.target.closest('.e-popup') == null &&
        e.target.closest('.edit-value') == null) &&
      e.target.closest('button') == null
    ) {
      if (this.eleGridMember && this.eleGridMember?.gridRef?.isEdit) {
        this.eleGridMember.saveRow((res: any) => { //? save lưới trước
          if (res) {
            this.eleGridMember.isSaveOnClick = false;
          }
        })
      }
      if (this.eleGridCounting && this.eleGridCounting?.gridRef?.isEdit) {
        this.eleGridCounting.saveRow((res: any) => { //? save lưới trước
          if (res) {
            this.eleGridCounting.isSaveOnClick = false;
            setTimeout(() => {
              if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') {
                e.target.focus();
                //e.target.select();
              }
            }, 100);
          }
        })
      }
      if (this.eleGridItems && this.eleGridItems?.gridRef?.isEdit) {
        this.eleGridItems.saveRow((res: any) => { //? save lưới trước
          if (res) {
            this.eleGridItems.isSaveOnClick = false;
            setTimeout(() => {
              if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') {
                e.target.focus();
                //e.target.select();
              }
            }, 100);
          }
        })
      }
      if (this.eleGridAsset && this.eleGridAsset?.gridRef?.isEdit) {
        this.eleGridAsset.saveRow((res: any) => { //? save lưới trước
          if (res) {
            this.eleGridAsset.isSaveOnClick = false;
            setTimeout(() => {
              if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') {
                e.target.focus();
                //e.target.select();
              }
            }, 100);
          }
        })
      }
    }
  }
  //#endregion

}
