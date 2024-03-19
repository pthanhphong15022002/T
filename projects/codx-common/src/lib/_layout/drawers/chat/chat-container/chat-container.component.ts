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
import { ApiHttpService, AuthService } from 'codx-core';
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
  constructor
  (
    private api:ApiHttpService,
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
    this.signalRSV.openBoxChat
    .subscribe((group: any) => {
      if (group) 
      {
        this.handleBoxChat(group);
      }
    });

    this.signalRSV.addGroup
    .subscribe((groupID:any) => {
      if(groupID)
      {
        this.api.execSv(
          'WP',
          'ERM.Business.WP',
          'GroupBusiness',
          'GetGroupByIDAsync',
          [groupID]
        ).subscribe((res:any) => 
        {
          if(res) 
          {
            this.lstGroupActive.push(res);
            this.dt.detectChanges();
          }
        });
      }
    });

    this.signalRSV.removeGroup
    .subscribe((groupID:any) => {
      if(groupID)
      {
        if(this.lstGroupActive.length > 0)
        {
          let idx = this.lstGroupActive.findIndex(x => x.groupID == groupID);
          if(idx > -1)
            this.lstGroupActive.splice(idx,1);
        }

        if(this.lstGroupCollapse.length > 0)
        {
          let idx = this.lstGroupCollapse.findIndex(x => x.groupID == groupID);
          if(idx > -1)
            this.lstGroupCollapse.splice(idx,1);
        }
        this.dt.detectChanges();
      }
    });
  }
  ngOnDestroy(): void {}

  handleBoxChat(data: any) {
    if(!data) return;
    
    let isOpen = this.lstGroupActive.some((x) => x.groupID == data.groupID);
    if (isOpen) return;

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
  
  closeBoxChat(data: any) {
    let index = this.lstGroupActive.findIndex((x) => x.groupID == data.groupID);
    if (index > -1) {
      this.lstGroupActive.splice(index, 1);
      if (this.lstGroupCollapse.length > 0) {
        let group = this.lstGroupCollapse.pop();
        this.lstGroupActive.push(group);
      }
      
      let ele = document.getElementById(data.groupID);
      if (ele) ele.remove();
      this.dt.detectChanges();
    }
  }
  
  collapseBoxChat(data: any) {
    let index = this.lstGroupActive.findIndex((x) => x.groupID == data.groupID);
    if (index > -1) {
      this.lstGroupActive.splice(index, 1);
      this.lstGroupCollapse.unshift(data);
      this.dt.detectChanges();
    }
  }
  
}
