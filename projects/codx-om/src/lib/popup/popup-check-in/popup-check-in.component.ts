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

  dataKR:any;

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
    
  }
  click(event: any) {
    switch (event) {
      
    }
  }


  checkinSave(){

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
