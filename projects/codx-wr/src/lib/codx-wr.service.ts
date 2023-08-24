import { Injectable } from '@angular/core';
import { ApiHttpService } from 'codx-core';

@Injectable({
  providedIn: 'root',
})
export class CodxWrService {
  constructor(private api: ApiHttpService) {}

  getOneCustomer(recID) {
    return this.api.exec<any>('CM', 'CustomersBusiness', 'GetOneAsync', [
      recID,
    ]);
  }

  getOneContact(objectID) {
    return this.api.exec<any>('CM', 'ContactsBusiness', 'GetOneAsync', [
      objectID,
    ]);
  }

  getOneServiceTag(key) {
    return this.api.exec<any>('WR', 'ServiceTagsBusiness', 'GetOneAsync', [
      key,
    ]);
  }
}
