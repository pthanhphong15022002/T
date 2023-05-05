import { ViewBaseComponent } from 'codx-core/lib/layout/views/view-base/view-base.component';
import {
  Component,
  EventEmitter,
  Injector,
  Input,
  Optional,
  Output,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  DialogData,
  FormModel,
  RequestOption,
  DialogRef,
  ImageViewerComponent,
  AuthService,
  UIComponent,
  CRUDService,
  NotificationsService,
  Util,
} from 'codx-core';
import { CodxEpService } from 'projects/codx-ep/src/lib/codx-ep.service';
import { Device, Equipments } from 'projects/codx-ep/src/lib/models/equipments.model';
import { EPCONST } from '../../codx-ep.constant';

@Component({
  selector: 'popup-add-resources',
  templateUrl: 'popup-add-resources.component.html',
  styleUrls: ['popup-add-resources.component.scss'],
})
export class PopupAddResourcesComponent extends UIComponent {
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;

  @Input() data!: any;
  @Input() editResources: any;
  @Input() isAdd = true;
  @Output() closeEdit = new EventEmitter();
  dialogRef: DialogRef;
  cacheGridViewSetup: any;
  CbxName: any;
  fGroupAddRoom: FormGroup;
  vllDevices = [];
  lstDevices: [];
  isAfterRender = false;
  isDone = true;
  tmplstDevice = [];
  lstDeviceRoom = [];
  returnData: any;
  formModel: FormModel;
  headerText = '';
  subHeaderText = '';
  lstEquipment = [];
  moreFunc: any;
  functionList: any;
  imgRecID: any;
  grView: any;
  funcID:string;
    r_FuncID=EPCONST.FUNCID.R_Category;
    c_FuncID=EPCONST.FUNCID.C_Category;
    dr_FuncID=EPCONST.FUNCID.DR_Category;
    ca_FuncID=EPCONST.FUNCID.CA_Category;
  useCardCheck: any;
  autoNumDisable: boolean;
  constructor(
    injector: Injector,
    private authService: AuthService,
    private codxEpService: CodxEpService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);

    this.data = dialogData?.data[0];
    this.isAdd = dialogData?.data[1];
    this.headerText = dialogData?.data[2];
    this.funcID = dialogData?.data[3];
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef.formModel;
    if (this.isAdd) {
      this.data.preparator = this.authService.userValue.userID;      
      this.imgRecID = null;
    } else {
      this.imgRecID = this.data.recID;
    }
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  
  onInit(): void {  
    this.getCacheData();  
    this.initForm();

  }

  
  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Cache Data--------------------------------//
  //---------------------------------------------------------------------------------//
  getCacheData(){
    this.cache
    .gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
    .subscribe((grv) => {
      if (grv) {
        this.grView = Util.camelizekeyObj(grv);
      }
    });
    this.cache.valueList('EP012').subscribe((res) => {
      this.vllDevices = res.datas;
      this.vllDevices.forEach((item) => {
        let device = new Device();
        device.id = item.value;
        device.text = item.text;
        device.icon = item.icon;
        device.isSelected = false;
        if (!this.isAdd && this.data.equipments != null) {
          this.data.equipments.forEach((item) => {
            if (item.equipmentID == device.id) {
              device.isSelected = true;
            }
          });
        }
        this.lstDeviceRoom.push(device);
        this.tmplstDevice = JSON.parse(JSON.stringify(this.lstDeviceRoom));
      });
    });
    this.codxEpService
      .getAutoNumberDefault(this.formModel.funcID)
      .subscribe((autoN) => {
        if (autoN) {
          if (!autoN?.stop) {
            this.autoNumDisable = true;
          }
        }
      });
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Data Func---------------------------------//
  //---------------------------------------------------------------------------------//
  initForm() {
    this.codxEpService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.fGroupAddRoom = item;
        //this.isAfterRender = true;
      });
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Event------------------------------------//
  //---------------------------------------------------------------------------------//
  valueChange(event: any) {
    if (event?.field != null && event?.field != '') {
      if (event.data instanceof Object) {
        this.data['field'] = event.data.value;
      } else {
        this.data['field'] = event.data;
      }
    }
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Event----------------------------------//
  //---------------------------------------------------------------------------------//
  emailChange(event: any) {
    if (event?.field != null && event?.field != '') {
      this.data.email = event.data;
      this.detectorRef.detectChanges();
    }
  }
  checkedChange(event: any, device: any) {
    let index = this.tmplstDevice.indexOf(device);
    if (index != -1) {
      this.tmplstDevice[index].isSelected = event.data;
    }
  }
  changeCategory(event:any){
    if(event?.data && event?.data!='1'){
      this.data.companyID=null;
      this.detectorRef.detectChanges();
    }
  }
  valueUseCardChange(evt:any){
    if(evt!=null){
      this.data.useCard=evt.data;  
      this.useCardCheck=evt.data;    
      this.detectorRef.detectChanges();
    }
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Validate Func---------------------------------//
  //---------------------------------------------------------------------------------//

  beforeSave(option: RequestOption) {
    let itemData = this.fGroupAddRoom.value;
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd];
    return true;
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Logic Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  onSaveForm() {
    
    this.fGroupAddRoom.patchValue(this.data);
    if (this.fGroupAddRoom.invalid == true) {
      this.codxEpService.notifyInvalid(this.fGroupAddRoom, this.formModel);
      return;
    }
    this.lstEquipment = [];
    this.tmplstDevice.forEach((element) => {
      if (element.isSelected) {
        let tempEquip = new Equipments();
        tempEquip.equipmentID = element.id;
        tempEquip.createdBy = this.authService.userValue.userID;
        this.lstEquipment.push(tempEquip);
      }
    });
    this.fGroupAddRoom.patchValue({
      equipments: this.lstEquipment,
      category: '1',
    });
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
                  else{

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

  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Func-----------------------------------//
  //---------------------------------------------------------------------------------//


  //---------------------------------------------------------------------------------//
  //-----------------------------------Popup-----------------------------------------//
  //---------------------------------------------------------------------------------//
  
  openPopupDevice(template: any) {
    this.detectorRef.detectChanges();
  }
  
}
