import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  Optional,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  permissionDis,
  updateDis,
  dispatch,
  inforSentEMail,
  extendDeadline,
  assignTask,
} from '../../models/dispatch.model';
import { AgencyService } from '../../services/agency.service';
import { DispatchService } from '../../services/dispatch.service';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import {
  AuthStore,
  CacheService,
  DataRequest,
  DialogData,
  DialogRef,
  NotificationsService,
  ViewsComponent,
} from 'codx-core';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { extractContent, formatBytes } from '../../function/default.function';
import { DateTime } from '@syncfusion/ej2-angular-charts';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
@Component({
  selector: 'app-od-sendemail',
  templateUrl: './sendemail.component.html',
  styleUrls: ['./sendemail.component.scss'],
})
export class SendEmailComponent implements OnInit {
  user: any;
  dialog: any;
  data: any;
  gridViewSetup: any;
  @ViewChild('attachment') attachment: AttachmentComponent;
  formatBytes = formatBytes;
  sendEmailForm = new FormGroup({
    from: new FormControl(),
    to: new FormControl(),
    subject: new FormControl(),
    content: new FormControl(),
    tenant: new FormControl(),
    saveTemplate: new FormControl(),
  });
  constructor(
    private odService: DispatchService,
    private authStore: AuthStore,
    private notifySvr: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data;
    this.dialog = dialog;
  }
  ngOnInit(): void {
    this.user = this.authStore.get();
    this.gridViewSetup = this.data['gridViewSetup'];
  }

  onSave(e: any) {
    console.log(e);
    /*  
   this.dataAssign.recID = this.data.recID;
    this.inforEmail.from = this.user?.userID;
    if(this.inforEmail.to.length>0) this.inforEmail.to = this.inforEmail.to.toString().replace(",",";");
    this.odService.sendMail(this.data.recID, this.inforEmail).subscribe((item)=>
    {
      if(item.status == 0) 
      {
        this.close();
      }
      this.notifySvr.notify(item.message);
    }) */
    this.sendEmailForm.value.from = this.user?.userID;
    this.sendEmailForm.value.to = this.sendEmailForm.value.to.join(';');
    this.sendEmailForm.value.saveTemplate =
      this.sendEmailForm.value.saveTemplate == null
        ? false
        : this.sendEmailForm.value.saveTemplate;
    this.odService
      .sendMail(
        this.dialog.dataService.dataSelected.recID,
        this.sendEmailForm.value
      )
      .subscribe((item) => {
        if (item.status == 0 && e.submitter.name != 'next') this.dialog.close();
        this.notifySvr.notify(item.message);
      });
  }
}
