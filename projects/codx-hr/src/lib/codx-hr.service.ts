import { Injectable } from '@angular/core';
import { ApiHttpService } from 'codx-core';
import { BehaviorSubject, finalize, catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CodxHrService {

  acction = new BehaviorSubject<string>(null);
  title = new BehaviorSubject<string>(null);
  constructor(private api: ApiHttpService,) { }
  loadEmployByPosition(positionID: string, _status: string): Observable<any> {

    return this.api.call('ERM.Business.HR', 'PositionsBusiness', 'GetEmployeeListByPositionAsync', [positionID, _status]).pipe(
      map((data) => {
        if (data.error) return;
        return data.msgBodyData[0];
      }),
      catchError((err) => {
        return of(undefined);
      }),
      finalize(() => null)
    );

  }
  loadEmployByCountStatus(positionID: string, _status: any): Observable<any> {

    return this.api.call('ERM.Business.HR', 'PositionsBusiness', 'GetEmployeeListByPosAsync', [positionID, _status]).pipe(
      map((data) => {
        if (data.error) return;
        return data.msgBodyData[0];
      }),
      catchError((err) => {
        return of(undefined);
      }),
      finalize(() => null)
    ); 

  }

  loadPosInfo(positionID: string): Observable<any> {

    return this.api.call('ERM.Business.HR', 'PositionsBusiness', 'GetPosInfoAsync', positionID).pipe(
      map((data) => {
        if (data.error) return;
        return data.msgBodyData[0];
      }),
      catchError((err) => {
        return of(undefined);
      }),
      finalize(() => null)
    );

  }
}
