import { Injectable } from '@angular/core';
import { ApiHttpService } from 'codx-core';
import { BehaviorSubject } from 'rxjs';
import { tmpInforSentEMail } from './models/BP_Processes.model';


@Injectable({
  providedIn: 'root'
})
export class CodxBpService {
  viewProcesses = new BehaviorSubject<any>(null);
  constructor(private api : ApiHttpService) { } 

    //Send Email
    sendMail(recID : string , infor : tmpInforSentEMail  )
    {
      // return this.api.exec<any>('OD' ,'DispatchesBusiness', 'SendMailDispatchAsync' , [recID , infor] )
      
    }

    getListProcessSteps(gridModel)
    {
     return this.api.exec<any>('BP' ,'ProcessStepsBusiness', 'GetProcessStepsAsync' , gridModel )
      
    }

    addProcessStep(data)
    {
     return this.api.exec<any>('BP' ,'ProcessStepsBusiness', 'AddProcessStepAsync' , data )
      
    }
}
