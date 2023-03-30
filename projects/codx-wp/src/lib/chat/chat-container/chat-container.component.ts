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
    heigth:0px;
    position: fixed;
    z-index: 99;
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
    private signalRSV:SignalRService,
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
    this.signalRSV.chat.subscribe((res:any) => {
      if(res){
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
      let codxBoxChat = window.ng.getComponent(ele);
      if(codxBoxChat){
        this.lstGroupCollapse.push(codxBoxChat.group);
      }
    }
    this.lstGroupActive.push(data);
    this.dt.detectChanges();
    
  }
  //close box chat
  closeBoxChat(group:any){
    let index = this.lstGroupActive.findIndex(x => x.groupID == group.groupID); 
    if(index > -1 ){
      this.lstGroupActive.splice(index, 1);
      if(this.lstGroupCollapse.length > 0){
        let group = this.lstGroupCollapse.pop();
        this.lstGroupActive.push(group);
      }
      // lấy element hiện tại của component trên DOM
      let ele = document.getElementById(group.groupID);
      ele?.remove();
      this.dt.detectChanges();
    }
  }
  // collapse box chat
  collapseBoxChat(group:any){
    let ele = document.getElementById(group.groupID);
    if(ele){
      let codxBoxChat =  window.ng.getComponent(ele);
      let index = this.lstGroupActive.findIndex(x => x.groupID == group.groupID); 
      if(index > -1 && codxBoxChat){
        this.lstGroupActive.splice(index, 1);
        this.lstGroupCollapse.unshift(codxBoxChat.group);
        ele.remove();
        this.dt.detectChanges();
      }
    }
  }
  // expanse box chat
  expanseBoxChat(data:any){
    this.signalRSV.sendData("ActiveGroupAsync",data);
  }

}


