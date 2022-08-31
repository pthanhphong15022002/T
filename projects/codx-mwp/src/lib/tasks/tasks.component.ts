import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'lib-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {

  funcID: any;
  constructor(private activedRouter: ActivatedRoute) {
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  ngOnInit(): void { }

}
