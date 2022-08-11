import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { WPService } from '@core/services/signalr/apiwp.service';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { CacheService, ApiHttpService, AuthService, NotificationsService, CallFuncService } from 'codx-core';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
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

  @Input() funcID:string;
  @Input() objectType:string;
  @Input() formModel:any;
  @Input() rootData: any;
  @Output() pushComment = new EventEmitter;
  @ViewChild('codxATM') codxATM: AttachmentComponent;

  fileUpload:any[] = [];
  lstData: any;
  lstUserVoted: any;
  checkVoted = false;
  comments = "";
  repComment = "";
  dicDatas = {};
  user: any;
  votes: any;
  lstUserVote: any;
  dataSelected: any[];
  attachement?: AttachmentComponent;
  codxFile?: CodxFilesComponent;
  constructor(
    private dt: ChangeDetectorRef,
    private cache: CacheService,
    private api: ApiHttpService,
    private auth: AuthService,
    private notifySvr: NotificationsService,
    private callFuc: CallFuncService,
    private dmSV:CodxDMService
  ) {
    
  }

  ngOnInit(): void {
    console.log(this.rootData)
    this.user = this.auth.userValue;
    this.cache.valueList('L1480').subscribe((res) => {
      if (res) {
        this.lstData = res.datas;
      }
    });
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
    // if (!value.trim() ) {
    //   this.notifySvr.notifyCode('E0315');
    //   return;
    // }
    if (post.recID) {
      var type = "WP_Comments";
      this.api
        .execSv<any>(
          'WP',
          'ERM.Business.WP',
          'CommentsBusiness',
          'PublishCommentAsync',
          [post.recID, value, this.rootData.recID, type]
        )
        .subscribe((res) => {
          if (res) {
            if(this.codxFile?.fileUpload.length > 0){
              this.codxFile.objectID = res.recID;
              this.codxFile.saveFiles().subscribe((result:any)=>{
                if(result){
                    this.comments = "";
                    this.repComment = "";
                    this.rootData.totalComment += 1;
                    post.showReply = false;
                    this.dicDatas[res["recID"]] = res;
                    this.codxFile.fileUpload = [];
                    this.setNodeTree(res);
                    this.dt.detectChanges();
                    this.notifySvr.notifyCode("SYS006");

                    }
              })
            }
            else{
              this.rootData.totalComment += 1;
            this.comments = "";
            this.repComment = "";
            post.showReply = false;
            this.setNodeTree(res);
            this.dt.detectChanges();
            this.notifySvr.notifyCode("SYS006");

            } 
          }
        });
    }
  }
  sendComment(post: any, value: any) {
    // if (!value.trim()) {
    //   this.notifySvr.notifyCode('E0315');
    //   return;
    // }
      var type = "WP_Comments";
      this.api
        .execSv<any>(
          'WP',
          'ERM.Business.WP',
          'CommentsBusiness',
          'PublishCommentAsync',
          [post.recID, value, post.recID, type]
        )
        .subscribe((res) => {
          if (res) {
            if(this.codxFile?.fileUpload?.length > 0){
              this.codxFile.objectID = res.recID;
              this.codxFile.saveFiles().subscribe((result:any)=>{
                if(result){
                    this.comments = "";
                    this.repComment = "";
                    this.rootData.totalComment += 1;
                    post.showReply = false;
                    this.dicDatas[res["recID"]] = res;
                    this.codxFile.fileUpload = [];
                    this.setNodeTree(res);
                    this.dt.detectChanges();
                    this.notifySvr.notifyCode("SYS006");
                    }
              })
            }
            else{
              this.comments = "";
              this.repComment = "";
              this.rootData.totalComment += 1;
              post.showReply = false;
              this.dicDatas[res["recID"]] = res;
              this.setNodeTree(res);
              this.dt.detectChanges();
              this.notifySvr.notifyCode("SYS006");

            }
          }
        });
    
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
  loadSubComment(data) {
    data.isShowComment = !data.isShowComment;
    this.api.execSv(
      'WP',
      'ERM.Business.WP',
      'CommentsBusiness',
      "GetSubCommentAsync",
      [data.recID, 0]
    ).subscribe((res: any) => {
      res.map(p => {
        this.setNodeTree(p);
      })
      this.dt.detectChanges();
    })
  }
  showComments(post: any) {
    if (post.isShowComment) {
      post.isShowComment = false;
    }
    else {
      post.isShowComment = true;
    }
    this.dt.detectChanges();
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
      this.addNode(this.rootData, newNode, id);
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
        if (!this.rootData) return;
        this.rootData.listComment = this.rootData.listComment.filter(function (element: any, index: any) {
          return element["recID"] != id;
        });
      }

      delete this.dicDatas[id];
    }
    this.dt.detectChanges();
  }
  deleteComment(data: any) {
    if (!data) return;
    else {
      this.notifySvr.alertCode('Xóa bình luận?').subscribe((res) => {
        if (res.event.status == "Y") {
          this.api.execSv("WP", 
          "ERM.Business.WP",
           "CommentsBusiness",
           "DeletePostAsync", 
           data).subscribe((res: number) => 
           {
              if (res) {
                this.removeNodeTree(data.recID);
                this.rootData.totalComment = this.rootData.totalComment - res;
                this.notifySvr.notifyCode('SYS008');
              }
            });
        }
      });
    }
  }
  clickEditComment(data: any) {
    data.isEditComment = !data.isEditComment;
    this.dt.detectChanges();
  }
  valueChangeComment(event: any, data: any) {
    data.content = event.data
    this.dt.detectChanges();
  }
  editComment(value: string, data: any) {
    data.content = value;
    this.api.execSv(
      "WP",
      "ERM.Business.WP",
      "CommentsBusiness",
      "UpdateCommentPostAsync",
      [data.recID, value])
      .subscribe((res: boolean) => {
        if (res) {
          data.isEditComment = false;
          this.notifySvr.notifyCode("SYS007");
          this.dt.detectChanges();
        }
        else {
          this.notifySvr.notifyCode("SYS021");
        }
      })
  }


  upLoadFile(){
    this.attachement.uploadFile();
  }
  getFileCount(event:any){
    if(event.data.length > 0){
      this.fileUpload = event.data;
      this.dt.detectChanges();
    }
  }

  getFile(event:any,data:any){
    data.files = event;
  }
  fileAfterInit(event: any){
    this.attachement = event.codxATM;
    this.codxFile = event.codxFile;
  }

  getFileUpload(event:any){
    if(this.codxFile){
      this.codxFile.fileUpload = event;
    }
  }
}
