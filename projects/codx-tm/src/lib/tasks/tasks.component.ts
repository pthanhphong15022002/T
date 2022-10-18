import { CodxTMService } from 'projects/codx-tm/src/lib/codx-tm.service';
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
  constructor(private activedRouter: ActivatedRoute, private tmService: CodxTMService) {
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  ngOnInit(): void {
    this.tmService.menuClick.subscribe(res => {
      if (res) {
        this.funcID = res.funcId
      }
    })
  }
}
