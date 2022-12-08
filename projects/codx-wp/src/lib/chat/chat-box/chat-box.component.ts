import { ChangeDetectorRef, Component, Input, OnInit, Optional } from '@angular/core';
import { ApiHttpService, AuthStore, DialogData, DialogRef } from 'codx-core';
import { SignalRService } from '../../services/signalr.service';

@Component({
  selector: 'codx-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css']
})
export class ChatBoxComponent implements OnInit {

  @Input() groupID:string ;

  group:any = {};
  user:any = {};
  dialogData:any = {};
  dialogRef:DialogRef = null;
  message:string = "";
  constructor
  (
    private api:ApiHttpService,
    private auth:AuthStore,
    private signalR: SignalRService,
    private dt:ChangeDetectorRef,
    @Optional() dialogData?:DialogData,
    @Optional() dialogRef?:DialogRef,
  ) 
  {
    this.dialogData = dialogData;
    this.dialogRef = dialogRef;
    this.user = this.auth.get()
  }

  ngOnInit(): void 
  {
    if(this.dialogData){
      this.groupID = this.dialogData.data;
      this.getGroupInfo(this.groupID);

    }
  }

  // get group info
  getGroupInfo(groupID:string){
    if(groupID){
      this.api.execSv(
        "WP",
        "ERM.Business.WP",
        "GroupBusiness",
        "GetGoupChatBydIDAsync",
        [groupID])
      .subscribe((res:any) =>{
        if(res){
          this.group = JSON.parse(JSON.stringify(res));
        }
      });
    }
  }
  // close 
  closeChatBox(){
    if(this.dialogRef)
    {
      this.dialogRef.close()
    }
  }


  // value Change
  valueChange(event:any){

  }
}
