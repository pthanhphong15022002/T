import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { WPService } from '@core/services/signalr/apiwp.service';
import { SignalRService } from '@core/services/signalr/signalr.service';
import { Post } from '@shared/models/post';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
declare var _;
import { ApiHttpService, AuthService, CacheService, CallFuncService, NotificationsService } from 'codx-core';
import { PopupVoteComponent } from './popup-vote/popup-vote.component';
import { AttachmentComponent } from '../attachment/attachment.component';
import { ImageGridComponent } from '../image-grid/image-grid.component';
@Component({
  selector: 'treeview-comment',
  templateUrl: './treeview-comment.component.html',
  styleUrls: ['./treeview-comment.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TreeviewCommentComponent implements OnInit {
  @Input() funcID:string;
  @Input() objectID:string;
  @Input() objectType:string;
  @Input() formModel:any;
  @Input() rootData: any;
  @Input() dataComment: any;
  @Output() pushComment = new EventEmitter;
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
  constructor(
    private dt: ChangeDetectorRef,
    private signalRApi: WPService,
    private cache: CacheService,
    private api: ApiHttpService,
    private auth: AuthService,
    private notifySvr: NotificationsService,
    private callFuc: CallFuncService,
  ) {
    
  }

  ngOnInit(): void {
    this.user = this.auth.userValue;
    this.getValueIcon();
    // this.getDataComment();
  }

  getValueIcon(){
    this.cache.valueList("L1480").subscribe((res) => {
      if (res) {
        this.vllL1480 = res.datas;
      }
    });
  }
  lstComment:any[] = [];
  getDataComment(){ 
    this.api.execSv
    ("WP",
    "ERM.Business.WP",
    "CommentsBusiness",
    "GetCommentsByOjectIDAsync",[this.objectID, this.pageIndex])
    .subscribe((res:any[]) => {
      if(res){
        this.lstComment = res[0];
        console.log(res);
        this.dt.detectChanges();
      }
    })
  }

  showVotes(data: any) {
    this.callFuc.openForm(PopupVoteComponent, "", 750, 500, "", data);
  }
  getUserVotes(postID: string, voteType: String) {
    this.api.execSv("WP", "ERM.Business.WP", "VotesBusiness", "GetUserVotesAsync", [postID, voteType])
      .subscribe((res) => {
        this.lstUserVote = res;
        this.dt.detectChanges();
      })
  }
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

  replyTo(data) {
    data.showReply = !data.showReply;
    this.dt.detectChanges();
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

  showComments(data: any) {
    data.isShowComment = !data.isShowComment;
    this.dt.detectChanges();
    if(data.isShowComment){
      this.getDataComment();
    }
  }
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

  setDicData(data) {
    this.dicDatas[data["recID"]] = data;
  }
  setNodeTree(newNode: any) {
    if (!newNode) return;
    var id = newNode["recID"],
      parentId = newNode["refID"];

    this.dicDatas[id] = newNode;
    var t = this;
    var parent = this.dicDatas[parentId];
    if (parent) {
      this.addNode(parent, newNode, id);
    } else {
      this.addNode(this.dataComment, newNode, id);
    }

    this.dt.detectChanges();
  }

  addNode(dataNode: any, newNode: any, id: string) {
    var t = this;
    if (!dataNode) {
      dataNode = [newNode];
    } else {
      var idx = -1;
      if (!dataNode.listComment) {
        dataNode.listComment = [];
      }
      else {
        dataNode.listComment.forEach(function (element: any, index: any) {
          if (element["recID"] == id) {
            idx = index;
            return;
          }
        });
      }
      if (idx == -1) {
        if (dataNode.length == 0)
          dataNode.push(newNode);
        else
          dataNode.listComment.push(newNode);
      }
      else {
        var obj = dataNode[idx];
        newNode.listComment = obj.listComment;
        dataNode[idx] = newNode;
      }
    }
  }

  removeNodeTree(id: string) {
    if (!id) return;
    var data = this.dicDatas[id],
      parentId = data["refID"];
    if (data) {
      var t = this;
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


  deleteComment(event: any) {
    this.removeNodeTree(event.data.recID);
    this.dataComment.totalComment = this.dataComment.totalComment - event.total;
    if(this.dataComment.totalComment < 0){
      this.dataComment.totalComment = 0;
    }
    this.dt.detectChanges();
    this.notifySvr.notifyCode('SYS008');
  }
  clickEditComment(comment: any) {
    comment.isEditComment = true;
    this.dt.detectChanges();
  }

  valueChangeComment(event: any, comment: any) {
    comment.content = event.data
    this.dt.detectChanges();
  }
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

  upLoadFile(){
    this.codxATM.uploadFile();
  }
  fileUpload:any[] = [];
  fileCount(files:any){
    if(files && files.data.length > 0){
      this.fileUpload = files.data;
      this.codxFile.addFiles(this.fileUpload);
      this.dt.detectChanges();
    }
  }

  addFile(files: any) {
    if (this.fileUpload.length == 0) {
      this.fileUpload = files;
    }
    else {
      this.fileUpload.concat(files);
    }
    this.dt.detectChanges();
  }
  removeFile(file: any) {
    this.fileUpload = this.fileUpload.filter((f: any) => { return f.fileName != file.fileName });
    this.dt.detectChanges();
  }
}
