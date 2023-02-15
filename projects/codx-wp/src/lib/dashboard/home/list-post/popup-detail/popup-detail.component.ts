import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Optional,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ApiHttpService, CacheService, DialogData, DialogRef } from 'codx-core';
import { ImageViewerComponent2 } from 'projects/codx-share/src/lib/components/ImageViewer2/imageViewer2.component';
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
  dialogData:any = null;
  post: WP_Comments= new WP_Comments();
  postID:string ="";
  files:any[] = [];
  fileID:string = "";
  fileReferType:string = "";
  fileSelected: any = null;
  imageSrc:any[] = [];
  index:number = 0;
  vllL1480:any = null;
  dVll:any = {};
  data:any = null;
  FILE_REFERTYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };
  @ViewChild("codxImageViewer") codxImageViewer:ImageViewerComponent2;
  constructor(
    private api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private cache:CacheService,
    @Optional() dd?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) 
  {
    this.dialogRef = dialogRef;
    this.dialogData = dd.data;
  }

  ngOnInit(): void {
    if(this.dialogData)
    {
      this.postID = this.dialogData.objectID;
      this.fileID = this.dialogData.recID;
      this.fileReferType = this.dialogData.referType;
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
          this.dt.detectChanges();
        }
      });
    }
  }
  //change image
  changeImage(file:any){
    if(file){
      this.postID = file.objectID;
      this.fileID = file.recID;
      this.fileReferType = file.referType;
      this.getPostByID(this.postID,this.fileID,this.fileReferType);
    }
    
  }
}
