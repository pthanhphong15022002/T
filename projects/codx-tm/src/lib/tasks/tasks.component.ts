import {
  Component,
  ViewEncapsulation,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'codx-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TasksComponent implements OnInit {
  funcID: any;
  constructor(private activedRouter: ActivatedRoute) {
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  ngOnInit(): void { }
}
