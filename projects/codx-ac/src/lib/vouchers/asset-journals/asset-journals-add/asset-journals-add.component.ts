import {
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
  fmCountingMembers,
  fmAsset,
  fmVATInvoices,
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
  encapsulation: ViewEncapsulation.None,
})
export class AssetJournalsAddComponent extends UIComponent {
  //#region Contructor
  @ViewChild('formAsset') public formAsset: CodxFormComponent;
  @ViewChild('eleGridAcquisitions')
  eleGridAcquisitions: CodxGridviewV2Component;
  @ViewChild('eleGridAccountMember')
  eleGridAccountMember: CodxGridviewV2Component;
  @ViewChild('elementTabDetail') elementTabDetail: any;
  @ViewChild('eleGridVatInvoices') eleGridVatInvoices: CodxGridviewV2Component;
  @ViewChild('eleCbxSubType') eleCbxSubType: CodxDropdownSelectComponent;

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
    this.isLoad = false;
    this.headerText = dialogData.data?.headerText;
    this.dataDefault = JSON.parse(
      JSON.stringify({ ...dialogData.data?.oData })
    );
    this.preData = { ...dialogData.data?.oData };
    this.journal = { ...dialogData.data?.journal };
    this.baseCurr = dialogData.data?.baseCurr;
    this.assetSV = this.acService.createCRUDService(inject, this.fmAsset, 'AM');
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.fmAssetJournalsLines =
      this.dialog.formModel.funcID == 'ACT811'
        ? fmAssetAcquisitionsLines
        : fmAssetRevaluationsLines;
  }

  /**
   * *Hàm init sau khi form được vẽ xong
   * @param event
   */
  onAfterInitForm(event) {}

  ngOnDestroy() {
    this.onDestroy();
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.isLoad = true;
    }, 100);
    this.detectorRef.detectChanges();
  }

  /**
   * *Hàm hủy các observable api
   */
  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  //#endregion

  //#region Event
  createTabDetail(event: any, eleTab: TabComponent) {
    this.showHideTabDetail(
      this.formAsset?.data?.subType,
      this.elementTabDetail
    );
  }
  /**
   * *Hàm xử lí đổi loại chứng từ
   * @param event
   * @param eleTab
   */
  changeSubType(event?: any) {
    if (
      event &&
      event.data[0] &&
      ((this.eleGridAcquisitions &&
        this.eleGridAcquisitions.dataSource.length > 0) ||
        (this.eleGridVatInvoices &&
          this.eleGridVatInvoices.dataSource.length > 0))
    ) {
      this.notification.alertCode('AC0014', null).subscribe((res) => {
        if (res?.event?.status === 'Y') {
          this.api
            .exec('AM', 'AssetJournalsBusiness', 'ChangeSubTypeAsync', [
              this.formAsset.data,
              event.data[0],
            ])
            .pipe(takeUntil(this.destroy$))
            .subscribe((res: any) => {
              this.formAsset.setValue('subType', event.data[0], {});
              this.dialog.dataService.update(this.formAsset.data).subscribe();
              if (this.eleGridAcquisitions)
                this.eleGridAcquisitions.dataSource = [];
              if (this.eleGridVatInvoices)
                this.eleGridVatInvoices.dataSource = [];
              this.showHideTabDetail(
                this.formAsset?.data?.subType,
                this.elementTabDetail
              );
              this.onDestroy();
            });
        } else {
          this.eleCbxSubType.setValue(this.formAsset.data.subType);
        }
      });
    } else {
      this.formAsset.setValue('subType', event.data[0], {
        onlySelf: true,
        emitEvent: false,
      });
      this.detectorRef.detectChanges();
      if (this.elementTabDetail) {
        this.showHideTabDetail(
          this.formAsset?.data?.subType,
          this.elementTabDetail
        );
      }
    }
  }
  showHideTabDetail(type, eleTab) {
    if (eleTab) {
      switch (type) {
        case `${this.journal.journalType + '1'}`:
          eleTab.hideTab(0, false);
          eleTab.hideTab(1, false);
          eleTab.select(0);
          break;
        default:
          eleTab.hideTab(1, true);
          eleTab.select(0);
          break;
      }
    }
  }
  /**
   * *Hàm click nút đóng form
   */
  closeForm() {
    this.onDestroy();
    this.dialog.close();
  }
  //#endregion

  //#region Function
  selecting(event) {
    if (event.isSwiped) {
      event.cancel = true;
    }
  }
  onTabSelectedMaster(event) {
    if (event.selectedIndex == 1) {
      this.loadInfo();
    }
  }

  loadInfo() {}

  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
    }
  }
  changeMF(e, data) {
    e.forEach((res) => {
      switch (res.functionID) {
        case 'SYS02':
        case 'SYS04':
          res.disabled = false;
          break;
        default:
          res.disabled = true;
          break;
      }
    });
  }
  //#endregion

  valueChangeMaster(e) {
    if (e && e?.field) {
      switch (e.field) {
        case 'objectID':
          this.formAsset.data.objectType = e?.type;
          break;
      }
    }
  }

  //#region  tab grid lines
  initGrid(eleGrid: CodxGridviewV2Component) {
    console.log('lst', eleGrid);
  }

  onActionGrid(event: any) {
    switch (event.type) {
      case 'autoAdd':
        // this.onAddLine('');
        break;
      case 'closeEdit':
        if (
          this.eleGridAcquisitions &&
          this.eleGridAcquisitions.rowDataSelected
        ) {
          this.eleGridAcquisitions.rowDataSelected = null;
        }
        if (this.eleGridAcquisitions.isSaveOnClick)
          this.eleGridAcquisitions.isSaveOnClick = false;
        break;
      case 'beginEdit':
        event.data.entryMode = this.journal.entryMode;
        // let oAccount = this.acService.getCacheValue('account', event?.data.accountID);
        // let oOffsetAccount = this.acService.getCacheValue('account', event?.data.offsetAcctID);
        // this.setLockAndRequireFields(event?.data, oAccount, oOffsetAccount);
        break;
    }
  }
  /**
   * *Hàm xử lí change value trên detail
   * @param event
   */
  async valueChangeLine(event: any) {
    if (event?.value && event?.field) {
      switch (event.field) {
        case 'assetID':
          {
            let asset = await firstValueFrom(
              this.api.execSv<any>('AM', 'AM', 'AssetsBusiness', 'GetAsync', [
                event?.value,
              ])
            );
            if (asset) {
              event.data = this.acService.replaceData(asset, event.data);
            }
            let idx = this.eleGridAcquisitions.dataSource?.findIndex(
              (x) => x.recID == event.data.recID
            );
            if (idx != -1) this.eleGridAcquisitions.updateRow(idx, event.data);
          }
          break;
        case 'costAmt':
        case 'deprPeriods':
          if (event.data.deprMethod == '1') {
            event.data.deprRate =
              event.data?.deprPeriods > 0
                ? event.data.costAmt / event.data?.deprPeriods
                : 0;
            let idx = this.eleGridAcquisitions.dataSource?.findIndex(
              (x) => x.recID == event.data.recID
            );
            if (idx != -1) this.eleGridAcquisitions.updateRow(idx, event.data);
          }
          break;
      }

      this.detectorRef.detectChanges();
    }
  }
  /**
   * *Hàm thêm dòng cho các lưới
   * @returns
   */
  onAddLine(type = '') {
    this.formAsset
      .save(null, 0, '', '', false, { allowCompare: false })
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (!res) return;
        if (res.hasOwnProperty('save')) {
          if (res.save.hasOwnProperty('data') && !res.save.data) return;
        }
        if (res.hasOwnProperty('update')) {
          if (res.update.hasOwnProperty('data') && !res.update.data) return;
        }
        if (this.eleGridAcquisitions) {
          this.eleGridAcquisitions.saveRow((res: any) => {
            if (res && res.type != 'error') this.addLine(type);
          });
          return;
        }
      });
  }
  nextTabIndex: number;

  @HostListener('click', ['$event']) //? focus out grid
  onClick(e) {
    if (
      e.target.closest('.e-grid') == null &&
      e.target.closest('.e-popup') == null &&
      e.target.closest('.edit-value') == null &&
      e.target.closest('button') == null
    ) {
      if (
        this.eleGridAcquisitions &&
        this.eleGridAcquisitions?.gridRef?.isEdit
      ) {
        this.eleGridAcquisitions.saveRow((res: any) => {
          //? save lưới trước
          if (res) {
            this.eleGridAcquisitions.isSaveOnClick = false;
            setTimeout(() => {
              if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') {
                e.target.focus();
                // e.target.select();
              }
            }, 100);
          }
        });
      }
      if (
        this.eleGridAccountMember &&
        this.eleGridAccountMember?.gridRef?.isEdit
      ) {
        this.eleGridAccountMember.saveRow((res: any) => {
          //? save lưới trước
          if (res) {
            this.eleGridAccountMember.isSaveOnClick = false;
            setTimeout(() => {
              if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') {
                e.target.focus();
                // e.target.select();
              }
            }, 100);
          }
        });
      }
      if (this.eleGridVatInvoices && this.eleGridVatInvoices?.gridRef?.isEdit) {
        this.eleGridVatInvoices.saveRow((res: any) => {
          //? save lưới trước
          if (res) {
            this.eleGridVatInvoices.isSaveOnClick = false;
            setTimeout(() => {
              if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') {
                e.target.focus();
                // e.target.select();
              }
            }, 100);
          }
        });
      }
    }
  }

  addLine(type) {
    this.api
      .exec('AM', 'AssetJournalsLinesBusiness', 'SetDefaultAsync', [
        this.formAsset.data,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          let dataLine = JSON.parse(JSON.stringify(res));
          dataLine.rowNo = this.eleGridAcquisitions.dataSource.length + 1;
          if (type == 'add') {
            let headerText = 'Thêm mới tài sản cố định';
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
                      headerText: headerText,
                      dataDefault: { ...res },
                    };
                    let option = new SidebarModel();
                    option.DataService = this.assetSV;
                    option.FormModel = this.fmAsset;
                    option.Width = '800px';
                    let dialog = this.callfc.openSide(
                      FixedAssetAddComponent,
                      data,
                      option,
                      this.fmAsset.funcID
                    );
                    dialog.closed.subscribe((ele) => {
                      if (ele && ele?.event) {
                        let asset = JSON.parse(JSON.stringify(ele.event));
                        dataLine = this.acService.replaceData(asset, dataLine);
                        this.lstLines.push(dataLine);
                        this.eleGridAcquisitions.addRow(
                          dataLine,
                          this.eleGridAcquisitions.dataSource.length
                        );
                        this.detectorRef.detectChanges();
                      }
                    });
                  });
              }
            });
          } else {
            this.lstLines.push(dataLine);
            this.eleGridAcquisitions.addRow(
              dataLine,
              this.eleGridAcquisitions.dataSource.length
            );
          }
        }
        this.onDestroy();
        this.detectorRef.detectChanges();
      });
  }

  onDelete(e) {
    console.log(e);
  }

  onEdit(e) {
    console.log('onEdit: ', e);
  }

  delete(data) {
    this.eleGridAcquisitions.saveRow((res: any) => {
      if (res && res.type != 'error') {
        this.eleGridAcquisitions.deleteRow(data);
        this.lstLinesDeletes.push(data);
        this.lstLines = this.eleGridAcquisitions.dataSource;
        this.detectorRef.detectChanges();
      }
    });
  }

  copy(data) {
    let ele = { ...data };
    this.eleGridAcquisitions.saveRow(async (res: any) => {
      if (res && res.type != 'error') {
        let asset = await firstValueFrom(
          this.api.execSv<any>('AM', 'AM', 'AssetsBusiness', 'GetAsync', [
            ele.assetID,
          ])
        );
        if (asset) {
          ele = this.acService.replaceData(asset, ele);
        }
        let lst = JSON.parse(JSON.stringify(this.lstLines));
        ele.recID = Util.uid();
        // ele.index = this.eleGridAcquisitions?.dataSource?.length + 1;
        ele.rowNo = this.eleGridAcquisitions?.dataSource?.length + 1;
        lst.push(ele);
        this.lstLines = JSON.parse(JSON.stringify(lst));
        this.eleGridAcquisitions.addRow(
          ele,
          this.eleGridAcquisitions.dataSource.length
        );
        this.detectorRef.detectChanges();
      }
    });
  }
  //#endregion

  //#region tab account member
  valueChangeAccount(event) {
    if (event?.field == 'memberID') {
      event.data.memberName = event?.itemData?.UserName;
      event.data.position =
        event?.itemData?.PositionName ?? event.data.position;
      let index = this.eleGridAccountMember.dataSource.findIndex(
        (x) => x.recID == event.data.recID
      );
      this.eleGridAccountMember.updateRow(index, event.data, false);
    }
    let index = this.lstAccountMembers.findIndex(
      (x) => x.recID == event?.data?.recID
    );
    if (index != -1) {
      this.lstAccountMembers[index] = event?.data;
    } else {
      this.lstAccountMembers.push(event?.data);
    }
    this.detectorRef.detectChanges();
  }
  initGridAccount(e) {}
  onActionGridAccount(event: any) {
    switch (event.type) {
      case 'autoAdd':
        // this.onAddLine('');
        break;
      case 'closeEdit':
        if (
          this.eleGridVatInvoices &&
          this.eleGridVatInvoices.rowDataSelected
        ) {
          this.eleGridVatInvoices.rowDataSelected = null;
        }
        if (this.eleGridVatInvoices.isSaveOnClick)
          this.eleGridVatInvoices.isSaveOnClick = false;

        if (
          this.eleGridAccountMember &&
          this.eleGridAccountMember.rowDataSelected
        ) {
          this.eleGridAccountMember.rowDataSelected = null;
        }
        if (this.eleGridAccountMember.isSaveOnClick)
          this.eleGridAccountMember.isSaveOnClick = false;
        break;
      case 'beginEdit':
        event.data.entryMode = this.journal.entryMode;
        // let oAccount = this.acService.getCacheValue('account', event?.data.accountID);
        // let oOffsetAccount = this.acService.getCacheValue('account', event?.data.offsetAcctID);
        // this.setLockAndRequireFields(event?.data, oAccount, oOffsetAccount);
        break;
    }
  }
  clickMFAccount(event: any, type) {
    switch (event.event.functionID) {
      case 'SYS101':
        this.addAccountMember();
        break;
      case 'SYS104':
        this.copyAccountMember(event.data, type);
        break;
      case 'SYS102':
        this.deleteAccountMember(event.data, type);
        break;
    }
  }

  addAccountMember() {
    this.formAsset
      .save(null, 0, '', '', false, { allowCompare: false })
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (!res) return;
        if (res.hasOwnProperty('save')) {
          if (res.save.hasOwnProperty('data') && !res.save.data) return;
        }
        if (res.hasOwnProperty('update')) {
          if (res.update.hasOwnProperty('data') && !res.update.data) return;
        }
        if (this.eleGridAccountMember) {
          this.eleGridAccountMember.saveRow((res: any) => {
            if (res && res.type != 'error') {
              let member = {};
              member['recID'] = Util.uid();
              member['transID'] = this.formAsset.data.recID;

              this.eleGridAccountMember.addRow(
                member,
                this.eleGridAccountMember.dataSource.length
              );
            }
          });
          return;
        }
      });
  }
  copyAccountMember(data, type) {
    let ele = { ...data };
    if (this.eleGridAccountMember && type == 'member') {
      this.eleGridAccountMember.saveRow((res: any) => {
        if (res && res.type != 'error') {
          let lst = JSON.parse(JSON.stringify(this.lstAccountMembers));
          ele.recID = Util.uid();
          ele.index = this.eleGridAccountMember?.dataSource?.length;
          ele.entryMode = this.journal.entryMode;
          this.eleGridAccountMember.addRow(
            ele,
            this.eleGridAccountMember.dataSource.length
          );
          this.detectorRef.detectChanges();
        }
      });
    }
    if (this.eleGridVatInvoices && type == 'vat') {
      this.eleGridVatInvoices.saveRow((res: any) => {
        if (res && res.type != 'error') {
          let lst = JSON.parse(JSON.stringify(this.lstAccountMembers));
          ele.recID = Util.uid();
          ele.index = this.eleGridVatInvoices?.dataSource?.length;
          ele.entryMode = this.journal.entryMode;
          this.eleGridVatInvoices.addRow(
            ele,
            this.eleGridVatInvoices.dataSource.length
          );
          this.detectorRef.detectChanges();
        }
      });
    }
  }
  deleteAccountMember(data, type) {
    if (this.eleGridAccountMember && type == 'member') {
      this.eleGridAccountMember.saveRow((ele: any) => {
        if (ele && ele.type != 'error') {
          this.eleGridAccountMember.deleteRow(data);
          this.detectorRef.detectChanges();
        }
      });
    }
    if (this.eleGridVatInvoices && type == 'vat') {
      this.eleGridVatInvoices.saveRow((res: any) => {
        if (res && res.type != 'error') {
          this.eleGridVatInvoices.deleteRow(data);
          this.detectorRef.detectChanges();
        }
      });
    }
  }
  //#endregion

  /**
   * *Hàm thêm dòng hóa đơn GTGT
   */
  addLineVatInvoices() {
    this.formAsset
      .save(null, 0, '', '', false, { allowCompare: false })
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (!res) return;
        if (res.hasOwnProperty('save')) {
          if (res.save.hasOwnProperty('data') && !res.save.data) return;
        }
        if (res.hasOwnProperty('update')) {
          if (res.update.hasOwnProperty('data') && !res.update.data) return;
        }
        if (this.eleGridVatInvoices) {
          this.eleGridVatInvoices.saveRow(async (res: any) => {
            if (res && res.type != 'error') {
              let obj = {};
              obj['recID'] = Util.uid();
              obj['transID'] = this.formAsset.data.recID;
              obj['objectID'] = this.formAsset.data.objectID;
              obj['objectType'] = this.formAsset.data.objectType;
              obj['lineID'] = this.formAsset.data.recID;

              if (obj['objectID'] && obj['objectType']) {
                let sub = await firstValueFrom(
                  this.api.execSv<any>(
                    'AC',
                    'AC',
                    'SubObjectsBusiness',
                    'GetOneDataAsync',
                    [obj['objectID'], obj['objectType']]
                  )
                );
                obj['objectName'] = sub?.objectName;
              }

              this.eleGridVatInvoices.addRow(
                obj,
                this.eleGridVatInvoices.dataSource.length
              );
              this.detectorRef.detectChanges();
            }
          });
        }
      });
  }
  //#region footer
  onDiscard() {
    if (this.formAsset && this.formAsset.data._isEdit) {
      this.notification.alertCode('AC0010', null).subscribe((res) => {
        if (res.event.status === 'Y') {
          this.ngxLoader.start();
          this.detectorRef.detectChanges();
          this.dialog.dataService
            .delete(
              [this.formAsset.data],
              false,
              null,
              '',
              '',
              null,
              null,
              false
            )
            .pipe(takeUntil(this.destroy$))
            .subscribe((res) => {
              if (res.data != null) {
                this.notification.notifyCode('E0860');
                this.api
                  .exec('AM', 'AssetJournalsBusiness', 'SetDefaultAsync', [
                    null,
                    this.journal.journalNo,
                    '',
                  ])
                  .subscribe((res: any) => {
                    if (res) {
                      res.data.isAdd = true;
                      this.formAsset.refreshData({ ...res.data });
                      setTimeout(() => {
                        this.refreshGrid();
                      }, 100);
                    }
                    this.ngxLoader.stop();
                    this.detectorRef.detectChanges();
                  });
              } else {
                this.ngxLoader.stop();
              }
            });
        }
      });
    }
  }
  onSave(type) {
    this.formAsset
      .save(null, 0, '', '', false, { allowCompare: false })
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        let isError = false;
        if (!res) isError = true;
        if (res.hasOwnProperty('save')) {
          if (res.save.hasOwnProperty('data') && !res.save.data) isError = true;
        }
        if (res.hasOwnProperty('update')) {
          if (res.update.hasOwnProperty('data') && !res.update.data)
            isError = true;
        }

        if (this.eleGridAccountMember || this.eleGridAcquisitions?.isEdit) {
          this.eleGridAcquisitions.saveRow((res: any) => {});
        }

        if (
          (this.eleGridAcquisitions || this.eleGridAcquisitions?.isEdit) &&
          this.elementTabDetail.selectingID == '0'
        ) {
          this.eleGridAcquisitions.saveRow((res: any) => {
            //? save lưới trước
            if (res && res.type != 'error') {
              if (type == 'save') {
                this.dialog.close(res);
                this.onDestroy();
              } else {
                this.refreshForm();
              }
              if (this.formAsset.data.isAdd || this.formAsset.data.isCopy)
                this.notification.notifyCode('SYS006');
              else this.notification.notifyCode('SYS007');
            } else {
              this.ngxLoader.stop();
            }
          });
          return;
        }
        if (
          (this.eleGridVatInvoices || this.eleGridAcquisitions?.isEdit) &&
          this.elementTabDetail.selectingID == '1'
        ) {
          this.eleGridVatInvoices.saveRow((res: any) => {
            //? save lưới trước
            if (res && res.type != 'error') {
              if (type == 'save') {
                this.dialog.close(res);
                this.onDestroy();
              } else {
                this.refreshForm();
              }
              if (this.formAsset.data.isAdd || this.formAsset.data.isCopy)
                this.notification.notifyCode('SYS006');
              else this.notification.notifyCode('SYS007');
            } else {
              this.ngxLoader.stop();
            }
          });
          return;
        }
      });
  }

  onAdd(type) {
    if (!this.isSaveAdd) {
      this.dialog.dataService
        .save((option: any) => this.beforeSave(option), 0)
        .subscribe(async (res) => {
          if (res) {
            if (this.lstAccountMembers?.length > 0) {
              await firstValueFrom(
                this.addOrUpdateCountingMembers(this.lstAccountMembers, [])
              );
            }
          }
        });
    } else {
      this.api
        .execSv<any>(
          'AM',
          'AM',
          'AssetJournalsBusiness',
          'AddAssetJournalsAsync',
          [this.formAsset.data, this.lstLines]
        )
        .subscribe(async (res) => {
          if (res) {
            (this.dialog.dataService as CRUDService).add(res).subscribe();

            if (this.lstAccountMembers?.length > 0) {
              await firstValueFrom(
                this.addOrUpdateCountingMembers(this.lstAccountMembers, [])
              );
            }
            if (type == 'save') {
              this.isSaveAdd = false;
              this.dialog.close(res);
              this.onDestroy();
            } else {
              this.isSaveAdd = true;
              this.refreshForm();
            }
            this.notification.notifyCode('SYS006');
          }
        });
    }
  }

  onUpdate(type) {
    if (!this.isSaveAdd) {
      this.dialog.dataService
        .save((option: any) => this.beforeSave(option))
        .subscribe(async (res) => {
          if (res && res.update) {
            if (
              this.lstAccountMembers?.length > 0 ||
              this.lstAccMemDeletes?.length > 0
            ) {
              await firstValueFrom(
                this.addOrUpdateCountingMembers(
                  this.lstAccountMembers,
                  this.lstAccMemDeletes
                )
              );
            }
            if (type == 'save') {
              this.isSaveAdd = false;
              this.dialog.close(res.update);
              this.onDestroy();
            } else {
              this.isSaveAdd = true;
              this.refreshForm();
            }
          }
        });
    } else {
      this.api
        .execSv<any>(
          'AM',
          'AM',
          'AssetJournalsBusiness',
          'AddAssetJournalsAsync',
          [this.formAsset.data, this.lstLines]
        )
        .subscribe(async (res) => {
          if (res) {
            (this.dialog.dataService as CRUDService).add(res).subscribe();
            if (this.lstAccountMembers?.length > 0) {
              await firstValueFrom(
                this.addOrUpdateCountingMembers(this.lstAccountMembers, [])
              );
            }
            if (type == 'save') {
              this.isSaveAdd = false;
              this.dialog.close(res);
              this.onDestroy();
            } else {
              this.isSaveAdd = true;
              this.refreshForm();
            }
          }
          this.notification.notifyCode('SYS006');
        });
    }
  }

  beforeSave(op) {
    var data = [];

    op.methodName = this.formAsset.data.isEdit
      ? 'UpdateAssetJournalsAsync'
      : 'AddAssetJournalsAsync';
    op.assemblyName = 'AM';
    op.service = 'AM';
    op.className = 'AssetJournalsBusiness';

    data = this.formAsset.data.isEdit
      ? [this.formAsset.data, this.lstLines, this.lstLinesDeletes]
      : [this.formAsset.data, this.lstLines];
    op.data = data;
    return true;
  }

  addOrUpdateCountingMembers(list, deletes) {
    return this.api.execSv<any>(
      'AC',
      'AC',
      'CountingMembersBusiness',
      'CRUDListCountingsAsync',
      [this.formAsset.data.recID, list, deletes]
    );
  }

  refreshForm() {
    this.api
      .exec('AM', 'AssetJournalsBusiness', 'SetDefaultAsync', [
        null,
        this.journal,
        'add',
      ])
      .subscribe((res: any) => {
        if (res) {
          res.data.isAdd = true;
          this.formAsset.refreshData({ ...res.data });
          setTimeout(() => {
            this.refreshGrid();
          }, 100);
          this.detectorRef.detectChanges();
        }
      });
  }

  refreshGrid() {
    this.lstLines = [];
    this.lstLinesDeletes = [];
    this.lstAccMemDeletes = [];
    this.lstAccountMembers = [];
    if (this.eleGridAcquisitions) {
      this.eleGridAcquisitions.dataSource = [];
      this.eleGridAcquisitions.refresh();
    }
    if (this.eleGridAccountMember) {
      this.eleGridAccountMember.dataSource = [];
      this.eleGridAccountMember.refresh();
    }
  }
  //#endregion
}
