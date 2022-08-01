import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { Post } from '@shared/models/post';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { ApiHttpService, DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-popup-detail',
  templateUrl: './popup-detail.component.html',
  styleUrls: ['./popup-detail.component.css']
})
export class PopupDetailComponent implements OnInit {

  service:string = "WP";
  assemplyName:string = "ERM.Business.WP";
  className:string = "CommentsBusiness";
  methodName:string = "GetPostByIDAsync";
  data:Post = null;
  dialogRef:any;
  recID:string = "";
  file:any = null;
  FILE_REFERTYPE = {
    IMAGE: "image",
    VIDEO: "video",
    APPLICATION :'application'
  }
  constructor(
    private api:ApiHttpService,
    private dt:ChangeDetectorRef,
    @Optional() dd? : DialogData,
    @Optional() dialogRef?: DialogRef
  ) 
  {
    this.dialogRef = dialogRef;
    this.recID = dd.data.objectID;
    this.file = dd.data;
  }

  ngOnInit(): void {
    this.getPostByID(this.recID);
  }

  getPostByID(recID:string){
    this.api.execSv(this.service,this.assemplyName,this.className,this.methodName, recID)
    .subscribe((res:any) => {
      if(res)
      {
        this.data = res;
      }
    });
  }
}
