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
  signalData = new EventEmitter<Post>();
  userConnect = new EventEmitter<any>();
  signalObject = new EventEmitter<any>();
  signalChat = new EventEmitter<any>();
  signalGroup = new EventEmitter<any>();
  signaDataVote = new EventEmitter<any>();
  signalVote = new EventEmitter<any>();
  signalDelChat = new EventEmitter<any>();
  signalVoteType = new EventEmitter<any>();
  //signalR emit data

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
      this.connectionId = data;
      this.signalChat.emit(data);
    });
    // group emit
    this.hubConnection.on('GroupEmit', (data) => {
      this.connectionId = data;
      this.signalGroup.emit(data);
    });
  }
  //#endregion

  //#region Post to server
  sendData(message, method = null) {
    if (method) {
      this.hubConnection.invoke(method, message);
    }
  }

  //#endregion
}
