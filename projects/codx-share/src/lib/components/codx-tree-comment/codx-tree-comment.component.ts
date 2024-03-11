import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { ApiHttpService, AuthService, CacheService } from 'codx-core';

@Component({
  selector: 'codx-tree-comment',
  templateUrl: './codx-tree-comment.component.html',
  styleUrls: ['./codx-tree-comment.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CodxTreeCommentComponent implements OnInit, OnChanges {

  @Input() data:any; // bổ sung 11/03/2024 - comment and push noti to createdBy and owner
  @Input() funcID: string;
  @Input() objectType: string;
  @Input() objectID: string;
  @Input() id: string;
  @Input() actionType: string;
  @Input() formModel: any;
  @Input() addNew: boolean = false;
  @Input() viewIcon: boolean = false;
  @Input() viewVote: boolean = false;
  @Input() allowEdit: boolean = false;
  @Input() showCommentTree: boolean = true;
  @Input() totalComment: number = 0;
  @Output() totalCommentChange = new EventEmitter<number>();
  @Output() typed = new EventEmitter<any>();
  /////////////////////////////
  vllL1480 = 'L1480'; // valueList icon
  vllIcon: any = [];
  dVll: any = {};
  lstHistory: any[] = [];
  root: any = {
    listSubComment: [],
    recID: '',
  };
  dicDatas = {};

  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private auth: AuthService,
    private dt: ChangeDetectorRef
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.objectID.previousValue != changes.objectID.currentValue) {
      this.getDataAsync();
    }
  }

  ngOnInit(): void {
    this.getDataAsync();
  }

  getValueIcon() {
    this.cache.valueList(this.vllL1480).subscribe((res) => {
      if (res) {
        this.vllIcon = res.datas as any[];
        if (this.vllIcon.length > 0) {
          this.vllIcon.forEach((element) => {
            this.dVll[element.value + ''] = element;
          });
        }
      }
    });
  }
  getDataAsync() {
    this.getCommentsAsync(this.objectID);
    this.getValueIcon();
  }
  // get data comments
  getCommentsAsync(objectID: string) {
    if(objectID ){
      this.api
      .execSv(
        "BG",
        "ERM.Business.BG",
        "CommentLogsBusiness",
        'GetCommentByIDAsync',
        [objectID])
      .subscribe((res: any[]) => {
        if (res) {
          this.root.listSubComment = res[0];
          this.totalComment = res[1];
          this.totalCommentChange.emit(this.totalComment);
        }
      });
    }
  }
  // click reply
  replyTo(data) {
    data.showReply = !data.showReply;
    this.dt.detectChanges();
  }
  // delete comment
  deleteComment(event: any) {
    this.totalComment--;
    this.totalCommentChange.emit(this.totalComment);
    this.removeNodeTree(event.recID);
    this.dt.detectChanges();
  }
  // send comments
  sendComment(event: any, data: any = null) {
    if(event){
      event.showReply = false;
      if (data)
      {
        data.showReply = false;
      }
      this.totalComment++;
      this.totalCommentChange.emit(this.totalComment);
      this.typed.emit(event)
      this.dicDatas[event['recID']] = event;
      this.setNodeTree(event);
      this.dt.detectChanges();
    }
  }

  setDicData(data) {
    if (data && data['recID']) {
      this.dicDatas[data['recID']] = data;
    }
  }

  setNodeTree(newNode: any) {
    if (!newNode) return;
    var id = newNode['recID'],
      parentId = newNode['reference'];
    this.dicDatas[id] = newNode;
    var parent = this.dicDatas[parentId];
    if (parent) {
      this.addNode(parent, newNode, id);
    } else {
      this.addNode(this.root, newNode, id);
    }

    this.dt.detectChanges();
  }

  addNode(dataNode: any, newNode: any, id: string) {
    if (!dataNode) {
      dataNode = [newNode];
    } else {
      var idx = -1;
      if (!dataNode.listSubComment) {
        dataNode.listSubComment = [];
      } else {
        dataNode.listSubComment.forEach(function (element: any, index: any) {
          if (element['recID'] == id) {
            idx = index;
            return;
          }
        });
      }
      if (idx == -1) {
        if (dataNode.length == 0) dataNode.unshift(newNode);
        else dataNode.listSubComment.unshift(newNode);
      } else {
        var obj = dataNode[idx];
        newNode.listSubComment = obj.listSubComment;
        dataNode[idx] = newNode;
      }
    }
  }

  removeNodeTree(id: string) {
    if (!id) return;
    var data = this.dicDatas[id],
      parentId = data['reference'];
    if (data) {
      var parent = this.dicDatas[parentId];
      if (parent) {
        parent.listSubComment = parent.listSubComment.filter(function (
          element: any,
          index: any
        ) {
          return element['recID'] != id;
        });
      } else {
        if (!this.root.listSubComment) return;
        this.root.listSubComment = this.root.listSubComment.filter(function (
          element: any,
          index: any
        ) {
          return element['recID'] != id;
        });
      }
      delete this.dicDatas[id];
    }
    this.dt.detectChanges();
  }
}
