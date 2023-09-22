import { Component, Injector, Optional, ViewChild } from '@angular/core';
import {
  CodxFormComponent,
  DialogData,
  DialogRef,
  ImageViewerComponent,
  NotificationsService,
  UIComponent,
  UploadFile,
} from 'codx-core';
import { map } from 'rxjs/operators';
import { CodxAcService } from '../../../codx-ac.service';
import { ItemStyle } from '../interfaces/ItemStyle.interface';
import { EntityName, getClassName } from '../utils/unknown.util';

@Component({
  selector: 'lib-popup-add-item-style',
  templateUrl: './popup-add-item-style.component.html',
  styleUrls: ['./popup-add-item-style.component.css'],
})
export class PopupAddItemStyleComponent extends UIComponent {
  //#region Constructor
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('itemStyleImage') itemStyleImage?: ImageViewerComponent;

  itemStyle: ItemStyle = {} as ItemStyle;
  savedItemStyles: ItemStyle[] = [];
  isEdit: boolean = false;
  formTitle: string;

  constructor(
    injector: Injector,
    private acService: CodxAcService,
    private notiService: NotificationsService,
    @Optional() public dialogRef: DialogRef,
    @Optional() public dialogData: DialogData
  ) {
    super(injector);

    this.dialogRef.beforeClose.subscribe(
      (res) => (res.event = this.savedItemStyles)
    );
  }
  //#endregion

  //#region Init
  onInit(): void {
    if (this.dialogData.data.itemStyle) {
      this.isEdit = true;
      this.itemStyle = this.dialogData.data.itemStyle;
      this.savedItemStyles = this.dialogData.data.savedItemStyles;
    }

    this.cache
      .moreFunction('ItemStyles', 'grvItemStyles')
      .pipe(
        map((data) => data.find((m) => m.functionID === 'ACS21302')),
        map(
          (data) =>
            data.defaultName.charAt(0).toLowerCase() + data.defaultName.slice(1)
        )
      )
      .subscribe((functionName) => {
        this.cache.moreFunction('CoDXSystem', '').subscribe((actions) => {
          const action = this.isEdit
            ? actions.find((a) => a.functionID === 'SYS03')?.customName
            : actions.find((a) => a.functionID === 'SYS01')?.defaultName;

          this.formTitle = `${action} ${functionName}`;
        });
      });
  }
  //#endregion

  //#region Event
  //#endregion

  //#region Method
  save(closeAfterSave: boolean) {
    console.log(this.itemStyle);

    if (
      !this.acService.isFormDataValid(
        this.form.formGroup,
        this.dialogData.data.gridViewSetup
      )
    ) {
      return;
    }

    this.api
      .exec(
        'IV',
        getClassName(EntityName.IV_ItemsStyles),
        'AddItemStyleAsync',
        this.itemStyle
      )
      .subscribe((res: ItemStyle) => {
        if (res) {
          this.notiService.notifyCode('SYS006');

          if (this.itemStyleImage?.imageUpload?.item) {
            console.log('has image');
            this.itemStyleImage.updateFileDirectReload(res.recID).subscribe();
          }

          this.savedItemStyles.push(res);

          if (closeAfterSave) {
            this.dialogRef.close();
          } else {
            // clear form
            this.form.formGroup.reset();
            this.itemStyleImage.data = null;
            this.itemStyleImage.imageUpload = new UploadFile();
          }
        }
      });
  }

  update(): void {
    console.log(this.itemStyle);

    if (
      !this.acService.isFormDataValid(
        this.form.formGroup,
        this.dialogData.data.gridViewSetup
      )
    ) {
      return;
    }

    this.api
      .exec(
        'IV',
        getClassName(EntityName.IV_ItemsStyles),
        'UpdateItemStyleAsync',
        this.itemStyle
      )
      .subscribe((res: ItemStyle) => {
        if (res) {
          this.notiService.notifyCode('SYS007');

          if (this.itemStyleImage?.imageUpload?.item) {
            this.itemStyleImage.updateFileDirectReload(res.recID).subscribe();
          }

          this.savedItemStyles = this.savedItemStyles.map((origin) =>
            origin.recID === this.itemStyle.recID ? this.itemStyle : origin
          );

          console.log(this.savedItemStyles);
        }
      });
  }
  //#endregion

  //#region Function
  //#endregion
}
