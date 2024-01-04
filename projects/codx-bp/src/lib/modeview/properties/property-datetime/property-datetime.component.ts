import { Component } from '@angular/core';
import { BasePropertyComponent } from '../base.component';

@Component({
  selector: 'lib-property-datetime',
  templateUrl: './property-datetime.component.html',
  styleUrls: ['./property-datetime.component.css']
})
export class PropertyDatetimeComponent extends BasePropertyComponent{

  changeValueDate(e:any)
  {
    this.data[e?.field] = e?.data?.fromDate;
    this.dataChange.emit(this.data);
  }
}
