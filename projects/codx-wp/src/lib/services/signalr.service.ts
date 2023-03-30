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
  activeNewGroup = new EventEmitter<any>();
  activeGroup = new EventEmitter<any>();
  chat = new EventEmitter<any>();
  voteChat = new EventEmitter<any>();
  constructor(
    private authStore: AuthStore) {
    this.createConnection();
    this.registerOnServerEvents();
  }

  public createConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.apiUrl + '/serverHub', {
        skipNegotiation: true,
        accessTokenFactory: async () => {
          return this.authStore.get().token;
        },
        transport: signalR.HttpTransportType.WebSockets,
      })
      .build();

    this.hubConnection
      .start()
      .then()
      .catch((err) => console.log('Error while starting connection: ' + err));
  }
  // reciver from server
  public registerOnServerEvents() {
    this.hubConnection.on('onConnect', (data) => {
      this.connectionId = data;
      this.userConnect.emit(data);
    });
    this.hubConnection.on('ReceiveMessage', (res) => {
      switch (res.action) {
        case 'onConnected':
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
        case 'voteMessage':
          this.voteChat.emit(res.data);
          break;
        case 'sendMessageSystem':
          this.chat.emit(res.data);
          this.activeGroup.emit(res.data);
        break;
      }
    });
  }
  // send to server
  sendData(methodName: string, ...args: any[]) {
    this.hubConnection.invoke(methodName, ...args);
  }
}
