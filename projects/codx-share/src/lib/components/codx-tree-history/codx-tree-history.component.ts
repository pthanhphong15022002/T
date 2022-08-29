import { ChangeDetectorRef, Component, Input, OnInit,  ViewEncapsulation, } from '@angular/core';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { ApiHttpService, AuthService, CacheService } from 'codx-core';

@Component({
  selector: 'codx-tree-history',
  templateUrl: './codx-tree-history.component.html',
  styleUrls: ['./codx-tree-history.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CodxTreeHistoryComponent implements OnInit {

  @Input() funcID:string;
  @Input() objectType:string;
  @Input() objectID:string;
  @Input() actionType:string;
  @Input() addNew:boolean = false;
  /////////////////////////////
  service = "BG";
  assemply = "ERM.Business.BG";
  className = "TrackLogsBusiness";
  lstHistory:any[] = [];
  constructor(
    private api:ApiHttpService,
    private cache:CacheService,
    private auth:AuthService,
    private dt:ChangeDetectorRef,
  ) 
  { }

  ngOnInit(): void {
    if(this.actionType){
      this.GetCommentTrackLogByObjectIDAsync();
    }
    else{
      this.getTrackLogAsync();
    }
  }


  getTrackLogAsync(){
    this.api.execSv(this.service,this.assemply,this.className,"GetTrackLogsByObjectIDAsync",this.objectID).
    subscribe((res:any[]) =>{
      if(res) {
        console.log('getTrackLogAsync: ',res)
        this.lstHistory = res;
      }
    })
  }

  GetCommentTrackLogByObjectIDAsync(){
    this.api.execSv(this.service,this.assemply,this.className,"GetCommentTrackLogByObjectIDAsync",[this.objectID,this.actionType]).
    subscribe((res:any[]) =>{
      if(res) {
        console.log('GetCommentTrackLogByObjectIDAsync: ',res)
        this.lstHistory = res;
      }
    })
  }

  replyTo(data) {
    data.showReply = !data.showReply;
    this.dt.detectChanges();
  }

  deleteComment(event: any) {

  }

  sendComment(event:any,data:any = null){

  }
}
