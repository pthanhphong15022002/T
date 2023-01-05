import { ChangeDetectorRef, Component, HostBinding, Input, OnInit, AfterViewInit } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { ApiHttpService, AuthStore, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { WP_Messages } from '../../models/WP_Messages.model';
import { SignalRService } from '../../services/signalr.service';

@Component({
  selector: 'codx-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css']
})
export class ChatBoxComponent implements OnInit, AfterViewInit{
  @Input() groupID:string ;

  group:any = {};
  user:any = {};
  arrMessages:any[] = [];
  message:WP_Messages = new WP_Messages();
  constructor
  (
    private api:ApiHttpService,
    private auth:AuthStore,
    private signalR: SignalRService,
    private sanitizer: DomSanitizer,
    private notifiSV:NotificationsService,
    private dt:ChangeDetectorRef,
  ) 
  {
    this.user = this.auth.get()
  }
 

  ngOnInit(): void 
  {
    if(this.groupID)
    {
      this.message.userID = this.user.userID;
      this.message.groupID = this.groupID;
      this.getGroupInfo(this.groupID);
    }
  }

  ngAfterViewInit(): void {
    this.signalR.signalChat.subscribe((res:any) => {
      if(res)
      {
        debugger
        let data = JSON.parse(JSON.stringify(res));
        this.arrMessages.push(data);
        this.dt.detectChanges();
      }
    })
  }
  // get group info
  getGroupInfo(groupID:string){
    if(groupID){
      this.api.execSv(
        "WP",
        "ERM.Business.WP",
        "GroupBusiness",
        "GetGoupChatByIDAsync",
        [groupID])
        .subscribe((res:any[]) =>{
        if(res)
        {
          let dataGroup = res[0];
          let dataMessages = res[1];
          this.group = JSON.parse(JSON.stringify(dataGroup));
          if(dataMessages)
          {
            this.arrMessages = JSON.parse(JSON.stringify(dataMessages[0]));
          }
        }
      });
    }
  }
  // close 
  closeChatBox(groupID:string){
    if(groupID)
    {
      let element = document.getElementById(groupID);
      element.remove();
      if(element){
        element.remove();
        let elementContainer = document.querySelector(".container-chat");
        if(elementContainer){
          elementContainer.childNodes.forEach((e:any) => {
            e.setAttribute('style',`
            position: fixed!important;
            bottom: 0px;
            right: 100px;
            margin-top: -500px;
            background-color: white;`)
          })
        }
      } 
    }
  }
  // value Change
  valueChange(event:any){
    if(event?.data){
      this.message.messageType = "1";
      this.message.message = event.data;
    }
  }
  // send message
  sendMessage(){
    if(this.message.message)
    {
      this.api.execSv(
      "WP",
      "ERM.Business.WP",
      "ChatBusiness",
      "SendMessageAsync",
      [this.message])
      .subscribe((res:any) => {
        if(res)
        {
          this.message.message = "";
          this.signalR.sendData(res,"SendMessageToGroup");
        }
      })
    }
  }
  // get list chat
  getDataChat(groupID:string){
    if(groupID){
      this.api.execSv(
        "WP",
        "ERM.Business.WP",
        "ChatBusiness",
        "GetMessageByGroupIDAsync",
        [this.groupID,0])
        .subscribe((res:any[]) => {
          if(res[1] > 0)
          {
            this.arrMessages = JSON.parse(JSON.stringify(res[0]));
          }
        });
    }
    else
    {
      this.notifiSV.notifyCode("SYS001");
    }
  }
}
