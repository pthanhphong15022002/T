import { ApplicationRef, ChangeDetectorRef, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ApiHttpService } from 'codx-core';
import { SignalRService } from '../../services/signalr.service';
import { ChatBoxComponent } from '../chat-box/chat-box.component';
declare var window: any;

@Component({
  selector: 'codx-chat-container',
  templateUrl: './chat-container.component.html',
  styleUrls: ['./chat-container.component.scss']
})
export class ChatContainerComponent implements OnInit {

  groups:any[] = [];
  lstGroupID:Array<string> = [];
  constructor
  (
    private api:ApiHttpService,
    private signalRSV:SignalRService,
    private applicationRef:ApplicationRef,
    private dt:ChangeDetectorRef
  ) 
  {
  }
  @ViewChild("boxChats",{static:true}) boxChats:TemplateRef<any>;
  @ViewChild("boxChatItem",{static:true}) boxChatItem:TemplateRef<any>;

  ngOnInit(): void {
  }


  ngAfterViewInit(){
    // active new group
    this.signalRSV.activeNewGroup.subscribe((res:any) => {
      if(res){
        this.addBoxChat(res.groupID);
      }
    });
    // active group
    this.signalRSV.activeGroup.subscribe((res:any) => {
      if(res)
      {
        let isOpenBoxChat = this.checkBoxChat(res.groupID);
        if(!isOpenBoxChat){
          this.addBoxChat(res.groupID);
        }
      }
    });
    //receiver message
    this.signalRSV.reciverChat.subscribe((res:any) => {
      if(res.groupID){
        let isOpenBoxChat = this.checkBoxChat(res.groupID);
        if(!isOpenBoxChat){
          this.addBoxChat(res.groupID);
        }
      }
    });
  }

  // add box chat
  addBoxChat(groupID:any){


    let viewRef = this.boxChatItem?.createEmbeddedView({ $implicit: groupID });
    this.applicationRef.attachView(viewRef);
    viewRef?.detectChanges();
    let boxChat = viewRef?.rootNodes[0];
    boxChat?.setAttribute('id',groupID);
    document.querySelector('#boxChats')?.appendChild(boxChat);
    this.dt.detectChanges();
  }

  // check box chat
  checkBoxChat(groupID:string):boolean {
    debugger
    let boxChats = document.getElementsByTagName("codx-chat-box");
    if(Array.isArray(boxChats)){
      return boxChats.some(x => x.id === groupID);
    }
    return false;
  }
}


