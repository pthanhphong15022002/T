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
    this.checkActive(this.groupID);
  }
  @Input() groupID:any;

  user:any = {};
  arrMessages:any[] = [];
  message:WP_Messages = null;
  page:number = 0;
  pageIndex:number = 0;
  yValue:number = 0;
  group:any = null;
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
    this.user = this.auth.get();
    this.message = new WP_Messages();
  }
  
 

  ngOnInit(): void 
  {
    this.getGroupInfo();
    this.getMessage();
  }

  ngAfterViewInit(): void {
    // scroll up data
    if(this.chatBoxBody){
      setTimeout(() => {
        this.chatBoxBody.nativeElement.scrollTo(0,this.chatBoxBody.nativeElement.scrollHeight)
        this.yValue = this.chatBoxBody.nativeElement.scrollHeight;
      },100)
    }
    //receiver message
    this.signalR.reciverChat.subscribe((res:any) => {
      if(res.groupID === this.groupID)
      {
        let data = JSON.parse(JSON.stringify(res));
        this.arrMessages.push(data);
        this.dt.detectChanges();
      }
    });
  }
  // get group infor
  getGroupInfo(){
    this.api.execSv("WP","ERM.Business.WP","GroupBusiness","GetGroupInforAsync",[this.groupID])
    .subscribe((res:any) => {
      if(res){
        this.group = res;
        this.message.groupID = this.group.groupID;
      }
    })
  }
  // get history chat
  getMessage(){
    this.api.execSv(
      "WP",
      "ERM.Business.WP",
      "ChatBusiness",
      "GetMessageByGroupIDAsync",
      [this.groupID,this.pageIndex])
      .subscribe((res:any[]) => {
        if(res[1] > 0)
        {
          this.arrMessages = res[0];
        }
      });
  }
  // scroll up load data
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
        [this.group.groupID,this.pageIndex])
        .subscribe((res:any[]) => {
          if(res[1] > 0)
          {
            let _messgae = res[0];
            this.arrMessages = _messgae.concat(this.arrMessages);
          }
        });
    }
  }
  // close 
  closeChatBox(){
    debugger
    let elementContainer = document.querySelector(".container-chat");
    if(elementContainer){
      let element = document.getElementById(this.group.groupID);
      element.remove();
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
    let jsMessage = JSON.stringify(this.message);
    this.signalR.sendData(jsMessage,"SendMessageToGroup");
    this.message.message = "";
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
    else
    {
      this.isChatBox(element.parentElement);
    }
  }
  // check active
  checkActive(id:string){
    if(id){
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
}
