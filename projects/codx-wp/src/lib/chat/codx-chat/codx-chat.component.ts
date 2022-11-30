import { Component, HostBinding, OnInit } from '@angular/core';
import { SignalRService } from 'projects/codx-wp/src/lib/services/signalr.service';
import { CodxService, CallFuncService } from 'codx-core';

@Component({
  selector: 'codx-chat',
  templateUrl: './codx-chat.component.html',
  styleUrls: ['./codx-chat.component.css']
})
export class CodxChatComponent implements OnInit {
  @HostBinding('class') get class() {
    return "d-flex align-items-center " + this.codxService.toolbarButtonMarginClass; 
  }
  loaded = false;
  autoClose:boolean = true;
  constructor(
    public codxService:CodxService,
    private callFc:CallFuncService,
    private signalRSV:SignalRService
  ) 
  { }

  ngOnInit(): void {
  }

  close()
  {
    alert("close");
  }
  openChatBox()
  {
    this.loaded = true;
  }
}
