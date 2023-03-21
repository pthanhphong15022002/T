import { Component, Injector, Optional, ViewChild } from '@angular/core';
import {
  CodxFormComponent,
  DialogData,
  DialogRef,
  NotificationsService,
  UIComponent
} from 'codx-core';
import { map } from 'rxjs/operators';
import { ItemColor } from '../interfaces/ItemColor.Interface';
import { ItemsService } from '../items.service';

@Component({
  selector: 'lib-popup-add-item-color',
  templateUrl: './popup-add-item-color.component.html',
  styleUrls: ['./popup-add-item-color.component.css'],
})
export class PopupAddItemColorComponent extends UIComponent {
  //#region Constructor
  @ViewChild('form') form: CodxFormComponent;
  itemColor: ItemColor = {} as ItemColor;
  savedItemColors: ItemColor[] = [];
  isEdit: boolean = false;
  formTitle: string = '';

  constructor(
    private injector: Injector,
    private itemsService: ItemsService,
    private notiService: NotificationsService,
    @Optional() public dialogRef: DialogRef,
    @Optional() private dialogData: DialogData
  ) {
    super(injector);

    this.dialogRef.beforeClose.subscribe(
      (res) => (res.event = this.savedItemColors)
    );
  }
  //#endregion

  //#region Init
  onInit(): void {
    if (this.dialogData.data.itemColor) {
      this.isEdit = true;
      this.savedItemColors = this.dialogData.data.savedItemColors;
      this.itemColor = this.dialogData.data.itemColor;
    } else {
      this.itemColor.colorCode = '#66ffcc';
    }

    this.cache
      .moreFunction('ItemColors', 'grvItemColors')
      .pipe(
        map((data) => data.find((m) => m.functionID === 'ACS21303')),
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
  handleInputChange(e) {
    console.log(e);

    this.itemColor[e.field] = e.data;
  }
  //#endregion

  //#region Method
  save(closeAfterSaving: boolean): void {
    console.log(this.itemColor);

    if (
      !this.itemsService.validateFormData(
        this.form.formGroup,
        this.dialogData.data.gridViewSetup
      )
    ) {
      return;
    }

    this.api
      .exec('IV', 'ItemColorsBusiness', 'AddItemColorAsync', this.itemColor)
      .subscribe((res) => {
        if (res) {
          this.notiService.notifyCode('SYS006');

          this.savedItemColors.push(res as ItemColor);

          if (closeAfterSaving) {
            this.dialogRef.close();
          } else {
            // clear form
            this.form.formGroup.reset();
          }
        }
      });
  }

  update(): void {
    console.log(this.itemColor);

    if (
      !this.itemsService.validateFormData(
        this.form.formGroup,
        this.dialogData.data.gridViewSetup
      )
    ) {
      return;
    }

    this.api
      .exec('IV', 'ItemColorsBusiness', 'UpdateItemColorAsync', this.itemColor)
      .subscribe((res) => {
        if (res) {
          this.notiService.notifyCode('SYS007');

          this.savedItemColors = this.savedItemColors.map((origin) =>
            origin.recID === this.itemColor.recID ? this.itemColor : origin
          );
        }
      });
  }
  //#endregion

  //#region Function
  //#endregion
}
