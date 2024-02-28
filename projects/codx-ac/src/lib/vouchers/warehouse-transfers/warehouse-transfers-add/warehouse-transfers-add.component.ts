import { ChangeDetectionStrategy, Component, HostListener, Injector, Optional, ViewChild } from '@angular/core';
import { CodxFormComponent, CodxGridviewV2Component, DialogData, DialogRef, NotificationsService, UIComponent, Util } from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-approval/tab/model/tabControl.model';
import { Subject, takeUntil } from 'rxjs';
import { CodxAcService, fmIssueTransfersLines, fmReceiptTransfersLines } from '../../../codx-ac.service';
import { RoundService } from '../../../round.service';
import { IV_TransfersLines } from '../../../models/IV_TransfersLines.model';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';

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
  @ViewChild('formWareHouse') public formWareHouse: CodxFormComponent;
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
  }

  ngAfterViewInit() {
    if (this.formWareHouse?.data?.coppyForm) this.formWareHouse.data._isEdit = true; //? test copy để tạm
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

  beforeInitGrid(eleGrid:CodxGridviewV2Component){
    let hideFields = [];
    let setting = this.acService.getSettingFromJournal(eleGrid,this.journal);
    eleGrid = setting[0];
    if (this.dialogData?.data.hideFields && this.dialogData?.data.hideFields.length > 0) {
      hideFields = [...this.dialogData?.data.hideFields]; //? get danh sách các field ẩn được truyền vào từ dialogdata
    }
    eleGrid.showHideColumns(hideFields);
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
   * *Hàm xử lí change subtype
   * @param event 
   */
  changeSubType(event?: any) {
    this.formWareHouse.setValue('subType', event.data[0], { onlySelf: true, emitEvent: false, });
  }

  valueChangeMaster(event: any) {
    let field = event?.field || event?.ControlName;
    let value = event?.data || event?.crrValue;
    switch (field.toLowerCase()) {
      case 'reasonid':
        let indexrs = this.eleCbxReasonID?.ComponentCurrent?.dataService?.data.findIndex((x) => x.ReasonID == this.eleCbxReasonID?.ComponentCurrent?.value);
        let memo = '';
        if (value == '' || value == null || indexrs == -1) {
          this.isPreventChange = true;
          this.formWareHouse.setValue(field, null, {});
          this.formWareHouse.data.reasonName = null;
          this.isPreventChange = false;
          return;
        } 
        this.formWareHouse.data.reasonName = event?.component?.itemsSelected[0]?.ReasonName;
        memo = this.getMemoMaster();
        this.formWareHouse.setValue('memo',memo,{});
        break;
      case 'fromwhid':
        let indexfromwhid = event?.component?.dataService?.data.findIndex((x) => x.WarehouseID == event.data);
        let memo2 = '';
        if (value == '' || value == null || indexfromwhid == -1) {
          this.isPreventChange = true;
          this.formWareHouse.setValue(field, null, {});
          this.formWareHouse.data.fromWHIDName = null;
          this.isPreventChange = false;
          return;
        }
        this.formWareHouse.data.fromWHIDName = event?.component?.dataService?.data[indexfromwhid].WarehouseName;
        memo2 = this.getMemoMaster();
        this.formWareHouse.setValue('memo', memo2, {});
        break;
      case 'towhid':
        let indextowhid = event?.component?.dataService?.data.findIndex((x) => x.WarehouseID == event.data);
        let memo3 = '';
        if (value == '' || value == null || indextowhid == -1) {
          this.isPreventChange = true;
          this.formWareHouse.setValue(field, null, {});
          this.formWareHouse.data.toWHIDName = null;
          this.isPreventChange = false;
          return;
        }
        this.formWareHouse.data.toWHIDName = event?.component?.dataService?.data[indextowhid].WarehouseName;
        memo3 = this.getMemoMaster();
        this.formWareHouse.setValue('memo', memo3, {});
        break;
      case 'requester':
        let indexrq = event?.component?.dataService?.data.findIndex((x) => x.ObjectID == event.data);
        if(value == '' || value == null || indexrq == -1){
          this.formWareHouse.data.requesterName = null;
          return;
        }
        this.formWareHouse.data.requesterName = event?.component?.itemsSelected[0]?.ObjectName;
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
      this.formWareHouse.data,
      oLine,
      type
    ]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res) {
        Object.assign(oLine, res);
        this.genFixedDims(oLine);
        this.detectorRef.detectChanges();
        if(type === 'receipt') this.eleGridReceipt.endProcess();
        else this.eleGridIssue.endProcess();
      }
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
    if (this.formWareHouse && this.formWareHouse.data._isEdit) {
      this.notification.alertCode('AC0010', null).subscribe((res) => {
        if (res.event.status === 'Y') {
          this.detectorRef.detectChanges();
          this.dialog.dataService
            .delete([this.formWareHouse.data], false, null, '', '', null, null, false)
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
    this.formWareHouse.save(null, 0, '', '', false,{allowCompare:false})
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (!res) return;
      if (res.hasOwnProperty('save')) {
        if (res.save.hasOwnProperty('data') && !res.save.data) return;
      }
      if (res.hasOwnProperty('update')) {
        if (res.update.hasOwnProperty('data') && !res.update.data) return;
      }
      if ((this.eleGridIssue || this.eleGridIssue?.isEdit) && this.elementTabDetail?.selectingID == '0') {
        this.eleGridIssue.saveRow((res:any)=>{
          if(res){
            this.saveVoucher(type);
          }
        })
        return;
      }    
      if ((this.eleGridReceipt || this.eleGridReceipt?.isEdit) && this.elementTabDetail?.selectingID == '1') {
        this.eleGridReceipt.saveRow((res:any)=>{
          if(res){
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
        this.formWareHouse.data,
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
            .exec('IV', 'TransfersBusiness', 'SetDefaultAsync', [
              this.dialogData.data?.oData,
              this.journal,
            ])
            .subscribe((res: any) => {
              if (res) {
                res.data.isAdd = true;
                this.formWareHouse.refreshData({...res.data});
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
          if (this.formWareHouse.data.isAdd || this.formWareHouse.data.isCopy)
            this.notification.notifyCode('SYS006');
          else 
            this.notification.notifyCode('SYS007');

        }
        if(this.eleGridIssue && this.eleGridIssue?.isSaveOnClick) this.eleGridIssue.isSaveOnClick = false;
        if(this.eleGridReceipt && this.eleGridReceipt?.isSaveOnClick) this.eleGridReceipt.isSaveOnClick = false;
      });
  }
  //#endregion Method

  //#region Function

  onAddLine(type) {
    this.formWareHouse.save(null, 0, '', '', false,{allowCompare:false})
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
            if (res) {
              this.addLine(type);
            }
          })
          return;
        }
        if (this.eleGridIssue && this.elementTabDetail?.selectingID == '1') {
          this.eleGridReceipt.saveRow((res: any) => {
            if (res) {
              this.addLine(type);
            }
          })
          return;
        }
      })
  }

  addLine(type) {
    let oLine = this.setDefaultLine();
    if(type === 'issue')
      this.eleGridIssue.addRow(oLine, this.eleGridIssue.dataSource.length);
    else 
      this.eleGridReceipt.addRow(oLine, this.eleGridReceipt.dataSource.length);
  }

  setDefaultLine() {
    let model : any = new IV_TransfersLines();
    let oLine = Util.camelizekeyObj(model);
    oLine.transID = this.formWareHouse.data.recID;
    oLine.idiM41 = this.formWareHouse.data.fromWHID;
    oLine.idiM42 = this.formWareHouse.data.toWHID;
    oLine.reasonID = this.formWareHouse.data.reasonID;
    let indexReason = this.eleCbxReasonID?.ComponentCurrent?.dataService?.data.findIndex((x) => x.ReasonID == this.eleCbxReasonID?.ComponentCurrent?.value);
    if (indexReason > -1) {
      oLine.note = this.eleCbxReasonID?.ComponentCurrent?.dataService?.data[indexReason].ReasonName;
    }
    oLine = this.genFixedDims(oLine);
    oLine = this.acService.getDataSettingFromJournal(oLine,this.journal);
    return oLine;
  }

  onActionGrid(event: any,type) {
    switch (event.type) {
      case 'autoAdd':
        this.onAddLine(type);
        break;
      case 'add':
      case 'update':
        this.dialog.dataService.update(this.formWareHouse.data).subscribe();
        break;
      case 'closeEdit': //? khi thoát dòng
      if (this.eleGridIssue && this.eleGridIssue.rowDataSelected) {
        this.eleGridIssue.rowDataSelected = null;
      }
      if (this.eleGridReceipt && this.eleGridReceipt.rowDataSelected) {
        this.eleGridReceipt.rowDataSelected = null;
      }
      if(this.eleGridIssue.isSaveOnClick) this.eleGridIssue.isSaveOnClick = false;
      if(this.eleGridReceipt.isSaveOnClick) this.eleGridReceipt.isSaveOnClick = false;
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

    let indexReason =
      this.eleCbxReasonID?.ComponentCurrent?.dataService?.data.findIndex(
        (x) => x.ReasonID == this.eleCbxReasonID?.ComponentCurrent?.value
      );
    if (indexReason > -1) {
      reasonName = this.eleCbxReasonID?.ComponentCurrent?.dataService?.data[indexReason].ReasonName + ' - ';
    }

    let indexFrom =
      this.eleCbxFromWHID?.ComponentCurrent?.dataService?.data.findIndex(
        (x) => x.WarehouseID == this.eleCbxFromWHID?.ComponentCurrent?.value
      );
    if (indexFrom > -1) {
      fromName = this.eleCbxFromWHID?.ComponentCurrent?.dataService?.data[indexFrom].WarehouseName + ' - ';
    }

    let indexTo =
      this.eleCbxToWHID?.ComponentCurrent?.dataService?.data.findIndex(
        (x) => x.WarehouseID == this.eleCbxToWHID?.ComponentCurrent?.value
      );
    if (indexTo > -1) {
      toName = this.eleCbxToWHID?.ComponentCurrent?.dataService?.data[indexTo].WarehouseName + ' - ';
    }

    newMemo = reasonName + fromName + toName;
    return newMemo.substring(0, newMemo.lastIndexOf(' - ') + 1);
  }

  genFixedDims(line: any) {
    let fixedDims1: string[] = Array(10).fill('0');
    let fixedDims2: string[] = Array(10).fill('0');
    for (let i = 0; i < 10; i++) {
      if (line['idiM' + i + '1']) {
        fixedDims1[i] = '1';
      }
      if (line['idiM' + i + '2']) {
        fixedDims2[i] = '1';
      }
    }
    line.fixedDIMs = fixedDims1.join('');
    line.fixedDIMs2 = fixedDims2.join('');
    return line;
  }

  /**
   * *Hàm ẩn các morefunction trong lưới
   * @param event
   */
  changeMF(event) {
    event.forEach((element) => {
      if (element.functionID == 'SYS104' || element.functionID == 'SYS102') {
        element.disabled = false;
        element.isbookmark = false;
      } else {
        element.disabled = true;
      }
    });
  }

  
  copyRow(data) {
    if (this.eleGridIssue && this.elementTabDetail?.selectingID == '0') {
      this.eleGridIssue.saveRow((res:any)=>{ //? save lưới trước
        if(res){
          data.recID = Util.uid();
          data.index = this.eleGridIssue.dataSource.length;
          delete data?._oldData;
          this.eleGridIssue.addRow(data, this.eleGridIssue.dataSource.length);
        }
      })
    }
    if (this.eleGridReceipt && this.elementTabDetail?.selectingID == '2') {
      this.eleGridReceipt.saveRow((res:any)=>{ //? save lưới trước
        if(res){
          data.recID = Util.uid();
          data.index = this.eleGridReceipt.dataSource.length;
          delete data?._oldData;
          this.eleGridReceipt.addRow(data, this.eleGridReceipt.dataSource.length);
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
