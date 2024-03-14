import {
  ApplicationRef,
  ComponentFactoryResolver,
  EventEmitter,
  Injectable,
  Injector,
  TemplateRef,
} from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { AuthStore } from 'codx-core';
import { error, group } from 'console';
import { environment } from 'src/environments/environment';
import { Post } from 'src/shared/models/post';
import { CHAT } from '../models/chat-const.model';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  public hubConnection: signalR.HubConnection;
  connectionId: string;
  logOut: boolean = false;
  userConnect = new EventEmitter<any>();
  disConnected = new EventEmitter<any>();
  activeGroup = new EventEmitter<any>();//Bật chat box
  chatboxChange = new EventEmitter<any>();//Gửi tin
  votedMessage = new EventEmitter<any>();//Thả emoji
  loadedGroup = new EventEmitter<any>();//Lấy thông tin Group
  updateOnlineStatus = new EventEmitter<any>();//Lấy thông tin Group


  openBoxChat = new EventEmitter<any>(); // open box chat

  constructor(private authStore: AuthStore) {
    this.createConnection();
  }

  public async createConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.apiUrl + '/hubwp/chat', {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
        accessTokenFactory: async () => {
          return this.authStore.get()?.token;
        },
      })
      .build();
    this.hubConnectionstart();

    this.hubConnection.on('ReceiveMessage', (res) => {
      if (res && res?.event) 
      {
        switch (res.event)
        {
          case CHAT.UI_FUNC.OnConnected:
            this.updateOnlineStatus.emit(res);
            break;
          
          case CHAT.UI_FUNC.OnDisconnected:{
            this.disConnected.emit(res);
            this.updateOnlineStatus.emit(res);
            break;
          }
          case CHAT.UI_FUNC.OpenBoxChat: {
            this.openBoxChat.emit(res.data);
            break;
          }
          case CHAT.UI_FUNC.LoadedGroup: {
            this.loadedGroup.emit(res);
            this.activeGroup.emit(res);
            break;
          }
          //Thêm người còn lại vào nhóm, sau load
          case CHAT.BE_FUNC.JoinGroup: {
            this.sendData(CHAT.BE_FUNC.JoinGroup, res.data);
            break;
          }
          //Sau khi thêm người vào nhóm, thêm nhóm vào UI nếu chưa có (mở chatbox nếu cần)
          case CHAT.UI_FUNC.JoinedGroup: {
            this.loadedGroup.emit(res);
            break;
          }
          //Gửi tin nhắn
          case CHAT.UI_FUNC.SendedMessage:
            this.chatboxChange.emit(res);
            break;
          //Xóa tin nhắn
          case CHAT.UI_FUNC.DeletedMessage:
            this.chatboxChange.emit(res);
            break;
          //phản hồi tin nhắn
          case CHAT.UI_FUNC.ReactedMessage:
            this.chatboxChange.emit(res);
            break;
          //Gửi chat của hệ thống và mở chat box
          case CHAT.UI_FUNC.SendedMessageSystem:{
            this.chatboxChange.emit(res);
            this.activeGroup.emit(res);
            break;
          }

          
        }
      }
    });

    this.hubConnection.onclose(() => {
      this.hubConnectionstart();
    });
  }

  hubConnectionstart() {
    var t = this;
    this.hubConnection.start().catch(function () {
      setTimeout(function () {
        t.hubConnectionstart();
      }, 5000);
    });
  }
  // send to server
  sendData(methodName: string, ...args: any[]) {
    return this.hubConnection.send(methodName, ...args);
  }

  // disconnect
  disconnect(user: any) {
    let codxChatContainer = document.getElementsByTagName(
      'codx-chat-container'
    );
    let chatboxs = Array.from(codxChatContainer as HTMLCollectionOf<HTMLElement>)
    if (chatboxs?.length>0) {
      Array.from(codxChatContainer).forEach((element) => {
        element.remove();
      });
    }
    this.logOut = true;
    this.hubConnection.invoke(CHAT.BE_FUNC.LogOut, user.userID, user.tenant);
  }
}
