import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { WPService } from '@core/services/signalr/apiwp.service';
import { SignalRService } from '@core/services/signalr/signalr.service';
import { Post } from '@shared/models/post';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
declare var _;
import { ApiHttpService, CacheService, NotificationsService } from 'codx-core';
@Component({
  selector: 'treeview-comment',
  templateUrl: './treeview-comment.component.html',
  styleUrls: ['./treeview-comment.component.scss'],
})
export class TreeviewCommentComponent implements OnInit {
  @Input() rootData: any;
  @Output() pushComment = new EventEmitter;
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
  dicDatas={};
  constructor(
    private dt: ChangeDetectorRef,
    private signalR: SignalRService,
    private signalRApi: WPService,
    private cache: CacheService,
    private api: ApiHttpService,
    private notifySvr: NotificationsService,
    private modalService: NgbModal
  ) {
    this.subscribeToEvents();
    this.cache.valueList('L1480').subscribe((res) => {
      if (res) {
        this.lstData = res.datas;
      }
    });
  }


  ngOnInit(): void {
   console.log(this.rootData);

  }
  

  openFormListIconVoted(content, commentID) {
    this.getIconVoted(commentID);
    this.modalService.open(content, { centered: true });
  }

  getIconVoted(commentID: any) {
    let i = 0;
    this.countVote_Like = 0;
    this.countVote_Amazing = 0;
    this.countVote_Happy = 0;
    this.countVote_Sad = 0;
    this.countVote_Angry = 0;
    this.api
      .exec<any>('ERM.Business.WP', 'VotesBusiness', 'GetVotedAsync', [
        commentID.toString(),
      ])
      .subscribe((res) => {
        this.lstUserVoted = res;
        console.log('CHECK lstUserVoted', this.lstUserVoted);
        for (i; i <= res.length; i++) {
          //this.rootData.myVotedType = this.lstUserVoted[i].voteType
          console.log('CHECK lstUserVoted', this.lstUserVoted[i].createdName);
          console.log('CHECK lstUserVoted', this.lstUserVoted[i].positionName);
          console.log('CHECK lstUserVoted', this.lstUserVoted[i].voteType);
          if (this.lstUserVoted[i].voteType == 1) {
            this.countVote_Like++;
          } else if (this.lstUserVoted[i].voteType == 2) {
            this.countVote_Amazing++;
          } else if (this.lstUserVoted[i].voteType == 3) {
            this.countVote_Happy++;
          } else if (this.lstUserVoted[i].voteType == 4) {
            this.countVote_Sad++;
          } else {
            this.countVote_Angry++;
          }
        }
        this.dt.detectChanges();
      });
  }

  keyup(e, id) {
    if (e.keyCode === 13) {
      let text = e.target.value;
      if (!text.trim()) {
        this.notifySvr.notifyCode('E0315');
        return;
      }
      text = text.replace('\n', '');
      if (id)
        this.signalRApi
          .postComment(id, text, this.rootData.id)
          .subscribe((res) => {
            e.target.value = '';
            this.crrId = '';
            this.closeReply(id);
          });
    }
  }
  PopoverEmpEnter(p: any) {
    p.open();
  }
  PopoverEmpLeave(p: any) {
    p.close();
  }

  replyComment(post:any,value:any){
    if (!value.trim()) {
      this.notifySvr.notifyCode('E0315');
      return;
    }
    if(post.recID)
    {
      var type="WP_Comments";
      this.api
      .execSv<any>(
        'WP',
        'ERM.Business.WP',
        'CommentBusiness',
        'PublishCommentAsync',
        [post.recID, value, this.rootData.recID,type]
      )
      .subscribe((res) => {
      if(res)
      {
        this.rootData.totalComment += 1;    
        this.comments = "";
        this.repComment = "";
        post.showReply = false;
        this.crrId = "";
        this.setNodeTree(res);
        // this.loadSubComment(post);
        this.dt.detectChanges();
      }
      });
    }
  }

  sendComment(post:any,value:any) {
    if (!value.trim()) {
      this.notifySvr.notifyCode('E0315');
      return;
    }
    if(post.recID)
    {
      var type="WP_Comments";
      this.api
      .execSv<any>(
        'WP',
        'ERM.Business.WP',
        'CommentBusiness',
        'PublishCommentAsync',
        [post.recID, value, this.rootData.recID,type]
      )
      .subscribe((res) => {
      if(res)
      { 
        this.comments = "";
        this.repComment = "";
        this.rootData.totalComment += 1;
        post.showReply = false;
        this.crrId = "";
        this.dicDatas[res["recID"]] = res;
        this.setNodeTree(res);
        this.dt.detectChanges();
      }
      });
    }
  }
  
  replyTo(data) {
    this.crrId = data.cm;
    data.showReply = !data.showReply;
    this.dt.detectChanges();
  }

  closeReply(id) {
    const t = this;
    _.filter(this.rootData.listComment, function (o) {
      if (o.id == id) o.showReply = false;
      else t.recursiveClose(o.listComment, id);
    });
  }

  recursiveClose(root, id) {
    const t = this;
    _.filter(root, function (o) {
      if (o.id == id) o.showReply = false;
      else t.recursiveClose(o.listComment, id);
    });
  }
  votePost(data:any, voteType = null) {
    this.signalRApi.votePost([data.recID, voteType]).subscribe((res) => {
      let data = res.msgBodyData[0];
      let totalvoted = data[1];
      this.checkVoted = data[2];
      if (this.checkVoted == false || this.rootData.myVotedType == voteType) {
        this.rootData.myVotedType = null;
        this.pennant = 0;
      } else {
        this.rootData.myVotedType = voteType;
        this.pennant = 1;
        this.votedTypeUpdated = voteType;
      }
      this.rootData.totalVote = totalvoted;
      this.dt.detectChanges();
    });
    // if(voteType == data.myVotedType){
    //   data.myVotedType = null;
    //   data.myVoted = false;
    //   this.signalRApi.votePost([data.recID, voteType]).subscribe((res) => {
    //     console.log(res.msgBodyData[0]);
        
    //   })
    //   this.dt.detectChanges();
    // }
  }

  voteComment(data:any){
    if(!data.recID) return;
    this.api
      .execSv<any>(
        'WP',
        'ERM.Business.WP',
        'VotesBusiness',
        'VotePostAsync',
        [data.recID, "1"]
      )
      .subscribe((res) => {
      if(res)
      {
        data.myVoted = true;
        data.totalVote +=1;
        this.dt.detectChanges();
      }
      });
  } 


  //#region handle data from serve
  updateVote(obj) {
    const t = this;
    if (this.rootData.id == obj.id) {
      this.rootData.totalVote = parseInt(obj.count);
      this.rootData.voted = !this.rootData.voted
      console.log("CHECK func updateVote-if", obj);
      t.dt.detectChanges()
    }
    else {
      t.recursiveVoted(this.rootData, obj);
      console.log('CHECK func updateVote-else', obj);
    }
  }

  pushCommentToSource(data) {
    const t = this;
    if (this.rootData.id == data.refID) {
      if (t.rootData.listComment.length) t.rootData.listComment.unshift(data);
      else t.rootData.listComment = [data];
      t.rootData.totalComment++;
      t.rootData.totalRecord++;
    } else {
      t.recursiveComment(t.rootData.listComment, data);
    }
  }

  loadSubComment(data) {
    data.isShowComment = !data.isShowComment;
    // // const t = this;
    // // if (data.totalComment < data.totalRecord) {
    // //   if (data.totalComment == 0) {
    // //     data.pageIndex = 0;
    // //     data.listComment = [];
    // //   } else data.pageIndex++;
    // // }
    // // this.dt.detectChanges;

    // this.signalRApi.loadSubComment(data.recID, data.pageIndex).subscribe((res) => {
    //   if (res) {
    //     _.filter(t.rootData.listComment, function (o) {
    //       if (o.id == data.id) {
    //         o.pageIndex = data.pageIndex;
    //         o.listComment = o.listComment.concat(res);
    //         o.totalComment = o.listComment.length;
    //       } else t.recursiveLoadComment(o.listComment, data, res);
    //     });
    //   }
    // });
    this.api.execSv(
      'WP',
      'ERM.Business.WP',
      'CommentBusiness',
      "GetSubCommentAsync",
      [data.recID, 0]
      ).subscribe((res: any) => {
        res.map( p => {
          this.setNodeTree(p);
        })
        this.dt.detectChanges();
      })
  }


  
  recursiveComment(root, data) {
    const t = this;
    _.filter(root, function (o) {
      if (o.id == data.refID) {
        o.totalRecord += 1;
        o.totalComment += 1;
        if (o.listComment == null) {
          o.listComment = [data];
        } else o.listComment.unshift(data);
      } else t.recursiveComment(o.listComment, data);
    });
  }

  recursiveLoadComment(root, oldData, data) {
    const t = this;
    _.filter(root, function (o) {
      if (o.id == oldData.id) {
        o.pageIndex = oldData.pageIndex;
        o.listComment = o.listComment.concat(data);
        o.totalComment = o.listComment.length;
      } else {
        t.recursiveLoadComment(o.listComment, oldData, data);
      }
    });
  }

  recursiveVoted(root, data) {
    const t = this;
    _.filter(root.listComment, function (o) {
      if (o.id == data.id) {
        console.log('CHECK dunc recursiveVoted-if', o);
        o.voted = !o.voted;
        o.totalVote = parseInt(data.count);
        t.dt.detectChanges()
      } else {
        t.recursiveVoted(o, data);
        console.log('CHECK dunc recursiveVoted-else', o, data);
      }
    });
  }
  //#endregion

  private subscribeToEvents(): void {
    this.signalR.signalData.subscribe((post: Post) => {
      console.log('CHECK func subscribeToEvents-signalData', post);
      if (post.category == '2') {
        console.log('CHECK func subscribeToEvents-signalData', post);
        this.pushCommentToSource(post);
      }
    });
  }
  showComments(post:any) {
    if(post.isShowComment){
      post.isShowComment = false;
    }
    else
    {
      post.isShowComment = true;
    }
    this.dt.detectChanges();
  }

  checkInput() {
    this.checkValueInput = false;
    // var fields = $("form :input");
    // for (var i = 0; i < fields.length; i++) {
    //   if ($(fields[i]).val() != '') {
    //     this.checkValueInput = true;
    //     break;
    //   }
    // }
  }


  
  valueChange(value:any,type){
    var text = value.data.toString().trim();
    if(text){
      if(type == "comments")
      {
        this.comments = text;
      }
      else
      {
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
      // parent[this.fieldCheck] = true;
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
      if(!dataNode.listComment){
        dataNode.listComment = [];
      }
      else
      {
        dataNode.listComment.forEach(function (element: any, index: any) {
          if (element["recID"] == id) {
            idx = index;
            return;
          }
        });
      }
      if (idx == -1) dataNode.listComment.push(newNode);
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
        parent.items = parent.items.filter(function (element: any, index: any) {
          return element["recID"] != id;
        });
      } else {
        if (!this.rootData) return;
        this.rootData = this.rootData.filter(function (element: any, index: any) {
          return element["recID"] != id;
        });
      }

      delete this.dicDatas[id];
    }
    this.dt.detectChanges();
  }
}
