import { Injectable } from '@angular/core';
import { ApiHttpService } from 'codx-core';
import { DataRequest } from 'codx-core/public-api';
import {
  BehaviorSubject,
  catchError,
  finalize,
  map,
  Observable,
  of,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CodxBpService {
  viewProcesses = new BehaviorSubject<any>(null);
  constructor(private api: ApiHttpService) {}
  getFlowChartNew = new BehaviorSubject<any>(null);
  crrFlowChart = this.getFlowChartNew.asObservable();

  funcIDParent = new BehaviorSubject<any>(null);



}
