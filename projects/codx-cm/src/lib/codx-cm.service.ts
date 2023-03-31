import { Injectable } from '@angular/core';
import { ApiHttpService } from 'codx-core';

@Injectable({
  providedIn: 'root',
})
export class CodxCmService {
  constructor(private api: ApiHttpService) {}

  quickAddContacts(data) {
    return this.api.exec<any>(
      'CM',
      'CustomersBusiness',
      'AddCrmAsync',
      data
    );
  }

  getContacts(){
    return this.api.exec<any>(
      'CM',
      'ContactsBusiness',
      'GetAsync',
    );
  }

  searchContacts(key: string){
    return this.api.exec<any>(
      'CM',
      'ContactsBusiness',
      'SearchKeyContactsAsync',
      key
    );
  }

  getOne(recID, funcID){
    return this.api.exec<any>(
      'CM',
      'CustomersBusiness',
      'GetOneAsync',
      [recID, funcID]
    );
  }
}
