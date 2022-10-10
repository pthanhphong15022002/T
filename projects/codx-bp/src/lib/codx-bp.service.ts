import { Injectable } from '@angular/core';
import { ApiHttpService } from 'codx-core';
import { tmpInforSentEMail } from './models/BP_Processes.model';


@Injectable({
  providedIn: 'root'
})
export class CodxBpService {
 

  constructor(private api : ApiHttpService) { } 

    //Send Email
    sendMail(recID : string , infor : tmpInforSentEMail  )
    {
      return this.api.exec<any>('OD' ,'DispatchesBusiness', 'SendMailDispatchAsync' , [recID , infor] )
      
    }
}
