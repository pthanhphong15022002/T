import { Component, OnInit, Input, Output, EventEmitter, Optional } from '@angular/core';
import { DispatchService } from '../../services/dispatch.service';
import { FormGroup, FormControl } from '@angular/forms';
import { ApiHttpService, AuthStore, DialogData, DialogRef, NotificationsService, ViewsComponent } from 'codx-core';
import { formatBytes, getJSONString } from '../../function/default.function';
import { forwarDis } from '../../models/dispatch.model';
import { isObservable } from 'rxjs';
import { CodxOdService } from '../../codx-od.service';
@Component({
  selector: 'app-od-forward',
  templateUrl: './forward.component.html',
  styleUrls: ['./forward.component.scss']
})
export class ForwardComponent implements OnInit {
  data : any;
  files: any;
  title: any = "Chuyển tiếp";
  user: any;
  dialog: any;
  gridViewSetup : any;
  forward = new forwarDis();
  formModel:any;
  formatBytes = formatBytes;
  getJSONString = getJSONString;
  @Input() viewbase: ViewsComponent;
  @Output() save : EventEmitter<any> = new EventEmitter();
  forwardForm = new FormGroup({
    userID: new FormControl(),
    comment : new FormControl(),
    sendMail: new FormControl(true),
    emailTemplates: new FormControl()
  });
  constructor(
    private api: ApiHttpService,
    private dispatchService: DispatchService,
    private codxODService: CodxOdService,
    private notifySvr: NotificationsService,
    private authStore: AuthStore,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data;
    this.dialog = dialog;
    this.formModel = dt?.data?.formModel
  }
    
  ngOnInit(): void {
    //this.formdata = new FormGroup({});
    this.user = this.authStore.get();
    this.gridViewSetup = this.data["gridViewSetup"];
    this.getAlert();
    this.files = this.data?.files;
  }


  getAlert()
  {
    var alertRule = this.codxODService.loadAlert("OD_0005") as any;

    if(isObservable(alertRule))
    {
      alertRule.subscribe((item:any)=>{
        if(item) this.forwardForm.controls['sendMail'].setValue(item?.isMail);
        if(item?.emailTemplate) this.getEmailTmp(item.emailTemplate);
      })
    }
    else {
      if(alertRule) this.forwardForm.controls['sendMail'].setValue(alertRule?.isMail);
      if(alertRule?.emailTemplate) this.getEmailTmp(alertRule.emailTemplate);
    }
  }

  getEmailTmp(emailTmpID:any)
  {

    var emailTmp = this.codxODService.loadEmailTemp(emailTmpID) as any;

    if(isObservable(emailTmp))
    {
      emailTmp.subscribe((item:any)=>{
        this.forwardForm.controls['comment'].setValue(item?.message);
        this.forwardForm.controls['emailTemplates'].setValue(item);
      })
    }
    else {
      this.forwardForm.controls['comment'].setValue(emailTmp?.message);
      this.forwardForm.controls['emailTemplates'].setValue(emailTmp);
    }
  }
  
  changeValueUserID(event: any)
  {
    this.forwardForm.controls['userID'].setValue(event.data?.value);
  }
  onSave()
  {
    if(this.checkRequired()) return null;
    let forwardForm: any = this.forwardForm.value;
    forwardForm.userID = forwardForm.userID.join(";");
    forwardForm.funcID = this.formModel?.funcID;
    forwardForm.referType = "source";
    forwardForm.entityName = this.formModel?.entityName;
    this.dispatchService.forwardDispatch(this.dialog.dataService.dataSelected.recID , forwardForm).subscribe((item)=>{
      if(item.status==0) this.dialog.close(item.data);
      this.notifySvr.notify(item.message);
    })
  }

  checkRequired()
  {
    var arr = [];    
    let forwardForm: any = this.forwardForm.value;
    if(!forwardForm.userID || forwardForm.userID.length == 0) arr.push('Người chuyển');
    if(!forwardForm.comment) arr.push('Mô tả chi tiết');
    if (arr.length > 0) {
      var name = arr.join(' , ');
      this.notifySvr.notifyCode('SYS009', 0, name);
      return true;
    }
    return false;
  }
}
