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
import { error } from 'console';

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
  isPreventChange:any = false;
  isChangeSavl = false;
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
  valueChange(event: any) {
    if (this.isPreventChange) {
      return;
    }
    let field = event?.field || event?.ControlName;
    let value = event?.data || event?.crrValue;
    this.form.form.setValue('updateColumns', '', {});
    this.api.exec('AM','AssetsBusiness','ValueChangedAsync',[this.form.form.data,field]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if(res){
        this.isPreventChange = true;
        //this.form.form.setObjValue(res,{});
        this.isPreventChange = false;
      }
    })
  }
  //#endregion

  //#region Method
  onSave() {
    this.form.form
      .save(null, 0, '', '', false)
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
