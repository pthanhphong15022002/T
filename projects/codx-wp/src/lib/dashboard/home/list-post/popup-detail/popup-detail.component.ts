import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Optional,
  ViewEncapsulation,
} from '@angular/core';
import { Post } from '@shared/models/post';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { ApiHttpService, CacheService, DialogData, DialogRef } from 'codx-core';
import { WP_Comments } from 'projects/codx-wp/src/lib/models/WP_Comments.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'lib-popup-detail',
  templateUrl: './popup-detail.component.html',
  styleUrls: ['./popup-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PopupDetailComponent implements OnInit {

  dialogRef: any;
  dialofData:any = null;
  post: WP_Comments= new WP_Comments();
  postID:string ="";
  files:any[] = [];
  fileID:string = "";
  fileReferType:string = "";
  fileSelected: any = null;
  index:number = 0;
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
    this.dialofData = dd.data;
  }

  ngOnInit(): void {
    if(this.dialofData)
    {
      this.postID = this.dialofData.postID;
      this.fileID = this.dialofData.fileID;
      this.fileReferType = this.dialofData.fileReferType;
      this.getFileByObjectID(this.postID);
      this.getPostByID(this.postID,this.fileID,this.fileReferType);
    }
  }
  
  //get post by postID
  getPostByID(postID: string,fileID:string,referType:string) {
    if(postID && fileID && referType)
    {
      this.api
      .execSv(
        "WP",
        "ERM.Business.WP",
        "CommentsBusiness",
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
  // get file by objectID
  getFileByObjectID(objectID:string){
    if(objectID)
    {
      this.api
      .execSv(
      'DM',
      'ERM.Business.DM',
      'FileBussiness',
      'GetFilesByIbjectIDAsync',
      [objectID])
      .subscribe((res:any[]) => {
        if(res?.length > 0)
        {
          res.forEach((f: any) => {
            if(f.referType == this.FILE_REFERTYPE.IMAGE || f.referType == this.FILE_REFERTYPE.VIDEO)
            {
              f["source"] = `${environment.urlUpload}/${f.url}`; 
            }
          });
          this.files = JSON.parse(JSON.stringify(res));
          let _index =  this.files.findIndex(x => x.recID == this.fileID);
          this.index = _index;
          this.fileSelected = this.files[_index];
        }
      });
    }
  }

  // close popup
  clickClosePopup() {
    this.dialogRef.close();
  }

  // nextFile
  nextFile(){
    if(this.index >= 0)
    {
      let _index = ++this.index;
      if(_index >= this.files.length){
        _index = 0;
      }
      this.fileSelected = this.files[_index];
      if(this.fileSelected)
      {
        this.getPostByID(this.postID,this.fileSelected.recID,this.fileSelected.referType);
      }
      this.index = _index;
      this.dt.detectChanges();
    }
  }

  // previriousFile
  previousFile(){
    if(this.index >= 0)
    {
      let _index = --this.index;
      if(_index <= -1 ){
        _index = this.files.length - 1;
      }
      this.fileSelected = this.files[_index];
      if(this.fileSelected)
      {
        this.getPostByID(this.postID,this.fileSelected.recID,this.fileSelected.referType);
      }
      this.index = _index;
      this.dt.detectChanges();
    }
  }
}
