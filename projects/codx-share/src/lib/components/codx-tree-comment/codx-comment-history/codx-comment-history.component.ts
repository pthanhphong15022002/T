import { E } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { ApiHttpService, AuthService, CacheService, CallFuncService, DialogModel, FormModel, NotificationsService, Util } from 'codx-core';
import { environment } from 'src/environments/environment';
import { CodxShareService } from '../../../codx-share.service';
import { tmpHistory } from '../../../models/tmpComments.model';
import { AttachmentComponent } from '../../attachment/attachment.component';
import { PopupVoteComponent } from '../../treeview-comment/popup-vote/popup-vote.component';
import { ViewFileDialogComponent } from '../../viewFileDialog/viewFileDialog.component';

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
  @Input() new:boolean = false;
  @Input() data:any;
  @Input() viewIcon:boolean = true;
  @Input() allowVotes:boolean = true;
  @Input() allowEdit:boolean = true;
  @Input() dVll: any = {};
  @Input() vllIcon: any = [];

  @Output() evtReply = new EventEmitter;
  @Output() evtDelete = new EventEmitter;
  @Output() evtSend = new EventEmitter;
  user: any = null;
  message: string = "";
  files:any = null
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
    private codxShareSV:CodxShareService,
    private dt: ChangeDetectorRef
  ) 
  {
    this.user = this.auth.userValue;
  }

  ngOnInit(): void {
    debugger
    if(this.data){
      this.getFileByObjectID();
    }
  }
  // get file by id
  getFileByObjectID(){
    this.api.execSv(
      "DM",
      "ERM.Business.DM",
      "FileBussiness",
      "GetFilesByIbjectIDAsync",
      this.data.recID)
    .subscribe((res:any[]) => {
      if(Array.isArray(res)){
        this.files = res[0]; 
        this.dt.detectChanges();
    }});
  }
  // deleted comment 
  deleteComment(item:any){
    this.notifySV.alertCode('WP032').subscribe((res) => {
      if (res.event.status == "Y")
      {
        this.api.execSv("BG","ERM.Business.BG","CommentLogsBusiness","DeleteAsync",item.recID)
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
  // value change
  valueChange(event: any) {
    if (event.data) {
      this.message = event.data;
      this.dt.detectChanges();
    }
  }
  // select file
  selectedFiles(event: any) {
    if (Array.isArray(event.data)) {
      let file = event.data[0];
      if(file.mimeType.indexOf("image") >= 0 ){
        file['referType'] = this.REFERTYPE.IMAGE;
        file['source'] = file.avatar;
      }
      else if(file.mimeType.indexOf("video") >= 0)
      {
        file['referType'] = this.REFERTYPE.VIDEO;
        file['source'] = file.data;
      }
      else{
        file['referType'] = this.REFERTYPE.APPLICATION;
      }
      this.files = file;
      this.dt.detectChanges();
    }
  }
  // remove file
  removeFile() {
    this.files = null;
    this.dt.detectChanges();
  }
  // send comment
  sendComments() {
    this.deleteComment
    if(!this.message && !this.files){
      this.notifySV.notifyCode("SYS010");
      return;
    }
    let data = new tmpHistory();
    data.recID = Util.uid();
    data.comment = this.message;
    data.objectID = this.objectID;
    data.objectType = this.objectType;
    data.functionID = this.funcID;
    data.reference = this.reference;
    if(this.files){
      data.attachments = 1;
      this.codxATM.objectId = data.recID;
      let lstFile = [];
      lstFile.push(this.files);
      this.codxATM.fileUploadList =  lstFile;
      this.codxATM.objectType = "BG_Comments";
      this.codxATM.saveFilesMulObservable()
      .subscribe((res: any) => {
        if(res){
          this.api.execSv(
            "BG",
            "ERM.Business.BG",
            "CommentLogsBusiness",
            "InsertCommentAsync",[data])
            .subscribe((res:any[]) => {
              if(res[0])
              {
                this.evtSend.emit(res[1]);
                this.notifySV.notifyCode("WP034"); 
              }
              else
                this.notifySV.notifyCode("SYS023");
              this.clearData(); 
            });
        }
        else
        {
          this.notifySV.notifyCode("SYS023");
          this.clearData(); 
        }
      });
    }
    else
    {
      this.api.execSv(
        "BG",
        "ERM.Business.BG",
        "CommentLogsBusiness",
        "InsertCommentAsync",[data])
        .subscribe((res:any[]) => {
          if(res[0])
          {
            this.evtSend.emit(res[1]);
            this.notifySV.notifyCode("WP034"); 
          }
          else
            this.notifySV.notifyCode("SYS023");
          this.clearData(); 
        });
    }
  }
  // clear data
  clearData(){
    this.message = "";
    this.files = null;
  }
  //click upload file
  uploadFile() {
    this.codxATM.uploadFile();
  }
  //click reply
  replyTo(data:any) {
    this.evtReply.emit(data);
  }
  //vote comment
  votePost(data: any, voteType = null) {
    this.api.execSv(
      "BG",
      "ERM.Business.BG",
      "CommentLogsBusiness",
      "VoteCommentAsync",
      [data.recID, voteType])
      .subscribe((res: any) => {
        if (res) {
          data.votes = res[0];
          data.totalVote = res[1];
          data.listVoteType = res[2];
          if (voteType == data.myVoteType) 
          {
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
  //click show votes
  showVotes(data:any){
    if(data){
      let object = {
        data: data,
        entityName: "BG_Comments",
        vll: this.dVll
      }
      this.callFuc.openForm(PopupVoteComponent, "", 750, 500, "", object);
    }
  }

  //click view file
  clickViewFile(file:any){
    let option = new DialogModel();
      option.FormModel = this.formModel;
      option.IsFull = true;
      option.zIndex = 999;
      this.callFuc.openForm(
        ViewFileDialogComponent,
        '',
        0,
        0,
        '',
        file,
        '',
        option
      );
  }
}
