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
  @Input() funcID:string = "";
  @Input() objectID:string = "";
  @Input() objectType:string = "";
  @Input() formModel:FormModel = null;
  @Input() showComment:boolean = false;

  @Output() pushCommentEvt = new EventEmitter;
  @Output() voteCommentEvt = new EventEmitter;
  @ViewChild('codxATM') codxATM :AttachmentComponent;
  
  

  crrId = '';
  checkVoted = false;
  dicDatas = {};
  user: any;
  votes: any;
  lstUserVote: any;
  dVll: any = {};
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
    if(this.showComment)
      this.showComments();
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
    if(!data.listComment)
      data.listComment = [];
    if(!data.pageIndex)
      data.pageIndex = 0;
    if(!data.totalPage)
      data.totalPage = 0;  
    if(data.pageIndex >= data.totalPage)
    {
      this.api.execSv(
        "WP",
        "ERM.Business.WP",
        "CommentsBusiness",
        "GetCommentsAsync",
        [data.recID,data.pageIndex + 1])
        .subscribe((res:any[]) => {
          data.loading = false;
          if(res)
          {
            let datas = res[0];
            let total = res[1];
            if(datas?.length > 0)
              data.listComment = data.listComment.concat(datas);
            if(!data.totalPage)
                data.totalPage = Math.ceil(res[1]/5);
            data.full = data.listComment.length == total;
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
  // send comment
  sendComment(event:any,data:any = null){
    this.data.totalComment += 1;
    event.showReply = false;
    if(data)
      data.showReply = false;
    this.crrId = "";
    this.dicDatas[event["recID"]] = event;
    this.setNodeTree(event);
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
  // click show comment
  showComments() {
    this.data.isShowComment = this.data.isShowComment ? !this.data.isShowComment : true;
    if(this.data.isShowComment && !this.data.loading)
    {
      this.data.loading = true;
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
      this.addNode(null, newNode, id);
    this.dt.detectChanges();
  }
  // add tree
  addNode(dataNode: any, newNode: any, id: string) {
    let idx = -1;
    let node = null;
    if(dataNode)
    {
      if(!dataNode.listComment || dataNode.listComment.length == 0)
        dataNode.listComment = [];
      
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
        dataNode.listComment.unshift(newNode);
    }
    else 
    {
      if(!Array.isArray(this.data.listComment))
        this.data.listComment = [];
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
    if(data && this.defaulVote){
      this.votePost(data,this.defaulVote.value);
    }
  }
}
