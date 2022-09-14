import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { WPService } from '@core/services/signalr/apiwp.service';
import { Post } from '@shared/models/post';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { CacheService, ApiHttpService, AuthService, NotificationsService, CallFuncService } from 'codx-core';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { environment } from 'src/environments/environment';
import { AttachmentComponent } from '../attachment/attachment.component';
import { CodxFilesComponent } from '../codx-files/codx-files.component';
import { PopupVoteComponent } from '../treeview-comment/popup-vote/popup-vote.component';

@Component({
  selector: 'codx-comments',
  templateUrl: './codx-comments.component.html',
  styleUrls: ['./codx-comments.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CodxCommentsComponent implements OnInit {
  @Input() data :any = null;
  @Input() parentID: string = null;
  @Input() refID: string = null;
  @Input() funcID:string ="";
  @Input() objectID:string ="";
  @Input() objectType:string = "";
  @Input() formModel:any;
  @Input() new:boolean = false;
  @Output() evtReplyTo = new EventEmitter;
  @Output() evtSendComment = new EventEmitter;
  @Output() evtDeleteComment = new EventEmitter;
  @Output() evtLoadSubComment = new EventEmitter;

  //
  @ViewChild('codxATM') codxATM :AttachmentComponent;
  user:any
  message:string ="";
  fileUpload:any = null;
  fileDelete:any = null;
  checkVoted = false
  lstData: any;
  edit:boolean = false;
  REFERTYPE = {
    IMAGE: "image",
    VIDEO: "video",
    APPLICATION :'application'
  }
  constructor(
    private api:ApiHttpService,
    private auth:AuthService,
    private cache: CacheService,
    private callFuc: CallFuncService,
    private notifySvr:NotificationsService,
    private dt:ChangeDetectorRef
  ){}
  ngOnInit(): void {
    this.user = this.auth.userValue;
    this.cache.valueList('L1480').subscribe((res) => {
      if (res) {
        this.lstData = res.datas;
      }
    });
    if(!this.new && this.data){
      this.message = this.data.content;
      this.getFileByObjectID();
    }
  }
  getFileByObjectID(){
    this.api.execSv(
      "DM","ERM.Business.DM",
      "FileBussiness",
      "GetFilesByIbjectIDAsync",
      this.data.recID)
    .subscribe((result:any[]) => {
      if(result.length > 0){
        let file = result[0];
        if(file && file.referType == this.REFERTYPE.VIDEO)
        {
          file['srcVideo'] = `${environment.apiUrl}/api/dm/filevideo/${file.recID}?access_token=${this.user.token}`;
        }
        this.fileUpload = file; 
        this.dt.detectChanges();
    }});
  }
  valueChange(value:any){
    let text = value.data.toString().trim();
    if(text){
      this.message = text;
      this.dt.detectChanges();
    }
  }

  sendComment(){
    if (!this.message.trim() && !this.fileUpload) {
      this.notifySvr.notifyCode('E0315');
      return;
    }
    let tmpPost = new Post()
    if(this.data){
      tmpPost = this.data;
    }
    tmpPost.content = this.message;
    tmpPost.refType = "WP_Comments";
    tmpPost.refID = this.refID;
    if(this.parentID){
      tmpPost.parentID = this.parentID;
    }
    else {
      tmpPost.parentID = tmpPost.refID;
    }
    this.api
      .execSv<any>(
        'WP',
        'ERM.Business.WP',
        'CommentsBusiness',
        'PublishCommentAsync',
        [tmpPost]
      )
      .subscribe(async (res) => {
        if (res) {
          if(this.data && this.edit){ // chỉnh sửa
            this.data = res;
            this.new = !this.new;
            if(this.fileDelete){
              this.api.execSv("DM",
              "ERM.Business.DM",
              "FileBussiness",
              "DeleteByObjectIDAsync",
              [this.data.recID.toString(), 'WP_Comments', true]).subscribe(async (result:any) => {
                if(result)
                {
                  if(this.fileUpload){
                    this.codxATM.objectId = res.recID;
                    let files = [];
                    files.push(this.fileUpload);
                    this.codxATM.fileUploadList = files;
                    this.codxATM.objectType = this.objectType;
                    (await this.codxATM.saveFilesObservable()).subscribe((result:any)=>{
                      if(result){
                        this.fileUpload = result.data;
                        this.dt.detectChanges();
                        this.evtSendComment.emit(res);
                        this.notifySvr.notifyCode("SYS006");
                      }
                    });
                  }
                }
              });
            }
            
          }
          else{ // thêm mới
            if(this.fileUpload){
              this.codxATM.objectId = res.recID;
              let files = [];
              files.push(this.fileUpload);
              this.codxATM.fileUploadList = files;
              this.codxATM.objectType = this.objectType;
              (await this.codxATM.saveFilesObservable()).subscribe((result:any)=>{
                if(result){
                  this.message = "";
                  this.fileUpload = null;
                  this.dt.detectChanges();
                  this.evtSendComment.emit(res);
                  this.notifySvr.notifyCode("SYS006");
                }
              })
            }
            else
            {
              this.message = "";
              this.dt.detectChanges();
              this.evtSendComment.emit(res);
              this.notifySvr.notifyCode("SYS006");
            }
          }
        }
      });
  }

  editComment(){
    this.edit = true;
    this.new = true;
    this.message = this.data.content;
    this.data.isEditComment = true;
    this.dt.detectChanges();
  }

  deleteComment(){
    this.notifySvr.alertCode('Xóa bình luận?').subscribe((res) => {
      if (res.event.status == "Y") {
        this.api.execSv(
          "WP", 
          "ERM.Business.WP", 
          "CommentsBusiness", 
          "DeletePostAsync", 
          this.data).subscribe((res: number) => {if(res) { 
            let obj = {
              data: this.data,
              total: res
            }
            this.evtDeleteComment.emit(obj);
           }});
      }
    });
  }

  loadSubComment(){
    this.data.totalSubComment  = 0 ;
    this.evtLoadSubComment.emit(this.data);
  }
  uploadFile(){
    this.codxATM.uploadFile();
  }

  getFileCount(files:any){
    let file = files.data[0];
    if(file){
      if(file.mimeType.indexOf("image") >= 0 ){
        file['referType'] = this.REFERTYPE.IMAGE;
      }
      else if(file.mimeType.indexOf("video") >= 0)
      {
        file['referType'] = this.REFERTYPE.VIDEO;
      }
      else{
        file['referType'] = this.REFERTYPE.APPLICATION;
      }
      this.fileUpload = file;
      this.dt.detectChanges();
    }
  }

  removeFile(){
    this.fileDelete = this.fileUpload;
    this.fileUpload = null;
    this.dt.detectChanges();
  }

  replyTo(data) {
    this.evtReplyTo.emit(data);
  }

  votePost(data: any, voteType = null) {
    this.api.execSv(
      "WP",
      "ERM.Business.WP",
      "VotesBusiness",
      "VotePostAsync",
      [data.recID, voteType])
      .subscribe((res: any) => {
        if (res) {
          data.votes = res[0];
          data.totalVote = res[1];
          data.listVoteType = res[2];
          if (voteType == data.myVotedType) {
            data.myVotedType = null;
            data.myVoted = false;
            this.checkVoted = false;
          }
          else {
            data.myVotedType = voteType;
            data.myVoted = true;
            this.checkVoted = true;
          }
          this.dt.detectChanges();
        }

      });
  }
  showVotes(data: any) {
    this.callFuc.openForm(PopupVoteComponent, "", 750, 500, "", data);
  }
}
