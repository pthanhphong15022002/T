import { Injectable } from '@angular/core';
import { ApiHttpService } from 'codx-core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PatternService {
  id = '';
  //recID = "";
  component = null;
  indexEdit = -1;
  colorImage = '';
  load = true;
  private RecID = new BehaviorSubject<any>(null);
  recID = this.RecID.asObservable();
  constructor(private api: ApiHttpService) {}

  appendRecID(recID) {
    this.load = false;
    this.RecID.next(recID);
  }

  getFileByObjectID(recID) {
    return this.api.execSv(
      'DM',
      'ERM.Business.DM',
      'FileBussiness',
      'GetFilesByIbjectIDAsync',
      recID
    );
  }

  deleteFile(recID) : Observable<any>{
    return this.api.execSv(
      'DM',
      'ERM.Business.DM',
      'FileBussiness',
      'DeleteByObjectIDAsync',
      [recID, 'FD_Patterns', true]
    );
  }
}
