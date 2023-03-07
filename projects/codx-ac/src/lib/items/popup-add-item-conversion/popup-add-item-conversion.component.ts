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
import { map } from 'rxjs/operators';
import { UMConversion } from '../interfaces/UMConversion.interface';
import { ItemsService } from '../items.service';

@Component({
  selector: 'lib-popup-add-item-conversion',
  templateUrl: './popup-add-item-conversion.component.html',
  styleUrls: ['./popup-add-item-conversion.component.css'],
})
export class PopupAddItemConversionComponent extends UIComponent {
  //#region Constructor
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('itemConversionImage') itemConversionImage?: ImageViewerComponent;

  itemConversion: UMConversion = {} as UMConversion;
  savedItemConversions: UMConversion[] = [];
  isEdit: boolean = false;
  requiredFields: { gvsPropName: string; dataPropName?: string }[] = [
    {
      gvsPropName: 'FromUMID',
    },
    {
      gvsPropName: 'ToUMID',
    },
    {
      gvsPropName: 'Conversion',
    },
  ];
  formTitle: string;

  constructor(
    private injector: Injector,
    private itemsService: ItemsService,
    private notiService: NotificationsService,
    @Optional() public dialogRef: DialogRef,
    @Optional() public dialogData: DialogData
  ) {
    super(injector);

    this.dialogRef.beforeClose.subscribe(
      (res) => (res.event = this.savedItemConversions)
    );
  }
  //#endregion

  //#region Init
  onInit(): void {
    if (this.dialogData.data.itemConversion) {
      this.itemConversion = this.dialogData.data.itemConversion;
      this.savedItemConversions = this.dialogData.data.savedItemConversions;
      this.isEdit = true;

      this.itemConversion.inverted =
        this.itemConversion.inverted == 1 ? true : false;
      this.itemConversion.conversion =
        this.itemConversion.conversion.toString();
    }

    this.cache
      .moreFunction('UMConversion', 'grvUMConversion')
      .pipe(
        map((data) => data.find((m) => m.functionID === 'ACS21305')),
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
  save(closeAfterSaving: boolean): void {
    console.log(this.itemConversion);
    this.itemConversion.inverted = this.itemConversion.inverted ? 1 : 0;

    if (
      !this.itemsService.validateFormData(
        this.itemConversion,
        this.dialogData.data.gridViewSetup,
        this.requiredFields
      )
    ) {
      return;
    }

    this.api
      .exec('BS', 'UMConversionBusiness', 'AddSingleAsync', this.itemConversion)
      .subscribe((res: UMConversion) => {
        if (res) {
          this.notiService.notifyCode('SYS006');

          if (this.itemConversionImage?.imageUpload?.item) {
            console.log('has image');
            this.itemConversionImage
              .updateFileDirectReload(res.recID)
              .subscribe();
          }

          this.savedItemConversions.push(res);

          if (closeAfterSaving) {
            this.dialogRef.close();
          } else {
            // clear form
            this.form.formGroup.reset();
            this.itemConversionImage.data = null;
            this.itemConversionImage.imageUpload = new UploadFile();
          }
        }
      });
  }

  update(): void {
    console.log(this.itemConversion);

    this.itemConversion.inverted = this.itemConversion.inverted ? 1 : 0;
    this.itemConversion.conversion = this.itemConversion.conversion.toString();

    if (
      !this.itemsService.validateFormData(
        this.itemConversion,
        this.dialogData.data.gridViewSetup,
        this.requiredFields
      )
    ) {
      return;
    }

    this.api
      .exec(
        'BS',
        'UMConversionBusiness',
        'UpdateSingleAsync',
        this.itemConversion
      )
      .subscribe((res: UMConversion) => {
        if (res) {
          this.notiService.notifyCode('SYS007');

          this.itemConversion = res;

          if (this.itemConversionImage?.imageUpload?.item) {
            console.log('has image');
            this.itemConversionImage
              .updateFileDirectReload(res.recID)
              .subscribe();
          }

          this.savedItemConversions = this.savedItemConversions.map((origin) =>
            origin.recID === this.itemConversion.recID
              ? this.itemConversion
              : origin
          );

          this.dialogRef.close();
        }
      });
  }
  //#endregion

  //#region Function
  //#endregion
}
