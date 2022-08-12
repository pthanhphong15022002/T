import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import {
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  FormModel,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';

import { CodxEpService } from '../../../codx-ep.service';

@Component({
  selector: 'popup-add-drivers',
  templateUrl: 'popup-add-drivers.component.html',
  styleUrls: ['popup-add-drivers.component.scss'],
})
export class PopupAddDriversComponent implements OnInit ,AfterViewInit{
  @Input() editResources: any;
  @Input() isAdd = true;
  @Input() data: any;
  @Output() closeEdit = new EventEmitter();
  @Output() onDone = new EventEmitter();

  @ViewChild('attachment') attachment : AttachmentComponent 
  cacheGridViewSetup: any;
  CbxName: any;
  dialogAddDriver: FormGroup;

  formModel: FormModel;
  dialog: any;
  headerText = '';
  subHeaderText = 'Tạo & upload file văn bản';

  constructor(
    private cacheSv: CacheService,
    private bookingService: CodxEpService,
    private callFuncService: CallFuncService,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data[0];
    this.isAdd = dt?.data[1];
    this.dialog = dialog;
    this.formModel = this.dialog.formModel;
    this.cacheSv.valueList('VL005').subscribe((res) => {
      console.log(res);
    });
  }
  ngAfterViewInit(): void {
  this.dialog && this.dialog.closed.subscribe(res=>{});
}

  isAfterRender = false;
  ngOnInit(): void {
    this.initForm();

    this.bookingService
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
    //     this.dialogAddDriver.patchValue({
    //       ranking: '1',
    //       category: '1',
    //       owner: '',
    //     });
    //   });
    if(this.isAdd){      
      this.headerText = "Thêm mới lái xe"
    }
    else{
      this.headerText = "Sửa thông tin lái xe"
    }
    this.bookingService
      .getFormGroup('Resources', 'grvResources')
      .then((item) => {
        this.dialogAddDriver = item;
        if (this.data) {
          this.dialogAddDriver.patchValue(this.data);
        }
        this.dialogAddDriver.addControl(
          'code',
          new FormControl(this.data.code)
        );
        this.isAfterRender = true;
      });
  }

  valueChange(event: any) {
    if (event?.field != null) {
      if (event.data instanceof Object) {
        this.dialogAddDriver.patchValue({ [event['field']]: event.data.value });
      } else {
        this.dialogAddDriver.patchValue({ [event['field']]: event.data });
      }
    }
  }

  beforeSave(option: any) {
    let itemData = this.dialogAddDriver.value;
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd];

    return true;
  }

  valueCbxChange(event: any) {
    if (event?.field != null) {
      if (event.data instanceof Object) {
        this.dialogAddDriver.patchValue({ [event['field']]: event.data.value });
      } else {
        this.dialogAddDriver.patchValue({ [event['field']]: event.data });
      }
    }
  }
  valueCbxCarChange(event: any) {
    if (event.data != '') {
      if (event.data instanceof Object) {
        this.dialogAddDriver.patchValue({ [event['field']]: event.data.value });
      } else {
        this.dialogAddDriver.patchValue({ [event['field']]: event.data });
      }
      var cbxCar = event.component.dataService.data;
      cbxCar.forEach(element => {
        if(element.ResourceID == event.component.valueSelected) {
          this.dialogAddDriver.patchValue({code : element.Code}); 
          this.changeDetectorRef.detectChanges();
        }
      });
    }  
  }
  openPopupDevice(template: any) {
    var dialog = this.callFuncService.openForm(template, '', 550, 430);
    this.changeDetectorRef.detectChanges();
  }

  onSaveForm() {
    if (this.dialogAddDriver.invalid == true) {
      console.log(this.dialogAddDriver);
      return;
    }    
    
    this.dialogAddDriver.value.companyID = this.dialogAddDriver.value.companyID[0];
    this.dialogAddDriver.value.owner = this.dialogAddDriver.value.owner[0];

    if (!this.dialogAddDriver.value.linkType) {
      this.dialogAddDriver.value.linkType = '2';
    }
    this.dialogAddDriver.value.resourceType = '3';
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe();
    this.attachment.saveFilesObservable().subscribe(res=>{})
  }

  fileCount(event){
    this.dialogAddDriver.value.icon= event.data[0].data;
    
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
