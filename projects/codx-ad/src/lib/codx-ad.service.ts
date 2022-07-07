import { Injectable } from '@angular/core';
import { ApiHttpService } from 'codx-core';

@Injectable({
  providedIn: 'root'
})
export class CodxAdService {

  constructor( private api: ApiHttpService ) { }

  getListFunction(data){
    return this.api.execSv<any>("SYS","SYS","FunctionListBusiness","GetByParentAsync",data)
  }

  getListCompanySettings(){
    return this.api.execSv<any>("SYS","AD","CompanySettingsBusiness","GetAsync")
  }

  updateContactCompanySettings(data){
    return this.api.execSv<any>("SYS","AD","CompanySettingsBusiness","UpdateBusinessContactAsync",data)
  }
  updatePersonalCompanySettings(data){
    return this.api.execSv<any>("SYS","AD","CompanySettingsBusiness","UpdateBusinessPersonalAsync",data)
  }
}
