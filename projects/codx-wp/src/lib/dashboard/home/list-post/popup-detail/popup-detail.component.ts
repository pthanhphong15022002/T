import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Optional,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Post } from '@shared/models/post';
import { Thickness } from '@syncfusion/ej2-angular-charts';
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
  parentPost: any = null;
  chilPost: any = null;
  parentID:string ="";
  fileID:string = "";
  fileReferType:string = "";
  fileSelected: any = null;
  imageSrc:any[] = [];
  index:number = 0;
  vllL1480:any = null;
  dVll:any = {};
  data:any = null;
  activeChildPost:boolean = false;
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
    this.fileSelected = dd.data;

  }

  ngOnInit(): void {
    if(this.fileSelected)
    {
      this.parentID = this.fileSelected.objectID;
      this.fileID = this.fileSelected.recID;
      this.fileReferType = this.fileSelected.referType;
      this.getParentPost(this.parentID);
      this.getChilPost(this.fileID);
    }
  }
  
  //get parent post by objectID DM_FileInfor 
  getParentPost(objectID:string) {
    if(objectID){
      this.api
      .execSv(
        "WP",
        "ERM.Business.WP",
        "CommentsBusiness",
        'GetParentPostAsync',
        [objectID])
        .subscribe((res: any) => {
        if(res) 
        {
          this.parentPost = JSON.parse(JSON.stringify(res));
          this.dt.detectChanges();
        }
      });
    }
  }
  // get child post by recID DM_FileInfor
  getChilPost(objectID:string){
    if(objectID){
      this.api
      .execSv(
        "WP",
        "ERM.Business.WP",
        "CommentsBusiness",
        'GetChildPostAsync',
        [objectID])
        .subscribe((res:any) => {
          debugger
          if(res){
            this.chilPost = JSON.parse(JSON.stringify(res));
          }
          else // chưa có bài viết 
          {
            this.chilPost = new Post();
            this.chilPost.refID = this.fileSelected.recID;
            if(this.fileSelected.referType == this.FILE_REFERTYPE.IMAGE)
              this.chilPost.category = "9";
            else if(this.fileSelected.referType == this.FILE_REFERTYPE.IMAGE)
              this.chilPost.category = "10";
            else this.chilPost.category = "11";
            this.activeChildPost = true;
          }
          this.dt.detectChanges();
      });
    }
  }
  //change image
  changeImage(file:any){
    if(file){
      this.fileID = file.recID;
      this.fileSelected = file;
      this.getChilPost(file.recID);
    }
  }
  // create chilPost
  createdChilPost(){
    this.api.execSv( 
      "WP",
      "ERM.Business.WP",
      "CommentsBusiness",
      'InsertChilPostAsync',
      [this.chilPost])
      .subscribe((res:any) => {
        this.activeChildPost = false;
      });
  }
}
