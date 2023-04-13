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
  RequestOption,
  UIComponent,
} from 'codx-core';
import { IAsset } from '../interfaces/IAsset.interface';
import { CodxAcService } from '../../../codx-ac.service';

@Component({
  selector: 'lib-popup-add-fixed-asset',
  templateUrl: './popup-add-fixed-asset.component.html',
  styleUrls: ['./popup-add-fixed-asset.component.css'],
})
export class PopupAddFixedAssetComponent
  extends UIComponent
  implements AfterViewInit
{
  //#region Constructor
  @ViewChild('form') form: CodxFormComponent;

  title: string;
  asset: IAsset = {} as IAsset;
  gvs: any;
  isEdit: boolean = false;
  oldAssetId: string;
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

  constructor(
    private injector: Injector,
    private acService: CodxAcService,
    @Optional() public dialogRef: DialogRef,
    @Optional() private dialogData: DialogData
  ) {
    super(injector);

    this.asset = this.dialogRef.dataService?.dataSelected;

    if (this.dialogData.data?.formType === "edit") {
      this.isEdit = true;
      this.oldAssetId = this.asset.assetID;
    }
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.cache
      .gridViewSetup(
        this.dialogRef.formModel.formName,
        this.dialogRef.formModel.gridViewName
      )
      .subscribe((res) => {
        console.log(res);
        this.gvs = res;
      });
  }

  ngAfterViewInit(): void {
    this.title = this.dialogData.data?.formTitle;
  }
  //#endregion

  //#region Event
  handleClickSave(): void {
    console.log(this.asset);

    if (!this.acService.validateFormData(this.form.formGroup, this.gvs)) {
      return;
    }

    this.dialogRef.dataService
      .save((req: RequestOption) => {
        req.methodName = !this.isEdit ? 'AddAsync' : 'UpdateAsync';
        req.className = 'AssetsBusiness';
        req.assemblyName = 'ERM.Business.AM';
        req.service = 'AM';
        req.data = !this.isEdit ? this.asset : [this.asset, this.oldAssetId];

        return true;
      })
      .subscribe((res) => {
        if (res.save || res.update) {
          this.dialogRef.close();
        }
      });
  }
  //#endregion

  //#region Method
  //#endregion

  //#region Function
  //#endregion
}
