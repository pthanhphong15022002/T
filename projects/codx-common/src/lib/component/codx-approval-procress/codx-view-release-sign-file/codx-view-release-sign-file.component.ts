import {
  Component,
  Injector,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  UIComponent,
  DialogData,
  DialogRef,
  NotificationsService,
  AuthStore,
} from 'codx-core';
import { PdfComponent } from 'projects/codx-common/src/lib/component/pdf/pdf.component';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';
import { ApproveProcess } from 'projects/codx-share/src/lib/models/ApproveProcess.model';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';

@Component({
  selector: 'codx-view-release-sign-file',
  templateUrl: './codx-view-release-sign-file.component.html',
  styleUrls: ['./codx-view-release-sign-file.component.scss'],
})
export class CoDxViewReleaseSignFileComponent extends UIComponent {
  @ViewChild('pdfView') pdfView: PdfComponent;
  @ViewChild('popupOTPPin', { static: false }) popupOTPPin: TemplateRef<any>;
  dialogRef: DialogRef;
  signFile: any;
  user: import('codx-core').UserModel;
  approveProcess: ApproveProcess;
  files: any;
  isAfterRender = true;
  listURL = [];
  constructor(
    private inject: Injector,
    private notify: NotificationsService,
    private authStore: AuthStore,
    private codxCommonService: CodxCommonService,
    private codxShareService: CodxShareService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialogRef = dialog;
    this.signFile = dt?.data.signFile;
    this.approveProcess = dt?.data?.approveProcess;
    this.files = dt?.data?.files;
    this.user = this.authStore.get();
  }

  onInit(): void {
    // if(this.files?.length>0){
    //   let sfFiles= this.files?.filter(x=>x.autoCreate=='3');//Chỉ lấy file export tự động(autoCreate=='3') để ký số
    //   if(sfFiles?.length>0 && this.signFile?.files?.length>0){  
    //     let nFiles = [];      
    //     for(let i = 0; i < sfFiles?.length; i++){
    //       let nFile = {...this.signFile.files[0]};            
    //       nFile.fileID = sfFiles[i]?.recID;
    //       nFile.fileName = sfFiles[i]?.fileName;
    //       nFile.comment = sfFiles[i]?.extension;
    //       nFiles.push(nFile);
    //       this.listURL.push(sfFiles[i]?.url); 
    //     }
    //     this.signFile.files=nFiles;        
    //     this.isAfterRender=true;
    //     this.detectorRef.detectChanges();
    //   }
    // }    
  }

  closePopup(){  
    this.dialogRef && this.dialogRef.close();
  }
  ngAfterViewInit() {}
  release() {
    this.codxCommonService
      .codxRelease(
        this.approveProcess?.module,
        this.approveProcess?.recID,
        this.approveProcess?.category?.recID,
        this.approveProcess?.entityName,
        this.approveProcess?.funcID,
        null,
        this.approveProcess?.htmlView,
        null,        
        this.approveProcess?.approvers,
      )
      .subscribe((res) => {
        if (res?.msgCodeError == null && res?.rowCount > 0) {
          this.dialogRef && this.dialogRef.close(res);
        } else {
          this.notify.notifyCode(res?.msgCodeError);
          return;
        }
      });
  }
}
