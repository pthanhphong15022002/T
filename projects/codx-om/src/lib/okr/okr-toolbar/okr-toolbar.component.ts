import { Component, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { ButtonModel } from 'codx-core';

@Component({
  selector: 'lib-okr-toolbar',
  templateUrl: './okr-toolbar.component.html',
  styleUrls: ['./okr-toolbar.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class OkrToolbarComponent implements OnInit {

  buttonAddKR: ButtonModel;
  buttonAddO: ButtonModel;
  button?: ButtonModel;
  @Output() click = new EventEmitter<any>();
  date = new Date();
  ops = ['m','q','y'];
  constructor() { }

  ngOnInit(): void {
    
    
    this.button = {
      id: 'btnAdd',
      icon:'icon-i-chevron-down',
      formName:'OKRPlans',
      items:[
        {
          text:'Thêm mục tiêu',
          id:'btnAddO',
          
        },
        {
          text:'Thêm kết quả',
          id:'btnAddKR',
        }
      ]
    };
  }
  buttonClick(event:any)
  {
    this.click.emit(event);
  }
  changeCalendar(event:any)
  {
    var obj = 
    {
      id : "Calendar",
      data : event
    };
    this.click.emit(obj);
  }
}
