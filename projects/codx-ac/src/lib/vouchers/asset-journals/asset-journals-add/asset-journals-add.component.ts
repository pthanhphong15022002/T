import { Component, Injector, Optional, ViewChild } from '@angular/core';
import {
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
    this.headerText = dialogData.data?.headerText;
    this.dataDefault = { ...dialogData.data?.oData };
    this.preData = { ...dialogData.data?.oData };
    this.journal = { ...dialogData.data?.journal };
    this.baseCurr = dialogData.data?.baseCurr;
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
      )
      .subscribe((res: any) => {
        if (res) {
          this.postDateControl = res?.PostedDateControl;
        }
      });
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

  clickMF(e, data) {}
  changeMF(e, data) {}
  //#endregion

  valueChangeMaster(e) {}

  //#region  tab grid
  initGrid(eleGrid: CodxGridviewV2Component){
    this.lstLines = eleGrid.dataSource ?? [];
  }

  onActionGrid(event: any) {
    console.log("onActionGrid", event);
  }
  /**
   * *Hàm xử lí change value trên detail
   * @param event
   */
  valueChangeLine(event: any) {
    console.log('event change: ', event);
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

  //#region crud
  addRowDetail() {
    let line = {};
    line['rowNo'] = this.eleGridAcquisitions.dataSource.length;
    line['recID'] = Util.uid();
    line['transID'] = this.formAsset.data?.recID;
    this.eleGridAcquisitions.addRow(
      line,
      this.eleGridAcquisitions.dataSource.length
    );
    this.lstLines.push(line);
    this.detectorRef.detectChanges();
  }

  onDiscard() {}
  onSave(type) {}
  //#endregion
}
