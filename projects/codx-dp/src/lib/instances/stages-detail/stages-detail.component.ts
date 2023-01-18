import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'codx-stages-detail',
  templateUrl: './stages-detail.component.html',
  styleUrls: ['./stages-detail.component.css']
})
export class StagesDetailComponent implements OnInit {

  lstTest = [{
    name: 'test1'
  },
  {
    name: 'test2'
  },
  {
    name: 'test3'
  },
  {
    name: 'test4'
  }]

  constructor() { }

  ngOnInit(): void {
  }


  click(e, id){
    const element = document.getElementById('step-click');

  }
}
