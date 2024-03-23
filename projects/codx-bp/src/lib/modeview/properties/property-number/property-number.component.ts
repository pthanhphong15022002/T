import { Component, OnChanges, SimpleChanges } from '@angular/core';
import { BasePropertyComponent } from '../base.component';

@Component({
  selector: 'lib-property-number',
  templateUrl: './property-number.component.html',
  styleUrls: ['./property-number.component.css']
})
export class PropertyNumberComponent extends BasePropertyComponent implements OnChanges{
  numberI = false;
  numberD = false;
  numberP = false;
  
  ngOnChanges(changes: SimpleChanges): void {
    if (
     changes['data'] &&
     changes['data']?.currentValue != changes['data']?.previousValue
   ) 
   {
     if(this.data.dataFormat == "I") this.numberI = true;
     else if(this.data.dataFormat == "D") this.numberD = true;
     else this.numberP = true;
   }
 }

 changeValueNumber(e:any)
 {
  this.data[e?.field] = e?.data ? "1" : "0";
  this.dataChange.emit(this.data);
 }
 
}
