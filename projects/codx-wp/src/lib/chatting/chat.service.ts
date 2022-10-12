import { ApiHttpService, DataRequest } from "codx-core";
import { Post } from "@shared/models/post";
import { EventEmitter, Injectable } from "@angular/core";
import { SignalRService } from "@core/services/signalr/signalr.service";

@Injectable({
    providedIn: 'root'
  })
export class ChatService{
    constructor(private api: ApiHttpService, private signalRService: SignalRService)
    {
        this.listeningChatMessage();
    }
    listeningChatMessage() {
        this.signalRService.signalChat.subscribe((signData: any)=>{
            let topic = signData.topic;
            let data = signData.data;
            switch(topic){
                case "ReadMessageToMe":
                    this.readMessage.emit(data);
                    break;
                case "ReceiveMessage":
                    this.receiveMessage.emit(data);
                    break;
                default:
                    break;
            }
        })
    }

    public receiveMessage = new EventEmitter();
    public readMessage = new EventEmitter();

    public openChatBoxEvent = new EventEmitter();

    public searchUser(opts: DataRequest){
        return this.api.execSv<Post>('SYS', 'ERM.Business.CM', 'DataBusiness', 'LoadDataAsync', opts);
    }

    public searchGroup(opts: DataRequest){
        return this.api.exec<Post>('WP', 'CommentsBusiness', 'GetPostByIDAsync', opts);
    }

    public openChatBox(opts: any){
        this.openChatBoxEvent.emit(opts);
    }

    public sendMessage(data: any, topic: string){
        this.signalRService.sendData(data, topic);
    }
}