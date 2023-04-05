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
import { ApiHttpService, AuthService, CacheService, CallFuncService, DialogModel, FormModel, NotificationsService } from 'codx-core';
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
  @Input() data:any = null;
  @Input() funcID:string = "";
  @Input() objectID:string = "";
  @Input() objectType:string = "";
  @Input() formModel:FormModel = null;
  @Output() pushComment = new EventEmitter;
  @Output() voteCommentEvt = new EventEmitter;
  @ViewChild('codxATM') codxATM :AttachmentComponent;
  @ViewChild('codxFile') codxFile : ImageGridComponent;
  
  

  crrId = '';
  checkVoted = false;
  comments = "";
  repComment = "";
  dicDatas = {};
  user: any;
  votes: any;
  lstUserVote: any;
  dVll: any = {};
  totalComment:number = 0;
  vllL1480:any[] = [];
  constructor(
    private dt: ChangeDetectorRef,
    private cache: CacheService,
    private api: ApiHttpService,
    private auth: AuthService,
    private notifySvr: NotificationsService,
    private callFuc: CallFuncService,

  ) 
  {
    this.user = this.auth.userValue;
  }

  ngOnInit(): void {
    this.getCommentsAsync();
    this.getValueIcon();
  }
  // get vll icon
  getValueIcon(){
    this.cache.valueList("L1480")
    .subscribe((res) => {
      if(Array.isArray(res.datas)) {
        this.vllL1480 = Array.from<any>(res.datas);
        if(this.vllL1480.length > 0){
          this.dVll["0"] = null;
          this.vllL1480.forEach(element => {
            this.dVll[element.value + ""] = element;
          });
        }
      }
    });
  }
  // get comment
  pageIndex:number = 1 ;
  totalPage:number = 0;
  pageSize:number = 10;
  getCommentsAsync(scrolled:boolean = false){ 
    if(scrolled){
      this.pageIndex++;
      if(this.pageIndex > this.totalPage){
        return
      }
    }
    this.api.execSv(
      "WP",
      "ERM.Business.WP",
      "CommentsBusiness",
      "GetCommentsAsync",
      [this.data.recID, this.pageIndex,true])
      .subscribe((res:any[]) => {
        if(res && res[0].length > 0){
          if(scrolled)
          {
            this.data.listComment = this.data.listComment.concat(res[0]);
          }
          else
          {
            this.totalPage = Math.ceil(res[1]/this.pageSize);
            this.data.listComment = res[0];
          }
          this.dt.detectChanges();
        }
      });
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
          [post.recID, value, this.data.recID, type]
        )
        .subscribe((res) => {
          if (res) {
            this.data.totalComment += 1;
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
    this.data.totalComment += 1;
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
  }
  votePostEmit(event:any){
    this.voteCommentEvt.emit();
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
    data.isShowComment = true;
    this.api.execSv(
      'WP',
      'ERM.Business.WP',
      'CommentsBusiness',
      "GetSubCommentAsync",
      [data.recID])
      .subscribe((res: any[]) =>{
        if(res){
          data.listComment = res;
          res.map((e:any) => {this.setNodeTree(e)});
          this.dt.detectChanges();
        }
      })
  }
  // click show comment
  showComments() {
    this.data.isShowComment = !this.data.isShowComment;
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
    {
      this.addNode(null, newNode, id);

    }
    this.dt.detectChanges();
  }
  // add tree
  addNode(dataNode: any, newNode: any, id: string) {
    debugger
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
        dataNode.listComment.unshift(newNode);
      }
    }
    else 
    {
      if(!Array.isArray(this.data.listComment)){
        this.data.listComment = [];
      }
      this.data.listComment.unshift(newNode);
    }
    this.dt.detectChanges();   
  }
  //remove tree
  removeNodeTree(id: string) {
    if (!id) return;
    var data = this.dicDatas[id]
    var parentId = data["refID"];
    if (data) {
      var parent = this.dicDatas[parentId];
      if (parent)
        parent.listComment = parent.listComment.filter((element: any) => element["recID"] != id);
      else 
        this.data.listComment = this.data.listComment.filter((element: any) => element["recID"] != id);
      delete this.dicDatas[id];
    }
    this.dt.detectChanges();
  }

  // delete comment
  deleteComment(data: any) {
    if(data?.recID){
      this.removeNodeTree(data.recID);
      this.getTotalComment();
    }
  }
  //get total comment
  getTotalComment(){
    this.api.execSv(
      "WP",
      "ERM.Business.WP",
      "CommentsBusiness",
      "GetTotalCommentsAsync",
      [this.data.recID])
    .subscribe((res:number) => {
      this.data.totalComment = res;
      this.dt.detectChanges();
    });
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
}
