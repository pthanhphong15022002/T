import {
  AfterViewInit,
  Component,
  Injector,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  CRUDService,
  CodxFormComponent,
  DialogData,
  DialogRef,
  RequestOption,
  UIComponent,
} from 'codx-core';
import { CodxAcService } from '../../../codx-ac.service';
import { IAsset } from '../interfaces/IAsset.interface';

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

  dataService: CRUDService;
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
    injector: Injector,
    private acService: CodxAcService,
    @Optional() public dialogRef: DialogRef,
    @Optional() private dialogData: DialogData
  ) {
    super(injector);

    this.dataService = this.dialogRef.dataService;
    this.asset = this.dataService.dataSelected;

    if (this.dialogData.data?.formType === 'edit') {
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
  onClickSave(): void {
    console.log(this.asset);

    if (!this.acService.validateFormData(this.form.formGroup, this.gvs)) {
      return;
    }

    this.dataService
      .save((req: RequestOption) => {
        if (!this.isEdit) {
          return false;
        }

        req.methodName = 'UpdateAsync';
        req.className = 'AssetsBusiness';
        req.assemblyName = 'ERM.Business.AM';
        req.data = [this.asset, this.oldAssetId];
        return true;
      })
      .subscribe((res: any) => {
        console.log(res);
        const isOkay: boolean = !this.isEdit
          ? res.save.data || res.update.data
          : res.save || res.update;
        if (isOkay) {
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
