import {
  AfterViewInit,
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
  CRUDService,
  DialogData,
  DialogRef,
  FormModel,
  ImageViewerComponent,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';

import { CodxEpService } from '../../../codx-ep.service';

@Component({
  selector: 'popup-add-drivers',
  templateUrl: 'popup-add-drivers.component.html',
  styleUrls: ['popup-add-drivers.component.scss'],
})
export class PopupAddDriversComponent
  extends UIComponent
  implements AfterViewInit
{
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;

  @Input() editResources: any;
  @Input() isAdd = true;
  @Input() data: any;
  @Output() closeEdit = new EventEmitter();
  @Output() onDone = new EventEmitter();
  @Output() loadData = new EventEmitter();

  headerText = '';
  subHeaderText = '';

  fGroupAddDriver: FormGroup;
  formModel: FormModel;
  dialogRef: DialogRef;

  CbxName: any;
  isAfterRender = false;
  returnData:any;
  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.data =  dialogData?.data[0];
    this.isAdd = dialogData?.data[1];    
    this.headerText=dialogData?.data[2];
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef.formModel;
  }

  onInit(): void {
    this.initForm();
  }

  ngAfterViewInit(): void {}

  initForm() {
    this.codxEpService
      .getFormGroup(
        this.formModel.formName,
        this.formModel.gridViewName
      )
      .then((item) => {
        this.fGroupAddDriver = item;        
        this.isAfterRender = true;
      });
  }

  valueChange(event: any) {
    if (event?.field != null && event?.field != '') {
      if (event.data instanceof Object) {
        //this.fGroupAddDriver.patchValue({ [event['field']]: event.data.value });
      } else {
        //this.fGroupAddDriver.patchValue({ [event['field']]: event.data });
      }
    }
  }
  valueCbxCarChange(event: any) {
    if (event?.data && event.data != '') {      
      var cbxCar = event.component.dataService.data;
      cbxCar.forEach((element) => {
        if (element.ResourceID == event.component.valueSelected) {
          this.data.code = element.Code; 
          this.detectorRef.detectChanges();         
        }
      });
      this.detectorRef.detectChanges();
    }
    
  }

  beforeSave(option: any) {
    let itemData = this.fGroupAddDriver.value;
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd];
    return true;
  }

  onSaveForm() {
    this.data.linkType='2';
    this.data.resourceType='3';
    this.fGroupAddDriver.patchValue(this.data);
    if (this.fGroupAddDriver.invalid == true) {
      this.codxEpService.notifyInvalid(this.fGroupAddDriver, this.formModel);
      return;
    }
    if (this.fGroupAddDriver.value.category != 1) {
      this.fGroupAddDriver.patchValue({companyID:null});
    }   
    let index:any
    if(this.isAdd){
      index=0;
    }
    else{
      index=null;
    }
    this.dialogRef.dataService
      .save((opt: any) => this.beforeSave(opt),index)
      .subscribe(async (res) => {
        if (res) {          
          if (!res.save) {
            this.returnData = res.update;
          } else {
            this.returnData = res.save;
          }
          if(this.imageUpload)
          {
            (await this.imageUpload
            .updateFileDirectReload(this.returnData.recID))
            .subscribe((result) => {
              if (result) {
                this.loadData.emit();
                //xử lí nếu upload ảnh thất bại
                //...
              }
            });
          }    
          this.dialogRef.close();
        }
        else{
          this.notificationsService.notifyCode('SYS001');
          return;
        }
      }); 
  }
  
  changeCategory(event:any){
    if(event?.data && event?.data!='1'){
      this.data.companyID=null;
      this.detectorRef.detectChanges();
    }
  }
  closeFormEdit(data) {
    this.initForm();
    this.closeEdit.emit(data);
  }
}
