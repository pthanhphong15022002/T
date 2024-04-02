import {
  AfterViewInit,
  Component,
  Injector,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  CRUDService,
  CodxFormComponent,
  DialogData,
  DialogRef,
  LayoutAddComponent,
  NotificationsService,
  RequestOption,
  UIComponent,
} from 'codx-core';
import { CodxAcService } from '../../../codx-ac.service';
import { Subject, firstValueFrom, takeUntil } from 'rxjs';

@Component({
  selector: 'lib-popup-add-fixed-asset',
  templateUrl: './fixed-asset-add.component.html',
  styleUrls: ['./fixed-asset-add.component.css'],
})
export class FixedAssetAddComponent extends UIComponent {
  //#region Constructor
  @ViewChild('form') form: LayoutAddComponent; //? element form layoutadd
  dialog!: DialogRef;
  dialogData?: DialogData;
  dataDefault: any;
  headerText: any;
  lblAdd: any;
  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'General Info' },
    {
      icon: 'icon-add_box',
      text: 'Thông tin khấu hao',
      name: 'Deduction Info',
    },
    {
      icon: 'icon-tune',
      text: 'Thông tin khác',
      name: 'Other Info',
    },
  ];
  private destroy$ = new Subject<void>();
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.dataDefault = { ...dialogData?.data?.dataDefault };
    this.dialogData = { ...dialogData };
  }
  //#endregion

  //#region Init
  onInit(): void {}

  ngAfterViewInit(): void {
    (this.form.form as CodxFormComponent).onAfterInit.subscribe((res: any) => {
      if (res) {
        this.setValidateForm();
      }
    });
  }

  ngOnDestroy() {
    this.onDestroy();
  }

  /**
   * *Hàm hủy các obsevable subcrible
   */
  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  //#endregion

  //#region Event
  async valueChange(e) {
    if (e && e?.field) {
      let data = this.form?.form?.data
        ? JSON.parse(JSON.stringify(this.form?.form?.data))
        : null;
      switch (e?.field) {
        case 'assetGroupID':
          if (e?.data != null && e?.data?.trim() != '') {
            const grp = await firstValueFrom(
              this.api
                .execSv<any>('AM', 'AM', 'AssetGroupsBusiness', 'GetAsync', [
                  e?.data,
                ])
                .pipe(takeUntil(this.destroy$))
            );

            if (grp) {
              const group = { ...grp };
              if (group.autoNoFormat) {
                let autoNumberAsset = await firstValueFrom(
                  this.api
                    .execSv<any>(
                      'AM',
                      'AM',
                      'AssetGroupsBusiness',
                      'GenerateAutoNumberAssetAsync',
                      [group.autoNoFormat]
                    )
                    .pipe(takeUntil(this.destroy$))
                );
                if (autoNumberAsset) {
                  data.assetID = autoNumberAsset;
                }
              }
              data = this.acService.replaceData(group, data);
              if (this.form && this.form.formGroup) {
                this.form.formGroup.patchValue(data);
              }
              this.detectorRef.detectChanges();
            }
          }
          break;
        case 'quantity':
        case 'purcAmount':
          {
            if (e?.data && typeof e.data === 'number') {
              let quantity = data?.quantity ?? 0;
              let purcAmount = data?.purcAmount ?? 0;
              data.costAmt = quantity * purcAmount ?? 0;
              if(data.salvage == 0) data.salvage = data.costAmt;
              data.deprRate =
                data?.deprPeriods > 0
                  ? data.costAmt / data?.deprPeriods
                  : false;

              if (this.form) {
                this.form.setValue('costAmt', data.costAmt, {});
                this.form.setValue('salvage', data.salvage, {});
                this.form.setValue('deprRate', data.deprRate, {});
              }
            }
          }
          break;
        case 'costAmt':
        case 'deprPeriods':
          data.deprRate =
            data?.deprPeriods > 0 ? data.costAmt / data?.deprPeriods : 0;
          data.remainPeriods = Math.abs(data.servicePeriods - data.deprPeriods);
          if(data.salvage == 0) data.salvage = data.costAmt;

          if (this.form) {
            this.form.setValue('remainPeriods', data.remainPeriods, {});
            this.form.setValue('salvage', data.salvage, {});
            this.form.setValue('deprRate', data.deprRate, {});
          }
          break;
        case 'servicePeriods':
          {
            data.remainPeriods = Math.abs(
              data.servicePeriods - data.deprPeriods
            );
            if (this.form) {
              this.form.setValue('remainPeriods', data.remainPeriods, {});
            }
          }
          break;
        case 'deprConvention':
        case 'placeInService':
        case 'deprCalendar':
          {
            if (e?.data) {
              const ele = await firstValueFrom(
                this.api
                  .execSv<any>(
                    'AM',
                    'AM',
                    'AssetGroupsBusiness',
                    'GetDeprStartDateAsync',
                    [
                      data?.deprCalendar,
                      data?.deprConvention,
                      data?.placeInService,
                    ]
                  )
                  .pipe(takeUntil(this.destroy$))
              );

              if (ele[1]) {
                data.deprStartDate = new Date(ele[0]);

                if (this.form && this.form.formGroup) {
                  this.form.formGroup.patchValue({'deprStartDate': data.deprStartDate});
                }

                this.detectorRef.detectChanges();
              }
            }
          }
          break;
      }
      this.detectorRef.detectChanges();
    }
  }
  //#endregion

  //#region Method
  onSave() {
    this.form.form
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
        if (this.form.form.data.isAdd || this.form.form.data.isCopy)
          this.notification.notifyCode('SYS006');
        else this.notification.notifyCode('SYS007');
        this.dialog.close(
          this.form.form.data.isEdit ? res?.update?.data : res?.save?.data
        );
      });
  }
  //#endregion

  //#region Function
  setTitle(event) {
    this.headerText = this.dialogData?.data?.headerText;
  }

  setValidateForm() {
    let rAssetID = true;
    let lsRequire: any = [];
    if (this.form.form.data?._keyAuto == 'AssetID') rAssetID = false; //? thiết lập không require khi dùng đánh số tự động tài khoản
    lsRequire.push({ field: 'AssetID', isDisable: false, require: rAssetID });
    this.form.form.setRequire(lsRequire);
  }
  //#endregion
}
