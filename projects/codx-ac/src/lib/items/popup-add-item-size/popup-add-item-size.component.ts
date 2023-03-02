import {
  AfterViewInit,
  Component,
  Injector,
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
import { ItemSize } from '../interfaces/ItemSize.interface';
import { ItemsService } from '../items.service';

@Component({
  selector: 'lib-popup-add-item-size',
  templateUrl: './popup-add-item-size.component.html',
  styleUrls: ['./popup-add-item-size.component.css'],
})
export class PopupAddItemSizeComponent
  extends UIComponent
  implements AfterViewInit
{
  //#region Constructor
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('itemSizeImage') itemSizeImage?: ImageViewerComponent;
  itemSize: ItemSize = {} as ItemSize;
  savedItemSizes: ItemSize[] = [];
  isEdit: boolean = false;
  dialogRef: DialogRef;
  formTitle: string;
  requiredFields: { gvsPropName: string; dataPropName?: string }[] = [
    {
      gvsPropName: 'SizeID',
    },
    {
      gvsPropName: 'SizeName',
    },
  ];

  constructor(
    private injector: Injector,
    private itemsService: ItemsService,
    private notiService: NotificationsService,
    @Optional() dialogRef: DialogRef,
    @Optional() public dialogData: DialogData
  ) {
    super(injector);
    this.dialogRef = dialogRef;

    this.dialogRef.beforeClose.subscribe(
      (res) => (res.event = this.savedItemSizes)
    );
  }
  //#endregion

  //#region Init
  onInit(): void {
    if (this.dialogData.data.itemSize) {
      this.itemSize = this.dialogData.data.itemSize;
      this.isEdit = true;
      this.savedItemSizes = this.dialogData.data.savedItemSizes;
    }

    if (this.dialogData.data.sizeType == 1) {
      this.formTitle = this.isEdit
        ? 'Sửa quy cách đóng gói'
        : 'Thêm quy cách đóng gói';
    } else {
      this.formTitle = this.isEdit ? 'Sửa quy cách' : 'Thêm quy cách';
    }
  }

  ngAfterViewInit(): void {
    console.log(this.form);
    console.log(this.dialogRef);
    console.log(this.itemSize);
  }
  //#endregion

  //#region Event
  //#endregion

  //#region Method
  save(closeAfterSaving: boolean): void {
    console.log(this.itemSize);

    if (
      !this.itemsService.validateFormData(
        this.itemSize,
        this.dialogData.data.gridViewSetup,
        this.requiredFields
      )
    ) {
      return;
    }

    this.itemSize.sizeType = this.dialogData.data.sizeType;
    this.api
      .exec('IV', 'ItemSizesBusiness', 'AddItemSizeAsync', this.itemSize)
      .subscribe((res: ItemSize) => {
        if (res) {
          this.notiService.notifyCode('SYS006');

          if (this.itemSizeImage?.imageUpload?.item) {
            console.log(this.itemSizeImage);
            console.log('has image');
            this.itemSizeImage.updateFileDirectReload(res.recID).subscribe();
          }

          this.savedItemSizes.push(res);

          if (closeAfterSaving) {
            this.dialogRef.close();
          } else {
            // clear form
            this.form.formGroup.reset();
            this.itemSizeImage.data = null;
            this.itemSizeImage.imageUpload = new UploadFile();
          }
        }
      });
  }

  update(): void {
    console.log(this.itemSize);

    if (
      !this.itemsService.validateFormData(
        this.itemSize,
        this.dialogData.data.gridViewSetup,
        this.requiredFields
      )
    ) {
      return;
    }

    this.api
      .exec('IV', 'ItemSizesBusiness', 'UpdateItemSizeAsync', this.itemSize)
      .subscribe((res: ItemSize) => {
        if (res) {
          this.notiService.notifyCode('SYS007');

          this.itemSize = res;

          if (this.itemSizeImage?.imageUpload?.item) {
            this.itemSizeImage.updateFileDirectReload(res.recID).subscribe();
          }

          this.savedItemSizes = this.savedItemSizes.map((itemSize) =>
            itemSize.recID === this.itemSize.recID ? this.itemSize : itemSize
          );

          console.log(this.savedItemSizes);
          this.dialogRef.close();
        }
      });
  }
  //#endregion

  //#region Function
  //#endregion
}
