import { Injectable } from '@angular/core';
import signalR from '@microsoft/signalr';
import { AuthService, AuthStore, CacheService, Util } from 'codx-core';
import { resolve } from 'dns';

@Injectable({
  providedIn: 'root'
})
export class CodxWpService {

  hubUrl: string;
  connection: any;


  constructor
  (
    private cache:CacheService,
    private auth:AuthStore
  ) 
  {
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

  public async GetFormModel(formName:string,gridViewName) {
    if(formName && gridViewName){
      this.cache.gridViewSetup(formName,gridViewName).subscribe((grd:any) =>{
        if(grd){
          let user = this.auth.get();
          let model = {};
          model['write'] = [];
          model['delete'] = [];
          let gID = "";
          let userID = "";
          for (const key in grd){
            if (Object.prototype.hasOwnProperty.call(grd, key)){
              const element = grd[key];
              element.fieldName = element.fieldName.charAt(0).toLowerCase() + element.fieldName.slice(1);
              grd[element.fieldName] = [];
              switch(element.fieldName){
                case "recID":
                  gID = Util.uid();
                  model[element.fieldName].push(gID);
                  break;
                case "createdBy":
                  userID = user.userID;
                  model[element.fieldName].push();
                  break;
                case "createdOn":
                  model[element.fieldName].push(new Date());
                  break;
                default:
                  break;
              }
            }
          }
          model['write'].push(false);
          model['delete'].push(false);
          return 
        }
        // resolve(this.fb.group(model, { updateOn: 'blur' }));
      });
    }
  }
}
