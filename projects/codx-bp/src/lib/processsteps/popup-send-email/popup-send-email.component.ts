import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ApiHttpService, AuthStore, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { DispatchService } from 'projects/codx-od/src/lib/services/dispatch.service';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxBpService } from '../../codx-bp.service';

@Component({
  selector: 'lib-popup-send-email',
  templateUrl: './popup-send-email.component.html',
  styleUrls: ['./popup-send-email.component.css']
})
export class PopupSendEmailComponent implements OnInit {

  user: any;
  dialog: any;
  data: any;
  gridViewSetup: any;
  job:"";
  @ViewChild('attachment') attachment: AttachmentComponent;
  // formatBytes = formatBytes;
  sendEmailForm = new FormGroup({
    from: new FormControl(),
    to: new FormControl(),
    subject: new FormControl(),
    content: new FormControl(),
    tenant: new FormControl(),
    saveTemplate: new FormControl(),
  });
  constructor(
    private bpService : CodxBpService,
    private authStore: AuthStore,
    private notifySvr: NotificationsService,
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data;
    this.dialog = dialog;
  }
  ngOnInit(): void {
    this.user = this.authStore.get();
    this.gridViewSetup = this.data['gridViewSetup'];
    this.getDataUser();
  }
  changeValueOwner(event: any) {
    //this.dispatch.owner = event.data?.value[0];
    this.sendEmailForm.controls['to'].setValue([event.data?.value[0]]);
  }
  onSave() {
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
    this.bpService
      .sendMail(
        this.dialog.dataService.dataSelected.recID,
        this.sendEmailForm.value
      )
      .subscribe((item) => {
        if (item.status == 0) this.dialog.close();
        this.notifySvr.notify(item.message);
      });
  }
  getDataUser()
  {
    this.api.execSv("HR", 'ERM.Business.HR', "HRBusiness" , "GetDataJoinUserAsync" ,this.user?.userID).subscribe((item:any)=>{
      if(item)
      {
        this.job = item?.jobName
      }
    })
  }
}
