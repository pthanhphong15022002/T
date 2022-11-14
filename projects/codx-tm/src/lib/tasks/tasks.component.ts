import { CacheService } from 'codx-core';
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
  constructor(private activedRouter: ActivatedRoute, private tmService: CodxTMService, private cache: CacheService) {
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  ngOnInit(): void {
    // this.cache.functionList(this.funcID).subscribe(res => {
    //   console.log(res);
    // })
    this.tmService.menuClick.subscribe(res => {
      if (res && res.func) {
        if (this.funcID != res.func.functionID)
          this.funcID = res.func.functionID;
        this.tmService.menuClick.next(null);
      }
    })
  }
}
