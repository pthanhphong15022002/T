import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { ApiHttpService, CacheService, DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-popup-vote',
  templateUrl: './popup-vote.component.html',
  styleUrls: ['./popup-vote.component.css']
})
export class PopupVoteComponent implements OnInit {

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
    if(this.data){
      if(this.entityName === "WP_Comments"){
        this.getWPCommentsVotes(this.data.recID);
      }
      else
      {
        this.getBGCommentVotes(this.data.recID);
      }
    }
  }
  getBGCommentVotes(objectID:string){
    if(objectID){
      this.api.execSv(
        "BG",
        "ERM.Business.BG",
        "CommentLogsBusiness",
        "GetVotesCommentAsync",
        [objectID])
        .subscribe((res:any[]) => {
          if(res)
          {
            this.lstVote = res[0];
            this.getUserVote(this.defaultVote);
          }
        });
    }
    
  }

  getWPCommentsVotes(objectID:string)
  {
    if(objectID){
      this.api.execSv(
        "WP",
        "ERM.Business.WP",
        "VotesBusiness",
        "GetVotesAsync",
        [objectID])
        .subscribe((res:any[]) => {
          if(res)
          {
            this.lstVote = res[0];
            this.getUserVote(this.defaultVote);
            this.dt.detectChanges();
          }
        });
    }
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
