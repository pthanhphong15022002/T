import { Component, Input, OnInit, Optional } from '@angular/core';
import { CodxSvService } from '../codx-sv.service';
import { DialogData, DialogRef, NotificationsService } from 'codx-core';
import { isObservable } from 'rxjs';

@Component({
  selector: 'app-sharelink',
  templateUrl: './sharelink.component.html',
  styleUrls: ['./sharelink.component.scss']
})
export class SharelinkComponent implements OnInit {
  headerText:any;
  dialog:any
  data:any;
  recID:any;
  funcID:any;
  link:any;
  post = false;
  emailTemplate:any;
  subject:any;
  messages:any;
  constructor(
    private notifySvr: NotificationsService,
    private svService : CodxSvService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  { 
    this.dialog = dialog;
    this.headerText = dt?.data?.headerText;
    this.recID = dt?.data?.recID;
    this.funcID = dt?.data?.funcID;
    this.link = dt?.data?.link;
  }
  ngOnInit(): void {
    this.getAlertRule();
  }
  
  valueChange(e:any,type:any)
  {
    if(typeof this.data != 'object') this.data = {};
    switch(type)
    {
      case 'to':
        {
          if(e?.data && e?.data.length > 0)
          {
            this.data.to = [];
            for(var i = 0 ; i < e?.data.length ; i++)
            {
              var object = 
              {
                objectID : e?.data[i]?.id,
                objectType : e?.data[i]?.objectType,
                objectName : e?.data[i]?.objectName,
                text : e?.data[i]?.text,
              };
              this.data.to.push(object);
            }
          }
          break;
        }
      case 'content':
      {
        this.data.content = e?.data;
        break;
      }
      case 'subject':
      {
        this.data.subject = e?.data;
        break;
      }
      case "post":
      {
        this.post = e?.data;
        break;
      }
    }
    
  }

  getAlertRule()
  {
    var alertRule = this.svService.loadAlertRule("SV_0001") as any;
    if(isObservable(alertRule))
    {
      alertRule.subscribe((item:any)=>{
        this.getEmailTemplate(item.emailTemplate)
      })
    }
    else this.getEmailTemplate(alertRule?.emailTemplate)
  }

  getEmailTemplate(recID:any)
  {
    var emailTemplate = this.svService.loadEmailTemplate(recID) as any;
    if(isObservable(emailTemplate))
    {
      emailTemplate.subscribe((item:any)=>{ 
        this.emailTemplate = item[0]
        this.subject = item[0]?.subject;
        this.messages = item[0]?.message;
      });
    }
    else {
      this.emailTemplate = emailTemplate[0];
      this.subject = emailTemplate[0]?.subject;
      this.messages = emailTemplate[0]?.message;
    }
  }

  save()
  {
    if(!this.checkRequired()) return
    this.data.recID = this.recID;
    this.svService.shareLink(this.data,this.post,this.funcID,this.link).subscribe(item=>{
      if(item)
      {
        this.notifySvr.notifyCode("SYS015");
        this.dialog.close();
      }
      else this.notifySvr.notifyCode("SYS016");
    });
  }

  checkRequired()
  {
    var arr = [];
    if(!this.data?.to || this.data?.to.length<=0) arr.push("đến");
    if(!this.data?.subject)  arr.push("tiêu đề");
    if(!this.data?.content)  arr.push("nội dung");
    if(arr.length>0)
    {
      var name = arr.join(" , ");
      return this.notifySvr.notifyCode('SYS009', 0, name);
    }
    return true;
  }
}
