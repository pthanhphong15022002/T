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
  @ViewChild("chatBox") chatBox:TemplateRef<any>;

  constructor(
    public codxService:CodxService,
    private api:ApiHttpService,
    private signalRSV:SignalRService,
  ) 
  { }
  

  
  ngOnInit(): void {
    this.getTotalMessage();
  }

  ngAfterViewInit(): void {
    this.signalRSV.signalBoxChat.subscribe((res:any) => {
    });
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
}
