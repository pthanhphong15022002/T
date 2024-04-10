import { ChangeDetectionStrategy, Component, Injector, Optional, ViewChild } from '@angular/core';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import { CodxFormComponent, CodxGridviewV2Component, DataRequest, DialogData, DialogModel, DialogRef, NotificationsService, UIComponent } from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-approval/tab/model/tabControl.model';
import { Subject, map, takeUntil } from 'rxjs';
import { CodxAcService } from '../../../codx-ac.service';
import { RoundService } from '../../../round.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ChooseJournalComponent } from '../../../share/choose-journal/choose-journal.component';

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

  addLineAssetProposal() {
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
  onHandle(){
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
          return;
        }
        if(this.master.data?.diffValue == 0){
          this.notification.notify('Không có chênh lệch để xử lý','2');
          return;
        }
        let type = '';
        let totalAmt = 0;
        if(this.master.data?.diffValue < 0){
          type = 'CR';
          totalAmt = -(this.master.data?.diffValue);
        } 
        if(this.master.data?.diffValue > 0){
          type = 'CP';
          totalAmt = this.master.data?.diffValue;
        }
        let data = {
          type: type,
          totalAmt:totalAmt,
          refID:this.master.data.recID,
          refType:this.journal.journalType,
          refNo:this.master.data.voucherNo
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
  //#endregion

}
