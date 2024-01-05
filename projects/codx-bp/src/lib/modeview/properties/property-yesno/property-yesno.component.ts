import { Component, OnChanges, SimpleChanges } from '@angular/core';
import { BasePropertyComponent } from '../base.component';

@Component({
  selector: 'lib-property-yesno',
  templateUrl: './property-yesno.component.html',
  styleUrls: ['./property-yesno.component.css']
})
export class PropertyYesnoComponent extends BasePropertyComponent implements OnChanges{
  switch = false;
  checkbox = false;
  
  ngOnChanges(changes: SimpleChanges): void {
    if (
     changes['data'] &&
     changes['data']?.currentValue != changes['data']?.previousValue
   ) 
   {
     if(this.data.controlType == "Switch") this.switch = true;
     else this.checkbox = true;
   }
 }
}