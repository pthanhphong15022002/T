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
  AuthService,
  CRUDService,
  DialogData,
  DialogRef,
  FormModel,
  ImageViewerComponent,
  NotificationsService,
  RequestOption,
  UIComponent,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { Device } from '../../../booking/car/popup-add-booking-car/popup-add-booking-car.component';

import { CodxEpService } from '../../../codx-ep.service';
import { Equipments } from '../../../models/equipments.model';

@Component({
  selector: 'popup-add-epCards',
  templateUrl: 'popup-add-epCards.component.html',
  styleUrls: ['popup-add-epCards.component.scss'],
})
export class PopupAddEpCardsComponent extends UIComponent {
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @Input() editResources: any;
  @Input() isAdd = true;
  @Input() data!: any;
  @Output() closeEdit = new EventEmitter();
  @Output() onDone = new EventEmitter();
  @Output() loadData = new EventEmitter();
  returnData:any;
  headerText = '';
  subHeaderText = '';
  fGroupAddEpCards: FormGroup;
  formModel: FormModel;
  dialogRef: DialogRef;
  lstEquipment = [];
  isAfterRender = false;
  gviewEpCards: any;
  avatarID: any = null;
  funcID: any;
  autoNumDisable= false;
  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.data = dialogData?.data[0];
    this.isAdd = dialogData?.data[1];
    this.headerText = dialogData?.data[2];
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef.formModel;
    
  }

  ngAfterViewInit(): void {}

  onInit(): void {
    this.initForm();    
    this.codxEpService.getAutoNumberDefault(this.formModel.funcID).subscribe(autoN=>{
      if(autoN){
        if(!autoN?.stop ){
          this.autoNumDisable=true;
        }
      }
    })
  }
  valueChange(evt:any){
    console.log(evt);
  }
  initForm() {    
    this.codxEpService
      .getFormGroup(
        this.formModel.formName,
        this.formModel.gridViewName
      )
      .then((item) => {
        this.fGroupAddEpCards = item;        
        this.isAfterRender = true;
      });
  }

  
  beforeSave(option: any) {
    let itemData = this.data;
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd];
    return true;
  }

  onSaveForm() {
    this.fGroupAddEpCards.patchValue(this.data);
    if (this.fGroupAddEpCards.invalid == true) {
      this.codxEpService.notifyInvalid(this.fGroupAddEpCards, this.formModel);
      return;
    }
    this.data.resourceType='7';
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
}
