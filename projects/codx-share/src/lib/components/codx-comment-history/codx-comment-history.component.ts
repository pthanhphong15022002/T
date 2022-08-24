import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { ApiHttpService, AuthService, CacheService } from 'codx-core';
import { AttachmentComponent } from '../attachment/attachment.component';
class BKD_TrackLogs {
  recID: string;
  objectType: string;
  objectID: string;
  ChildID: string;
  actionType: string;
  oldValues: string;
  newValues: string;
  attachments: string;
  comments: string;
  votes: any[];
  deleted: boolean;
  autoCreated: boolean;
  createdOn: Date;
  createdBy: string;
  iPConnection: string;
  reference: string;
  tenantID: string;
}
@Component({
  selector: 'codx-comment-history',
  templateUrl: './codx-comment-history.component.html',
  styleUrls: ['./codx-comment-history.component.scss']
})
export class CodxCommentHistoryComponent implements OnInit {

  @Input() funcID: string;
  @Input() objectID: string;
  @Input() objectType: string;
  @Input() type: "view" | "create" = "view";

  user: any = null;
  comment: string = "";
  REFERTYPE = {
    IMAGE: "image",
    VIDEO: "video",
    APPLICATION: 'application'
  }
  lstFile: any[] = [];
  @ViewChild("codxATM") codxATM: AttachmentComponent;
  constructor(
    private api: ApiHttpService,
    private auth: AuthService,
    private cache: CacheService,
    private dt: ChangeDetectorRef
  ) {

  }

  ngOnInit(): void {
    this.user = this.auth.userValue;
  }

  valueChange(event: any) {
    if (event.data) {
      this.comment = event.data;
      this.dt.detectChanges();
    }
  }
  selectedFiles(event: any) {
    if (event.data.length > 0) {
      let files = event.data;
      files.map((e: any) => {
        if (e.mimeType.indexOf("image") >= 0) {
          e['referType'] = this.REFERTYPE.IMAGE;
        }
        else if (e.mimeType.indexOf("video") >= 0) {
          e['referType'] = this.REFERTYPE.VIDEO;
        }
        else {
          e['referType'] = this.REFERTYPE.APPLICATION;
        }
      });
      this.lstFile = files;
      this.dt.detectChanges();
    }
  }

  removeFile(file: any) {
    this.lstFile = this.lstFile.filter((e: any) => e.fileName != file.fileName);
    this.dt.detectChanges();
  }
  sendComments() {
    let data = new BKD_TrackLogs();
    data.comments = this.comment;
    data.createdOn = new Date();
    data.createdOn = this.user.userID;
    this.api.execSv("Background", "ERM.Business.Background", "TrackLogsBusiness", "InsertAsync", data)
      .subscribe((res: any) => {
        console.log(res)
      })
  }

  uploadFile() {
    this.codxATM.uploadFile();
  }

}
