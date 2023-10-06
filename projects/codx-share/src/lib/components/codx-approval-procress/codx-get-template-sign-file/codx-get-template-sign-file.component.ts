import {
  CacheService,
  DialogData,
  DialogRef,
  ApiHttpService,
  NotificationsService,
  AuthStore,
} from 'codx-core';
import {
  Component,
  OnInit,
  Optional,
  ViewChild,
  TemplateRef,
  ChangeDetectorRef,
} from '@angular/core';
import { CodxShareService } from '../../../codx-share.service';

@Component({
  selector: 'codx-get-template-sign-file',
  templateUrl: './codx-get-template-sign-file.component.html',
  styleUrls: ['./codx-get-template-sign-file.component.css'],
})
export class CodxGetTemplateSignFileComponent implements OnInit {

  dialogRef: any;
  headerText='Chọn quy trình mẫu';
  sfTemplates=[];
  //fields: Object = { text: 'title', value: 'recID' };
  //crrTemplate: any;
  signFileFM: import("codx-core").FormModel;
  isAfterRender=false;
  selectedTemplate=[];
  constructor(
    private detectorRef: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private codxShareService: CodxShareService,
    // private cache: CacheService,
    // private apiHttpService: ApiHttpService,
    // private authStore: AuthStore,
    @Optional() dialogData?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialogRef=dialog;
    
    this.sfTemplates=dialogData?.data?.sfTemplates ?? [];
  }

  ngOnInit(): void {
    this.codxShareService.getFormModel('EST011').then((res) => {
      if (res) {
        this.signFileFM = res;
        this.sfTemplates.forEach(temp=>{
          temp.isSelected = true;
        })
        this.isAfterRender= true;
        this.detectorRef.detectChanges();
      }
    });
  }
  checkChange(recID:any){
    let crrTemplate = this.sfTemplates.filter(x=>x?.recID == recID);
    if(crrTemplate?.length>0){
      crrTemplate[0].isSelected = !crrTemplate[0].isSelected;
    }
  }
  onSaveForm() {
    this.selectedTemplate= this.sfTemplates.filter(x=>x.isSelected);
    if(this.selectedTemplate?.length >0)
    {
      this.dialogRef && this.dialogRef.close(this.selectedTemplate);      
    }
    else{
      this.notificationsService.notify("Quy trình mẫu ko đc bỏ trống!",'2',null);
      return;
    }
  }

  
  // valueChange(evt:any) {
  //   if (evt !=null) {
  //     let template = this.sfTemplates.filter(x=>x?.recID==evt);
  //     if(template?.length>0){
  //       this.crrTemplate=template[0];
  //     }
  //     else{
  //       this.crrTemplate=null;
  //     }
  //     this.detectorRef.detectChanges();
  //   }
  // }
  // onSaveForm1() {
  //   if(this.crrTemplate==null)
  //   {
  //     this.notificationsService.notify("Quy trình mẫu ko đc bỏ trống!",'2',null);
  //     return;
  //   }
  //   this.dialogRef && this.dialogRef.close(this.crrTemplate);
  // }
  
  
}
