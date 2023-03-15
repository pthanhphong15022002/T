import { LayoutAddComponent } from 'codx-core';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Injector,
  Optional,
  Output,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import {
  DialogData,
  DialogRef,
  FormModel,
  ImageViewerComponent,
  RequestOption,
  UIComponent,
} from 'codx-core';
import { CodxEpService } from 'projects/codx-ep/src/lib/codx-ep.service';

@Component({
  selector: 'popup-add-stationery',
  templateUrl: './popup-add-stationery.component.html',
  styleUrls: ['./popup-add-stationery.component.scss'],
})
export class PopupAddStationeryComponent
  extends UIComponent
  implements AfterViewInit
{
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @ViewChild('form') form: LayoutAddComponent;
  @Output() loadData = new EventEmitter();
  isAfterRender = false;
  dialogAddStationery: FormGroup;
  color: any;
  returnData;
  title: string = '';
  tabInfo: any[] = [
    {
      icon: 'icon-info',
      text: 'Thông tin chung',
      name: 'lblGeneralInfo',
    },
    {
      icon: 'icon-person_add_alt_1',
      text: 'Định mức sử dụng',
      name: 'lblQuotaInfo',
    },
    {
      icon: 'icon-tune',
      text: 'Thông tin khác',
      name: 'lblMoreInfo',
    },
  ];
  data: any = {};
  dialogRef: DialogRef;
  isAdd = true;
  colorItem: any;
  listColor = [];
  formModel: FormModel;
  quota;
  headerText: Object = [
    { text: 'Thông tin chung', iconCss: 'icon-info' },
    { text: 'Định mức sử dụng', iconCss: 'icon-person_add' },
    { text: 'Thông tin khác', iconCss: 'icon-tune' },
  ];
  tmpTitle = '';
  autoNumDisable = false;
  imgRecID: any;
  warehouseOwner: string = '';
  warehouseOwnerName: string = '';
  defaultWarehouse: string = '';
  isPriceVisible: boolean = false;

  constructor(
    injector: Injector,
    private epService: CodxEpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(injector);
    this.data = dt?.data[0];
    this.isAdd = dt?.data[1];
    this.tmpTitle = dt?.data[2];
    this.dialogRef = dialog;
    this.formModel = this.dialogRef.formModel;
    if (this.isAdd) {
      this.imgRecID = null;
    } else {
      this.imgRecID = this.data.recID;
      this.defaultWarehouse = this.data.location;
      this.warehouseOwnerName = this.data.ownerName;
    }
  }

  onInit(): void {
    this.epService.getEPStationerySetting('1').subscribe((res: any) => {
      if (res) {
        let dataValue = res.dataValue;
        let json = JSON.parse(dataValue);
        this.isPriceVisible = json.ShowUnitPrice ?? false;
      }
    });

    this.epService
      .getAutoNumberDefault(this.formModel.funcID)
      .subscribe((autoN) => {
        if (autoN) {
          if (!autoN?.stop) {
            this.autoNumDisable = true;
          }
        }
      });

    this.epService.getQuotaByID(this.data.resourceID).subscribe((res) => {
      if (res) {
        this.quota = res;
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.isAdd) {
      this.api
        .exec('EP', 'WarehousesBusiness', 'GetDefaultWarehousesIDAsync', [])
        .subscribe((res: string) => {
          this.defaultWarehouse = res;
          this.data.location = this.defaultWarehouse;
          this.epService
            .getWarehousesOwner(this.defaultWarehouse)
            .subscribe((res: any) => {
              if (res) {
                this.warehouseOwner = res[0];
                this.data.owner = this.warehouseOwner;
                this.warehouseOwnerName = res[1];
                this.detectorRef.detectChanges();
              }
            });
        });
    }
  }

  beforeSave(option: RequestOption) {
    let itemData = this.data;
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd];
    return true;
  }

  onSaveForm() {
    this.dialogAddStationery = this.form.formGroup;
    this.dialogAddStationery.patchValue(this.data);
    if (this.dialogAddStationery.invalid == true) {
      this.epService.notifyInvalid(this.dialogAddStationery, this.formModel);
      return;
    }
    let index: any;
    if (this.isAdd) {
      index = 0;
    } else {
      index = null;
    }
    this.dialogRef.dataService
      .save((opt: any) => this.beforeSave(opt), index)
      .subscribe(async (res) => {
        if (res.save || res.update) {
          if (!res.save) {
            this.returnData = res.update;
          } else {
            this.returnData = res.save;
          }
          if (this.returnData?.recID) {
            if (this.imageUpload?.imageUpload?.item) {
              this.imageUpload
                .updateFileDirectReload(this.returnData.recID)
                .subscribe((result) => {
                  if (result) {
                    //xử lí nếu upload ảnh thất bại
                    //...
                    this.dialogRef && this.dialogRef.close(this.returnData);
                  }
                });
            } else {
              this.dialogRef && this.dialogRef.close(this.returnData);
            }
          }
        } else {
          //Trả lỗi từ backend.
          return;
        }
      });
  }

  valueChange(event) {
    if (event?.field) {
      if (event.data instanceof Object) {
        this.data[event.field] = event.data.value;
      } else {
        this.data[event?.field] = event.data;
      }
    }

    if (event?.field == 'location') {
      this.epService.getWarehousesOwner(event.data).subscribe((res: string) => {
        this.warehouseOwner = res[0];
        this.warehouseOwnerName = res[1];
        this.detectorRef.detectChanges();
      });
    }

    if (event?.field == 'owner') {
      this.data.owner = this.warehouseOwner;
      this.detectorRef.detectChanges();
    }
  }

  buttonClick(event) {}

  setTitle(event) {
    this.title = this.tmpTitle;
    this.detectorRef.detectChanges();
  }
}
