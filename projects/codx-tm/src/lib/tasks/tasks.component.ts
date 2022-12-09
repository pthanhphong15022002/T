import { CacheService } from 'codx-core';
import { CodxTMService } from 'projects/codx-tm/src/lib/codx-tm.service';
import { Component, ViewEncapsulation, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
    private  changeDetectorRef : ChangeDetectorRef
  ) {
      this.funcID = this.activedRouter.snapshot.params['funcID'];
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.changeDetectorRef.detectChanges() ;
  }
  
  ngOnInit(): void {
    this.changeFunction()
    console.log( this.funcID)
  }
  changeFunction(){
    this.tmService.childMenuClick.subscribe((res) => {
      if (res && res.func) {
        if (this.funcID != res.func.functionID)
          this.funcID = res.func.functionID;
        this.tmService.childMenuClick.next(null);
      }
    });
  }
}
