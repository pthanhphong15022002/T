import { Injectable } from '@angular/core';
import { ApiHttpService } from 'codx-core';

@Injectable({
  providedIn: 'root'
})
export class CodxDpService {

  constructor(
    private api: ApiHttpService

  ) { }



  // Gán tạm để show data test
  getUserByProcessId(data) {
    return this.api.exec<any>(
      'BP',
      'ProcessesBusiness',
      'GetAllUserPermissionAsync',
      data
    );
  }

  onAddProcess(data){
    return this.api.exec<any>(
      'DP',
      'ProcessesBusiness',
      'AddProcessAsync',
      data
    );
  }
}
