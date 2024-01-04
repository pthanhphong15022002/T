import { Component, OnChanges, SimpleChanges } from '@angular/core';
import { BasePropertyComponent } from '../base.component';

@Component({
  selector: 'lib-property-user',
  templateUrl: './property-user.component.html',
  styleUrls: ['./property-user.component.css']
})
export class PropertyUserComponent extends BasePropertyComponent implements OnChanges{
  dropdown = false;
  popup = false;
  
  ngOnChanges(changes: SimpleChanges): void {
    if (
     changes['data'] &&
     changes['data']?.currentValue != changes['data']?.previousValue
   ) 
   {
     if(this.data.refType == "3") this.dropdown = true;
     else this.popup = true;
   }
 }
}