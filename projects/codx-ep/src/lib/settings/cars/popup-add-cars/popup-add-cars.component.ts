import {
  ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Optional, Output, ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import {
  CacheService,
  CallFuncService,
  CRUDService,
  DialogData,
  DialogRef,
  FormModel,
  RequestOption,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { Device } from '../../../booking-car/popup-add-booking-car/popup-add-booking-car.component';

import { CodxEpService } from '../../../codx-ep.service';

@Component({
  selector: 'popup-add-cars',
  templateUrl: 'popup-add-cars.component.html',
  styleUrls: ['popup-add-cars.component.scss'],
})
export class PopupAddCarsComponent implements OnInit {
  @Input() editResources: any;
  @Input() isAdd = true;
  @Input() data!: any;
  @Output() closeEdit = new EventEmitter();
  @Output() onDone = new EventEmitter();
  @ViewChild('attachment') attachment : AttachmentComponent 
  cacheGridViewSetup: any;
  CbxName: any;
  dialogAddCar: FormGroup;
  formModel: FormModel;
  dialog: DialogRef;
  headerText='';
  subHeaderText = 'Tạo & upload file văn bản';
  isAfterRender = false;
  vllDevices = [];
  lstDeviceCar = [];
  tmplstDevice = [];

  constructor(
    private cacheSv: CacheService,
    private epService: CodxEpService,
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
        this.lstDeviceCar.push(device);          
        this.tmplstDevice = JSON.parse(JSON.stringify(this.lstDeviceCar));
      });       
    }); 

    this.epService
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
    // this.cacheSv
    //   .gridViewSetup('Resources', 'EP_Resources')
    //   .subscribe((item) => {
    //     this.editResources = item;
    //     this.dialogAddCar.patchValue({
    //       ranking: '1',
    //       category: '1',
    //       owner: '',
    //     });        
    //   });
    if(this.isAdd){      
      this.headerText = "Thêm mới xe"
    }
    else{
      this.headerText = "Sửa thông tin xe"
    }
    this.epService
      .getFormGroup('Resources', 'grvResources')
      .then((item) => {
        this.dialogAddCar = item;
        if (this.data) {
          this.dialogAddCar.patchValue(this.data);
        }
        this.dialogAddCar.addControl(
          'code',
          new FormControl(this.data.code)
        );
        this.isAfterRender = true;
      });
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
  valueChange(event: any) {
    if (event?.field != null) {
      if (event.data instanceof Object) {
        this.dialogAddCar.patchValue({ [event['field']]: event.data.value });
      } else {
        this.dialogAddCar.patchValue({ [event['field']]: event.data });
      }
    }
  }
  valueCbxChange(event: any) {
    if (event?.field != null) {
      if (event.data instanceof Object) {
        this.dialogAddCar.patchValue({ [event['field']]: event.data.value });
      } else {
        this.dialogAddCar.patchValue({ [event['field']]: event.data });
      }
    }
  }
  
  beforeSave(option: RequestOption) {
    let itemData = this.dialogAddCar.value;
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd];
    return true;
  }

  onSaveForm() {
    if (this.dialogAddCar.invalid == true) {
      console.log(this.dialogAddCar);
      return;
    }

    let equipments = '';
    this.tmplstDevice.forEach((element) => {
      if (element.isSelected) {
        if (equipments == '') {
          equipments += element.id;
        } else {
          equipments += ';' + element.id;
        }
      }
    });
    this.dialogAddCar.value.equipments = equipments;
    this.dialogAddCar.value.companyID = this.dialogAddCar.value.companyID[0];
    this.dialogAddCar.value.owner = this.dialogAddCar.value.owner[0];

    if (!this.dialogAddCar.value.linkType) {
      this.dialogAddCar.value.linkType = '3';
    }
    this.dialogAddCar.value.resourceType = '2';
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe(
        res => {
          if (res.update) {
            (this.dialog.dataService as CRUDService)
              .update(res.update)
              .subscribe();
          }
          this.changeDetectorRef.detectChanges();
        }
      );      
    this.attachment.saveFilesObservable().subscribe(res=>{})
  }

  fileCount(event){
    this.dialogAddCar.value.icon= event.data[0].data;
    
  }
  fileAdded(event){debugger}
  
  popupUploadFile() {
    this.attachment.uploadFile();
  } 

  closeFormEdit(data) {
    this.initForm();
    this.closeEdit.emit(data);
  }
}
