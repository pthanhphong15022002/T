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

@Component({
  selector: 'codx-get-template-sign-file',
  templateUrl: './codx-get-template-sign-file.component.html',
  styleUrls: ['./codx-get-template-sign-file.component.css'],
})
export class CodxGetTemplateSignFileComponent implements OnInit {

  dialogRef: any;
  headerText='Chọn quy trình mẫu';
  sfTemplates=[];
  fields: Object = { text: 'title', value: 'recID' };
  crrTemplate: any;
  constructor(
    private detectorRef: ChangeDetectorRef,
    private notificationsService: NotificationsService,
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
    
  }

  onSaveForm() {
    if(this.crrTemplate==null)
    {
      this.notificationsService.notify("Quy trình mẫu ko đc bỏ trống!",'2',null);
      return;
    }
    this.dialogRef && this.dialogRef.close(this.crrTemplate);
  }

  
  valueChange(evt:any) {
    if (evt !=null) {
      let template = this.sfTemplates.filter(x=>x?.recID==evt);
      if(template?.length>0){
        this.crrTemplate=template[0];
      }
      else{
        this.crrTemplate=null;
      }
      this.detectorRef.detectChanges();
    }
  }

  
}
