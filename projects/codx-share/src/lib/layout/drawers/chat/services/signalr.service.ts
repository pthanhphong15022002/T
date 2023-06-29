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
import { environment } from 'src/environments/environment';
import { Post } from 'src/shared/models/post';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private hubConnection: signalR.HubConnection;
  connectionId: string;
  userConnect = new EventEmitter<any>();
  disConnected = new EventEmitter<any>();

  activeNewGroup = new EventEmitter<any>();
  activeGroup = new EventEmitter<any>();
  chat = new EventEmitter<any>();
  undoMssg = new EventEmitter<any>();

  voteChat = new EventEmitter<any>();
  constructor(
    private authStore: AuthStore) {
    this.createConnection();
    this.registerOnServerEvents();
  }

  public createConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.apiUrl + '/hubwp/chat', {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
        accessTokenFactory: async () => {
          return this.authStore.get()?.token;
        }
      })
      .build();

    this.hubConnection
      .start()
      .then()
      .catch();
  }
  // reciver from server
  public registerOnServerEvents() {
    this.hubConnection.on('ReceiveMessage', (res) => {
      if(res){
        let data = res.data;
        switch (data.action) {
          case 'onConnected':
            break;
          case 'onDisconnected':
            this.disConnected.emit(data);
          break;
          case 'activeNewGroup':
            this.activeNewGroup.emit(data);
            break;
          case 'activeGroup':
            this.activeGroup.emit(data);
            break;
          case 'sendMessage':
            this.chat.emit(data);
            break;
          case 'deletedMessage':
            this.chat.emit(data);
            break;
          case 'voteMessage':
            this.voteChat.emit(data);
            break;
          case 'sendMessageSystem':
            this.chat.emit(data);
            this.activeGroup.emit(data);
          break;
          
        }
      }
      
    });
  }
  // send to server
  sendData(methodName: string, ...args: any[]) {
    this.hubConnection.invoke(methodName, ...args);
  }
}
