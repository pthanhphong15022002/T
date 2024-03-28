import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AuthStore, CallFuncService, DialogModel, FormModel, UserModel } from 'codx-core';
import { Subscription } from 'rxjs';
import { SignalRService } from '../services/signalr.service';

@Component({
  selector: 'codx-chat-message',
  templateUrl: './codx-message.component.html',
  styleUrls: ['./codx-message.component.css']
})
export class CodxMessageComponent implements OnInit,AfterViewInit,OnDestroy {
  
  @Input() data:any;
  @Input() user:UserModel;
  @Input() formModel:FormModel;
  @Input() vllL1480:any;
  @Output() clickMF = new EventEmitter();

  subscriptions = new Subscription();
  constructor
  (
    private signalR:SignalRService,
    private detectorRef:ChangeDetectorRef,
    private callFCSV:CallFuncService,
    private auth:AuthStore
  ) 
  {
  }
  ngOnInit(): void {
    if(!this.user)
    {
      this.user = this.auth.get(); 
      this.detectorRef.detectChanges();
    }
  }
  
  ngAfterViewInit(): void {
    let subscripbe1 = this.signalR.voteMessage
    .subscribe((res:any) => {
      if(res && res.mssgID == this.data.recID) 
      {
        let type = res.data.type, data = res.data.data;
        let votes = [...this.data.votes];
        switch(type)
        {
          case"add":
            if(!votes) votes = [];
            votes.push(data);
            break;
          case"update":
            let idx = votes.findIndex(x => x.createdBy == data.createdBy);
            if(idx > -1) votes[idx] = data; 
            break;
          case "remove":
            let idxx = votes.findIndex(x => x.createdBy == data.createdBy);
            if(idxx > -1)
              votes.splice(idxx,1);
            break;  
        }
        this.data.votes = [...votes];
        this.detectorRef.detectChanges();
      }
    });
    this.subscriptions.add(subscripbe1);
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }


  clickViewFile(event){

  }


  clickReply(mssg:any){
    let event = {
      type :"reply",
      data : mssg
    };
    this.clickMF.emit(event);
  }

  clickEmoji(mssg:any){
    let event = {
      type :"vote",
      data : mssg
    };
    this.clickMF.emit(event);
  }

  clickDelete(mssg:any){
    if(mssg)
    {
      mssg.messageType = "5";
      let event = {
        type :"delete",
        data : mssg
      };
      this.clickMF.emit(event);
    }
  }

  clickVote(vote:any){
    if(vote)
    {
      let event = {
        type :"vote",
        data : {
          mssg : this.data,
          vote : vote
        }
      };
      this.clickMF.emit(event);
    }
  }

  clickShowVotes(){
    let dialog = new DialogModel();
    
  }
}
