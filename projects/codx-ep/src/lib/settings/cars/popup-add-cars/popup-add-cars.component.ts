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
import { Device } from '../../../booking/car/popup-add-booking-car/popup-add-booking-car.component';


import { CodxEpService } from '../../../codx-ep.service';

@Component({
  selector: 'popup-add-cars',
  templateUrl: 'popup-add-cars.component.html',
  styleUrls: ['popup-add-cars.component.scss'],
})
export class PopupAddCarsComponent implements OnInit {
  @ViewChild('attachment') attachment : AttachmentComponent; 

  @Input() editResources: any;
  @Input() isAdd = true;
  @Input() data!: any;
  @Output() closeEdit = new EventEmitter();
  @Output() onDone = new EventEmitter();

  headerText='';
  subHeaderText = 'Tạo & upload file văn bản';

  fGroupAddCar: FormGroup;
  formModel: FormModel;
  dialogRef: DialogRef;

  CbxName: any;
  isAfterRender = false;  

  vllDevices = [];
  lstDeviceCar = [];
  tmplstDevice = [];

  constructor(    
    private callFuncService: CallFuncService,
    private cacheService: CacheService,
    private changeDetectorRef: ChangeDetectorRef,
    private codxEpService: CodxEpService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    this.data = dialogData?.data[0];
    this.isAdd = dialogData?.data[1];
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef.formModel;    
  }

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {    
    this.initForm();
    this.cacheService.valueList('EP012').subscribe((res) => {      
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

    this.codxEpService
      .getComboboxName(
        this.dialogRef.formModel.formName,
        this.dialogRef.formModel.gridViewName
      )
      .then((res) => {
        this.CbxName = res;
        console.log('cbx', this.CbxName);
      });
  }

  initForm() {
    if(this.isAdd){      
      this.headerText = "Thêm mới xe"
    }
    else{
      this.headerText = "Sửa thông tin xe"
    }
    this.codxEpService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.fGroupAddCar = item;
        if (this.data) {
          this.fGroupAddCar.patchValue(this.data);
        }
        this.fGroupAddCar.addControl(
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
        this.fGroupAddCar.patchValue({ [event['field']]: event.data.value });
      } else {
        this.fGroupAddCar.patchValue({ [event['field']]: event.data });
      }
    }
  }

  valueCbxChange(event: any) {
    if (event?.field != null) {
      if (event.data instanceof Object) {
        this.fGroupAddCar.patchValue({ [event['field']]: event.data.value });
      } else {
        this.fGroupAddCar.patchValue({ [event['field']]: event.data });
      }
    }
  }
  
  beforeSave(option: RequestOption) {
    let itemData = this.fGroupAddCar.value;
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd];
    return true;
  }

  onSaveForm() {
    if (this.fGroupAddCar.invalid == true) {
      console.log(this.fGroupAddCar);
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
    this.fGroupAddCar.value.equipments = equipments;
    if(this.fGroupAddCar.value.category!=1){
      this.fGroupAddCar.value.companyID=null;
    }else{      
      this.fGroupAddCar.value.companyID = this.fGroupAddCar.value.companyID[0];
    }
    this.fGroupAddCar.value.owner = this.fGroupAddCar.value.owner[0];

    if (!this.fGroupAddCar.value.linkType) {
      this.fGroupAddCar.value.linkType = '3';
    }
    this.fGroupAddCar.value.resourceType = '2';
    this.dialogRef.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe(
        res => {
          if (res.update) {
            (this.dialogRef.dataService as CRUDService)
              .update(res.update)
              .subscribe();
          }
          this.changeDetectorRef.detectChanges();
        }
      );      
    //this.attachment.saveFilesObservable().subscribe(res=>{})
  }

  fileCount(event){
    this.fGroupAddCar.value.icon= event.data[0].data;    
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
