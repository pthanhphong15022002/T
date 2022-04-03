import { Injectable } from '@angular/core';
import { ApiHttpService } from 'codx-core';
import { ListviewComponent } from '@shared/components/listview/listview.component';
import { TableviewComponent } from '@shared/components/tableview/tableview.component';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  listview: ListviewComponent;
  tableview: TableviewComponent;

  constructor(private api: ApiHttpService) { }
  public setValueFavorite = new BehaviorSubject<string>('');
  isSetValueFavorite = this.setValueFavorite.asObservable();
}
