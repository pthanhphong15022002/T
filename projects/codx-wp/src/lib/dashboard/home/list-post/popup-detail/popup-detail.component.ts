import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Optional,
  ViewEncapsulation,
} from '@angular/core';
import { Post } from '@shared/models/post';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { ApiHttpService, CacheService, DialogData, DialogRef } from 'codx-core';
import { WP_Comments } from 'projects/codx-wp/src/lib/models/WP_Comments.model';

@Component({
  selector: 'lib-popup-detail',
  templateUrl: './popup-detail.component.html',
  styleUrls: ['./popup-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PopupDetailComponent implements OnInit {
  
  service: string = 'WP';
  assemplyName: string = 'ERM.Business.WP';
  className: string = 'CommentsBusiness';
  methodName: string = 'GetPostByIDAsync';
  post: WP_Comments= new WP_Comments();
  dialogRef: any;
  recID: string = '';
  userID:string = "";
  userName:string = "";
  shareControl:string = "";
  createdOn:string = "";
  file: any = null;
  vllL1480:any = null;
  dVll:any = {};
  data:any = null;
  FILE_REFERTYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };
  constructor(
    private api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private cache:CacheService,
    @Optional() dd?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) 
  {
    this.dialogRef = dialogRef;
    this.file = dd.data;
  }

  ngOnInit(): void {
    if(this.file)
    {
      this.getPostByID(this.file.objectID,this.file.recID,this.file.referType);
    }
  }
  
  //get post by file ref
  getPostByID(postID: string,fileID:string,referType:string) {
    if(postID && fileID && referType)
    {
      this.api
      .execSv(
        this.service,
        this.assemplyName,
        this.className,
        'GetDetailPostByIDAsync',
        [postID,fileID,referType])
        .subscribe((res: any) => {
        if(res) 
        {
          this.post = JSON.parse(JSON.stringify(res));
        }
      });
    }
  }

  //close popup
  clickClosePopup() {
    this.dialogRef.close();
  }
}
