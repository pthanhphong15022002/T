import { ApiHttpService, DataRequest } from "codx-core";
import { Post } from "@shared/models/post";
import { EventEmitter, Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
  })
export class ChatService{
    constructor(private api: ApiHttpService)
    {}

    public openChatBoxEvent = new EventEmitter();

    public searchUser(opts: DataRequest){
        return this.api.execSv<Post>('SYS', 'ERM.Business.CM', 'DataBusiness', 'LoadDataAsync', opts);
    }

    public searchGroup(opts: DataRequest){
        return this.api.exec<Post>('WP', 'CommentBusiness', 'GetPostByIDAsync', opts);
    }

    public openChatBox(opts: any){
        this.openChatBoxEvent.emit(opts);
    }
}