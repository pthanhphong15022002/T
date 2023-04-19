import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ApiHttpService, AuthService, CacheService, CallFuncService, DialogModel, FormModel, NotificationsService } from 'codx-core';
import { PopupVoteComponent } from './popup-vote/popup-vote.component';
import { AttachmentComponent } from '../attachment/attachment.component';
import { ImageGridComponent } from '../image-grid/image-grid.component';
import { map } from 'rxjs';
@Component({
  selector: 'treeview-comment',
  templateUrl: './treeview-comment.component.html',
  styleUrls: ['./treeview-comment.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TreeviewCommentComponent implements OnInit {
  @Input() data:any = null;
  @Input() activeParent:boolean = false;
  @Input() funcID:string = "";
  @Input() objectID:string = "";
  @Input() objectType:string = "";
  @Input() formModel:FormModel = null;
  @Output() pushCommentEvt = new EventEmitter;
  @Output() voteCommentEvt = new EventEmitter;
  @ViewChild('codxATM') codxATM :AttachmentComponent;
  @ViewChild('codxFile') codxFile : ImageGridComponent;
  
  

  crrId = '';
  checkVoted = false;
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
    this.getValueIcon();
  }
  
  // get vll icon
  getValueIcon(){
    this.cache.valueList("L1480")
    .subscribe((res) => {
      if(Array.isArray(res.datas)) {
        this.vllL1480 = Array.from<any>(res.datas);
        this.defaulVote = this.vllL1480[0];
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
  getCommentsAsync(data:any){ 
    debugger
    if(!Array.isArray(data.listComment))
    {
      data.listComment = [];
    }
    this.api.execSv(
    "WP",
    "ERM.Business.WP",
    "CommentsBusiness",
    "GetCommentsAsync",
    [data.recID,data.pageIndex == null ? 0 : data.pageIndex + 1])
    .subscribe((res:any[]) => {
      if(Array.isArray(res[0]))
      {
        data.listComment = data.listComment.concat(res[0]);
        data.pageIndex++;
      }
      data.full = data.listComment.length == res[1];
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
  // send comment
  sendComment(event:any,data:any = null){
    this.data.totalComment += 1;
    event.showReply = false;
    if(data){
      data.showReply = false;
    }
    this.crrId = "";
    this.dicDatas[event["recID"]] = event;
    this.setNodeTree(event);
    // bài viết chi tiết - tạo bài viết khi comment lần đầu
    if(this.activeParent){
      this.pushCommentEvt.emit(event);
      this.activeParent = false;
    }
    this.dt.detectChanges();
  }
  // reply to
  replyTo(data) {
    data.showReply = !data.showReply;
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
            else
            {
              data.myVoteType = voteType;
              data.myVoted = true;
              this.checkVoted = true;
            }
            this.dt.detectChanges();
          }
  
        });
    }
  }
  isShowComment : boolean = false;
  // click show comment
  showComments() {
    this.isShowComment = !this.isShowComment;
    if(!this.data.load){
      this.data.load = true;
      this.getCommentsAsync(this.data);
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

  // doubleclick votes
  defaulVote:any = null;
  dbLikePost(data){
    debugger
    if(data && this.defaulVote){
      this.votePost(data,this.defaulVote.value);
    }
  }
}
