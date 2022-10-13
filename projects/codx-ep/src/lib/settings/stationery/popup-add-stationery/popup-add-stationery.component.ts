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
  columnGrid;
  title: string = '';
  titleAction: string = 'Thêm mới';
  tabInfo: any[] = [
    {
      icon: 'icon-info',
      text: 'Thông tin chung',
      subName: 'Thông tin chi tiết của VPP',
      name: 'tabGeneralInfo',
    },
    {
      icon: 'icon-person_add_alt_1',
      text: 'Định mức sử dụng',
      subName: 'Định mức khi đặt VPP',
      name: 'tabQuotaInfo',
    },
    {
      icon: 'icon-tune',
      text: 'Thông tin khác',
      subName: 'Thông tin tham chiếu',
      name: 'tabMoreInfo',
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
    this.dialog = dialog;
    this.formModel = this.dialog.formModel;
  }

  onInit(): void {
    this.initForm();
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
    this.data.resourceType = '6';
    this.dialogAddStationery.patchValue(this.data);
    let index:any
    if(this.isAdd){
      index=0;
    }
    else{
      index=null;
    }
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt), index)
      .subscribe((res) => {
        if (res.save || res.update) {
          if (!res.save) {
            this.returnData = res.update;
          } else {
            this.returnData = res.save;
          }
          if (this.imageUpload && this.returnData?.recID) {
            this.imageUpload
              .updateFileDirectReload(this.returnData?.recID)
              .subscribe((result) => {
                if (result) {
                  this.data.icon = result[0].fileName;
                  this.epService
                    .updateResource(this.data, this.isAdd)
                    .subscribe();
                  this.loadData.emit();
                  //xử lí nếu upload ảnh thất bại
                  //...
                }
              });
          }
          
          this.dialog.close();
        }
        return;
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

  setTitle(e: any) {
    this.title = this.titleAction + ' ' + e.toString().toLowerCase();
    this.detectorRef.detectChanges();
  }

  buttonClick(e: any) {}
}
