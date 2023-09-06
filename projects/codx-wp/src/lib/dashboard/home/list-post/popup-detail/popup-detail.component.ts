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
import { TreeviewCommentComponent } from 'projects/codx-share/src/lib/components/treeview-comment/treeview-comment.component';

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
  childPost: any = null;
  parentID:string ="";
  fileSelected: any = null;
  data:any = null;
  FILE_REFERTYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };
  @ViewChild("codxImageViewer") codxImageViewer:ImageViewerComponent2;
  @ViewChild("codxTreeComment") codxTreeComment:TreeviewCommentComponent;
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
      this.getData(this.fileSelected.objectID,this.fileSelected.recID,this.fileSelected.referType);
    }
  }
  //get data 
  getData(recID:string,refID:string,type:string){
    this.api
      .execSv(
        "WP",
        "ERM.Business.WP",
        "CommentsBusiness",
        "GetDataDetailAsync",
        [recID,refID,type])
        .subscribe((res:any[]) => {
        if(res) 
        {
          this.parentPost = res[0];
          this.childPost = res[1];
          this.dt.detectChanges();
        }
      });
  }
  // get child post ref file
  getChilPost(recID:string,refID:string,type:string){
    this.api
      .execSv(
        "WP",
        "ERM.Business.WP",
        "CommentsBusiness",
        "GetChildPostAsync",
        [recID,refID,type])
        .subscribe((res:any) => {
          this.childPost = JSON.parse(JSON.stringify(res));
          this.codxTreeComment.data = this.childPost;
          if(this.childPost.totalComment > 0)
            this.codxTreeComment.showComments();
          this.dt.detectChanges();
      });
  }
  //change image
  changeImage(file:any){
    if(file)
    {
      this.fileSelected = JSON.parse(JSON.stringify(file));;
      this.getChilPost(this.parentID,file.recID,file.referType);
    }
  }
}
