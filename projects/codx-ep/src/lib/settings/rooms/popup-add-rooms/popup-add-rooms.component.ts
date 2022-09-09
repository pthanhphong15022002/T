import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  CallFuncService,
  DialogData,
  FormModel,
  RequestOption,
  CacheService,
  DialogRef,
  ImageViewerComponent,
  CRUDService,
} from 'codx-core';
import { Device } from '../../../booking/car/popup-add-booking-car/popup-add-booking-car.component';
import { CodxEpService } from '../../../codx-ep.service';

@Component({
  selector: 'popup-add-rooms',
  templateUrl: 'popup-add-rooms.component.html',
  styleUrls: ['popup-add-rooms.component.scss'],
})
export class PopupAddRoomsComponent implements OnInit {
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @Input() data!: any;
  @Input() editResources: any;
  @Input() isAdd = true;
  @Output() closeEdit = new EventEmitter();
  dialog: any;
  cacheGridViewSetup: any;
  CbxName: any;
  dialogAddRoom: FormGroup;
  vllDevices = [];
  lstDevices: [];
  isAfterRender = false;

  tmplstDevice = [];
  lstDeviceRoom = [];

  formModel: FormModel;  
  headerText='';
  subHeaderText = '';

  constructor(
    private cacheSv: CacheService,
    private codxEpService: CodxEpService,
    private callFuncService: CallFuncService,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {    
    this.data = dt?.data[0];
    this.isAdd = dt?.data[1];
    this.dialog = dialog;
    this.formModel = this.dialog.formModel;    
  }

  ngOnInit(): void {    
    this.initForm();
    this.cacheSv.valueList('EP012').subscribe((res) => {      
      this.vllDevices = res.datas;      
      this.vllDevices.forEach((item) => {
        let device = new Device();
        device.id = item.value;
        device.text = item.text;
        if(!this.isAdd)
        {      
          this.data.equipments.split(";").forEach((item)=>{
            if(item == device.id){
              device.isSelected = true;
            }
          }); 
        }
        this.lstDeviceRoom.push(device);          
        this.tmplstDevice = JSON.parse(JSON.stringify(this.lstDeviceRoom));
      });       
    }); 

    this.codxEpService
      .getComboboxName(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
      .then((res) => {
        this.CbxName = res;
        console.log('cbx', this.CbxName);
      });
  }

  initForm() {
    if(this.isAdd){      
      this.headerText = "Thêm mới phòng"
    }
    else{
      this.headerText = "Sửa thông tin phòng"
    }

    this.codxEpService
    .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.dialogAddRoom = item;
        if (this.data) {
          this.dialogAddRoom.patchValue(this.data);
        }        
        this.isAfterRender = true;
      });
  }

  valueCbxChange(event: any) {
    if (event?.field != null) {
      if (event.data instanceof Object) {
        this.dialogAddRoom.patchValue({ [event['field']]: event.data.value });
      } else {
        this.dialogAddRoom.patchValue({ [event['field']]: event.data });
      }
    }
  }

  checkedChange(event: any, device: any) {
    let index = this.tmplstDevice.indexOf(device);
    if (index != -1) {
      this.tmplstDevice[index].isSelected = event.data;
    }
  }
  openPopupDevice(template: any) {
    var dialog = this.callFuncService.openForm(template, '', 550, 430);
    this.changeDetectorRef.detectChanges();
  }
  onSaveForm() {
    if (this.dialogAddRoom.invalid == true) {
      console.log(this.dialogAddRoom);
      return;
    }
    let lstEquipments = '';
    this.tmplstDevice.forEach((element) => {
      if (element.isSelected) {
        if (lstEquipments == '') {
          lstEquipments += element.id;
        } else {
          lstEquipments += ';' + element.id;
        }
      }
    });    
    this.dialogAddRoom.patchValue({
      resourceType:'1',
      linkType:'0',
      equipments:lstEquipments,
    });
    
    this.dialogAddRoom.patchValue({companyID:'chưa có dữ liệu'});
    if(this.dialogAddRoom.value.owner instanceof Object){
      this.dialogAddRoom.patchValue({owner:this.dialogAddRoom.value.owner[0]})
    }
    if (this.dialogAddRoom.value.companyID instanceof Object){
      this.dialogAddRoom.patchValue({companyID:this.dialogAddRoom.value.companyID[0]})
    }

    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe((res) => {
        if (res) {
          this.imageUpload
            .updateFileDirectReload(res.update.recID)
            .subscribe((result) => {
              if (result) {
                //this.loadData.emit();
              }
            });
          this.dialog.close();
        }
        return;
      });
  }

  beforeSave(option: RequestOption) {
    let itemData = this.dialogAddRoom.value;
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd];
    return true;
  }
  closeFormEdit(data) {
    this.initForm();
    this.closeEdit.emit(data);
  }
}
