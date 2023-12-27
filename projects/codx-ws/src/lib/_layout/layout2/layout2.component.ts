import { Component, Injector, OnInit } from '@angular/core';
import { CodxWsService } from '../../codx-ws.service';
import { isObservable } from 'rxjs';

@Component({
  selector: 'lib-layout2',
  templateUrl: './layout2.component.html',
  styleUrls: ['./layout2.component.scss']
})
export class Layout2Component implements OnInit{
  funcs:any;

  constructor(
    inject: Injector,
    private codxWsService: CodxWsService,
  ) {
  }

  ngOnInit(): void {
    this.getFunc();
  }

  getFunc()
  {
    this.funcs = this.codxWsService.loadListFucByParentID("WS001");

    if(isObservable(this.funcs))
    {
      this.funcs.subscribe(item=>{
        debugger
      })
    }
  }
}
