import { ChangeDetectionStrategy, Component, HostListener, Injector, Optional, ViewChild } from '@angular/core';
import { CodxFormComponent, CodxGridviewV2Component, DialogData, DialogRef, NotificationsService, UIComponent, Util } from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-approval/tab/model/tabControl.model';
import { Subject, map, takeUntil } from 'rxjs';
import { CodxAcService, fmIssueTransfersLines, fmReceiptTransfersLines } from '../../../codx-ac.service';
import { RoundService } from '../../../round.service';
import { IV_TransfersLines } from '../../../models/IV_TransfersLines.model';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'lib-warehouse-transfers-add',
  templateUrl: './warehouse-transfers-add.component.html',
  styleUrls: ['./warehouse-transfers-add.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarehouseTransfersAddComponent extends UIComponent {
  //#region Contrucstor
  @ViewChild('eleGridIssue') eleGridIssue: CodxGridviewV2Component;
  @ViewChild('eleGridReceipt') eleGridReceipt: CodxGridviewV2Component;
  @ViewChild('master') public master: CodxFormComponent;
  @ViewChild('eleCbxReasonID') eleCbxReasonID: any;
  @ViewChild('eleCbxFromWHID') eleCbxFromWHID: any;
  @ViewChild('eleCbxToWHID') eleCbxToWHID: any;
  @ViewChild('elementTabDetail') elementTabDetail: any;
  headerText: string; //? tên tiêu đề
  dialog!: DialogRef; //? dialog truyền vào
  dialogData?: any; //? dialog hứng data truyền vào
  dataDefault: any; //? data của cashpayment
  journal: any; //? data sổ nhật kí
  tabInfo: TabModel[] = [ //? thiết lập footer
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'References', textDefault: 'Liên kết', isActive: false },
  ];
  fmIssueTransfersLines: any = fmIssueTransfersLines;
  fmReceiptTransfersLines: any = fmReceiptTransfersLines;
  baseCurr: any; //? đồng tiền hạch toán
  isPreventChange: any = false;
  nextTabIndex:any;
  postDateControl: any;
  editSettings:EditSettingsModel = {
    allowAdding:false,
    allowEditing:false,
    allowDeleting:false,
    allowEditOnDblClick:false,
    allowNextRowEdit:false
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
    this.dialog = dialog; //? dialog truyền vào
    this.dialogData = dialogData; //? data dialog truyền vào
    this.headerText = dialogData.data?.headerText; //? get tên tiêu đề
    this.dataDefault = { ...dialogData.data?.oData }; //? get data của Cashpayments
    this.journal = { ...dialogData.data?.journal }; //? get data sổ nhật kí
    this.baseCurr = dialogData.data?.baseCurr; //? get đồng tiền hạch toán
  }
  //#endregion Contrucstor

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
    if (this.master?.data?.coppyForm) this.master.data._isEdit = true; //? test copy để tạm
  }

  ngOnDestroy() {
    this.onDestroy();
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * *Hàm init sau khi form được vẽ xong
   * @param event
   */
  onAfterInitForm(event) {
    //this.setValidateForm();
    this.detectorRef.detectChanges();
  }

  initGrid(eleGrid:CodxGridviewV2Component){
    // let hideFields = [];
    // let setting = this.acService.getSettingFromJournal(eleGrid,this.journal);
    // eleGrid = setting[0];
    // if (this.dialogData?.data.hideFields && this.dialogData?.data.hideFields.length > 0) {
    //   hideFields = [...this.dialogData?.data.hideFields]; //? get danh sách các field ẩn được truyền vào từ dialogdata
    // }
    // eleGrid.showHideColumns(hideFields);
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
   * *Hàm click các morefunction
   * @param event
   * @param data
   */
  clickMF(event: any) {
    switch (event.event.functionID) {
      case 'SYS104':
        this.copyRow(event.data);
        break;
      case 'SYS102':
        this.deleteRow(event.data);
        break;
    }
  }

  /**
   * *Hàm xử lí change subtype
   * @param event 
   */
  changeSubType(event?: any) {
    this.master.setValue('subType', event.data[0], { onlySelf: true, emitEvent: false, });
  }

  valueChangeMaster(event: any) {
    let field = event?.field || event?.ControlName;
    let value = event?.data || event?.crrValue;
    switch (field.toLowerCase()) {
      case 'fromwhid':
        this.fromWHIDChange(field);
        break;

      case 'towhid':
        this.toWHIDChange(field);
        break;

      case 'reasonid':
        this.reasonIDChange(field);
        break;
      
      case 'requester':
        let indexrq = event?.component?.dataService?.data.findIndex((x) => x.EmployeeID == event.data);
        if(value == '' || value == null || indexrq == -1){
          this.master.data.requesterName = null;
          return;
        }
        this.master.data.requesterName = event?.component?.itemsSelected[0]?.EmployeeName;
        break;
    }
  }

  valueChangeLine(event: any,type:any) {
    let oLine = event.data;
    if (event.field.toLowerCase() === 'itemid') {
      oLine.itemName = event?.itemData?.ItemName;
      this.detectorRef.detectChanges();
    }
    if(type === 'receipt') this.eleGridReceipt.startProcess();
    else this.eleGridIssue.startProcess();
    
    this.api.exec('IV', 'TransfersLinesBusiness', 'ValueChangedAsync', [
      event.field,
      this.master.data,
      oLine,
      type
    ]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res) {
        Object.assign(oLine, res);
        this.detectorRef.detectChanges();
        if(type === 'receipt') this.eleGridReceipt.endProcess();
        else this.eleGridIssue.endProcess();
      }
      this.onDestroy();
    })
  }

  onTabSelectedDetail(event){
    switch(event?.selectedIndex){
      case 0:
        if (this.eleGridIssue && this.eleGridIssue.isEdit) {
          event.cancel = true;
          this.nextTabIndex = event?.selectingIndex;
          return;
        }
        this.eleGridIssue.refresh();
        break;
      case 1:
        if (this.eleGridReceipt && this.eleGridReceipt.isEdit) {
          event.cancel = true;
          this.nextTabIndex = event?.selectingIndex;
          return;
        }
        this.eleGridReceipt.refresh();
        break;
    }
  }

  selecting(event){
    if (event.isSwiped) {
      event.cancel = true;
    }
  }
  //#endregion Event

  //#region Method
  onDiscardVoucher() {
    if (this.master && this.master.data._isEdit) {
      this.notification.alertCode('AC0010', null).subscribe((res) => {
        if (res.event.status === 'Y') {
          this.detectorRef.detectChanges();
          this.dialog.dataService
            .delete([this.master.data], false, null, '', '', null, null, false)
            .pipe(takeUntil(this.destroy$))
            .subscribe((res) => {
              if (res.data != null) {
                this.notification.notifyCode('E0860');
                this.dialog.close({type:'discard'});
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
   * @param type 
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
        if (isError) {
          this.ngxLoader.stop();
          return;
        }
        if ((this.eleGridIssue || this.eleGridIssue?.isEdit) && this.elementTabDetail?.selectingID == '0') {
          this.eleGridIssue.saveRow((res: any) => {
            if (res && res.type != 'error') {
              this.saveVoucher(type);
            }
          })
          return;
        }
        if ((this.eleGridReceipt || this.eleGridReceipt?.isEdit) && this.elementTabDetail?.selectingID == '1') {
          this.eleGridReceipt.saveRow((res: any) => {
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
      .exec('IV', 'TransfersBusiness', 'UpdateVoucherAsync', [
        this.master.data,
        this.journal,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:(res: any) => {
          if (res?.update) {
            this.dialog.dataService.update(res.data).subscribe();
            if (type == 'save') {
              this.onDestroy();
              this.dialog.close();
            }else{
              this.api
              .exec('IV', 'TransfersBusiness', 'SetDefaultAsync', [
                this.dialogData.data?.oData,
                this.journal,
              ])
              .subscribe((res: any) => {
                if (res) {
                  res.data.isAdd = true;
                  this.master.refreshData({...res.data});
                  setTimeout(() => {
                    this.eleGridIssue.dataSource = [];
                    this.eleGridIssue.refresh();
                    this.eleGridReceipt.dataSource = [];
                    this.eleGridReceipt.refresh();
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
          if(this.eleGridIssue && this.eleGridIssue?.isSaveOnClick) this.eleGridIssue.isSaveOnClick = false;
          if(this.eleGridReceipt && this.eleGridReceipt?.isSaveOnClick) this.eleGridReceipt.isSaveOnClick = false;
          this.onDestroy();
        }
      });
  }
  //#endregion Method

  //#region Function
  fromWHIDChange(field: any) {
    this.api.exec('IV', 'TransfersBusiness', 'ValueChangedAsync', [
      field,
      this.master.data,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.master.data.fromWHIDName = res?.data?.fromWHIDName;
          let memo = this.getMemoMaster();
          this.master.setValue('memo',memo,{});
          this.detectorRef.detectChanges();
        }
        this.onDestroy();
      })
  }

  toWHIDChange(field: any) {
    this.api.exec('IV', 'TransfersBusiness', 'ValueChangedAsync', [
      field,
      this.master.data,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.master.data.toWHIDName = res?.data?.toWHIDName;
          let memo = this.getMemoMaster();
          this.master.setValue('memo',memo,{});
          this.detectorRef.detectChanges();
        }
        this.onDestroy();
      })
  }

  reasonIDChange(field: any) {
    this.api.exec('IV', 'TransfersBusiness', 'ValueChangedAsync', [
      field,
      this.master.data,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.master.data.reasonName = res?.data?.reasonName;
          let memo = this.getMemoMaster();
          this.master.setValue('memo',memo,{});
          this.detectorRef.detectChanges();
        }
        this.onDestroy();
      })
  }

  onAddLine(type) {
    this.master.save(null, 0, '', '', false,{allowCompare:false})
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (!res) return;
        if (res.hasOwnProperty('save')) {
          if (res.save.hasOwnProperty('data') && !res.save.data) return;
        }
        if (res.hasOwnProperty('update')) {
          if (res.update.hasOwnProperty('data') && !res.update.data) return;
        }
        if (this.eleGridIssue && this.elementTabDetail?.selectingID == '0') {
          this.eleGridIssue.saveRow((res: any) => {
            if (res && res.type != 'error') this.addLine(type);
          })
          return;
        }
        if (this.eleGridIssue && this.elementTabDetail?.selectingID == '1') {
          this.eleGridReceipt.saveRow((res: any) => {
            if (res && res.type != 'error') this.addLine(type);
          })
          return;
        }
      })
  }

  addLine(type) {
    this.api.exec('IV','TransfersLinesBusiness','SetDefaultAsync',[this.master.data]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res) {
        if(type === 'issue') 
          this.eleGridIssue.addRow(res, this.eleGridIssue.dataSource.length);
        else
          this.eleGridReceipt.addRow(res, this.eleGridReceipt.dataSource.length);
      }
      this.onDestroy();
    })
  }

  onActionGrid(event: any,type) {
    switch (event.type) {
      case 'autoAdd':
        this.onAddLine(type);
        break;
      case 'add':
      case 'update':
        this.dialog.dataService.update(this.master.data).subscribe();
        break;
      case 'closeEdit': //? khi thoát dòng
      if (this.eleGridIssue && this.eleGridIssue.rowDataSelected) {
        this.eleGridIssue.rowDataSelected = null;
      }
      if (this.eleGridReceipt && this.eleGridReceipt.rowDataSelected) {
        this.eleGridReceipt.rowDataSelected = null;
      }
      if(this.eleGridIssue && this.eleGridIssue.isSaveOnClick) this.eleGridIssue.isSaveOnClick = false;
      if(this.eleGridReceipt && this.eleGridReceipt.isSaveOnClick) this.eleGridReceipt.isSaveOnClick = false;
      setTimeout(() => {
        let element = document.getElementById('btnAddVou'); //? focus lại nút thêm dòng
        element.focus();
      }, 100);
        break;
    }
  }

  getMemoMaster() {
    let newMemo = ''; 
    let reasonName = '';
    let fromName = '';
    let toName = '';
    
    if (this.master.data.reasonID) {
      reasonName = this.master.data.reasonName + ' - ';
    }

    let indexFrom =
      this.eleCbxFromWHID?.ComponentCurrent?.dataService?.data.findIndex(
        (x) => x.WarehouseID == this.eleCbxFromWHID?.ComponentCurrent?.value
      );
    if (this.master.data.fromWHID) {
      fromName = this.master.data.fromWHIDName + ' - ';
    }
    
    if (this.master.data.toWHID) {
      toName = this.master.data.toWHIDName + ' - ';
    }

    newMemo = reasonName + fromName + toName;
    return newMemo.substring(0, newMemo.lastIndexOf(' - ') + 1);
  }
  
  copyRow(data) {
    let newData = {...data};
    if (this.eleGridIssue && this.elementTabDetail?.selectingID == '0') {
      this.eleGridIssue.saveRow((res:any)=>{ //? save lưới trước
        if(res){
          newData.recID = Util.uid();
          newData.index = this.eleGridIssue.dataSource.length;
          delete newData?._oldData;
          this.eleGridIssue.addRow(newData, this.eleGridIssue.dataSource.length);
        }
      })
    }
    if (this.eleGridReceipt && this.elementTabDetail?.selectingID == '2') {
      this.eleGridReceipt.saveRow((res:any)=>{ //? save lưới trước
        if(res){
          newData.recID = Util.uid();
          newData.index = this.eleGridReceipt.dataSource.length;
          delete newData?._oldData;
          this.eleGridReceipt.addRow(newData, this.eleGridReceipt.dataSource.length);
        }
      })
    }
  }

  deleteRow(data) {
    if (this.eleGridIssue && this.elementTabDetail?.selectingID == '0') {
      this.eleGridIssue.saveRow((res:any)=>{ //? save lưới trước
        if(res){
          this.eleGridIssue.deleteRow(data);
        }
      })
    }
    if (this.eleGridReceipt && this.elementTabDetail?.selectingID == '1') {
      this.eleGridReceipt.saveRow((res:any)=>{ //? save lưới trước
        if(res){
          this.eleGridReceipt.deleteRow(data);
        }
      })
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
      if (this.eleGridIssue && this.eleGridIssue?.gridRef?.isEdit) {
        this.eleGridIssue.saveRow((res:any)=>{ //? save lưới trước
          if(res){
            this.eleGridIssue.isSaveOnClick = false;
            if(this.nextTabIndex) this.elementTabDetail.select(this.nextTabIndex);
            setTimeout(() => {
              if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') {
                e.target.focus();
                e.target.select();
              }
            }, 100);
          }
        })
      }
      if (this.eleGridReceipt && this.eleGridReceipt?.gridRef?.isEdit) {
        this.eleGridReceipt.saveRow((res:any)=>{ //? save lưới trước
          if(res){
            this.eleGridReceipt.isSaveOnClick = false;
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
