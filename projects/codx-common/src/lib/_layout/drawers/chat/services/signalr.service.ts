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
import { error } from 'console';
import { environment } from 'src/environments/environment';
import { Post } from 'src/shared/models/post';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  public hubConnection: signalR.HubConnection;
  connectionId: string;
  logOut: boolean = false;
  userConnect = new EventEmitter<any>();
  disConnected = new EventEmitter<any>();

  activeNewGroup = new EventEmitter<any>();
  activeGroup = new EventEmitter<any>();
  chat = new EventEmitter<any>();
  undoMssg = new EventEmitter<any>();
  voteChat = new EventEmitter<any>();

  openBoxChat = new EventEmitter<any>();


  constructor(private authStore: AuthStore) 
  {
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
      if (res) {
        switch (res.event) 
        {
          case 'onConnected':
            break;
          case 'onDisconnected':
            this.disConnected.emit(res.data);
            break;
          case 'activeNewGroup':
            this.activeNewGroup.emit(res.data);
            break;
          case 'activeGroup':
            this.activeGroup.emit(res.data);
            break;
          case 'sendMessage':
            this.chat.emit(res.data);
            break;
          case 'deletedMessage':
            this.chat.emit(res.data);
            break;
          case 'voteMessage':
            this.voteChat.emit(res.data);
            break;
          case 'sendMessageSystem':
            this.chat.emit(res.data);
            this.activeGroup.emit(res.data);
            break;
          case 'openBoxChat':
            this.openBoxChat.emit(res.data);
            break;
        }
      }
    });
    
    this.hubConnection.onclose(() => {
      this.hubConnectionstart();
    });
  }


  hubConnectionstart() {
    this.hubConnection.start().catch(function () {
        setTimeout(function () {
          this.hubConnectionstart();
        }, 5000);
    });
  }
  // send to server
  sendData(methodName: string, ...args: any[]) {
    return this.hubConnection.send(methodName, ...args)
  }

  // disconnect
  disconnect(user: any) {
    let codxChatContainer = document.getElementsByTagName('codx-chat-container');
    if (Array.isArray(codxChatContainer)) 
    {
      Array.from(codxChatContainer).forEach(element => { element.remove() });
    }
    this.logOut = true;
    this.hubConnection.invoke('LogOutAsync', user.userID, user.tenant);
  }
}
