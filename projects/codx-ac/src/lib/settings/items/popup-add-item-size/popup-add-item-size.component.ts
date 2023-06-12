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
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { CodxAcService } from '../../../codx-ac.service';
import { ItemSize } from '../interfaces/ItemSize.interface';
import { EntityName, getClassName } from '../utils/unknown.util';

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

    const functionName1$ = this.acService
      .getDefaultNameFromMoreFunctions('Items', 'grvItems', 'ACS21301')
      .pipe(map((res) => this.acService.toCamelCase(res)));

    const functionName2$ = this.acService
      .getDefaultNameFromMoreFunctions('ItemSizes', 'grvItemSizes', 'ACS21304')
      .pipe(map((res) => this.acService.toCamelCase(res)));

    combineLatest({
      functionName:
        this.dialogData.data.sizeType == 1 ? functionName1$ : functionName2$,
      actions: this.cache.moreFunction('CoDXSystem', ''),
    }).subscribe(({ functionName, actions }) => {
      const action = this.isEdit
        ? actions.find((a) => a.functionID === 'SYS03')?.customName
        : actions.find((a) => a.functionID === 'SYS01')?.defaultName;

      this.formTitle = `${action} ${functionName}`;
    });
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
  save(closeAfterSave: boolean): void {
    console.log(this.itemSize);

    if (
      !this.acService.validateFormData(
        this.form.formGroup,
        this.dialogData.data.gridViewSetup
      )
    ) {
      return;
    }

    this.itemSize.sizeType = this.dialogData.data.sizeType;
    this.api
      .exec(
        'IV',
        getClassName(EntityName.IV_ItemsSizes),
        'AddItemSizeAsync',
        this.itemSize
      )
      .subscribe((res: ItemSize) => {
        if (res) {
          this.notiService.notifyCode('SYS006');

          if (this.itemSizeImage?.imageUpload?.item) {
            console.log(this.itemSizeImage);
            console.log('has image');
            this.itemSizeImage.updateFileDirectReload(res.recID).subscribe();
          }

          this.savedItemSizes.push(res);

          if (closeAfterSave) {
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
      !this.acService.validateFormData(
        this.form.formGroup,
        this.dialogData.data.gridViewSetup
      )
    ) {
      return;
    }

    this.api
      .exec(
        'IV',
        getClassName(EntityName.IV_ItemsSizes),
        'UpdateItemSizeAsync',
        this.itemSize
      )
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
