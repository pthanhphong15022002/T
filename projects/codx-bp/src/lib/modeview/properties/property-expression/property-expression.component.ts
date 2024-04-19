import { Component, OnInit } from '@angular/core';
import { BasePropertyComponent } from '../base.component';
import { PropertyExpressionSettingsComponent } from './property-expression-settings/property-expression-settings.component';

@Component({
  selector: 'lib-property-expression',
  templateUrl: './property-expression.component.html',
  styleUrls: ['./property-expression.component.css']
})
export class PropertyExpressionComponent extends BasePropertyComponent implements OnInit{

  listField = [];
  formula:string = "";

  ngOnInit(): void {
    this.data.refValue = this.data.refValue && typeof this.data.refValue == 'string' ? JSON.parse(this.data.refValue) : this.data.refValue;
    this.convertReferedValue();
  }
  
  setting()
  {
    this.listField = [];
    this.dataTable.forEach(elm=>{
      if(elm.columnOrder < this.data.columnOrder) this.listField = this.listField.concat(elm.children)
      else if(elm.columnOrder == this.data.columnOrder)
      {
        elm.children.forEach(elm2=>{
          if(elm2.columnNo < this.data.columnNo)
          {
            this.listField.push(elm2);
          }
        })
      }
    })
    let popup = this.callFuc.openForm(PropertyExpressionSettingsComponent,"",900,700,"",{listField:this.listField,referedValue:this.data.refValue});
    popup.closed.subscribe(res=>{
      this.data.refValue = res?.event || '';
      this.dataChange.emit(this.data);
      this.convertReferedValue();
    })
  }

  convertReferedValue()
  {
    this.formula = "";
    if(this.data.refValue)
    {
      this.data.refValue.forEach((elm,i)=>{
        elm.forEach(elm2=>{
          let field = elm2.slice(1,-1);
          let index = this.listField.findIndex(x=>x.fieldName == field);
          if(index>=0) this.formula += this.listField[index].title;
          else this.formula += elm2;
        })
        //this.formula += elm.join("");
        if(i < this.data.refValue.length - 1) this.formula += "&";
      })
    }
  }
}
