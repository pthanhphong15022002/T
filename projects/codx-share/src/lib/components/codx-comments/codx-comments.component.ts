import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { Post } from '@shared/models/post';
import { CacheService, ApiHttpService, AuthService, NotificationsService, CallFuncService, Util, DialogModel, AuthStore } from 'codx-core';
import { environment } from 'src/environments/environment';
import { CodxShareService } from '../../codx-share.service';
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
  files:any = null;
  fileDelete:any = null;
  checkVoted = false
  iCons: any;
  edit:boolean = false;
  date = new Date();
  grvWP:any = null;
  REFERTYPE = {
    IMAGE: "image",
    VIDEO: "video",
    APPLICATION :'application'
  }
  constructor(
    private api:ApiHttpService,
    private auth:AuthStore,
    private cache: CacheService,
    private callFuc: CallFuncService,
    private notifySvr:NotificationsService,
    private codxShareSV:CodxShareService,
    private dt:ChangeDetectorRef
  )
  {
    this.user = this.auth.get();
  }
  ngOnInit(): void {
    this.cache.valueList('L1480').subscribe((res) => {
      if (res) {
        this.iCons = res.datas;
      }
    });
    if(!this.new)
    {
      this.message = this.data.content;
      this.getFileByObjectID();
    }
    this.getGrvetup();
  }
  // get gridview set up WP_Comments
  getGrvetup(){
    this.cache.gridViewSetup("Comments","grvComments").subscribe((grv:any) => {
      if(grv){
        this.grvWP = grv;
      }
    })
  }
  // get file by objectID
  getFileByObjectID(){
    this.api.execSv(
      "DM","ERM.Business.DM",
      "FileBussiness",
      "GetFilesByIbjectIDAsync",
      this.data.recID)
    .subscribe((res:any[]) => {
      if(res.length > 0){
        let _file = res[0];
        if(_file.referType == this.REFERTYPE.IMAGE)
        {
          _file["source"] = this.codxShareSV.getThumbByUrl(_file.url,150);
        }
        else if(_file.referType == this.REFERTYPE.IMAGE){
          _file["source"] = `${environment.urlUpload}`+"/"+_file.url; 
        }
        this.files = _file; 
        this.dt.detectChanges();
    }});
  }
  // value change
  valueChange(value:any){
    let _text = value.data;
    if(_text){
      this.message = _text;
    }
  }
  // send comment
  sendComment(){
    if (!this.message.trim() && !this.files) {
      this.notifySvr.notifyCode('SYS009',0,this.grvWP['Comments']['headerText']);
      return;
    }
    let comment = new Post();
    let parent = this.new ? this.post : null;
    comment = this.data ? this.data : new Post();
    comment.content = this.message;
    comment.refType = "WP_Comments";
    comment.refID = this.refID;
    comment.parentID = this.parentID ? this.parentID : comment.refID;
    this.api
      .execSv<any>(
        'WP',
        'ERM.Business.WP',
        'CommentsBusiness',
        'PublishCommentAsync',
        [comment,parent])
      .subscribe((res) => {
        if (res) 
        {
          if(this.edit)
          { // update
            this.data = JSON.parse(JSON.stringify(res));
            this.new = !this.new;
            if(this.fileDelete)
            {
              this.api.execSv(
              "DM",
              "ERM.Business.DM",
              "FileBussiness",
              "DeleteByObjectIDAsync",
              [this.data.recID, 'WP_Comments', true])
              .subscribe();
            }
            if(this.files)
            {
              let _arrFiles = [];
              _arrFiles.push(this.files);
              this.codxATM.objectId = res.recID;
              this.codxATM.fileUploadList = JSON.parse(JSON.stringify(_arrFiles));
              this.codxATM.objectType = this.objectType;
              this.codxATM.saveFilesMulObservable()
              .subscribe((result:any)=>{
                if(result){
                  this.date = new Date();
                  this.files = result.data;
                  this.dt.detectChanges();
                  this.evtSendComment.emit(res);
                  this.notifySvr.notifyCode("SYS006");
                }
              });
            }
            this.evtSendComment.emit(res);
            this.dt.detectChanges();
          }
          else
          { // add
            this.message = "";
            if(this.files)
            {
              let _arrFiles = [];
              _arrFiles.push(this.files);
              this.codxATM.objectId = res.recID;
              this.codxATM.fileUploadList = JSON.parse(JSON.stringify(_arrFiles));
              this.codxATM.objectType = this.objectType;
              this.codxATM.saveFilesMulObservable()
              .subscribe((res2) => {
                this.date = new Date();
                  this.files = null;
                  this.dt.detectChanges();
                  this.evtSendComment.emit(res);
                  this.notifySvr.notifyCode("WP034");
              });
            }
            else
            {
              this.evtSendComment.emit(res);
              this.notifySvr.notifyCode("WP034");
              this.dt.detectChanges();
            }
          }
        }
        else 
        {
          this.notifySvr.notifyCode("SYS023");
        }
      });
  }
  //edit comment
  editComment(){
    this.edit = true;
    this.new = true;
    this.message = this.data.content;
    this.data.isEditComment = true;
    this.dt.detectChanges();
  }
  //delete comment
  deleteComment(){
    this.notifySvr.alertCode('WP032')
    .subscribe((res) => {
      if (res.event.status == "Y") {
        this.api.execSv(
          "WP", 
          "ERM.Business.WP", 
          "CommentsBusiness", 
          "DeleteCommentAsync", 
          [this.data])
          .subscribe((res:any[]) => {
            if(res[0])
              this.evtDeleteComment.emit(res[1]);
            else
              this.notifySvr.notifyCode("SYS022");
          });
      }
    });
  }
  //load sub comment
  loadSubComment(){
    this.data.totalSubComment  = 0 ;
    this.evtLoadSubComment.emit(this.data);
  }
  // click upload
  uploadFile(){
    this.codxATM.uploadFile();
  }
  // attachement return file
  getFileCount(files:any){
    let _file = files.data[0];
    if(_file){
      if(_file.mimeType.indexOf("image") >= 0 ){
        _file['referType'] = this.REFERTYPE.IMAGE;
        _file['source'] = _file.avatar;

      }
      else if(_file.mimeType.indexOf("video") >= 0)
      {
        _file['referType'] = this.REFERTYPE.VIDEO;
        _file['source'] = _file.data;
      }
      else{
        _file['referType'] = this.REFERTYPE.APPLICATION;
      }
      this.files = _file;
      this.dt.detectChanges();
    }
  }
  //remove file
  removeFile(){
    this.fileDelete = JSON.parse(JSON.stringify(this.files));
    this.files = null;
    this.dt.detectChanges();
  }
  //reply
  replyTo(data) {
    this.evtReplyTo.emit(data);
  }
  //vote 
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
  // show vote
  showVotes(data: any) {
    let object = {
      data: data,
      entityName: "WP_Comments",
      vll: this.dVll
    }
    this.callFuc.openForm(PopupVoteComponent, "", 750, 500, "", object);
  }
  //click view detail
  clickViewDetail(file:any){
    if(this.evtViewDetail)
    {
      this.evtViewDetail.emit(file);
    }
  }

}
