import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { WPService } from '@core/services/signalr/apiwp.service';
import { ApiHttpService, AuthService, CacheService, CallFuncService, DialogModel, FormModel, NotificationsService } from 'codx-core';
import { PopupVoteComponent } from './popup-vote/popup-vote.component';
import { AttachmentComponent } from '../attachment/attachment.component';
import { ImageGridComponent } from '../image-grid/image-grid.component';
import { ViewFileDialogComponent } from '../viewFileDialog/viewFileDialog.component';
import { CodxShareService } from '../../codx-share.service';
import { PopupDetailComponent } from 'projects/codx-wp/src/lib/dashboard/home/list-post/popup-detail/popup-detail.component';
@Component({
  selector: 'treeview-comment',
  templateUrl: './treeview-comment.component.html',
  styleUrls: ['./treeview-comment.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TreeviewCommentComponent implements OnInit {
  @Input() funcID:string = "";
  @Input() objectID:string = "";
  @Input() objectType:string = "";
  @Input() formModel:FormModel = null;
  @Input() rootData: any = null;
  @Input() dataComment: any = null;
  @Output() pushComment = new EventEmitter;
  @Output() voteCommentEvt = new EventEmitter;


  @ViewChild('codxATM') codxATM :AttachmentComponent;
  @ViewChild('codxFile') codxFile : ImageGridComponent;

  data:any = null;
  pageIndex:number = 0 ;
  crrId = '';
  checkValueInput = false;
  lstData: any;
  lstUserVoted: any;
  countVote_Like: number;
  countVote_Amazing: number;
  countVote_Happy: number;
  countVote_Sad: number;
  countVote_Angry: number;
  votedTypeUpdated: string;
  pennant = 0;
  checkVoted = false;
  comments = "";
  repComment = "";
  dicDatas = {};
  user: any;
  votes: any;
  lstUserVote: any;
  dataSelected: any[];
  vllL1480:any = null;
  dVll: any = {};
  totalComment:number = 0;

  constructor(
    private dt: ChangeDetectorRef,
    private cache: CacheService,
    private api: ApiHttpService,
    private auth: AuthService,
    private notifySvr: NotificationsService,
    private callFuc: CallFuncService,

  ) {
    this.user = this.auth.userValue;
    
  }

  ngOnInit(): void {
    this.getValueIcon();
    this.getDataComment();
  }
  // get vll icon
  getValueIcon(){
    this.cache.valueList("L1480").subscribe((res) => {
      if (res) {
        this.vllL1480 = res.datas as any[];
        if(this.vllL1480.length > 0){
          this.dVll["0"] = null;
          this.vllL1480.forEach(element => {
            this.dVll[element.value + ""] = element;
          });
        }
      }
    });
  }
  // get total comment
  getDataComment(){ 
    if(this.objectID){
      this.api.execSv
      ("WP",
      "ERM.Business.WP",
      "CommentsBusiness",
      "GetCommentsByOjectIDAsync",
      [this.objectID, this.pageIndex])
      .subscribe((res:any[]) => {
        if(res){
          this.dataComment.listComment = res[0];
          this.totalComment = res[1];
          this.dt.detectChanges();
        }
      });
    } 
    
  }
  // click show votes
  showVotes(data: any) {
    let object = {
      data: data,
      entityName: "WP_Comments",
      vll: this.dVll
    }
    this.callFuc.openForm(PopupVoteComponent, "", 750, 500, "", object);
  }
  // get user votes
  getUserVotes(postID: string, voteType: String) {
    this.api.execSv("WP", "ERM.Business.WP", "VotesBusiness", "GetUserVotesAsync", [postID, voteType])
      .subscribe((res) => {
        this.lstUserVote = res;
        this.dt.detectChanges();
      })
  }
  //reploy comment
  replyComment(post: any, value: any) {
    if (!value.trim()) {
      this.notifySvr.notifyCode('E0315');
      return;
    }
    if (post.recID) {
      var type = "WP_Comments";
      this.api
        .execSv<any>(
          'WP',
          'ERM.Business.WP',
          'CommentsBusiness',
          'PublishCommentAsync',
          [post.recID, value, this.dataComment.recID, type]
        )
        .subscribe((res) => {
          if (res) {
            this.dataComment.totalComment += 1;
            this.comments = "";
            this.repComment = "";
            post.showReply = false;
            this.crrId = "";
            this.setNodeTree(res);
            this.dt.detectChanges();
          }
        });
    }
  }
  // send comment
  sendComment(event:any,data:any = null){
    this.comments = "";
    this.repComment = "";
    this.dataComment.totalComment += 1;
    event.showReply = false;
    if(data){
      data.showReply = false;
    }
    this.crrId = "";
    this.dicDatas[event["recID"]] = event;
    this.setNodeTree(event);
    this.dt.detectChanges();
  }
  // reply to
  replyTo(data) {
    data.showReply = !data.showReply;
    this.dt.detectChanges();
  }
  votePostEmit(event:any){
    if(event)
    {
      this.voteCommentEvt.emit();
    }
  }
  // votes post
  votePost(data: any, voteType = null) {
    if(data && voteType){
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
  }
  //voet comment
  voteComment(data: any) {
    if (!data.recID) return;
    this.api
      .execSv<any>(
        'WP',
        'ERM.Business.WP',
        'VotesBusiness',
        'VotePostAsync',
        [data.recID, "1"]
      )
      .subscribe((res) => {
        if (res) {
          data.myVoted = true;
          data.totalVote += 1;
          this.dt.detectChanges();
        }
      });
  }
  // load subcomment
  loadSubComment(data:any) {
    data.isShowComment = !data.isShowComment;
    data.totalSubComment  = 0 ;
    this.api.execSv(
      'WP',
      'ERM.Business.WP',
      'CommentsBusiness',
      "GetSubCommentAsync",
      [data.recID, 0]
    ).subscribe((res: any[]) =>
      {
        if(res){
          res.map((e:any) => {this.setNodeTree(e)});
        }
      })
  }
  // click show comment
  showComments(data: any) {
    this.dataComment.isShowComment = !this.dataComment.isShowComment;
    this.dt.detectChanges();
    if(this.dataComment.isShowComment){
      this.getDataComment();
    }
  }
  // value change
  valueChange(value: any, type) {
    var text = value.data.toString().trim();
    if (text) {
      if (type == "comments") {
        this.comments = text;
      }
      else {
        this.repComment = text;
      }
      this.dt.detectChanges();
    }
  }
  //set tree
  setDicData(data) {
    this.dicDatas[data["recID"]] = data;
  }
  //check node
  setNodeTree(newNode: any) {
    if (!newNode) return;
    let id = newNode["recID"],
      parentId = newNode["refID"];
    this.dicDatas[id] = newNode;
    let parent = this.dicDatas[parentId];
    if (parent)
      this.addNode(parent, newNode, id);
    else
      this.addNode(null, newNode, id);
    this.dt.detectChanges();
  }
  // add tree
  addNode(dataNode: any, newNode: any, id: string) {
    let idx = -1;
    let node = null;
    if(dataNode)
    {
      if(!dataNode.listComment || dataNode.listComment.length == 0){
        dataNode.listComment = [];
      }
      else
      {
        node =  dataNode.listComment.find((e:any) => {
          return e["recID"] == id;
        });
      }
      if (node) 
      {
        newNode.listComment = node.listComment;
        dataNode[idx] = newNode;
      }
      else 
      {
        dataNode.listComment.push(newNode);
      }
    }
    else {
      this.dataComment.listComment.push(newNode);
    }
    this.dt.detectChanges();   
  }
  //remove tree
  removeNodeTree(id: string) {
    if (!id) return;
    var data = this.dicDatas[id],
      parentId = data["refID"];
    if (data) {
      var parent = this.dicDatas[parentId];
      if (parent) {
        parent.listComment = parent.listComment.filter(function (element: any, index: any) {
          return element["recID"] != id;
        });
      } else {
        if (!this.dataComment) return;
        this.dataComment.listComment = this.dataComment.listComment.filter(function (element: any, index: any) {
          return element["recID"] != id;
        });
      }
      delete this.dicDatas[id];
    }
    this.dt.detectChanges();
  }

  // delete comment
  deleteComment(event: any) {
    this.removeNodeTree(event.data.recID);
    this.dataComment.totalComment -= event;
    if(this.dataComment.totalComment < 0)
      this.dataComment.totalComment = 0;
    this.notifySvr.notifyCode('SYS008');
    this.dt.detectChanges();
  }
  //click edit comment
  clickEditComment(comment: any) {
    comment.isEditComment = true;
    this.dt.detectChanges();
  }
  // value change
  valueChangeComment(event: any, comment: any) {
    comment.content = event.data
    this.dt.detectChanges();
  }
  //edit comment
  editComment(value: string, comment: any) {
    comment.content = value;
    this.api.execSv(
      "WP",
      "ERM.Business.WP",
      "CommentsBusiness",
      "UpdateCommentPostAsync",
      [comment.recID, value])
      .subscribe((res: boolean) => {
        if (res) {
          comment.isEditComment = false;
          this.notifySvr.notifyCode("SYS007");
          this.dt.detectChanges();
        }
        else {
          this.notifySvr.notifyCode("SYS021");
        }
      })
  }
  //upload file
  upLoadFile(){
    this.codxATM.uploadFile();
  }
  //attachment return
  fileUpload:any[] = [];
  fileCount(files:any){
    if(files && files.data.length > 0){
      this.fileUpload = files.data;
      this.codxFile.addFiles(this.fileUpload);
      this.dt.detectChanges();
    }
  }
  // add file
  addFile(files: any) {
    if (this.fileUpload.length == 0) {
      this.fileUpload = files;
    }
    else {
      this.fileUpload.concat(files);
    }
    this.dt.detectChanges();
  }
  // remove file
  removeFile(file: any) {
    this.fileUpload = this.fileUpload.filter((f: any) => { return f.fileName != file.fileName });
    this.dt.detectChanges();
  }
  // view file
  clickViewDetailComment(file:any){
    if(file){
      // let dialog = new DialogModel();
      // dialog.FormModel = this.formModel;
      // dialog.IsFull = true;
      // this.callFuc.openForm(ViewFileDialogComponent,"",0,0,"",file,"",dialog);
      if (file) {
        let _data = {
          objectID:file.objectID,
          recID:file.recID,
          referType:file.referType
        };
        let option = new DialogModel();
        option.FormModel = this.formModel;
        option.IsFull = true;
        option.zIndex = 999;
        this.callFuc.openForm(
          PopupDetailComponent,
          '',
          0,
          0,
          '',
          _data,
          '',
          option
        );
      }
    }
  }
}
