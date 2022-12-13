import { CacheService } from 'codx-core';
import { CodxTMService } from 'projects/codx-tm/src/lib/codx-tm.service';
import {
  Component,
  ViewEncapsulation,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Route, Router } from '@angular/router';
@Component({
  selector: 'codx-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TasksComponent implements OnInit, OnChanges {
  funcID: any;
  constructor(
    private activedRouter: ActivatedRoute,
    private tmService: CodxTMService,
    private cache: CacheService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router
  ) {
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.changeDetectorRef.detectChanges();
  }

  ngOnInit(): void {
    this.changeFunction();
    //   this.router.events.subscribe((val) => {
    //     if(val &&  val instanceof NavigationEnd){
    //       let arr = val.url.split('/') ;
    //       if(arr.length >0){
    //         this.funcID = arr[arr.length-1] ;
    //       }
    //     }
    // });
  }
  changeFunction() {
    this.tmService.childMenuClick.subscribe((res) => {
      if (res && res.func) {
        if (this.funcID != res.func.functionID)
          this.funcID = res.func.functionID;
        this.tmService.childMenuClick.next(null);
      }
    });
  }
}
