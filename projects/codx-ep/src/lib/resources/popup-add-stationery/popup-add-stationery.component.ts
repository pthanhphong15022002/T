import { filter } from 'rxjs';
import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import { LayoutAddComponent, ViewType } from 'codx-core';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Injector,
  Optional,
  Output,
  TemplateRef,
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
import { EPCONST } from '../../codx-ep.constant';
import { Warehouses } from '../../models/resource.model';

const _addMF = EPCONST.MFUNCID.Add;
const _copyMF = EPCONST.MFUNCID.Copy;
const _editMF = EPCONST.MFUNCID.Edit;
const _viewMF = EPCONST.MFUNCID.View;
@Component({
  selector: 'popup-add-stationery',
  templateUrl: './popup-add-stationery.component.html',
  styleUrls: ['./popup-add-stationery.component.scss'],
})
export class PopupAddStationeryComponent
  extends UIComponent
  implements AfterViewInit
{
  @ViewChild('tmpWarehouse') tmpWarehouse: TemplateRef<any>;
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
      icon: 'icon-tune',
      text: 'Thông tin khác',
      name: 'lblMoreInfo',
    },
    {
      icon: 'icon-person_add_alt_1',
      text: 'Định mức sử dụng',
      name: 'lblQuotaInfo',
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
  mfuncID: any;
  viewOnly=false;
  warehouses=[];
  curWarehouse = new Warehouses();

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
    this.funcID = dt?.data[3];
    this.mfuncID = dt?.data[4];
    this.dialogRef = dialog;
    this.formModel = this.dialogRef.formModel;
    if (this.isAdd) {
      this.imgRecID = null;
      this.data.warehouses=[];
    } else {
      this.imgRecID = this.data.recID;
      this.defaultWarehouse = this.data.location;
      this.warehouseOwnerName = this.data.ownerName;
    }
    if(this.mfuncID==_viewMF){
      this.viewOnly=true;
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
    option.methodName = 'SaveAsync';
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

    if (event?.field == 'location'&& event?.data!='') {
      this.epService.getWarehousesOwner(event.data).subscribe((res: string) => {
        if(res){
          this.warehouseOwner = res[0];
          this.warehouseOwnerName = res[1];
          this.detectorRef.detectChanges();
        }
      });
    }

    if (event?.field == 'owner') {
      this.data.owner = this.warehouseOwner;
      this.detectorRef.detectChanges();
    }
    
  }
  warehouseChange(event){
    if(event?.field && (event?.data!='' || event?.data>=0)){      
      this.curWarehouse[event?.field] = event.data;
      if(event?.field =='warehouseID' ){
        this.epService.getWarehousesOwner(event.data).subscribe((res: any) => {
          if(res){
            this.curWarehouse.owner = res[0];
            this.detectorRef.detectChanges();
          }
        });
      }
    }
    
  }
  buttonClick(event) {}

  setTitle(event) {
    this.title = this.tmpTitle;
    this.detectorRef.detectChanges();
  }
  deleteWarehouse(wh){
    if(this.data?.warehouses?.length>0 && wh !=null){
      this.data.warehouses=this.data?.warehouses?.filter(x=>x?.warehouseID != wh?.warehouseID);
      this.detectorRef.detectChanges();
    }
  }
  addEditWarehouse(wh:any, isAdd=true){
    if(isAdd){
      this.curWarehouse = new Warehouses();
      this.curWarehouse.availableQty=0;
      this.curWarehouse.reservedQty=0;
      this.curWarehouse.currentQty=0;
    }
    else{
      this.curWarehouse = {...wh};
    }    
    let dialogWH = this.callfc.openForm(this.tmpWarehouse, '', 400, 500);
  }
  saveWarehouse(dialog){
    if(this.data?.warehouses==null) this.data.warehouses=[];
    let addWH = true;
    for (let index = 0; index < this.data?.warehouses.length; index++) {      
      if(this.data?.warehouses[index]?.warehouseID == this.curWarehouse?.warehouseID){
        this.data.warehouses[index]=this.curWarehouse;
        addWH=false;
      }      
    }
    if(addWH){
      this.data.warehouses.push(this.curWarehouse);    
    }    
    this.data.availableQty=0;
    this.data.reservedQty=0;
    this.data.currentQty=0;
    this.data.warehouses.forEach(x=>{
      if(x?.availableQty >0) this.data.availableQty+=x?.availableQty ;      
      if(x?.reservedQty >0) this.data.reservedQty+=x?.reservedQty ;
      if(x?.currentQty >0) this.data.currentQty+=x?.currentQty ;
    })
    this.detectorRef.detectChanges();
    dialog && dialog.close();
  }
}

