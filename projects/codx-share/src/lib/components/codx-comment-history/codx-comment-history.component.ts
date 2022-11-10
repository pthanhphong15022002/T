import { E } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { ApiHttpService, AuthService, CacheService, CallFuncService, FormModel, NotificationsService } from 'codx-core';
import { environment } from 'src/environments/environment';
import { tmpHistory } from '../../models/tmpComments.model';
import { AttachmentComponent } from '../attachment/attachment.component';
import { PopupVoteComponent } from '../treeview-comment/popup-vote/popup-vote.component';

@Component({
  selector: 'codx-comment-history',
  templateUrl: './codx-comment-history.component.html',
  styleUrls: ['./codx-comment-history.component.scss'],
  encapsulation: ViewEncapsulation.None,

})
export class CodxCommentHistoryComponent implements OnInit {

  @Input() funcID: string;
  @Input() objectID: string;
  @Input() objectType: string;
  @Input() actionType:string;
  @Input() reference:string;
  @Input() formModel:FormModel;
  @Input() type: "view" | "create" = "view";
  @Input() data:any;
  @Input() viewIcon:boolean = true;
  @Input()  allowVotes:boolean = true;
  @Input()  dVll: any = {};
  @Input() vllIcon: any = [];
  @Output() evtReply = new EventEmitter;
  @Output() evtDelete = new EventEmitter;
  @Output() evtSend = new EventEmitter;
  user: any = null;
  message: string = "";
  lstFile: any[] = [];
  grdSetUp:any;
  date = new Date();
  REFERTYPE = {
    IMAGE: "image",
    VIDEO: "video",
    APPLICATION: 'application'
  }
  

  @ViewChild("codxATM") codxATM: AttachmentComponent;
  constructor(
    private api: ApiHttpService,
    private auth: AuthService,
    private cache: CacheService,
    private notifySV:NotificationsService,
    private callFuc:CallFuncService,
    private dt: ChangeDetectorRef
  ) 
  {
    this.user = this.auth.userValue;
  }

  ngOnInit(): void {
    if(this.data){
      this.getFileByObjectID();
    }
  }

  getFileByObjectID(){
    this.api.execSv(
      "DM",
      "ERM.Business.DM",
      "FileBussiness",
      "GetFilesByIbjectIDAsync",
      this.data.recID)
    .subscribe((res:any[]) => {
      if(res.length > 0){
        let files = res;
        files.map((e:any) => {
          if(e && e.referType == this.REFERTYPE.VIDEO)
          {
            e['srcVideo'] = `${environment.apiUrl}/api/dm/filevideo/${e.recID}?access_token=${this.user.token}`;
          }
        })
        this.lstFile = res; 
        this.dt.detectChanges();
    }});
  }

  deleteComment(item:any){
    this.notifySV.alertCode('WP032').subscribe((res) => {
      if (res.event.status == "Y"){
        this.api.execSv("BG","ERM.Business.BG","TrackLogsBusiness","DeleteAsync",item.recID)
        .subscribe((res:any) => {
          if(res)
          {
            this.evtDelete.emit(item);
            this.notifySV.notifyCode("WP033");
          }
          else 
            this.notifySV.notifyCode("SYS022");
        })};
    });
    
  }

  valueChange(event: any) {
    if (event.data) {
      this.message = event.data;
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
  async sendComments() {
    if(!this.message && this.lstFile.length == 0){
      this.notifySV.notifyCode("SYS010");
      return;
    }
    let data = new tmpHistory();
    data.comment = this.message;
    data.attachments = this.lstFile.length;
    data.objectID = this.objectID;
    data.objectType = this.objectType;
    data.actionType = this.actionType;
    data.functionID = this.funcID;
    data.reference = this.reference;
    this.api.execSv("BG","ERM.Business.BG","TrackLogsBusiness","InsertAsync",data)
    .subscribe(async (res1:any) => {
      if(res1){
        debugger;
        if(data.attachments > 0)
        {
          this.codxATM.objectId = res1.recID;
          this.codxATM.objectType = "BG_TrackLogs";
          this.lstFile.map((e:any) => {
            e.objectId = res1.recID;
          });
          this.codxATM.fileUploadList = this.lstFile;  
          (await this.codxATM.saveFilesObservable()).subscribe((res2: any) => {
            debugger;
            if(res2){
              this.lstFile.unshift(res2.data);
              this.evtSend.emit(res1);
              this.notifySV.notifyCode("WP034"); 
              this.clearData();  
              this.lstFile = [...this.lstFile]; 
              this.dt.detectChanges();
            }
          })
        }
        else
        {
           
            this.evtSend.emit(res1);
            this.notifySV.notifyCode("WP034");
            this.clearData();   
        }
      }
      else {
        this.notifySV.notifyCode("SYS023");
      }
    });

  }
  clearData(){
    this.lstFile = [];
    this.message = "";
  }
  uploadFile() {
    this.codxATM.uploadFile();
  }


  replyTo(data:any) {
    this.evtReply.emit(data);
  }

  votePost(data: any, voteType = null) 
  {
    this.api.execSv(
      "BG",
      "ERM.Business.BG",
      "TrackLogsBusiness",
      "VoteCommentAsync",
      [data.recID, voteType])
      .subscribe((res: any) => {
        if (res) {
          data.votes = res[0];
          data.totalVote = res[1];
          data.listVoteType = res[2];
          if (voteType == data.myVoteType) {
            data.myVoteType = null;
            data.myVoted = false;
          }
          else {
            data.myVoteType = voteType;
            data.myVoted = true;
          }
          this.dt.detectChanges();
        }

      });
  }
  showVotes(data:any){
    let object = {
      data: data,
      entityName: "BG_TrackLogs",
      vll: this.dVll
    }
    this.callFuc.openForm(PopupVoteComponent, "", 750, 500, "", object);
  }
}
