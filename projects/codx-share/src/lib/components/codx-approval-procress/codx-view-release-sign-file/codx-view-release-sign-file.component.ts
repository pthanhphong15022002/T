import { extend } from '@syncfusion/ej2-base';
import { HttpClient } from '@angular/common/http';
import {
  Component,
  Injector,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  UIComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  AuthStore,
} from 'codx-core';
import { CodxEsService } from 'projects/codx-es/src/lib/codx-es.service';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';
import { PdfComponent } from 'projects/codx-share/src/lib/components/pdf/pdf.component';
import { ResponseModel } from 'projects/codx-share/src/lib/models/ApproveProcess.model';

@Component({
  selector: 'codx-view-release-sign-file',
  templateUrl: './codx-view-release-sign-file.component.html',
  styleUrls: ['./codx-view-release-sign-file.component.scss'],
})
export class CodxViewReleaseSignFileComponent extends UIComponent {
  @ViewChild('pdfView') pdfView: PdfComponent;
  @ViewChild('popupOTPPin', { static: false }) popupOTPPin: TemplateRef<any>;
  dialogRef: DialogRef;
  signFile: any;
  user: import("codx-core").UserModel;
  approveProcess: any;
  files: any;
  isAfterRender=false;
  constructor(
    private inject: Injector,
    private notify: NotificationsService,
    private authStore: AuthStore,
    private codxShareService: CodxShareService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef,
  ) {
    super(inject);
    this.dialogRef = dialog;
    this.signFile = dt?.data.signFile;
    this.approveProcess = dt?.data?.approveProcess;
    this.files = dt?.data?.files;
    this.user = this.authStore.get();
  }

  onInit(): void {
    if(this.files?.length>0){
      let sfFiles= this.files?.filter(x=>x.autoCreate=='3');//Chỉ lấy file export tự động(autoCreate=='3') để ký số
      if(sfFiles?.length>0 && this.signFile?.files?.length>0){
        for(let i = 0; i < this.signFile?.files.length; i++){
          if(i<sfFiles?.length){
            this.signFile.files[i].comment = sfFiles[i]?.extension;
            this.signFile.files[i].fileID = sfFiles[i]?.recID;
            this.signFile.files[i].fileName = sfFiles[i]?.fileName;
            this.signFile.files[i].comment = sfFiles[i]?.extension;
          }
        }
        this.isAfterRender=true;
        this.detectorRef.detectChanges();
      }
    }
    
  }

  closePopup(){
    this.codxShareService.deleteByObjectWithAutoCreate(this.approveProcess?.recID, this.approveProcess?.entityName,true,'3').subscribe();   
    this.dialogRef && this.dialogRef.close();
  }
  ngAfterViewInit() {}
}
