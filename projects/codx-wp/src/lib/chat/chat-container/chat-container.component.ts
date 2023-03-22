import { ApplicationRef, ChangeDetectorRef, Component, HostBinding, Input, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { ApiHttpService } from 'codx-core';
import { SignalRService } from '../../services/signalr.service';
import { ChatBoxComponent } from '../chat-box/chat-box.component';
declare var window: any;

@Component({
  selector: 'codx-chat-container',
  templateUrl: './chat-container.component.html',
  styleUrls: ['./chat-container.component.scss'],

})
export class ChatContainerComponent implements OnInit {
  @HostBinding('style') get myStyle(): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle(`
    width: 100%;
    position: fixed;
    bottom: 0;
    right: 0;
    left: 0;
    display: flex;
    justify-content: end;`);
  }
  lstGroupActive:Array<any> = [];
  lstGroupCollapse:Array<any> = [];
  constructor
  (
    private api:ApiHttpService,
    private signalRSV:SignalRService,
    private applicationRef:ApplicationRef,
    private sanitizer: DomSanitizer,
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
        this.handleBoxChat(res);
      }
    });
    // active group
    this.signalRSV.activeGroup.subscribe((res:any) => {
      if(res)
      {
        this.handleBoxChat(res);
      }
    });
    //receiver message
    this.signalRSV.reciverChat.subscribe((res:any) => {
      if(res.groupID){
        this.handleBoxChat(res);         
      }
    });
  }
  // handle box chat
  handleBoxChat(data:any){
    let isOpen = this.lstGroupActive.some(x => x.groupID == data.groupID);
    let index = this.lstGroupCollapse.findIndex(x => x.groupID === data.groupID);
    if(isOpen) return ;
    // check collaspe
    if(index > -1)
    {
      this.lstGroupCollapse.splice(index,1);
    }
    if(this.lstGroupActive.length == 2){
      let group = this.lstGroupActive.shift();
      let ele = document.getElementById(group.groupID);
      // get current instance của element trên DOM
      debugger
      let codxBoxChat = window.ng.getComponent(ele);
      if(codxBoxChat){
        this.lstGroupCollapse.push(codxBoxChat.group);
      }
    }
    this.lstGroupActive.push(data);
    this.dt.detectChanges();
    
  }
  //close box chat
  closeBoxChat(data:any,element:ChatBoxComponent){
    let index = this.lstGroupActive.findIndex(x => x.groupID == data.groupID); 
    if(index > -1 ){
      this.lstGroupActive.splice(index, 1);
      if(this.lstGroupCollapse.length > 0){
        let group = this.lstGroupCollapse.pop();
        this.lstGroupActive.push(group);
      }
      // lấy element hiện tại của component trên DOM
      window.ng.getHostElement(element)?.remove();
      this.dt.detectChanges();
    }
  }
  // collapse box chat
  collapseBoxChat(data:any,codxBoxChat:ChatBoxComponent){
    let index = this.lstGroupActive.findIndex(x => x.groupID == data.groupID); 
    if(index > -1){
      this.lstGroupActive.splice(index, 1);
      this.lstGroupCollapse.unshift(codxBoxChat.group);
      window.ng.getHostElement(codxBoxChat)?.remove();
      this.dt.detectChanges();
    }
  }
  // expanse box chat
  expanseBoxChat(data:any){
    debugger
    // if(this.lstGroupActive.length == 2){
    //   let group = this.lstGroupActive.shift();
    //   let ele = document.getElementById(group.groupID);
    //   let codxBoxChat = window.ng.getComponent(ele);
    //   if(codxBoxChat){
    //     let item = 
    //     {
    //       id:codxBoxChat.groupID,
    //       online:data.isOnline,
    //       groupID:codxBoxChat.groupID,
    //       message:codxBoxChat.message,
    //       objectID:codxBoxChat.groupType === '1' ? codxBoxChat.group.groupID2 : codxBoxChat.group.groupID,
    //       objectName:codxBoxChat.groupType === '1' ? codxBoxChat.group.groupName2 : codxBoxChat.group.groupName,
    //       objectType:codxBoxChat.groupType === '1' ? 'AD_Users':'WP_Groups'  
    //     }
    //     this.lstGroupCollapse.push(item);
    //   }
    // }
    // this.lstGroupActive.push(data);
    // let index = this.lstGroupCollapse.findIndex(x => x.groupID == data.groupID); 
    // this.lstGroupCollapse.splice(index, 1);
    // this.dt.detectChanges();
    this.signalRSV.sendData(data,"ActiveGroupAsync");
  }

}


