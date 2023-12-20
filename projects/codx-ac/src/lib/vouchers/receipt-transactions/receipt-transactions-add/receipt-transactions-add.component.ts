import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Injector, OnInit, Optional, ViewChild, ViewEncapsulation } from '@angular/core';
import { AuthStore, CodxComboboxComponent, CodxFormComponent, CodxGridviewV2Component, CodxInplaceComponent, CodxInputComponent, DataRequest, DialogData, DialogModel, DialogRef, FormModel, NotificationsService, RequestOption, UIComponent, Util } from 'codx-core';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import { Dialog, isCollide } from '@syncfusion/ej2-angular-popups';
import { IJournal } from '../../../journals/interfaces/IJournal.interface';
import { EditSettingsModel, row } from '@syncfusion/ej2-angular-grids';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { CodxAcService, fmVouchersLines } from '../../../codx-ac.service';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { itemMove } from '@syncfusion/ej2-angular-treemap';
import { Validators } from '@angular/forms';
import { IV_VouchersLines } from '../../../models/IV_VouchersLines.model';


@Component({
  selector: 'lib-receipt-transactions-add',
  templateUrl: './receipt-transactions-add.component.html',
  styleUrls: ['./receipt-transactions-add.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceiptTransactionsAddComponent extends UIComponent implements OnInit {
  //#region Constructor
  @ViewChild('eleGridVouchers') eleGridVouchers: CodxGridviewV2Component;
  @ViewChild('formVouchers') public formVouchers: CodxFormComponent;
  @ViewChild('eleCbxReasonID') eleCbxReasonID: any;
  @ViewChild('eleCbxObjectID') eleCbxObjectID: any;
  @ViewChild('eleCbxRequester') eleCbxRequester: any;
  headerText: string;
  dialog: DialogRef;
  dialogData?: any;
  dataDefault: any;
  journal: any;
  baseCurr: any;
  taxCurr:any;
  fmVouchersLines:any = fmVouchersLines;
  tabInfo: TabModel[] = [ //? thiết lập footer
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'References', textDefault: 'Liên kết', isActive: false },
  ];
  isPreventChange:any=false;
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api

  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.dialogData = dialogData;
    this.headerText = dialogData.data?.headerText;
    this.dataDefault = { ...dialogData.data?.oData };
    this.journal = { ...dialogData.data?.journal };
    this.baseCurr = dialogData.data?.baseCurr;
  }

  //#endregion Constructor

  //#region Init

  onInit(): void {
    this.acService.setPopupSize(this.dialog, '100%', '100%');
  }

  ngAfterViewInit() {
    console.log(this.formVouchers);
  }

  onAfterInitForm(event) {
    this.setValidateForm();
    this.detectorRef.detectChanges();
  }

  ngOnDestroy() {
    this.onDestroy();
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
   * *Hàm xử lí change subtype
   * @param event 
   */
  changeSubType(event?: any) {
    this.formVouchers.setValue('subType',event.data[0],{onlySelf: true,emitEvent: false,});
  }

  valueChangeMaster(event: any) {
    if(this.isPreventChange){
      return;
    }
    let field = event?.field || event?.ControlName;
    let value = event?.data || event?.crrValue;
    switch (field.toLowerCase()) {
      case 'reasonid':
        let indexrs = this.eleCbxReasonID?.ComponentCurrent?.dataService?.data.findIndex((x) => x.ReasonID == this.eleCbxReasonID?.ComponentCurrent?.value);
        if(value == '' || value == null || indexrs == -1){
          this.isPreventChange = true;
          let memo = this.getMemoMaster();
          this.formVouchers.setValue(field,null,{});
          this.formVouchers.setValue('memo',memo,{});
          this.isPreventChange = false;
          return;
        } 
        let memo = this.getMemoMaster();
        this.formVouchers.setValue('memo',memo,{});
        break;
      case 'objectid':
        let indexob = this.eleCbxObjectID?.ComponentCurrent?.dataService?.data.findIndex((x) => x.ObjectID == this.eleCbxObjectID?.ComponentCurrent?.value);
        if(value == '' || value == null || indexob == -1){
          this.isPreventChange = true;
          let memo = this.getMemoMaster();
          this.formVouchers.setValue(field,null,{});
          this.formVouchers.setValue('objectType',null,{});
          this.formVouchers.setValue('memo',memo,{});
          this.isPreventChange = false;
          return;
        } 
        let objectType = event?.component?.itemsSelected[0]?.ObjectType || '';
        this.formVouchers.setValue('objectType',objectType,{});
        let memo2 = this.getMemoMaster();
        this.formVouchers.setValue('memo',memo2,{});
        break;
      
      case 'requester':
        let indexrq = this.eleCbxRequester?.ComponentCurrent?.dataService?.data.findIndex((x) => x.ObjectID == this.eleCbxRequester?.ComponentCurrent?.value);
        if(value == '' || value == null || indexrq == -1){
          this.isPreventChange = true;
          let memo = this.getMemoMaster();
          this.formVouchers.setValue(field,null,{});
          this.formVouchers.setValue('memo',memo,{});
          this.isPreventChange = false;
          return;
        } 
        let memo3 = this.getMemoMaster();
        this.formVouchers.setValue('memo',memo3,{});
        break;
    }
  }

  valueChangeLine(event: any) {
    let oLine = event.data;
    if (event.field.toLowerCase() === 'itemid') {
      oLine.itemName = event?.itemData?.ItemName;
      this.detectorRef.detectChanges();
    }
    this.eleGridVouchers.startProcess();
    this.api.exec('IV', 'VouchersLinesBusiness', 'ValueChangedAsync', [
      event.field,
      this.formVouchers.data,
      oLine,
    ]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res) {
        Object.assign(oLine, res);
        oLine = this.genFixedDims(oLine);
        this.detectorRef.detectChanges();
        this.eleGridVouchers.endProcess();
      }
    })
  }

  onAddLine() {
    this.formVouchers.save(null, 0, '', '', false)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if(!res) return;
        if (res || res.save || res.update) {
          if (res || !res.save.error || !res.update.error) {
            if (this.eleGridVouchers) {
              this.eleGridVouchers.saveRow((res:any)=>{ //? save lưới trước
                if(res){
                  this.addLine();
                }
              })
              return;
            }
          }
        }
      })
  }

  //#endregion Event

  //#region Method
  onDiscardVoucher(){
    if (this.formVouchers && this.formVouchers.data._isEdit) {
      this.notification.alertCode('AC0010', null).subscribe((res) => {
        if (res.event.status === 'Y') {
          this.detectorRef.detectChanges();
          this.dialog.dataService
            .delete([this.formVouchers.data], false, null, '', '', null, null, false)
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
  onSaveVoucher(type){
    this.formVouchers.save(null, 0, '', '', false)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(!res) return;
      if (res || res.save || res.update) {
        if (res || !res.save.error || !res.update.error) {
          if ((this.eleGridVouchers || this.eleGridVouchers?.isEdit)) { //?
            this.eleGridVouchers.saveRow((res:any)=>{ //? save lưới trước
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
      .exec('IV', 'VouchersBusiness', 'UpdateVoucherAsync', [
        this.formVouchers.data,
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
            .exec('IV', 'VouchersBusiness', 'SetDefaultAsync', [
              this.dialogData.data?.oData,
              this.journal,
            ])
            .subscribe((res: any) => {
              if (res) {
                res.data.isAdd = true;
                this.formVouchers.refreshData({...res.data});
                setTimeout(() => {
                  this.eleGridVouchers.dataSource = [];
                  this.eleGridVouchers.refresh();
                }, 100);
                this.detectorRef.detectChanges();
              }
            });
          }
          if (this.formVouchers.data.isAdd || this.formVouchers.data.isCopy)
            this.notification.notifyCode('SYS006');
          else 
            this.notification.notifyCode('SYS007');
          
        }
        if(this.eleGridVouchers && this.eleGridVouchers?.isSaveOnClick) this.eleGridVouchers.isSaveOnClick = false;
      });
  }
  //#endregion Method

  //#region Function

  addLine() {
    let oLine = this.setDefaultLine();
    this.eleGridVouchers.addRow(oLine,this.eleGridVouchers.dataSource.length);
  }

  /**
   * *Hàm set data mặc định từ master khi thêm dòng mới
   */
  setDefaultLine() {
    let model : any = new IV_VouchersLines();
    let oLine = Util.camelizekeyObj(model);
    oLine.transID = this.formVouchers.data.recID;
    oLine.idiM4 = this.formVouchers.data.warehouseID;
    oLine.note = this.formVouchers.data.memo;
    oLine.reasonID = this.formVouchers.data.reasonID;
    oLine = this.genFixedDims(oLine);
    oLine = this.acService.getDataSettingFromJournal(oLine,this.journal);
    return oLine;
  }

  onActionGrid(event: any){
    switch (event.type) {
      case 'autoAdd':
        this.onAddLine();
        break;
      case 'add':
      case 'update':
        this.dialog.dataService.update(this.formVouchers.data).subscribe();
        break;
      case 'closeEdit': //? khi thoát dòng
      if (this.eleGridVouchers && this.eleGridVouchers.rowDataSelected) {
        this.eleGridVouchers.rowDataSelected = null;
      }
      if(this.eleGridVouchers.isSaveOnClick) this.eleGridVouchers.isSaveOnClick = false; //? trường save row nhưng chưa tới actioncomplete
      setTimeout(() => {
        let element = document.getElementById('btnAddVou'); //? focus lại nút thêm dòng
        element.focus();
      }, 100);
        break;
    }
  }

  genFixedDims(line: any) {
    let fixedDims: string[] = Array(10).fill('0');
    for (let i = 0; i < 10; i++) {
      if (line['idiM' + i]) {
        fixedDims[i] = '1';
      }
    }
    line.fixedDIMs = fixedDims.join('');
    return line;
  }

  getMemoMaster() {
    let newMemo = ''; 
    let reasonName = '';
    let objectName = '';
    let requesterName = '';

    let indexReason =
      this.eleCbxReasonID?.ComponentCurrent?.dataService?.data.findIndex(
        (x) => x.ReasonID == this.eleCbxReasonID?.ComponentCurrent?.value
      );
    if (indexReason > -1) {
      reasonName = this.eleCbxReasonID?.ComponentCurrent?.dataService?.data[indexReason].ReasonName + ' - ';;
    }

    let indexObject = this.eleCbxObjectID?.ComponentCurrent?.dataService?.data.findIndex((x) => x.ObjectID == this.eleCbxObjectID?.ComponentCurrent?.value);
    if (indexObject > -1) {
      objectName = this.eleCbxObjectID?.ComponentCurrent?.dataService?.data[indexObject].ObjectName + ' - ';
    }

    let indexRequest = this.eleCbxRequester?.ComponentCurrent?.dataService?.data.findIndex((x) => x.ObjectID == this.eleCbxRequester?.ComponentCurrent?.value);
    if (indexRequest > -1) {
      requesterName = this.eleCbxRequester?.ComponentCurrent?.dataService?.data[indexRequest].ObjectName + ' - ';
    }

    newMemo = reasonName + objectName + requesterName;
    return newMemo.substring(0, newMemo.lastIndexOf(' - ') + 1);
  }

  /**
   * *Hàm set validate cho form
   */
  setValidateForm(){
    let lstRequire :any = [];
    if (this.journal.assignRule == '2') {
      lstRequire.push({field : 'VoucherNo',isDisable : false,require:false});
    }
    this.formVouchers.setRequire(lstRequire);
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
      }else{
        element.disabled = true;
      }
    });
  }

  /**
   * *Hàm sao chép dòng trong lưới
   * @param data
   */
  copyRow(data) {
    if (this.eleGridVouchers) {
      this.eleGridVouchers.saveRow((res:any)=>{
        if(res){
          data.recID = Util.uid();
          data.index = this.eleGridVouchers.dataSource.length;
          delete data?._oldData;
          this.eleGridVouchers.addRow(data, this.eleGridVouchers.dataSource.length);
        }
      })
    }
  }

  /**
   * *Hàm xóa dòng trong lưới
   * @param data
   */
  deleteRow(data) {
    if (this.eleGridVouchers) {
      this.eleGridVouchers.saveRow((res:any)=>{ //? save lưới trước
        if(res){
          this.eleGridVouchers.deleteRow(data);
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
      if (this.eleGridVouchers && this.eleGridVouchers?.gridRef?.isEdit) {
        this.eleGridVouchers.saveRow((res:any)=>{ //? save lưới trước
          if(res){
            this.eleGridVouchers.isSaveOnClick = false;
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
