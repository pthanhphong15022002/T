import { Component } from '@angular/core';
import { BasePropertyComponent } from '../base.component';
@Component({
  selector: 'lib-property-text',
  templateUrl: './property-text.component.html',
  styleUrls: ['./property-text.component.css']
})
export class PropertyTextComponent extends BasePropertyComponent{
  changeValueUser(e:any)
  {
    if(e?.data == true) this.data[e?.field] = "User"
    else  this.data[e?.field] = ""
    this.dataChange.emit(this.data);
  }
}
