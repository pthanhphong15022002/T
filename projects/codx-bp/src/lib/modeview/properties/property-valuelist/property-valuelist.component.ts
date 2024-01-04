import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BasePropertyComponent } from '../base.component';

@Component({
  selector: 'lib-property-valuelist',
  templateUrl: './property-valuelist.component.html',
  styleUrls: ['./property-valuelist.component.css']
})
export class PropertyValueListComponent extends BasePropertyComponent implements OnChanges {
  dropdown = true;
  checkbox = false;

  ngOnChanges(changes: SimpleChanges): void {
     if (
      changes['data'] &&
      changes['data']?.currentValue != changes['data']?.previousValue
    ) 
    {
      if(this.data.refType == "2C") this.checkbox = true;
      else this.dropdown = true;
    }
  }
}
