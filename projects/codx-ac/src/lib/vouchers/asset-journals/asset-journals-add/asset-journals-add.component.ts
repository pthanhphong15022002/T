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
  NotificationsService,
  UIComponent,
  Util,
} from 'codx-core';
import { Subject, map, takeUntil } from 'rxjs';
import { CodxAcService, fmAssetJournalsLines } from '../../../codx-ac.service';
import { RoundService } from '../../../round.service';
import {
  EditSettingsModel,
  GridComponent,
} from '@syncfusion/ej2-angular-grids';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-approval/tab/model/tabControl.model';
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
  fmAssetJournalsLines: any = fmAssetJournalsLines;
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
  isLoad: boolean = false;
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private notification: NotificationsService,
    private roundService: RoundService,
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
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.acService.setPopupSize(this.dialog, '100%', '100%');
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

  //#region  tab grid
  initGrid(eleGrid: CodxGridviewV2Component) {
    console.log('lst', eleGrid);
  }

  onActionGrid(event: any) {
    switch (event.type) {
      case 'autoAdd':
        this.addRowDetail();
        break;
      case 'add':
      case 'update':
      case 'delete':
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
        setTimeout(() => {
          let element = document.getElementById('btnAddCash');
          element.focus();
        }, 100);
        break;
      case 'beginEdit':
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
  valueChangeLine(event: any) {
    // let oLine = event.data;
    // let field = event.field;
    // this.eleGridAcquisitions.startProcess();
    // this.eleGridAcquisitions.endProcess();
    this.detectorRef.detectChanges();
  }
  //#endregion

  /**
   * *Hàm thêm dòng cho các lưới
   * @returns
   */
  onAddLine() {
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
          //? nếu lưới cashpayment có active hoặc đang edit
          this.eleGridAcquisitions.saveRow((res: any) => {
            //? save lưới trước
            if (res && res.type != 'error') this.addRowDetail();
          });
          return;
        }
      });
  }
  nextTabIndex: number;

  @HostListener('click', ['$event']) //? focus out grid
  onClick(e) {
    if (this.eleGridAcquisitions && this.eleGridAcquisitions?.gridRef?.isEdit) {
      this.eleGridAcquisitions.isSaveOnClick = false;
      setTimeout(() => {
        if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') {
          e.target.focus();
          // e.target.select();
        }
      }, 100);
    }
  }
  //#region crud
  addRowDetail() {
    this.addLine();
    this.detectorRef.detectChanges();
  }

  addLine() {
    this.api
      .exec('AM', 'AssetJournalsLinesBusiness', 'SetDefaultAsync', [
        this.formAsset.data,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          res.rowNo = this.eleGridAcquisitions.dataSource.length + 1;
          this.lstLines.push(res);
          this.eleGridAcquisitions.addRow(res, this.eleGridAcquisitions.dataSource.length, true);
        }
        this.onDestroy();
        this.detectorRef.detectChanges();
      });
  }

  onDelete(e) {
    console.log(e);
  }

  onEdit(e){
    console.log('onEdit: ', e);
  }

  delete(data) {
    this.eleGridAcquisitions.deleteRow(data, true);
    this.lstLinesDeletes.push(data);
    this.lstLines = this.eleGridAcquisitions.dataSource;
    this.detectorRef.detectChanges();
  }

  copy(data) {
    let ele = {...data};
    this.eleGridAcquisitions.saveRow((res: any) => {
      if (res && res.type != 'error') {
        let lst = JSON.parse(JSON.stringify(this.lstLines));
        ele.recID = Util.uid();
        // ele.index = this.eleGridAcquisitions?.dataSource?.length + 1;
        ele.rowNo = this.eleGridAcquisitions?.dataSource?.length + 1;
        lst.push(ele);
        this.lstLines = JSON.parse(JSON.stringify(lst));
        this.eleGridAcquisitions.addRow(ele, this.eleGridAcquisitions.dataSource.length, true);
        this.detectorRef.detectChanges();
      }
    })

  }

  onDiscard() {}
  onSave(type) {
    if (this.formAsset.data.isAdd) {
      this.onAdd();
    } else if (this.formAsset.data.isEdit) {
      this.onUpdate();
    }
  }

  onAdd() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option), 0)
      .subscribe(async (res) => {
        if (res) {
          this.dialog.close(res);
        }
      });
  }

  onUpdate() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe(async (res) => {
        if (res && res.update) {
          this.dialog.close(res.update);
        }
      });
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
  //#endregion
}
