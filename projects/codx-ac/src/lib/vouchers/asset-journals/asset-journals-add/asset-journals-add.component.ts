import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Injector,
  Optional,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  CRUDService,
  CodxDropdownSelectComponent,
  CodxFormComponent,
  CodxGridviewV2Component,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  SidebarModel,
  UIComponent,
  Util,
} from 'codx-core';
import { Subject, firstValueFrom, map, takeUntil } from 'rxjs';
import {
  CodxAcService,
  fmAssetAcquisitionsLines,
  fmAssetRevaluationsLines,
  fmAssetLiquidationsLines,
  fmCountingMembers,
  fmAsset,
  fmVATInvoices,
  fmAssetTransfersLines,
  fmAssetDepreciationsLines,
} from '../../../codx-ac.service';
import { RoundService } from '../../../round.service';
import {
  EditSettingsModel,
  GridComponent,
} from '@syncfusion/ej2-angular-grids';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-approval/tab/model/tabControl.model';
import { FixedAssetAddComponent } from '../../../settings/fixed-assets/fixed-asset-add/fixed-asset-add.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
@Component({
  selector: 'lib-asset-journals-add',
  templateUrl: './asset-journals-add.component.html',
  styleUrls: ['./asset-journals-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetJournalsAddComponent extends UIComponent {
  //#region Contructor
  @ViewChild('master') public master: CodxFormComponent;
  @ViewChild('eleGridAsset') eleGridAsset: CodxGridviewV2Component;
  @ViewChild('eleGridMember') eleGridMember: CodxGridviewV2Component;
  @ViewChild('eleGridVatInvoices') eleGridVatInvoices: CodxGridviewV2Component;
  @ViewChild('elementTabMaster') elementTabMaster: any;
  @ViewChild('elementTabDetail') elementTabDetail: any;

  headerText: string;
  dialog!: DialogRef;
  dialogData?: any;
  dataDefault: any;
  journal: any;
  preData: any;
  baseCurr: any;
  postDateControl: any;
  editSettings: EditSettingsModel = {
    allowAdding: false,
    allowEditing: false,
    allowDeleting: false,
    allowEditOnDblClick: false,
    allowNextRowEdit: false,
  };
  fmAssetJournalsLines: FormModel;
  fmCountingMembers = fmCountingMembers;
  fmVATInvoices: any = fmVATInvoices;
  tabInfo: TabModel[] = [
    //? thiết lập footer
    { name: 'History', textDefault: 'Lịch sử', isActive: false },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'References', textDefault: 'Liên kết', isActive: false },
  ];
  private destroy$ = new Subject<void>();
  lstLines = [];
  lstLinesDeletes = [];
  lstAccountMembers = [];
  lstAccMemDeletes = [];
  isLoad: boolean = false;
  isSaveAdd = false;
  assetSV: CRUDService;
  fmAsset = fmAsset;
  isPreventChange:any = false;
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private notification: NotificationsService,
    private ngxLoader: NgxUiLoaderService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData,
  ) {
    super(inject);
    this.dialog = dialog;
    this.dialogData = dialogData;
    this.headerText = dialogData.data?.headerText;
    this.dataDefault = { ...dialogData.data?.oData };
    this.preData = { ...dialogData.data?.oData };
    this.journal = { ...dialogData.data?.journal };
    this.baseCurr = dialogData.data?.baseCurr;
    this.assetSV = this.acService.createCRUDService(
      inject,
      this.fmAsset,
      'AM'
    );
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.acService.setPopupSize(this.dialog, '100%', '100%');
    this.cache
      .viewSettingValues('ACParameters')
      .pipe(
        takeUntil(this.destroy$),
        map((arr: any[]) => arr.find((a) => a.category === '1')),
        map((data) => JSON.parse(data.dataValue))
      ).subscribe((res: any) => {
        if (res) {
          this.postDateControl = res?.PostedDateControl;
        }
      })
    this.setFormModel();
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

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }


  /**
   * *Hàm init sau khi form được vẽ xong
   * @param event
   */
  onAfterInitForm(event) {
    //this.setValidateForm();
    this.detectorRef.detectChanges();
  }

  createTabMaster(event: any, eleTab: TabComponent){
    this.showHideTabMaster(this.dialog.formModel.funcID, this.elementTabMaster);
  }

  createTabDetail(event: any, eleTab: TabComponent) {
    //this.showHideTabDetail(this.master?.data?.subType, this.elementTabDetail);
  }

  onTabSelectedDetail(event) {

  }

  initGrid(eleGrid: CodxGridviewV2Component) {}
  //#endregion

  //#region Event
  closeForm() {
    this.onDestroy();
    this.dialog.close();
  }

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

  copyRow(data) {
    let newData = {...data};
    if (this.eleGridAsset && this.elementTabDetail?.selectingID == '0') {
      this.eleGridAsset.saveRow((res: any) => { //? save lưới trước
        if (res && res.type != 'error') {
          newData.recID = Util.uid();
          newData.index = this.eleGridAsset.dataSource.length;
          delete newData?._oldData;
          this.eleGridAsset.addRow(newData, this.eleGridAsset.dataSource.length);
        }
      })
    }
    if (this.eleGridVatInvoices && this.elementTabDetail?.selectingID == '2') {
      this.eleGridVatInvoices.saveRow((res: any) => { //? save lưới trước
        if (res && res.type != 'error') {
          newData.recID = Util.uid();
          newData.entryMode = this.journal.entryMode;
          newData.index = this.eleGridVatInvoices.dataSource.length;
          delete newData?._oldData;
          this.eleGridVatInvoices.addRow(newData, this.eleGridVatInvoices.dataSource.length);
        }
      })
    }
  }

  deleteRow(data) {
    if (this.eleGridAsset && this.elementTabDetail?.selectingID == '0') {
      this.eleGridAsset.saveRow((res: any) => { //? save lưới trước
        if (res && res.type != 'error') {
          this.eleGridAsset.deleteRow(data);
        }
      })
    }
    if (this.eleGridVatInvoices && this.elementTabDetail?.selectingID == '2') {
      this.eleGridVatInvoices.saveRow((res: any) => { //? save lưới trước
        if (res && res.type != 'error') {
          data.entryMode = this.journal.entryMode;
          this.eleGridVatInvoices.deleteRow(data);
        }
      })
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
    let value = event?.data || event?.crrValue;
    let preValue:any = '';
    switch (field.toLowerCase()) {

      case 'cashbookid':
        preValue = event?.component?.dataService?.currentComponent?.previousItemData?.CashBookID  || '';
        break;

      case 'reasonid':
        preValue = event?.component?.dataService?.currentComponent?.previousItemData?.ReasonID  || '';
        break;

      case 'totalamt':
        if (value == null) {
          this.isPreventChange = true;
          setTimeout(() => {
            this.master.setValue(field, this.preData?.totalAmt, {});
            this.isPreventChange = false;
          }, 50);
          return;
        }
        break;

      case 'currencyid':
        preValue = event?.component?.dataService?.currentComponent?.previousItemData?.CurrencyID  || '';
        break;
    }
    this.api.exec('AM', 'AssetJournalsBusiness', 'ValueChangedAsync', [
      field,
      this.master.data,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.isPreventChange = true;
          //this.master.setObjValue(res?.data,{});
          this.isPreventChange = false;
        }
        this.master.setValue('updateColumns', '', {});
        this.master.setValue('updateColumn', '', {});
        this.onDestroy();
      });
  }

  valueChangeLine(event: any) {
    let oLine = event.data;
    let field = event.field;
    switch(field.toLowerCase()){
      case 'settledno':
        oLine.settledID = event?.itemData?.RecID;
        break;
    }
    this.eleGridAsset.startProcess();
    this.api.exec('AM','AssetJournalsLinesBusiness','ValueChangedAsync',[this.master.data,oLine,field]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      Object.assign(oLine, res);
      oLine.updateColumns = '';
      this.detectorRef.detectChanges();
      this.eleGridAsset.endProcess();
    })
  }

  valueChangeLineVATInvoices(event: any) {
    let oLine = event.data;
    if (event.field.toLowerCase() === 'goods') {
      oLine.itemID = event?.itemData?.ItemID;
    }
    this.eleGridVatInvoices.startProcess();
    this.api.exec('AC', 'VATInvoicesBusiness', 'ValueChangeAsync', [
      'AC_CashPayments',
      this.master.data,
      oLine,
      event.field
    ]).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        Object.assign(oLine, res);
        //this.vatAccount = res?.vatAccount;
        oLine.entryMode = this.journal.entryMode;
        oLine.updateColumns = '';
        this.detectorRef.detectChanges();
        this.eleGridVatInvoices.endProcess();
        this.detectorRef.detectChanges();
      }
    })
  }
  //#endregion

  //#region Method
  onDiscardVoucher() {
    if (this.master && this.master.data._isEdit) {
      this.notification.alertCode('AC0010', null).subscribe((res) => {
        if (res.event.status === 'Y') {
          this.ngxLoader.start();
          this.detectorRef.detectChanges();
          this.dialog.dataService
            .delete([this.master.data], false, null, '', '', null, null, false)
            .pipe(takeUntil(this.destroy$))
            .subscribe((res) => {
              if (res.data != null) {
                this.notification.notifyCode('E0860');
                this.api
                  .exec('AC', 'AssetJournalsBusiness', 'SetDefaultAsync', [
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
              }else{
                this.ngxLoader.stop();
              }
            });
        }
      });
    }
  }

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
        if ((this.eleGridAsset || this.eleGridAsset?.isEdit) && this.elementTabDetail?.selectingID == '0') {
          this.eleGridAsset.saveRow((res: any) => { //? save lưới trước
            if (res && res.type != 'error') {
              this.saveVoucher(type);
            }else{
              this.ngxLoader.stop();
            }
          })
          return;
        }
      });
  }

  saveVoucher(type) {
    this.api
      .exec('AM', 'AssetJournalsBusiness', 'UpdateVoucherAsync', [
        this.master.data,
        this.journal,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res?.update) {
          this.dialog.dataService.update(res.data,true).subscribe();
          if (type == 'save') {
            this.onDestroy();
            this.dialog.close(res);
          } else {
            this.api
              .exec('AC', 'AssetJournalsBusiness', 'SetDefaultAsync', [
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
        if (this.eleGridMember && this.eleGridMember?.isSaveOnClick) this.eleGridMember.isSaveOnClick = false;
        if (this.eleGridAsset && this.eleGridAsset.isSaveOnClick) this.eleGridAsset.isSaveOnClick = false;
        if (this.eleGridVatInvoices && this.eleGridVatInvoices.isSaveOnClick) this.eleGridVatInvoices.isSaveOnClick = false;
        this.ngxLoader.stop();
      });
  }
  //#endregion

  //#region Function
  onAddLine(type){
    this.master.save(null, 0, '', '', false, { allowCompare: false })
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (!res) return;
      if (res.hasOwnProperty('save')) {
        if (res.save.hasOwnProperty('data') && !res.save.data) return;
      }
      if (res.hasOwnProperty('update')) {
        if (res.update.hasOwnProperty('data') && !res.update.data) return;
      }
      //this.dialog.dataService.update(this.master.data,true).subscribe();
      if (this.eleGridAsset && this.elementTabDetail?.selectingID == '0') {
        this.eleGridAsset.saveRow((res: any) => { //? save lưới trước
          if (res && res.type != 'error') this.addRowDetail(type);
        })
        return;
      }
      if (this.eleGridVatInvoices && this.elementTabDetail?.selectingID == '1') {
        this.eleGridVatInvoices.saveRow((res: any) => { //? save lưới trước
          if (res && res.type != 'error') this.addRowDetail(type);
        })
        return;
      }
    });
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

  addRowDetail(type){
    switch(type){
      case '1':
        this.addLine();
        break;
      case '2':
        this.addLineVatInvoices();
        break;
      case '3':
        this.addFixAsset();
        break;
    }
  }

  addLine(){
    this.api.exec('AM','AssetJournalsLinesBusiness','SetDefaultAsync',[this.master.data,null]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res) {
        this.eleGridAsset.addRow(res, this.eleGridAsset.dataSource.length);
      }
      this.onDestroy();
    })
  }

  addLineMember() {
    this.api.exec('AC','CountingMembersBusiness','SetDefaultAsync',[this.master.data]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res) {
        this.eleGridMember.addRow(res, this.eleGridMember.dataSource.length);
      }
      this.onDestroy();
    })
  }

  addLineVatInvoices() {
    this.api.exec('AC','VATInvoicesBusiness','SetDefaultAsync',[
      'AC',
      'AC_CashPayments',
      'AC_CashPaymentsLines',
      this.master.data,
      this.eleGridAsset.rowDataSelected,
    ]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res) {
        this.eleGridVatInvoices.addRow(res, this.eleGridVatInvoices.dataSource.length);
      }
      this.onDestroy();
    })
  }

  addFixAsset() {
    this.assetSV.addNew().subscribe((res: any) => {
      if (res) {
        this.cache
          .gridViewSetup(
            this.fmAsset.formName,
            this.fmAsset.gridViewName
          )
          .pipe(takeUntil(this.destroy$))
          .subscribe((grid) => {
            res.isAdd = true;
            let data = {
              headerText: 'Thêm mới tài sản cố định',
              dataDefault: { ...res },
            };
            let option = new DialogModel();
            option.FormModel = this.fmAsset;
            option.DataService = this.assetSV;
            let dialog = this.callfc.openForm(
              FixedAssetAddComponent,
              '',
              800,
              800,
              '',
              data,
              '',
              option
            );
            dialog.closed.subscribe((res:any) => {
              if (res && res.event) {
                this.api.exec('AM','AssetJournalsLinesBusiness','SetDefaultAsync',[this.master.data,res.event]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
                  if (res) {
                    this.eleGridAsset.refresh();
                    this.detectorRef.detectChanges();
                  }
                  this.onDestroy();
                })
              }
            });
          });
      }
    })
  }

  setFormModel(){
    switch (this.dialog?.formModel?.funcID) {
      case 'ACT811':
        this.fmAssetJournalsLines = fmAssetAcquisitionsLines;
        break;
      case 'ACT821':
        this.fmAssetJournalsLines = fmAssetRevaluationsLines;
        break;
      case 'ACT871':
        this.fmAssetJournalsLines = fmAssetLiquidationsLines;
        break;
      case 'ACT831':
        this.fmAssetJournalsLines = fmAssetTransfersLines;
        break;
      case 'ACT841':
        this.fmAssetJournalsLines = fmAssetDepreciationsLines;
        break;
      case 'ACT881':
        this.fmAssetJournalsLines = fmAssetLiquidationsLines; // Chưa có
        break;
    }
  }

  onActionGridAsset(event: any) {
    switch (event.type) {
      case 'autoAdd':
        this.onAddLine('1');
        break;
      case 'closeEdit':
        if (this.eleGridAsset && this.eleGridAsset.rowDataSelected) {
          this.eleGridAsset.rowDataSelected = null;
        }
        if (this.eleGridAsset.isSaveOnClick) this.eleGridAsset.isSaveOnClick = false;
        setTimeout(() => {
          let element = document.getElementById('btnAddCash');
          element.focus();
        }, 100);
        break;
    }
  }

  onActionGridVatInvoice(event: any) {
    switch (event.type) {
      case 'autoAdd':
        this.onAddLine('2');
        break;
      case 'closeEdit': //? khi thoát dòng
        if (this.eleGridVatInvoices && this.eleGridVatInvoices.rowDataSelected) {
          this.eleGridVatInvoices.rowDataSelected = null;
        }
        if (this.eleGridVatInvoices.isSaveOnClick) this.eleGridVatInvoices.isSaveOnClick = false;
        setTimeout(() => {
          let element = document.getElementById('btnAddVAT');
          element.focus();
        }, 100);
        break;
      case 'beginEdit': //? trước khi thêm dòng
        event.data.entryMode = this.journal.entryMode;
        break;
    }
  }

  refreshGrid() {
    if (this.eleGridMember) {
      this.eleGridMember.dataSource = [];
      this.eleGridMember.refresh();
      return;
    }
    if (this.eleGridAsset && this.elementTabDetail?.selectingID == '0') {
      this.eleGridAsset.dataSource = [];
      this.eleGridAsset.refresh();
      return;
    }
    if (this.eleGridVatInvoices && this.elementTabDetail?.selectingID == '1') {
      this.eleGridVatInvoices.dataSource = [];
      this.eleGridVatInvoices.refresh();
      return;
    }
  }

  showHideTabMaster(type, eleTab) {
    if (eleTab) {
      switch (type) {
        case 'ACT811':
          eleTab.hideTab(0, false);
          eleTab.hideTab(1, true);
          break;
        default:
          eleTab.hideTab(0, false);
          eleTab.hideTab(1, false);
          break;
      }
    }
  }

  showHideTabDetail(type, eleTab) {
    
  }
  //#endregion
}
