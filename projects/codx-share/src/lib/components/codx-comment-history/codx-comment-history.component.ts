import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiHttpService } from 'codx-core';

@Component({
  selector: 'codx-comment-history',
  templateUrl: './codx-comment-history.component.html',
  styleUrls: ['./codx-comment-history.component.scss']
})
export class CodxCommentHistoryComponent implements OnInit {

  constructor(
    private api:ApiHttpService,
    private dt:ChangeDetectorRef
  ) 
  {

  }

  ngOnInit(): void {
    this.insertComment();
  }

  insertComment(){
    this.api.execSv("SYS","ERM.Business.BKD","TrackLogsBusiness","InsertAsync").subscribe((res:any) => {
      console.log(res);
    })
  }

}
