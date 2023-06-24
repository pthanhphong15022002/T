import { Component, Input, OnInit, Optional } from '@angular/core';
import { CodxSvService } from '../codx-sv.service';
import { DialogData, DialogRef, NotificationsService } from 'codx-core';

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
  }
  ngOnInit(): void {
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
    }
    
  }

  save()
  {
    if(!this.checkRequired()) return
    this.data.recID = this.recID;
    this.svService.shareLink(this.data).subscribe();
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
