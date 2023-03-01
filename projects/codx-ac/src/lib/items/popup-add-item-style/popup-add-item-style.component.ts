import {
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  CodxFormComponent,
  DialogData,
  DialogRef,
  ImageViewerComponent,
  NotificationsService,
  UIComponent,
  UploadFile,
} from 'codx-core';
import { ItemStyle } from '../interfaces/ItemStyle.interface';
import { ItemsService } from '../items.service';

@Component({
  selector: 'lib-popup-add-item-style',
  templateUrl: './popup-add-item-style.component.html',
  styleUrls: ['./popup-add-item-style.component.css'],
})
export class PopupAddItemStyleComponent extends UIComponent {
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('itemStyleImage') itemStyleImage?: ImageViewerComponent;

  itemStyle: ItemStyle = {} as ItemStyle;
  savedItemStyles: ItemStyle[] = [];
  isEdit: boolean = false;
  requiredFields: { gvsPropName: string; dataPropName?: string }[] = [
    {
      gvsPropName: 'StyleID',
    },
    {
      gvsPropName: 'StyleName',
    },
  ];

  constructor(
    private injector: Injector,
    private itemsService: ItemsService,
    private notiService: NotificationsService,
    @Optional() public dialogRef: DialogRef,
    @Optional() public dialogData: DialogData
  ) {
    super(injector);

    this.dialogRef.beforeClose.subscribe(
      (res) => (res.event = this.savedItemStyles)
    );
  }

  onInit(): void {
    if (this.dialogData.data.itemStyle) {
      this.isEdit = true;
      this.itemStyle = this.dialogData.data.itemStyle;
      this.savedItemStyles = this.dialogData.data.savedItemStyles;
    }
  }

  save(closeAfterSaving: boolean) {
    console.log(this.itemStyle);

    if (
      !this.itemsService.validateFormData(
        this.itemStyle,
        this.dialogData.data.gridViewSetup,
        this.requiredFields
      )
    ) {
      return;
    }

    this.api
      .exec('IV', 'ItemStylesBusiness', 'AddItemStyleAsync', this.itemStyle)
      .subscribe((res: ItemStyle) => {
        if (res) {
          this.notiService.notifyCode('SYS006');

          if (this.itemStyleImage?.imageUpload?.item) {
            console.log('has image');
            this.itemStyleImage.updateFileDirectReload(res.recID).subscribe();
          }

          this.savedItemStyles.push(res);

          if (closeAfterSaving) {
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
      !this.itemsService.validateFormData(
        this.itemStyle,
        this.dialogData.data.gridViewSetup,
        this.requiredFields
      )
    ) {
      return;
    }

    this.api
      .exec('IV', 'ItemStylesBusiness', 'UpdateItemStyleAsync', this.itemStyle)
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
}
