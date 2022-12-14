import {
  AfterViewInit,
  Component,
  EventEmitter,
  Injector,
  Input,
  Optional,
  Output,
  TemplateRef,
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
  ViewModel,
  ViewType,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxOmService } from '../../codx-om.service';


@Component({
  selector: 'popup-check-in',
  templateUrl: 'popup-check-in.component.html',
  styleUrls: ['popup-check-in.component.scss'],
})
export class PopupCheckInComponent extends UIComponent implements AfterViewInit {
  
  views: Array<ViewModel> | any = [];
  @ViewChild('attachment') attachment: AttachmentComponent;
  
  dialogRef: DialogRef;
  formModel: FormModel;
  headerText: string;

  data:any;
  dataKR:any;
  fCheckinKR: FormGroup;
  isAfterRender: boolean;
  constructor(
    private injector: Injector,
    private authService: AuthService,
    private codxOmService: CodxOmService,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.headerText= "Check-in"//dialogData?.data[2];
    this.dialogRef = dialogRef;    
    this.dataKR = dialogData.data[0];    
    this.formModel = dialogData.data[1];    
  }

  ngAfterViewInit(): void {
  }

  onInit(): void {
    this.initForm();
  }
  click(event: any) {
    switch (event) {
      
    }
  }
  initForm() {
    this.codxOmService
      .getFormGroup(this.formModel?.formName, this.formModel?.gridViewName)
      .then((item) => {
        this.fCheckinKR = item;  
        this.data=this.fCheckinKR.value;             
        this.isAfterRender = true;
      });    
  }

  checkinSave(){
    this.data.checkIn=new Date();
    // this.data.modifiedOn=new Date();
    this.data.oKRID=this.dataKR.recID;
    // this.data.modifiedBy= this.authService.userValue.userID;
    // this.fCheckinKR.patchValue(this.data);
    // if (this.fCheckinKR.invalid == true) {
    //   this.codxOmService.notifyInvalid(this.fCheckinKR, this.formModel);
    //   return;
    // }
    this.codxOmService.checkInKR(this.dataKR.recID, this.data).subscribe((res:any)=>{
      if(res){
        this.notificationsService.notifyCode('SYS034');
        res.checkIns=Array.from(res.checkIns).reverse();
        this.dialogRef && this.dialogRef.close(res)
      }
    })
  }
  checkinCancel(){
    this.dialogRef.close();
  }
  
  popupUploadFile(evt: any) {
    this.attachment.uploadFile();
  }
  fileCount(evt:any){
    
  }

  fileAdded(evt:any){

  }
}
