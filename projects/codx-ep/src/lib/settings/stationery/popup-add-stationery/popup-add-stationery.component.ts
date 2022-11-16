import { NotificationsService } from 'codx-core';
import {
  Component,
  EventEmitter,
  Injector,
  Optional,
  Output,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import {
  CRUDService,
  DialogData,
  DialogRef,
  FormModel,
  ImageViewerComponent,
  RequestOption,
  UIComponent,
} from 'codx-core';
import { CodxEpService } from '../../../codx-ep.service';

@Component({
  selector: 'popup-add-stationery',
  templateUrl: './popup-add-stationery.component.html',
  styleUrls: ['./popup-add-stationery.component.scss'],
})
export class PopupAddStationeryComponent extends UIComponent {
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @ViewChild('form') form: any;
  @Output() loadData = new EventEmitter();
  isAfterRender = false;
  dialogAddStationery: FormGroup;
  color: any;
  returnData;
  columnsGrid;
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
  dialog: DialogRef;
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

  constructor(
    private injector: Injector,
    private epService: CodxEpService,
    private notificationsService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(injector);
    this.data = dt?.data[0];
    this.isAdd = dt?.data[1];
    this.tmpTitle = dt?.data[2];
    this.dialog = dialog;
    this.formModel = this.dialog.formModel;
    if(this.isAdd){
      this.imgRecID=null;
    }
    else{
      this.imgRecID=this.data.recID;
    }
  }

  onInit(): void {
    this.initForm();
    this.epService
      .getAutoNumberDefault(this.formModel.funcID)
      .subscribe((autoN) => {
        if (autoN) {
          if (!autoN?.stop) {
            this.autoNumDisable = true;            
          }          
        }
      });
    this.columnsGrid = [
      // {
      //   field: 'noName',
      //   headerText: 'Phân loại',
      //   template: this.itemCategory,
      //   width: 200,
      // },
      // {
      //   field: 'competenceID',
      //   headerText: 'Người nhận/gửi',
      //   template: this.itemSenderOrReceiver,
      //   width: 200,
      // },
    ];
    this.epService
      .getQuotaByResourceID(this.data.resourceID)
      .subscribe((res) => {
        this.quota = res;
      });
  }

  initForm() {
    this.epService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item: any) => {
        this.dialogAddStationery = item;
        this.dialogAddStationery.patchValue({
          reservedQty: 0,
          currentQty: 0,
          availableQty: 0,
        });
        this.isAfterRender = true;
      });
  }

  beforeSave(option: RequestOption) {
    let itemData = this.data;
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd];
    return true;
  }

  onSaveForm() {
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
    this.dialog.dataService
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
                    this.dialog && this.dialog.close(this.returnData);
                  }
                });
            } else {
              this.dialog && this.dialog.close(this.returnData);
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
  }

  buttonClick(e: any) {}

  setTitle(e: any) {
    this.title = this.tmpTitle;
    this.detectorRef.detectChanges();
  }
}
