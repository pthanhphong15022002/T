import { Component, OnInit } from '@angular/core';
import { BasePropertyComponent } from '../base.component';

@Component({
  selector: 'lib-property-note',
  templateUrl: './property-note.component.html',
  styleUrls: ['./property-note.component.css']
})
export class PropertyNoteComponent extends BasePropertyComponent implements OnInit{
  
  ngOnInit(): void {
    if(!this.data.dataFormat) this.data.dataFormat = {};
    else if(typeof this.data.dataFormat == 'string') this.data.dataFormat = JSON.parse(this.data.dataFormat) 
  }

  changeValueFormat(e:any,data:any=null)
  {
    if(data)
    {
      this.data.dataFormat[e] = data;
    }
    else
    {
      if(!this.data.dataFormat[e]) this.data.dataFormat[e] = true;
      else this.data.dataFormat[e] = !this.data.dataFormat[e];
    }
    
    this.dataChange.emit(this.data)
  }
  
  changeValueFormatColor(e:any)
  {
    this.data.dataFormat[e?.field] = e?.data
  }
}
