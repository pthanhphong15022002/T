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
        this.handleBoxChat(res.groupID);
      }
    });
    // active group
    this.signalRSV.activeGroup.subscribe((res:any) => {
      if(res)
      {
        this.handleBoxChat(res.groupID);
      }
    });
    //receiver message
    this.signalRSV.reciverChat.subscribe((res:any) => {
      if(res.groupID){
        this.handleBoxChat(res.groupID);         
      }
    });
  }
  // handle box chat
  handleBoxChat(groupID:any){
    let isOpen = this.lstGroupActive.some(x=>x == groupID);
    let index = this.lstGroupCollapse.findIndex(x => x.id === groupID);
    if(!isOpen){
      // check collaspe
      if(index > -1){
        this.lstGroupCollapse.splice(index,1);
      }
      if(this.lstGroupActive.length == 2){
        
        let id = this.lstGroupActive.shift();
        let ele = document.getElementById(id);
        // get current instance của element trên DOM
        let codxBoxChat = window.ng.getComponent(ele);
        let item = 
        {
          id:codxBoxChat.group.groupID,
          message:codxBoxChat.group.message,
          objectID:codxBoxChat.group.groupType === '1' ? codxBoxChat.group.groupID2 : codxBoxChat.group.groupID,
          objectName:codxBoxChat.group.groupType === '1' ? codxBoxChat.group.groupName2 : codxBoxChat.group.groupName,
          objectType:codxBoxChat.group.groupType === '1' ? 'AD_Users':'WP_Groups'  
        }
        this.lstGroupCollapse.push(item);
      }
      this.lstGroupActive.push(groupID);
    }
    this.dt.detectChanges();
    
  }
  //close box chat
  closeBoxChat(id:string,codxBoxChat:ChatBoxComponent){
    let index = this.lstGroupActive.findIndex(x => x == id); 
    if(index > -1 ){
      this.lstGroupActive.splice(index, 1);
      if(this.lstGroupCollapse.length > 0){
        let group = this.lstGroupCollapse.pop();
        if(group?.id){
          this.lstGroupActive.push(group.id);
        }
      }
      // lấy element hiện tại của component trên DOM
      window.ng.getHostElement(codxBoxChat)?.remove();
      this.dt.detectChanges();
    }
  }
  // collapse box chat
  collapseBoxChat(id:string,codxBoxChat:ChatBoxComponent){
    let index = this.lstGroupActive.findIndex(x => x == id); 
    if(index > -1){
      this.lstGroupActive.splice(index, 1);
      let item = 
      {
        id:codxBoxChat.groupID,
        message:codxBoxChat.group.message,
        objectID:codxBoxChat.group.groupType === '1' ? codxBoxChat.group.groupID2 : codxBoxChat.group.groupID,
        objectName:codxBoxChat.group.groupType === '1' ? codxBoxChat.group.groupName2 : codxBoxChat.group.groupName,
        objectType:codxBoxChat.group.groupType === '1' ? 'AD_Users':'WP_Groups'  
      }
      this.lstGroupCollapse.unshift(item);
      window.ng.getHostElement(codxBoxChat)?.remove();
      this.dt.detectChanges();
    }
  }
  // expanse box chat
  expanseBoxChat(group:any){
    if(this.lstGroupActive.length == 2){
      let id = this.lstGroupActive.shift();
      let ele = document.getElementById(id);
      let codxBoxChat = window.ng.getComponent(ele);
      let item = 
      {
        id:codxBoxChat.groupID,
        message:codxBoxChat.group.message,
        objectID:codxBoxChat.group.groupType === '1' ? codxBoxChat.group.groupID2 : codxBoxChat.group.groupID,
        objectName:codxBoxChat.group.groupType === '1' ? codxBoxChat.group.groupName2 : codxBoxChat.group.groupName,
        objectType:codxBoxChat.group.groupType === '1' ? 'AD_Users':'WP_Groups'  
      }
      this.lstGroupCollapse.push(item);
    }
    this.lstGroupActive.push(group.id);
    let index = this.lstGroupCollapse.findIndex(x => x.id == group.id); 
    this.lstGroupCollapse.splice(index, 1);
    this.dt.detectChanges();
  }

}


