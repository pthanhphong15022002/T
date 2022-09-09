import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit,  Output,  SimpleChanges,  ViewEncapsulation, } from '@angular/core';
import { ApiHttpService, AuthService, CacheService } from 'codx-core';

@Component({
  selector: 'codx-tree-history',
  templateUrl: './codx-tree-history.component.html',
  styleUrls: ['./codx-tree-history.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CodxTreeHistoryComponent implements OnInit, OnChanges {

  @Input() funcID:string;
  @Input() objectType:string;
  @Input() objectID:string;
  @Input() actionType:string;
  @Input() addNew:boolean = false;
  @Input() viewIcon:boolean = false;
  @Input() viewVote:boolean = false;
  @Input() totalComment:number = 0;
  @Output() totalCommentChange = new EventEmitter<number>();
  /////////////////////////////
  service = "BG";
  assemply = "ERM.Business.BG";
  className = "TrackLogsBusiness";
  lstHistory:any[] = [];
  root:any = {
    listSubComment: [],
    recID: ""
  }
  dicDatas = {};

  constructor(
    private api:ApiHttpService,
    private cache:CacheService,
    private auth:AuthService,
    private dt:ChangeDetectorRef,
  ) 
  { }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes.objectID.previousValue != changes.objectID.currentValue ){
      this.getDataAsync();
    }
  }

  ngOnInit(): void {
    this.getDataAsync();
  }

  getDataAsync(){
    if(this.actionType){
      this.GetCommentTrackLogByObjectIDAsync();
    }
    else{
      this.getTrackLogAsync();
    }
  }
  getTrackLogAsync(){
    this.api.execSv(this.service,this.assemply,this.className,"GetTrackLogsByObjectIDAsync",this.objectID).
    subscribe((res:any[]) =>{
      if(res) {
        this.root.listSubComment = res[0];
      }
    })
  }

  GetCommentTrackLogByObjectIDAsync(){
    this.api.execSv(this.service,this.assemply,this.className,"GetCommentTrackLogByObjectIDAsync",[this.objectID,this.actionType]).
    subscribe((res:any[]) =>{
      if(res) {
        this.root.listSubComment = res[0];
        this.totalComment = res[1];
        this.totalCommentChange.emit(this.totalComment)
      }
    })
  }

  replyTo(data) {
    data.showReply = !data.showReply;
    this.dt.detectChanges();
  }

  deleteComment(event: any) {
    this.removeNodeTree(event.recID);
    this.dt.detectChanges();
  }

  sendComment(event:any,data:any = null){
    event.showReply = false;
    if(data){
      data.showReply = false;
    }
    this.dicDatas[event["recID"]] = event;
    this.setNodeTree(event);
    this.dt.detectChanges();
  }


  setDicData(data) {
    this.dicDatas[data["recID"]] = data;
  }

  setNodeTree(newNode: any) {
    if (!newNode) return;
    var id = newNode["recID"],
      parentId = newNode["reference"];
    this.dicDatas[id] = newNode;
    var t = this;
    var parent = this.dicDatas[parentId];
    if (parent) {
      this.addNode(parent, newNode, id);
    } else {
      this.addNode(this.root, newNode, id);
    }

    this.dt.detectChanges();
  }

  addNode(dataNode: any, newNode: any, id: string) {
    var t = this;
    if (!dataNode) {
      dataNode = [newNode];
    } else {
      var idx = -1;
      if (!dataNode.listSubComment) {
        dataNode.listSubComment = [];
      }
      else {
        dataNode.listSubComment.forEach(function (element: any, index: any) {
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
          dataNode.listSubComment.push(newNode);
      }
      else {
        var obj = dataNode[idx];
        newNode.listSubComment = obj.listSubComment;
        dataNode[idx] = newNode;
      }
    }
  }

  removeNodeTree(id: string) {
    if (!id) return;
    var data = this.dicDatas[id],
      parentId = data["reference"];
    if (data) {
      var parent = this.dicDatas[parentId];
      if (parent) {
        parent.listSubComment = parent.listSubComment.filter(function (element: any, index: any) {
          return element["recID"] != id;
        });
      } else {
        if (!this.root.listSubComment) return;
        this.root.listSubComment = this.root.listSubComment.filter(function (element: any, index: any) {
          return element["recID"] != id;
        });
      }

      delete this.dicDatas[id];
    }
    this.dt.detectChanges();
  }

}
