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
    debugger
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
          this.dt.detectChanges();
      });
  }
  //change image
  changeImage(file:any){
    debugger
    if(file)
    {
      this.fileSelected = JSON.parse(JSON.stringify(file));;
      this.getChilPost(this.parentID,file.recID,file.referType);
    }
  }
}
