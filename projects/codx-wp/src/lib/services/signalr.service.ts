import { ApplicationRef, ComponentFactoryResolver, EventEmitter, Injectable, Injector, TemplateRef } from '@angular/core';
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

  templateChatBox:TemplateRef<any> = null;
  userConnect = new EventEmitter<any>();
  signalChat = new EventEmitter<any>();
  signalGroup = new EventEmitter<any>();
  activeGroup = new EventEmitter<any>();
  constructor(
    private authStore: AuthStore,
    private applicationRef:ApplicationRef) {
    this.createConnection();
    this.registerOnServerEvents();
  }

  public createConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.apiUrl + '/serverHub', {
        skipNegotiation: true,
        accessTokenFactory: async () => {return this.authStore.get().token},
        transport: signalR.HttpTransportType.WebSockets,
      })
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log(this.hubConnection);
      })
      .catch((err) => console.log('Error while starting connection: ' + err));
  }

  //#region  get data from server
  public registerOnServerEvents() {
    this.hubConnection.on('onConnect', (data) => {
      this.connectionId = data;
      this.userConnect.emit(data);
    });
    this.hubConnection.on('ReceiveMessage', (res) => {
      switch(res.action){
        case 'activeGroup':
          this.activeGroup.emit(res.data);
          break;
        case 'newGroup':
          this.signalGroup.emit(res.data);
          break;
        case 'sendMessage':
          this.signalChat.emit(res.data);
          break;
      }
      
    });
  }

  sendData(data, method = null) {
    this.hubConnection.invoke(method, data);
  }
}
