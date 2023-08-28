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

  }

  closePopup(){
    this.codxShareService.deleteByObjectWithAutoCreate(this.approveProcess?.recID, this.approveProcess?.entityName,true,'3').subscribe();   
    this.dialogRef && this.dialogRef.close();
  }
  ngAfterViewInit() {}
}
