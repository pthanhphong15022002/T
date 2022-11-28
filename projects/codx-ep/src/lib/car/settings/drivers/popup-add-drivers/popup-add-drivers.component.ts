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
import { CodxEpService } from 'projects/codx-ep/src/lib/codx-ep.service';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';

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
  grvDriver:any;
  CbxName: any;
  isAfterRender = false;
  returnData:any;
  imgRecID: any;
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
    if(this.isAdd){
      this.imgRecID=null;
    }
    else{
      this.imgRecID=this.data.recID;
    }
  }

  onInit(): void {
    this.cache.gridViewSetup(this.formModel?.formName,this.formModel?.gridViewName)
    .subscribe(res=>{
      if(res){
        this.grvDriver=res;
        if(this.isAdd){
          this.data.code=res?.Code?.headerText;
        }
      }
    })
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
        this.data['field']=event.data.value;
      } else {
        this.data['field']=event.data;
      }
    }
  }
  emailChange(event: any) {
    if (event?.field != null && event?.field != '') {
      this.data.email=event.data;      
      this.detectorRef.detectChanges();  
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
    let itemData = this.data;
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd];
    return true;
  }

  onSaveForm() {
    this.fGroupAddDriver.patchValue(this.data);
    if (this.fGroupAddDriver.invalid == true) {
      this.codxEpService.notifyInvalid(this.fGroupAddDriver, this.formModel);
      return;
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
        if (res.save || res.update) {          
          if (!res.save) {
            this.returnData = res.update;
          } else {
            this.returnData = res.save;
          }
          if(this.returnData?.recID)
          {
            if(this.imageUpload?.imageUpload?.item) {
              this.imageUpload
              .updateFileDirectReload(this.returnData.recID)
              .subscribe((result) => {
                if (result) {                  
                  //xử lí nếu upload ảnh thất bại
                  //...
                  this.dialogRef && this.dialogRef.close(this.returnData);                
                }
                this.dialogRef && this.dialogRef.close(this.returnData);
              });  
            }          
            else 
            {
              this.dialogRef && this.dialogRef.close(this.returnData);
            }
          } 
        }
        else{ 
          //Trả lỗi từ backend.         
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
