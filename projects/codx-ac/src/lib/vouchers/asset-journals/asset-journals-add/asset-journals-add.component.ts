import { Component, Injector, Optional, ViewChild } from '@angular/core';
import { CodxFormComponent, DialogData, DialogRef, NotificationsService, UIComponent } from 'codx-core';
import { Subject, map, takeUntil } from 'rxjs';
import { CodxAcService } from '../../../codx-ac.service';
import { RoundService } from '../../../round.service';

@Component({
  selector: 'lib-asset-journals-add',
  templateUrl: './asset-journals-add.component.html',
  styleUrls: ['./asset-journals-add.component.css']
})
export class AssetJournalsAddComponent extends UIComponent {
  //#region Contructor
  @ViewChild('formAsset') public formAsset: CodxFormComponent;
  headerText: string;
  dialog!: DialogRef;
  dialogData?: any;
  dataDefault: any;
  journal: any;
  preData:any;
  baseCurr: any;
  postDateControl:any;
  private destroy$ = new Subject<void>();
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
      ).subscribe((res:any)=>{
        if (res) {
          this.postDateControl = res?.PostedDateControl;
        }
      })
  }

  /**
   * *Hàm init sau khi form được vẽ xong
   * @param event
   */
  onAfterInitForm(event){}

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
  //#endregion
}
