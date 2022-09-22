import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatternService {

  id = "";
  //recID = "";
  component = null;
  indexEdit = -1;
  colorimg = "";
  load = true;
  private RecID = new BehaviorSubject<any>(null);
  recID = this.RecID.asObservable();
  constructor() { }

  appendRecID(recID) {
    this.load = false;
    this.RecID.next(recID);
  }
}
