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
  headerText: string;

  oldDataKR:any;
  fCheckinKR: FormGroup;
  isAfterRender: boolean;
  dataKR: any;
  formModel= new FormModel();
  grView: any;
    
  constructor(
    private injector: Injector,
    private authService: AuthService,
    private codxOmService: CodxOmService,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.headerText= dialogData?.data[1];
    this.dialogRef = dialogRef;    
    this.oldDataKR = dialogData.data[0];    
    //this.formModel = dialogData.data[1];    
  }
//---------------------------------------------------------------------------------//
  //-----------------------------------Base Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  ngAfterViewInit(): void {

  }

  onInit(): void {
    this.getCacheData()
    this.formModel.entityName = 'OM_OKRs.CheckIns';
    this.formModel.entityPer = 'OM_OKRs.CheckIns';
    this.formModel.gridViewName = 'grvOKRs.CheckIns';
    this.formModel.formName = 'OKRs.CheckIns';
    this.getCurrentKR();
    
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Cache Data--------------------------------//
  //---------------------------------------------------------------------------------//
  getCacheData(){
    this.cache.gridViewSetup(this.formModel.formName,this.formModel.gridViewName).subscribe(grv=>{
      if(grv){
        this.grView=grv;
      }
    });
  }

  //---------------------------------------------------------------------------------//
  //-----------------------------------Get Data Func---------------------------------//
  //---------------------------------------------------------------------------------//
  getCurrentKR() {
    this.codxOmService.getOKRByID(this.oldDataKR.recID).subscribe((krModel) => {
      if (krModel) {
        this.dataKR= krModel;
        this.isAfterRender=true;
      }
    });
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Base Event------------------------------------//
  //---------------------------------------------------------------------------------//
  // valueChange(evt: any) {
  //   if (evt && evt?.data) {
      
  //   }
  //   this.detectorRef.detectChanges();
  // }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Event----------------------------------//
  //---------------------------------------------------------------------------------//
  checkinCancel(){
    this.dialogRef.close();
  }
  //---------------------------------------------------------------------------------//
  //-----------------------------------Validate Func---------------------------------//
  //---------------------------------------------------------------------------------//

  //---------------------------------------------------------------------------------//
  //-----------------------------------Logic Func-------------------------------------//
  //---------------------------------------------------------------------------------//
  checkinSave(){
    // this.fCheckinKR.patchValue(this.data);
    // if (this.fCheckinKR.invalid == true) {
    //   this.codxOmService.notifyInvalid(this.fCheckinKR, this.formModel);
    //   return;
    // }
    this.codxOmService.checkInKR(this.dataKR.recID, this.dataKR).subscribe((res:any)=>{
      if(res){
        this.notificationsService.notifyCode('SYS034');
        res.checkIns=Array.from(res.checkIns).reverse();
        this.dialogRef && this.dialogRef.close(res)
      }
    })
  }
  
  //---------------------------------------------------------------------------------//
  //-----------------------------------Custom Func-----------------------------------//
  //---------------------------------------------------------------------------------//


  //---------------------------------------------------------------------------------//
  //-----------------------------------Popup-----------------------------------------//
  //---------------------------------------------------------------------------------//
  
  
  
  
  popupUploadFile(evt: any) {
    this.attachment.uploadFile();
  }
  fileCount(evt:any){
    
  }

  fileAdded(evt:any){

  }
}
