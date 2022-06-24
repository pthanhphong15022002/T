import { Injectable } from '@angular/core';
import { ApiHttpService } from 'codx-core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  constructor(private api: ApiHttpService) { }
  public setValueFavorite = new BehaviorSubject<string>('');
  isSetValueFavorite = this.setValueFavorite.asObservable();
}
