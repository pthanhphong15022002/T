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
  NotificationsService,
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
  keyField: any = '';
  validate: any = 0;
  formType: any;
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
    private notification: NotificationsService,
    @Optional() public dialogRef: DialogRef,
    @Optional() private dialogData: DialogData
  ) {
    super(injector);

    this.dataService = this.dialogRef.dataService;
    this.asset = this.dataService.dataSelected;
    this.keyField = this.dataService!.keyField;
    this.formType = this.dialogData.data?.formType;
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

    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
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
  }
  //#endregion

  //#region Method
  checkValidate() {

    //Note
    let ignoredFields: string[] = [];
    if(this.keyField == 'AssetID')
    {
      ignoredFields.push(this.keyField);
    }
    ignoredFields = ignoredFields.map((i) => i.toLowerCase());
    //End Note

    var keygrid = Object.keys(this.gvs);
    var keymodel = Object.keys(this.asset);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gvs[keygrid[index]].isRequire == true) {
        if(ignoredFields.includes(keygrid[index].toLowerCase()))
        {
          continue;
        }
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.asset[keymodel[i]] == null ||
              String(this.asset[keymodel[i]]).match(/^ *$/) !== null
            ) {
              this.notification.notifyCode(
                'SYS009',
                0,
                '"' + this.gvs[keygrid[index]].headerText + '"'
              );
              this.validate++;
            }
          }
        }
      }
    }
  }
  //#endregion

  //#region Function
  //#endregion
}
