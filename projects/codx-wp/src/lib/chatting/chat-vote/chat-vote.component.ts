import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, CacheService, DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-chat-vote',
  templateUrl: './chat-vote.component.html',
  styleUrls: ['./chat-vote.component.css']
})
export class ChatVoteComponent implements OnInit {

  data: any;
  entityName:string = "";
  lstVote:any[] = []
  lstUserVoted:any[] = [];
  defaultVote:string = "0";
  dialogRef:DialogRef;
  vllL1480:any = [];
  dVll: any = {};
  constructor(
    private api: ApiHttpService,
    private cache:CacheService,
    private dt:ChangeDetectorRef,
    @Optional() dd?: DialogData,
    @Optional() dialog?:DialogRef
  ) 
  {
    this.data = dd.data.data;
    this.entityName = dd.data.entityName;
    this.dVll = dd.data.vll;
    this.dialogRef = dialog;
  }

  ngOnInit(): void {
    if(this.entityName == "WP_Messages"){
      this.getWPCommentsVotes();
    }
    /* else
    {
      this.getTracklogsCommentVotes();
    } */
  }

  /* getTracklogsCommentVotes(){
    debugger;
    this.api.execSv("BG","ERM.Business.BG","TrackLogsBusiness","GetVotesCommentAsync",[this.data.messageId])
    .subscribe((res:any[]) => {
      if(res)
      {
        this.lstVote = res[0];
        this.getUserVote(this.defaultVote);
      }
    })
  } */

  getWPCommentsVotes(){
    this.api.execSv("WP",
    "ERM.Business.WP",
    "ChatBusiness",
    "GetVotesAsync", [this.data.messageId])
    .subscribe((res:any[]) => {
      if(res)
      {
        this.lstVote = res[0];
        this.getUserVote(this.defaultVote);
        this.dt.detectChanges();
      }
    })
  }

  getUserVote(voteType:string){
    if(voteType == this.defaultVote){
      this.lstUserVoted = this.data.votes;
    }
    else
    {
      let lstUserVoted = this.data.votes.filter((v:any) => {
        return v.voteType == voteType;
      });
      this.lstUserVoted = lstUserVoted;
    }
    this.dt.detectChanges();
  }

}
