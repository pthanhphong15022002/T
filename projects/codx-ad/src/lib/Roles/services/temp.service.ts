import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { flattenDiagnosticMessageText } from 'typescript';
import { tmpformRoles } from '../model/tmpformRoles';

@Injectable({
  providedIn: 'root',
})
export class TempService {
  id: any;
  //roleName = 'Nhân viên';
  isSystem = false;
  isNew = true;
  roleName: BehaviorSubject<string> = new BehaviorSubject<string>(
    '' //'./assets/media/logos/logo-1-dark.svg'
  );
  private modules = new BehaviorSubject<any>(null);
  loadModule = this.modules.asObservable();
  //get data home
  data = new BehaviorSubject<any>(null);
  value = this.data.asObservable();

  private recID = new BehaviorSubject<any>(null);
  loadRecID = this.recID.asObservable();
  private saveas = new BehaviorSubject<any>(null);
  valuesave = this.saveas.asObservable();

  constructor() {}

  appendRecID(recID) {
    this.recID.next(recID);
  }

  changeRecID(RecID: any) {
    this.modules.next(RecID);
  }

  changeDatasaveas(saveas: string) {
    this.saveas.next(saveas);
  }
}
