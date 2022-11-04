import { Injectable } from '@angular/core';
import signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class CodxWpService {

  hubUrl: string;
  connection: any;


  constructor() {
    this.hubUrl = 'https://localhost:7199/signalrdemohub';
   }

   public async initiateSignalrConnection(): Promise<void>{
    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(this.hubUrl)
        .withAutomaticReconnect()
        .build();

      await this.connection.start();

      console.log(`SignalR connection success! connectionId: ${this.connection.connectionId}`);
    }
    catch (error) {
      console.log(`SignalR connection error: ${error}`);
    }
  }
}
