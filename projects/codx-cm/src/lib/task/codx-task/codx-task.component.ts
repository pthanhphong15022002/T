import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'codx-task',
  templateUrl: './codx-task.component.html',
  styleUrls: ['./codx-task.component.scss']
})
export class CodxTaskComponent implements OnInit {
  task = {};
  constructor() { }

  ngOnInit(): void {
  }

  getColor(task){

  }
  getIconTask(task){

  }

}
