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

  @Input() funcID: string = null;
  @Input() objectID: string = null;
  @Input() objectType:string = null;
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
    this.getFileByObjectID();

  }

  // get file video by objectID objectType 
  getFileByObjectID(){
    this.api.execSv(
      "DM",
      "ERM.Business.DM",
      "FileBussiness",
      "GetFileByOORAsync",
      [this.objectID,this.objectType,this.FILE_REFERTYPE.VIDEO])
    .subscribe((res:any) => {
      if(res.pathDisk)
      {
          res["source"] = `${environment.urlUpload}`+"/"+res.pathDisk; 
          this.file = res;
          this.dt.detectChanges();
      }
    });
  }
}
