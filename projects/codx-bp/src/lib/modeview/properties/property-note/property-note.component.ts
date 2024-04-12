import { Component, OnInit } from '@angular/core';
import { BasePropertyComponent } from '../base.component';

@Component({
  selector: 'lib-property-note',
  templateUrl: './property-note.component.html',
  styleUrls: ['./property-note.component.css']
})
export class PropertyNoteComponent extends BasePropertyComponent implements OnInit{
  
  ngOnInit(): void {
    if(!this.data.validateControl) this.data.dataFormat = {};
    else if(typeof this.data.validateControl == 'string' && this.data?.validateControl) this.data.validateControl = JSON.parse(this.data.validateControl) 
  }

  changeValueFormat(e:any,data:any=null)
  {
    if(!this.data.validateControl) this.data.validateControl = {}
    if(data)
    {
      this.data.validateControl[e] = data;
    }
    else
    {
      if(!this.data.validateControl[e]) this.data.validateControl[e] = true;
      else this.data.validateControl[e] = !this.data.validateControl[e];
    }
    
    this.dataChange.emit(this.data)
  }
  
  changeValueFormatColor(e:any)
  {
    if(!this.data.validateControl) this.data.validateControl = {}
    this.data.validateControl[e?.field] = e?.data
  }
}
