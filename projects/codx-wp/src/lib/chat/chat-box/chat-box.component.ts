import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ApiHttpService, AuthStore } from 'codx-core';
import { SignalRService } from '../../services/signalr.service';

@Component({
  selector: 'codx-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css']
})
export class ChatBoxComponent implements OnInit {

  @Input() groupID:string ;

  group:any = {};
  user:any = {};
  constructor
  (
    private api:ApiHttpService,
    private auth:AuthStore,
    private signalR: SignalRService,
    private dt:ChangeDetectorRef
  ) 
  {
    this.user = this.auth.get()
  }

  ngOnInit(): void 
  {

  }

  // get group info
  getGroupInfo(groupID:string){
    if(groupID){
      this.api.execSv(
        "WP",
        "ERM.Business.WP",
        "GroupBusiness",
        "GetGoupChatBydIDAsync",
        [groupID])
      .subscribe();
    }
  }
}
