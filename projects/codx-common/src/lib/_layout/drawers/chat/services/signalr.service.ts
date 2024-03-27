import {
  EventEmitter,
  Injectable,
} from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { AuthStore } from 'codx-core';
import { environment } from 'src/environments/environment';
import { CHAT } from '../models/chat-const.model';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {


  public hubConnection: signalR.HubConnection;
  connectionId: string;
  logOut: boolean = false;

  // 13/03/2024 - update
  addGroup = new EventEmitter<any>(); // add new group
  openBoxChat = new EventEmitter<any>(); // open box chat
  removeGroup = new EventEmitter<any>(); // remove group
  favoriteGroup = new EventEmitter<any>(); // favorite group
  groupChange = new EventEmitter<any>(); // group change
  incomingMessage = new EventEmitter<any>(); // recive message
  messageChange = new EventEmitter<any>();  // message change
  voteMessage = new EventEmitter<any>();  // vote message 

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
      if (res) 
      {
        switch (res.event)
        {
          // onconnection
          case CHAT.UI_FUNC.OnConnected:
            break;
          
          // disconnection
          case CHAT.UI_FUNC.OnDisconnected:
            break;

            // add new group
          case CHAT.UI_FUNC.AddGroup:
            this.sendData(CHAT.BE_FUNC.JoinGroupAsync,res.data);
            this.addGroup.emit(res.data);
            break;
          
            // open box chat
          case CHAT.UI_FUNC.OpenBoxChat: 
            this.openBoxChat.emit(res.data);
            break;

          // Join Group / Add connection to hub
          case CHAT.UI_FUNC.JoinGroup: 
            this.sendData(CHAT.BE_FUNC.JoinGroupAsync,res.data);
            break;
          
          // remove group
          case CHAT.UI_FUNC.RemoveGroup: 
            this.removeGroup.emit(res.data);
            break;
          
          // favirote group
          case CHAT.UI_FUNC.FavoriteGroup: 
            this.groupChange.emit(res.data);
            break;
          
          // Tin nhắn mới
          case CHAT.UI_FUNC.IncomingMessage:
            this.incomingMessage.emit(res.data);
            this.sendData("RemoveConnectionAsync",res.data)
            break;
          
          //Xóa tin nhắn
          case CHAT.UI_FUNC.DeletedMessage:
            this.messageChange.emit(res);
            break;
            
          // vote tin nhắn
          case CHAT.UI_FUNC.VoteMessage:
            this.voteMessage.emit(res.data);
            break;
          
          //Gửi chat của hệ thống và mở chat box
          case CHAT.UI_FUNC.SendedMessageSystem:
            this.incomingMessage.emit(res.data);
            break;
      }
    }
  });

    this.hubConnection.onclose(() => {
      this.hubConnectionstart();
    });
  }

  hubConnectionstart() {
    var t = this;
    this.hubConnection.start()
    .catch(function () {
      setTimeout(function () {
        t.hubConnectionstart();
      }, 5000);
    });
  }

  sendData(methodName: string, ...args: any[]) {
    return this.hubConnection.send(methodName, ...args);
  }

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
