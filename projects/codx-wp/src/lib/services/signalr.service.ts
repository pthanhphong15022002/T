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
  signalREmit = new EventEmitter<any>();

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

    // sendMessage
    this.hubConnection.on('openGroupChat', (data) => {
      this.signalREmit.emit(data);
    });

    // this.hubConnection.on('dataResponse', (data) => {
    //   this.signalData.emit(data);
    // });

    // this.hubConnection.on('SignalIncontroller', (data) => {
    //   this.signalData.emit(data);
    // });

    // this.hubConnection.on('VotePost', (obj) => {
    //   this.signalObject.emit(obj);
    // });

    // this.hubConnection.on('receiveChatMessage', (obj) => {
    //
    //   this.signalChat.emit(obj);
    // });
    // this.hubConnection.on('voteChatMessage', (obj, obj1, obj2) => {
    //   this.signaDataVote.emit(obj);
    //   this.signalVote.emit(obj1);
    //   this.signalVoteType.emit(obj2);
    // });
    // this.hubConnection.on('delChatMessage', (obj) => {
    //   this.signalDelChat.emit(obj);
    // });
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
