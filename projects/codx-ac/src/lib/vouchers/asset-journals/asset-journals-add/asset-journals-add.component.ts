import {
  Component,
  HostListener,
  Injector,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  CRUDService,
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
} from '../../../codx-ac.service';
import { RoundService } from '../../../round.service';
import {
  EditSettingsModel,
  GridComponent,
} from '@syncfusion/ej2-angular-grids';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-approval/tab/model/tabControl.model';
import { FixedAssetAddComponent } from '../../../settings/fixed-assets/fixed-asset-add/fixed-asset-add.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
@Component({
  selector: 'lib-asset-journals-add',
  templateUrl: './asset-journals-add.component.html',
  styleUrls: ['./asset-journals-add.component.css'],
})
export class AssetJournalsAddComponent extends UIComponent {
  //#region Contructor
  @ViewChild('formAsset') public formAsset: CodxFormComponent;
  @ViewChild('eleGridAcquisitions')
  eleGridAcquisitions: CodxGridviewV2Component;
  @ViewChild('eleGridAccountMember')
  eleGridAccountMember: CodxGridviewV2Component;

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

  /**
   * *Hàm xử lí đổi loại chứng từ
   * @param event
   * @param eleTab
   */
  changeSubType(event?: any) {}

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

  valueChangeMaster(e) {}

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
    if (event?.value) {
      if (event?.field == 'assetID') {
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
      if (event?.field == 'employeeID') {
        if (event?.itemData) {
          event.data.employeeID = event?.itemData?.EmployeeID;
          event.data.orgUnitID = event?.itemData?.OrgUnitID;
          event.data.departmentID = event?.itemData?.DepartmentID;
          event.data.companyID = event?.itemData?.CompanyID;
        }
      }
      let index = this.lstLines.findIndex((x) => x.recID == event?.data?.recID);
      if (index != -1) {
        this.lstLines[index] = event?.data;
      } else {
        this.lstLines.push(event?.data);
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
  onActionGridAccount(e) {}
  clickMFAccount(event: any) {
    switch (event.event.functionID) {
      case 'SYS101':
        this.addAccountMember();
        break;
      case 'SYS104':
        this.copyAccountMember(event.data);
        break;
      case 'SYS102':
        this.deleteAccountMember(event.data);
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
              this.api
                .exec('AC', 'CountingMembersBusiness', 'SetDefaultAsync', [
                  this.formAsset.data.recID,
                ])
                .pipe(takeUntil(this.destroy$))
                .subscribe((res: any) => {
                  if (res) {
                    this.lstAccountMembers.push(res);
                    this.eleGridAccountMember.addRow(
                      res,
                      this.eleGridAccountMember.dataSource.length
                    );
                  } else {
                    let member = {};
                    member['recID'] = Util.uid();
                    member['transID'] = this.formAsset.data.recID;

                    this.eleGridAccountMember.addRow(
                      member,
                      this.eleGridAccountMember.dataSource.length
                    );
                  }
                  this.onDestroy();
                  this.detectorRef.detectChanges();
                });
            }
          });
          return;
        }
      });
  }
  copyAccountMember(data) {
    let ele = { ...data };
    this.eleGridAccountMember.saveRow((res: any) => {
      if (res && res.type != 'error') {
        let lst = JSON.parse(JSON.stringify(this.lstAccountMembers));
        ele.recID = Util.uid();
        ele.index = this.eleGridAccountMember?.dataSource?.length;
        lst.push(ele);
        this.lstAccMemDeletes = JSON.parse(JSON.stringify(lst));
        this.eleGridAccountMember.addRow(
          ele,
          this.eleGridAccountMember.dataSource.length,
          true
        );
        this.detectorRef.detectChanges();
      }
    });
  }
  deleteAccountMember(data) {
    this.eleGridAccountMember.saveRow((ele: any) => {
      if (ele && ele.type != 'error') {
        this.eleGridAccountMember.deleteRow(data);
        this.lstAccMemDeletes.push(data);
        this.detectorRef.detectChanges();
      }
    });
  }
  //#endregion

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

        if (this.eleGridAcquisitions || this.eleGridAcquisitions?.isEdit) {
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
