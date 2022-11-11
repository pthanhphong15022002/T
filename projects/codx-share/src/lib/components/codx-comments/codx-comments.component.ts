import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { Post } from '@shared/models/post';
import { CacheService, ApiHttpService, AuthService, NotificationsService, CallFuncService, Util, DialogModel } from 'codx-core';
import { environment } from 'src/environments/environment';
import { AttachmentComponent } from '../attachment/attachment.component';
import { PopupVoteComponent } from '../treeview-comment/popup-vote/popup-vote.component';

@Component({
  selector: 'codx-comments',
  templateUrl: './codx-comments.component.html',
  styleUrls: ['./codx-comments.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CodxCommentsComponent implements OnInit {
  @Input() data :any = null;
  @Input() post:any = null;
  @Input() parentID: string = null;
  @Input() refID: string = null;
  @Input() funcID:string ="";
  @Input() objectID:string ="";
  @Input() objectType:string = "";
  @Input() formModel:any;
  @Input() new:boolean = false;
  @Input() dVll: any = {};
  @Output() evtReplyTo = new EventEmitter;
  @Output() evtSendComment = new EventEmitter;
  @Output() evtDeleteComment = new EventEmitter;
  @Output() evtLoadSubComment = new EventEmitter;
  @Output() evtViewDetail = new EventEmitter;
  //
  @ViewChild('codxATM') codxATM :AttachmentComponent;
  user:any
  message:string ="";
  fileUpload:any = null;
  fileDelete:any = null;
  checkVoted = false
  lstData: any;
  edit:boolean = false;
  date = new Date();
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
    let comment = new Post()
    if(this.data){
      comment = this.data;
    }
    comment.content = this.message;
    comment.refType = "WP_Comments";
    comment.refID = this.refID;
    if(this.parentID){
      comment.parentID = this.parentID;
    }
    else 
    {
      comment.parentID = comment.refID;
    }
    let parent = this.new ? this.post:null;
    this.api
      .execSv<any>(
        'WP',
        'ERM.Business.WP',
        'CommentsBusiness',
        'PublishCommentAsync',
        [comment,parent]
      )
      .subscribe(async (res) => {
        if (res) 
        {
          if(this.data && this.edit)
          { // update
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
                        debugger;
                        this.date = new Date();
                        this.fileUpload = result.data;
                        this.dt.detectChanges();
                        this.evtSendComment.emit(res);
                        this.notifySvr.notifyCode("SYS006");
                      }
                    });
                  }
                }
                else
                {
                  let fileName = this.fileUpload.fileName;
                  this.cache.message("DM006").subscribe((mssg:any) =>{
                    if(mssg && mssg.defaultName){
                      let strMssg = Util.stringFormat(mssg.defaultName,fileName);
                      this.notifySvr.notify(strMssg);
                    }
                  });
                  this.evtSendComment.emit(res);
                  this.dt.detectChanges();
                }
              });
            }
            
          }
          else
          { // add
            debugger;
            this.message = "";
            if(this.fileUpload){
              this.codxATM.objectId = res.recID;
              let files = [];
              files.push(this.fileUpload);
              this.codxATM.fileUploadList = files;
              this.codxATM.objectType = this.objectType;
              this.cache.message("DM006").subscribe((mssg:any) =>{
                if(mssg && mssg.defaultName)
                {
                  let strMssg = Util.stringFormat(mssg.defaultName,this.fileUpload);
                  console.log(strMssg);
                }
              });
              (await this.codxATM.saveFilesObservable()).subscribe((result:any)=>{
                if(result){
                  this.date = new Date();
                  this.fileUpload = null;
                  this.dt.detectChanges();
                  this.evtSendComment.emit(res);
                  this.notifySvr.notifyCode("WP034");
                }
                else
                {
                  let fileName = this.fileUpload.fileName;
                  this.cache.message("DM006").subscribe((mssg:any) =>{
                    if(mssg && mssg.defaultName){
                      let strMssg = Util.stringFormat(mssg.defaultName,fileName);
                      this.notifySvr.notify(strMssg);
                    }
                  });
                  this.evtSendComment.emit(res);
                  this.dt.detectChanges();
                }
              });
            }
            else
            {
              this.dt.detectChanges();
              this.evtSendComment.emit(res);
              this.notifySvr.notifyCode("WP034");
            }
          }
        }
        else 
        {
          this.notifySvr.notifyCode("SYS023");
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
    this.notifySvr.alertCode('WP032').subscribe((res) => {
      if (res.event.status == "Y") {
        this.api.execSv(
          "WP", 
          "ERM.Business.WP", 
          "CommentsBusiness", 
          "DeletePostAsync", 
          this.data).subscribe((res: number) => {
            if(res) 
            { 
              let obj = {
                data: this.data,
                total: res
              }
              this.evtDeleteComment.emit(obj);
            }
            else
            {
              this.notifySvr.notifyCode("SYS022");
            }
          });
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
      [data, voteType])
      .subscribe((res: any) => {
        if (res) {
          data.votes = res[0];
          data.totalVote = res[1];
          data.listVoteType = res[2];
          if (voteType == data.myVoteType) {
            data.myVoteType = null;
            data.myVoted = false;
            this.checkVoted = false;
          }
          else {
            data.myVoteType = voteType;
            data.myVoted = true;
            this.checkVoted = true;
          }
          this.dt.detectChanges();
        }

      });
  }
  showVotes(data: any) {
    let object = {
      data: data,
      entityName: "WP_Comments",
      vll: this.dVll
    }
    this.callFuc.openForm(PopupVoteComponent, "", 750, 500, "", object);
  }


  clickViewDetail(file:any){
    if(this.evtViewDetail){
      this.evtViewDetail.emit(file);
    }
  }

}
