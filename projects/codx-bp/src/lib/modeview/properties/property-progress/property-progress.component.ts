import { Component } from '@angular/core';
import { BasePropertyComponent } from '../base.component';

@Component({
  selector: 'lib-property-progress',
  templateUrl: './property-progress.component.html',
  styleUrls: ['./property-progress.component.css']
})
export class PropertyProgressComponent  extends BasePropertyComponent{
  changeValueRank(e:any)
  {
   this.data.rank[e?.field] = e?.data;
   this.dataChange.emit(this.data);
  }
}
