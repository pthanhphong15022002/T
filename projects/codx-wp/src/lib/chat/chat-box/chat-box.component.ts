import { ChangeDetectorRef, Component, HostBinding, Input, OnInit, AfterViewInit, HostListener, ViewChild, ElementRef, AfterContentInit } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { ApiHttpService, AuthStore, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { WP_Messages } from '../../models/WP_Messages.model';
import { SignalRService } from '../../services/signalr.service';

@Component({
  selector: 'codx-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss']
})
export class ChatBoxComponent implements OnInit, AfterViewInit{

  @HostListener('click', ['$event'])
  onClick(event:any) {
    this.isChatBox(event.target);
    this.checkActive(this.group.groupID);
  }
  @Input() groupID:string ;

  group:any = {};
  user:any = {};
  arrMessages:any[] = [];
  message:WP_Messages = new WP_Messages();
  page:number = 0;
  pageIndex:number = 0;
  @ViewChild("chatBoxBody") chatBoxBody:ElementRef<HTMLDivElement>;
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
    if(this.groupID){
      this.message.userID = this.user.userID;
      this.message.groupID = this.groupID;
      this.getGroupInfo(this.groupID);
    }
  }

  ngAfterViewInit(): void {
    
    if(this.chatBoxBody){
      setTimeout(() => {
        this.chatBoxBody.nativeElement.scrollTo(0,this.chatBoxBody.nativeElement.scrollHeight)
        this.yValue = this.chatBoxBody.nativeElement.scrollHeight;
      },100)
    }
    //receiver message
    this.signalR.signalChat.subscribe((res:any) => {
      if(res)
      {
        let data = JSON.parse(JSON.stringify(res));
        this.arrMessages.push(data);
        this.dt.detectChanges();
      }
    });
  }

  // get group info
  getGroupInfo(groupID:string){
    if(groupID){
      this.api.execSv(
        "WP",
        "ERM.Business.WP",
        "GroupBusiness",
        "GetGroupByIDAsync",
        [groupID])
        .subscribe((res:any[]) =>{
        if(res){
          let _group = res[0];
          let _messages = res[1];
          this.group = JSON.parse(JSON.stringify(_group));
          if(_messages.length > 0)
          {
            this.arrMessages = JSON.parse(JSON.stringify(_messages[0]));
            this.page = _messages[1] / 20;
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
    this.signalR.sendData(this.message,"SendMessageToGroup");
    this.message.message = "";
  }
  // scroll up load data
  yValue:number = 0;
  scroll(){
    let _y = this.chatBoxBody.nativeElement.scrollTop;
    if(_y < this.yValue && _y <= 50){
      this.getDataChat();
    }
    this.yValue = _y;
  }
  // get list chat
  getDataChat(){
    if(this.pageIndex < this.page){
      this.pageIndex = this.pageIndex + 1;
      this.api.execSv(
        "WP",
        "ERM.Business.WP",
        "ChatBusiness",
        "GetMessageByGroupIDAsync",
        [this.groupID,this.pageIndex])
        .subscribe((res:any[]) => {
          if(res[1] > 0)
          {
            let _messgae = res[0];
            this.arrMessages = _messgae.concat(this.arrMessages);
          }
        });
    }
  }
  // check tag name 
  isChatBox(element:HTMLElement){
    if(element.tagName == "CODX-CHAT-BOX"){
      if(!element.classList.contains("active"))
      {
        element.classList.add("active");
      }
      return;
    }
    else{
      this.isChatBox(element.parentElement);
    }
  }
  // check active
  checkActive(id:string){
    let _boxChats = document.getElementsByTagName("codx-chat-box");
    if(_boxChats.length > 0){
      Array.from(_boxChats).forEach(e => {
        if(e.id != id && e.classList.contains("active")){
          e.classList.remove("active");
        }
      });
      
    }
  }
}
