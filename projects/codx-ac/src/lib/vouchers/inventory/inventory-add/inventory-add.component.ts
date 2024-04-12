import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Injector, OnInit, Optional, ViewChild, ViewEncapsulation } from '@angular/core';
import { AuthStore, CodxComboboxComponent, CodxFormComponent, CodxGridviewV2Component, CodxInplaceComponent, CodxInputComponent, DataRequest, DialogData, DialogModel, DialogRef, FormModel, NotificationsService, RequestOption, UIComponent, Util } from 'codx-core';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import { Dialog, isCollide } from '@syncfusion/ej2-angular-popups';
import { EditSettingsModel, row } from '@syncfusion/ej2-angular-grids';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { CodxAcService, fmVouchersLines } from '../../../codx-ac.service';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, map, takeUntil } from 'rxjs';
import { itemMove } from '@syncfusion/ej2-angular-treemap';
import { Validators } from '@angular/forms';
import { IV_VouchersLines } from '../../../models/IV_VouchersLines.model';
import { NgxUiLoaderService } from 'ngx-ui-loader';


@Component({
  selector: 'lib-receipt-transactions-add',
  templateUrl: './inventory-add.component.html',
  styleUrls: ['./inventory-add.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryAddComponent extends UIComponent implements OnInit {
  //#region Constructor
  @ViewChild('eleGridVouchers') eleGridVouchers: CodxGridviewV2Component;
  @ViewChild('master') public master: CodxFormComponent;
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
  postDateControl:any;
  fmVouchersLines:any = fmVouchersLines;
  tabInfo: TabModel[] = [ //? thiết lập footer
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'References', textDefault: 'Liên kết', isActive: false },
  ];
  isPreventChange:any=false;
  editSettings:EditSettingsModel = {
    allowAdding:false,
    allowEditing:false,
    allowDeleting:false,
    allowEditOnDblClick:false,
    allowNextRowEdit:false
  }
  isActive:any = true;
  private destroy$ = new Subject<void>(); //? list observable hủy các subscribe api

  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private notification: NotificationsService,
    private ngxLoader: NgxUiLoaderService,
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
    if (dialogData.data.hasOwnProperty('isActive')){
      this.isActive = dialogData.data?.isActive; 
    } 
  }

  //#endregion Constructor

  //#region Init

  onInit(): void {
    this.acService.setPopupSize(this.dialog, '100%', '100%');
    this.cache
      .viewSettingValues('ACParameters')
      .pipe(
        map((arr: any[]) => arr.find((a) => a.category === '1')),
        map((data) => JSON.parse(data.dataValue))
      ).subscribe((res:any)=>{
        if (res) {
          this.postDateControl = res?.PostedDateControl;
        }
      })
  }

  ngAfterViewInit() {
    if (this.master?.data?.coppyForm) this.master.data._isEdit = true; //? test copy để tạm
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

  initGrid(eleGrid: CodxGridviewV2Component) {
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

    if (this.journal.drAcctControl == '1' || this.journal.drAcctControl == '2') {
      preAccountID = '@0.Contains(AccountID)';
      dtvAccountID = `[${this.journal?.drAcctID}]`;
    }
    eleGrid.setPredicates('accountID', preAccountID, dtvAccountID);

    if (
      (this.journal.crAcctControl == '1' || this.journal.crAcctControl == '2') &&
      this.journal.entryMode == '1'
    ) {
      preOffsetAcctID = '@0.Contains(AccountID)';
      dtvOffsetAcctID = `[${this.journal?.crAcctID}]`;
    }
    eleGrid.setPredicates('offsetAcctID', preOffsetAcctID, dtvOffsetAcctID);

    if (this.journal.diM1Control == '1' || this.journal.diM1Control == '2') {
      preDIM1 = '@0.Contains(ProfitCenterID)';
      dtvDIM1 = `[${this.journal?.diM1}]`;
    }
    eleGrid.setPredicates('diM1', preDIM1, dtvDIM1);

    if (this.journal.diM2Control == '1' || this.journal.diM2Control == '2') {
      preDIM2 = '@0.Contains(CostCenterID)';
      dtvDIM2 = `[${this.journal?.diM2}]`;
    }
    eleGrid.setPredicates('diM2', preDIM2, dtvDIM2);

    if (this.journal.diM3Control == '1' || this.journal.diM3Control == '2') {
      preDIM3 = '@0.Contains(CostItemID)';
      dtvDIM3 = `[${this.journal?.diM3}]`;
    }
    eleGrid.setPredicates('diM3', preDIM3, dtvDIM3);

    if (this.journal.diM1Control == "0") hideFields.push("DIM1");
    if (this.journal.diM2Control == "0") hideFields.push("DIM2");
    if (this.journal.diM3Control == "0") hideFields.push("DIM3");
    if (this.journal.projectControl == "0") hideFields.push("ProjectID");
    if (this.journal.loanControl == "0") hideFields.push("ContractID");
    if (this.journal.assetControl == "0") {
      hideFields.push("AssetGroupID");
      hideFields.push("AssetType");
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
    this.master.setValue('subType',event.data[0],{onlySelf: true,emitEvent: false,});
  }

  valueChangeMaster(event: any) {
    if(this.isPreventChange){
      return;
    }
    let field = event?.field || event?.ControlName;
    let value = event?.data || event?.crrValue;
    switch (field.toLowerCase()) {
      case 'warehouseid':
        this.wareHouseIDChange(field);
        break;
      case 'reasonid':
        this.reasonIDChange(field);
        break;
      case 'objectid':
        this.objectIDChange(field);
        break;
      case 'requester':
        let indexrq = this.eleCbxRequester?.ComponentCurrent?.dataService?.data.findIndex((x) => x.EmployeeID == this.eleCbxRequester?.ComponentCurrent?.value);
        if(value == '' || value == null || indexrq == -1){
          this.isPreventChange = true;
          this.master.setValue(field,null,{});
          this.master.data.requesterName = null;
          this.isPreventChange = false;
          return;
        }
        this.master.data.requesterName = event?.component?.itemsSelected[0]?.EmployeeName;
        break;
      
      case 'dim1':
        this.diM1Change(field);
        break;
      case 'dim2':
        this.diM2Change(field);
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
      this.master.data,
      oLine,
    ]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res) {
        Object.assign(oLine, res);
        oLine = this.genFixedDims(oLine);
        this.detectorRef.detectChanges();
        this.eleGridVouchers.endProcess();
        this.onDestroy();
      }
    })
  }

  onAddLine() {
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
        if (res || !res.save.error || !res.update.error) {
          if (this.eleGridVouchers) {
            this.eleGridVouchers.saveRow((res:any)=>{ //? save lưới trước
              if (res && res.type != 'error') this.addLine();
            })
            return;
          }
        }
      })
  }

  //#endregion Event

  //#region Method
  onDiscardVoucher(){
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
              }
              this.onDestroy();
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
        if ((this.eleGridVouchers || this.eleGridVouchers?.isEdit)) { //?
          this.eleGridVouchers.saveRow((res: any) => { //? save lưới trước
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
  saveVoucher(type){
    this.api
      .exec('IV', 'VouchersBusiness', 'UpdateVoucherAsync', [
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
              this.dialog.close(res);
            }else{
              this.api
              .exec('IV', 'VouchersBusiness', 'SetDefaultAsync', [
                this.dialogData.data?.oData,
                this.journal,
              ])
              .subscribe((res: any) => {
                if (res) {
                  res.data.isAdd = true;
                  this.master.refreshData({...res.data});
                  setTimeout(() => {
                    this.eleGridVouchers.dataSource = [];
                    this.eleGridVouchers.refresh();
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
          if(this.eleGridVouchers && this.eleGridVouchers?.isSaveOnClick) this.eleGridVouchers.isSaveOnClick = false;
          if(this.eleGridVouchers && this.eleGridVouchers?.isSaveOnClick) this.eleGridVouchers.isSaveOnClick = false;
          this.onDestroy();
        }
      });
  }
  //#endregion Method

  //#region Function
  wareHouseIDChange(field: any) {
    this.api.exec('IV', 'VouchersBusiness', 'ValueChangedAsync', [
      field,
      this.master.data,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.master.data.warehouseName = res?.data?.warehouseName;
        }
        this.onDestroy();
      })
  }

  reasonIDChange(field: any) {
    this.api.exec('IV', 'VouchersBusiness', 'ValueChangedAsync', [
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

  objectIDChange(field: any) {
    this.api.exec('IV', 'VouchersBusiness', 'ValueChangedAsync', [
      field,
      this.master.data,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.master.data.objectName = res?.data?.objectName;
        }
        this.onDestroy();
      })
  }

  diM1Change(field: any) {
    this.api.exec('IV', 'VouchersBusiness', 'ValueChangedAsync', [
      field,
      this.master.data,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.master.data.diM1Name = res?.data?.diM1Name;
        }
        this.onDestroy();
      })
  }

  diM2Change(field: any) {
    this.api.exec('IV', 'VouchersBusiness', 'ValueChangedAsync', [
      field,
      this.master.data,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.master.data.diM2Name = res?.data?.diM2Name;
        }
        this.onDestroy();
      })
  }

  addLine() {
    this.api.exec('IV','VouchersLinesBusiness','SetDefaultAsync',[this.master.data]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res) {
        this.eleGridVouchers.addRow(res, this.eleGridVouchers.dataSource.length);
      }
      this.onDestroy();
    })
  }

  onActionGrid(event: any){
    switch (event.type) {
      case 'autoAdd':
        this.onAddLine();
        break;
      case 'add':
      case 'update':
        this.dialog.dataService.update(this.master.data).subscribe();
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
    
    if (this.master.data.reasonID) {
      reasonName = this.master.data.reasonName;
    }

    newMemo = reasonName
    return newMemo;
  }

  /**
   * *Hàm set validate cho form
   */
  setValidateForm(){
    let lstRequire :any = [];
    if (this.journal.assignRule == '2') {
      lstRequire.push({field : 'VoucherNo',isDisable : false,require:false});
    }
    this.master.setRequire(lstRequire);
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
    let newData = {...data};
    if (this.eleGridVouchers) {
      this.eleGridVouchers.saveRow((res:any)=>{
        if(res){
          newData.recID = Util.uid();
          newData.index = this.eleGridVouchers.dataSource.length;
          delete newData?._oldData;
          this.eleGridVouchers.addRow(newData, this.eleGridVouchers.dataSource.length);
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
