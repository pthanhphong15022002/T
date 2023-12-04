import { Component, OnInit, ChangeDetectorRef, Optional } from '@angular/core';
import { permissionDis } from '../../models/dispatch.model';
import { DispatchService } from '../../services/dispatch.service';
import { formatBytes } from '../../function/default.function';
import { FormControl, FormGroup } from '@angular/forms';
import { DialogData, DialogRef, NotificationsService } from 'codx-core';
import { CodxOdService } from '../../codx-od.service';
import { isObservable } from 'rxjs';
@Component({
  selector: 'app-od-sharing',
  templateUrl: './sharing.component.html',
  styleUrls: ['./sharing.component.scss']
})
export class SharingComponent implements OnInit {
  dialog      : any;
  data:any;
  files: any;
  formModel : any;
  dataDis = new permissionDis();
  percentage100 = false;
  userTo      : any;
  userCC      : any;
  gridViewSetup     : any;
  referType = 'source';
  formatBytes = formatBytes
  shareForm = new FormGroup({
    to: new FormControl(),
    cc : new FormControl(),
    desc : new FormControl(),
    edit : new FormControl(),
    share: new FormControl(),
    download : new FormControl(),
    formDate: new FormControl(),
    toDate : new FormControl(),
    sendMail: new FormControl(true),
    emailTemplates: new FormControl()
  });
  constructor(
    private dispatchService: DispatchService, 
    private odService: CodxOdService, 
    private cr: ChangeDetectorRef , 
    private notifySvr: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  { 
    this.data = dt?.data
    this.dialog = dialog;
  }
  ngOnInit(): void {
    //this.formdata = new FormGroup({});
    //alert(this.recID);
    this.gridViewSetup = this.data["gridViewSetup"];
    this.formModel = this.data?.option?.FormModel;
    this.files = this.data?.files;
    this.getAlert();
  }

  getAlert()
  {
    var alertRule = this.odService.loadAlert("OD_0004") as any;

    if(isObservable(alertRule))
    {
      alertRule.subscribe((item:any)=>{
        if(item) this.shareForm.controls['sendMail'].setValue(item?.isMail);
        if(item?.emailTemplate) this.getEmailTmp(item.emailTemplate);
      })
    }
    else {
      if(alertRule) this.shareForm.controls['sendMail'].setValue(alertRule?.isMail);
      if(alertRule?.emailTemplate) this.getEmailTmp(alertRule.emailTemplate);
    }
  }

  getEmailTmp(emailTmpID:any)
  {

    var emailTmp = this.odService.loadEmailTemp(emailTmpID) as any;

    if(isObservable(emailTmp))
    {
      emailTmp.subscribe((item:any)=>{
        this.shareForm.controls['desc'].setValue(item?.message);
        this.shareForm.controls['emailTemplates'].setValue(item);
      })
    }
    else {
      this.shareForm.controls['desc'].setValue(emailTmp?.message);
      this.shareForm.controls['emailTemplates'].setValue(emailTmp);
    }
  }
  changeValueTo(e:any)
  {
    this.shareForm.controls['to'].setValue(e.data.value);
  }
  changeValueCC(e:any)
  {
    this.shareForm.controls['cc'].setValue(e.data.value);
  }
  getJSONString(data) {
    return JSON.stringify(data);    
  }
  onSave()
  {
    if(!this.checkRequired()) return;
   /*  var objID = (this.shareForm.get('form').value).concat(this.shareForm.get('to').value);
    this.dataDis.objID       = objID.join(";");
    this.dataDis.description = this.shareForm.get('desc').value;
    this.dataDis.download = this.shareForm.get('download').value == null ? false :this.shareForm.get('download').value;
    this.dataDis.edit = this.shareForm.get('edit').value == null ? false :this.shareForm.get('edit').value;
    this.dataDis.share = this.shareForm.get('share').value == null ? false :this.shareForm.get('share').value;
    this.dataDis.formDate = this.shareForm.get('formDate').value == null ? new Date : this.shareForm.get('formDate').value;
    this.dataDis.toDate = this.shareForm.get('toDate').value == null ? new Date : this.shareForm.get('formDate').value; */
    let shareForm: any =this.shareForm.value;
    shareForm.recID = this.dialog.dataService.dataSelected.recID;
    shareForm.funcID = this.formModel.funcID;
    this.dispatchService.shareDispatch(shareForm,this.referType,this.formModel.entityName).subscribe((item)=>{
      if(item.status==0) this.dialog.close(item.data);
      this.notifySvr.notify(item.message);
    })
  }

  checkRequired()
  {
    var name = [];
    if(!this.shareForm.value.to || this.shareForm.value.to.length==0) name.push("Đến") ;
    if(!this.shareForm.value.desc) name.push("Nội dung chia sẻ");
    if(name.length>0)
    {
      this.notifySvr.notifyCode("SYS009",0,name.join(' , '));
      return false;
    }
    return true
  }

}
