import { AfterViewInit, ApplicationRef, ChangeDetectorRef, Component, HostBinding, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { SignalRService } from 'projects/codx-wp/src/lib/services/signalr.service';
import { CodxService, CallFuncService, ApiHttpService } from 'codx-core';
import { group } from '@angular/animations';

@Component({
  selector: 'codx-chat',
  templateUrl: './codx-chat.component.html',
  styleUrls: ['./codx-chat.component.css']
})
export class CodxChatComponent implements OnInit,AfterViewInit {
  @HostBinding('class') get class() {
    return "d-flex align-items-center " + this.codxService.toolbarButtonMarginClass; 
  }
  loaded = false;
  autoClose:boolean = true;
  totalMessage:number = 0;

  constructor(
    public codxService:CodxService,
    private api:ApiHttpService,
    private signalRSV:SignalRService,
    private applicationRef:ApplicationRef
  ) 
  { }
  

  
  ngOnInit(): void {
    this.getTotalMessage();
  }

  ngAfterViewInit(): void {
    this.signalRSV.activeGroup.subscribe((res:any) => {
      debugger
      if(res){
        this.addBoxChat(res);
      }
    })
  }
  // get total message
  getTotalMessage(){
    this.api.execSv(
      "WP",
      "ERM.Business.WP",
      "ChatBusiness",
      "GetTotalMessageAsync")
      .subscribe((res:any) => {
        this.totalMessage = res;
      });
  }
  // open chat box
  openChatList(){
    this.loaded = true;
  }
  // seen all message
  seenAllMessage(){
    this.totalMessage = 0;
  }




  @ViewChild("chatBox") chatBox:TemplateRef<any>;

  // add box chat
  addBoxChat(groupID:any){
    let _eleChatBoxs = document.getElementsByTagName("codx-chat-box");
    let _arrBoxChat = Array.from(_eleChatBoxs);
    let _boxChat = _arrBoxChat.find(e => e.id === groupID);
    if(!_boxChat){
      let viewRef = this.chatBox.createEmbeddedView({ $implicit: groupID });
      this.applicationRef.attachView(viewRef);
      viewRef.detectChanges();
      let html = viewRef.rootNodes[0];
      let elementContainer = document.querySelector(".container-chat");
      if(elementContainer){
        let length = elementContainer.children.length;
        // add box chat
        if(length < 3){ 
          html.setAttribute('style',`
          position: fixed!important;
          bottom: 0px;
          right: ${(length*320 + 100)}px;
          margin-top: -500px;
          background-color: white;`);
          html.setAttribute('id',groupID);
          elementContainer.append(html);
        }
        else{
          
        }
      }
    }
  }
  
}
