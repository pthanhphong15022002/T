import {
  ChangeDetectorRef,
  Component,
  HostBinding,
  OnDestroy,
  OnInit,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { AuthService } from 'codx-core';
import { ɵglobal as global } from '@angular/core';
import { CodxChatBoxComponent } from '../chat-box/chat-box.component';
import { SignalRService } from '../services/signalr.service';
import { CHAT } from '../models/chat-const.model';
declare var window: any;

@Component({
  selector: 'codx-chat-container',
  templateUrl: './chat-container.component.html',
  styleUrls: ['./chat-container.component.scss'],
})
export class CodxChatContainerComponent implements OnInit, OnDestroy {
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
  lstGroupActive: Array<any> = [];
  lstGroupCollapse: Array<any> = [];
  constructor(
    private signalRSV: SignalRService,
    private sanitizer: DomSanitizer,
    private authSV: AuthService,
    private dt: ChangeDetectorRef
  ) {}

  @ViewChild('boxChats', { static: true }) boxChats: TemplateRef<any>;
  @ViewChild('boxChatItem', { static: true }) boxChatItem: TemplateRef<any>;
  @ViewChildren('codxChatBox') codxChatBoxes: QueryList<CodxChatBoxComponent>;
  windowNg: any = global;
  ngOnInit(): void {}
  ngAfterViewInit() {

    // open box chat
    this.signalRSV.openBoxChat
    .subscribe((res: any) => {
      if (res) 
      {
        this.handleBoxChat(res);
      }
    });
    
    // open box chat
    this.signalRSV.activeGroup.subscribe((res: any) => {
      if (res?.event && res?.data) {
        switch (res?.event){
          case CHAT.UI_FUNC.DeletedMessage:
            {
              break;
            }
          default:{              
            this.handleBoxChat(res?.data);
            break;
          }
        }
      }
    });

    // // loadedGroupChat
    // this.signalRSV.loadedGroupChat.subscribe((res: any) => {
    //   if(res)
    //   {
    //     this.handleBoxChat(res.data);
    //   }
    // });

    // // recive message Popup khi có tin nhắn mới
    // this.signalRSV.chatboxChange.subscribe((res: any) => {
    //   if (res?.data) {
    //     this.handleBoxChat(res.data);
    //   }
    // });

  }
  ngOnDestroy(): void {}
  // handle box chat
  handleBoxChat(data: any) {
    if(!data) return;
    let isOpen = this.lstGroupActive.some((x) => x.groupID == data.groupID);
    if (isOpen) return;
    // check collaspe
    let index = this.lstGroupCollapse.findIndex(
      (x) => x.groupID === data.groupID
    );
    if (index > -1) this.lstGroupCollapse.splice(index, 1);
    if (this.lstGroupActive.length == 2) {
      let group = this.lstGroupActive.shift();
      let codxBoxChat = Array.from(this.codxChatBoxes).find(
        (x) => x.groupID == group.groupID
      );
      if (codxBoxChat) this.lstGroupCollapse.push(codxBoxChat.group);
    }
    this.lstGroupActive.push(data);
    this.dt.detectChanges();
  }
  //close box chat
  closeBoxChat(data: any) {
    let index = this.lstGroupActive.findIndex((x) => x.groupID == data.groupID);
    if (index > -1) {
      this.lstGroupActive.splice(index, 1);
      if (this.lstGroupCollapse.length > 0) {
        let group = this.lstGroupCollapse.pop();
        this.lstGroupActive.push(group);
      }
      // lấy element hiện tại của component trên DOM
      let ele = document.getElementById(data.groupID);
      if (ele) ele.remove();
      this.dt.detectChanges();
    }
  }
  // collapse box chat
  collapseBoxChat(data: any) {
    let index = this.lstGroupActive.findIndex((x) => x.groupID == data.groupID);
    if (index > -1) {
      this.lstGroupActive.splice(index, 1);
      this.lstGroupCollapse.unshift(data);
      this.dt.detectChanges();
    }
  }
  // expanse box chat
  expanseBoxChat(data: any) {
    this.signalRSV.sendData(CHAT.BE_FUNC.LoadGroup, data?.groupID);
  }
}
