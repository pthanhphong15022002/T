import { Component, OnChanges, SimpleChanges } from '@angular/core';
import { BasePropertyComponent } from '../base.component';

@Component({
  selector: 'lib-property-rank',
  templateUrl: './property-rank.component.html',
  styleUrls: ['./property-rank.component.scss']
})
export class PropertyRankComponent extends BasePropertyComponent implements OnChanges{
  number = false;
  icon = false;
  
  ngOnChanges(changes: SimpleChanges): void {
    if (
     changes['data'] &&
     changes['data']?.currentValue != changes['data']?.previousValue
   ) 
   {
     if(this.data.rank.type == "1") this.number = true;
     else this.icon = true;
   }
 }

 changeValueRank(e:any)
 {
  this.data.rank[e?.field] = e?.data;
  this.dataChange.emit(this.data);
 }
}