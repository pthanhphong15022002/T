import { R } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { ApiHttpService, AuthService } from 'codx-core';
import { timeStamp } from 'console';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'wp-view-video',
  templateUrl: './view-video.component.html',
  styleUrls: ['./view-video.component.scss']
})
export class ViewVideoComponent implements OnInit {

  @Input() funcID: string | null = null;
  @Input() ObjectID: string | null = null;
  @Input() ObjectType:string | null = null;
  @ViewChild("codxATM") codxATM: AttachmentComponent;
  FILE_REFERTYPE = {
    IMAGE: "image",
    VIDEO: "video",
    APPLICATION :'application'
  }
  file:any = null;
  constructor(
    private api:ApiHttpService,
    private dt:ChangeDetectorRef,
    private auth:AuthService
  ) { }

  ngOnInit(): void {
    if(this.ObjectID){
      this.getFileByObjectID(this.ObjectID);
    }
  }

  getFileByObjectID(objectID:string){
    if(objectID){
      this.api.execSv(
        "DM",
        "ERM.Business.DM",
        "FileBussiness",
        "GetFilesByIbjectIDAsync",
        [objectID])
      .subscribe((files:any[]) => 
      {
        if(files.length > 0)
        {
          let fileVideo = files.find((f:any) => f.referType == this.FILE_REFERTYPE.VIDEO);
          if(fileVideo){
            fileVideo["source"] = `${environment.urlUpload}`+"/"+ fileVideo.url;
              this.file = fileVideo;
            this.dt.detectChanges();
          }
        }
      });
    }
  }
  fileUpload:any[] = [];
  addVideo(files: any) {

  }
  clickUploadFile(){
    if(this.codxATM){
      this.codxATM.uploadFile();
    }
  }
}
