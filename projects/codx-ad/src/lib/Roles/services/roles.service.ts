import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  formName = '';
  gridViewName = '';
  dataSave = {};
  funcID = '';
  listview: any;
  clickli = false;
  _activeMoreFuction = false;
  _activeSysFuction = false;
  _dataChanged = false;

  private dataPermission = new BehaviorSubject<any>(null);
  LoadDataPermission = this.dataPermission.asObservable();
  private activeSysFuction = new BehaviorSubject<any>(null);
  activeSys = this.activeSysFuction.asObservable();
  private activeMoreFuction = new BehaviorSubject<any>(null);
  activeMore = this.activeMoreFuction.asObservable();
  constructor() {}

  appendActive(sys, more) {
    this.activeSysFuction.next(sys);
    this.activeMoreFuction.next(more);
  }

  appendPesmission(data) {
    this.clickli = true;
    this.dataPermission.next(data);
  }
}
