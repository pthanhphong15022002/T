import { EventEmitter, Injectable } from '@angular/core';
import * as signalR from "@microsoft/signalr";
import { environment } from 'src/environments/environment';
import { Post } from 'src/shared/models/post';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection: signalR.HubConnection;
  connectionId: string;
  signalData = new EventEmitter<Post>();
  userConnect = new EventEmitter<any>();
  signalObject = new EventEmitter<any>();
  signalChat = new EventEmitter<any>();

  constructor() {
    this.createConnection();
    this.registerOnServerEvents();
  }

  private createConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.apiUrl + '/serverHub', {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .build();

    this.hubConnection
      .start().then(() => {
        console.log(this.hubConnection)
      }).catch(err => console.log('Error while starting connection: ' + err));
  }

  //#region  get data from server
  private registerOnServerEvents() {
    this.hubConnection.on('onConnect', (data) => {
      this.connectionId = data;
      this.userConnect.emit(data);
    });

    this.hubConnection.on('dataResponse', (data) => {
      this.signalData.emit(data);
    });

    this.hubConnection.on('SignalIncontroller', (data) => {
      this.signalData.emit(data);
    });

    this.hubConnection.on('VotePost', (obj) => {
      this.signalObject.emit(obj);
    });

    this.hubConnection.on('ChatMessage', (obj)=>{
      this.signalChat.emit(obj);
    });
  }
  //#endregion

  //#region Post to server
  sendData(message, func = 'NewMessage') {
    this.hubConnection.invoke(func, message);
  }
  //#endregion
}
