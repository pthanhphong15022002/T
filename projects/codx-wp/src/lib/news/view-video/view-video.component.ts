import { R } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ApiHttpService, AuthService } from 'codx-core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'wp-video',
  templateUrl: './view-video.component.html',
  styleUrls: ['./view-video.component.scss']
})
export class ViewVideoComponent implements OnInit {

  @Input() ObjectID: string | null = null;
  @Input() ObjectType:string | null = null;
  FILE_REFERTYPE = {
    IMAGE: "image",
    VIDEO: "video",
    APPLICATION :'application'
  }
  file:any;
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
    if(!objectID) return;
    this.api.execSv(
      "DM",
      "ERM.Business.DM",
      "FileBussiness",
      "GetFilesByObjectIDImageAsync",
      [objectID])
    .subscribe((files:any[]) => {
      if(files.length > 0){
        let fileVideo = files.find((f:any) => f.referType == this.FILE_REFERTYPE.VIDEO);
        if(fileVideo){
            fileVideo['srcVideo'] = `${environment.apiUrl}/api/dm/filevideo/${fileVideo.recID}?access_token=${this.auth.userValue.token}`;
            this.file = fileVideo;
          this.dt.detectChanges();
        }
      }
    });
  }

}
