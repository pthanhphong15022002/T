import { Component } from '@angular/core';
import { BasePropertyComponent } from '../base.component';
import { PropertyExpressionSettingsComponent } from './property-expression-settings/property-expression-settings.component';

@Component({
  selector: 'lib-property-expression',
  templateUrl: './property-expression.component.html',
  styleUrls: ['./property-expression.component.css']
})
export class PropertyExpressionComponent extends BasePropertyComponent{
  
  setting()
  {
    let data = [];
    this.dataTable.forEach(elm=>{
      if(elm.columnOrder < this.data.columnOrder) data = data.concat(elm.children)
      else if(elm.columnOrder == this.data.columnOrder)
      {
        elm.children.forEach(elm2=>{
          if(elm2.columnNo < this.data.columnNo)
          {
            data.push(elm2);
          }
        })
      }
    })
    this.callFuc.openForm(PropertyExpressionSettingsComponent,"",900,700,"",{listField:data});
  }
}
