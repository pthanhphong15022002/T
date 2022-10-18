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
  post: Post = new Post();
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
  ) {
    this.dialogRef = dialogRef;
    this.file = dd.data;
  }

  ngOnInit(): void {
    this.getValueIcon("L1480");
    this.getPostByID(this.file.objectID,this.file.recID);
  }
  getValueIcon(vll:string){
    if(vll)
    {
      this.cache.valueList(vll).subscribe((res) => {
        if (res && res?.datas) {
          this.vllL1480 = res.datas;
          if(this.vllL1480.length > 0){
            this.dVll["0"] = null;
            this.vllL1480.forEach((element:any) => {
              this.dVll[element.value + ""] = element;
            });
          }
        }
      });
    }
  }
  getPostByID(postID: string,fileID:string) {
    if(postID && fileID)
    {
      this.api
      .execSv(
        this.service,
        this.assemplyName,
        this.className,
        'GetDetailPostByIDAsync',
        [postID,fileID]
      )
      .subscribe((res: any) => {
        if (res) 
        {
          this.post = res;
        }
      });
    }
  }

  clickClosePopup() {
    this.dialogRef.close();
  }

  pushComment(data: any) {

  }
}
