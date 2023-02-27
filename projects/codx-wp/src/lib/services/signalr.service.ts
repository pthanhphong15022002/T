import { EventEmitter, Injectable } from '@angular/core';
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
  signalChat = new EventEmitter<any>();
  signalGroup = new EventEmitter<any>();
  signalBoxChat = new EventEmitter<any>();
  constructor(private authStore: AuthStore) {
    this.createConnection();
    this.registerOnServerEvents();
  }

  public createConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.apiUrl + '/serverHub', {
        skipNegotiation: true,
        accessTokenFactory: () => this.authStore.get().token,
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
    // chat emit
    this.hubConnection.on('ChatEmit', (data) => {
      this.signalChat.emit(data);
    });
    // group emit
    this.hubConnection.on('GroupEmit', (data) => {
      this.signalGroup.emit(data);
    });
  }
  //#endregion

  //#region Post to server
  sendData(data, method = null) {
    if (method) {
      this.hubConnection.invoke(method, data);
    }
  }

  //#endregion
}
