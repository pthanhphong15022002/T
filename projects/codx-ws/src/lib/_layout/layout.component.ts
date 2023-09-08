import { ViewChild, ViewEncapsulation } from '@angular/core';
import { Component, Injector } from '@angular/core';
import {
  AsideComponent,
  CallFuncService,
  DialogRef,
  LayoutBaseComponent,
  SidebarModel,
} from 'codx-core';
import { CallFuncConfig } from 'codx-core/lib/services/callFunc/call-func.config';

import { CodxWsService } from '../codx-ws.service';
import { ActivatedRoute } from '@angular/router';
import { isObservable } from 'rxjs';

@Component({
  selector: 'codx-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LayoutComponent extends LayoutBaseComponent {
  dialog!: DialogRef;

  constructor(
    inject: Injector,
    private codxWsService: CodxWsService,
    private route: ActivatedRoute
  ) {
    super(inject);
    this.module = 'WS';
  }

  onInit() {
    this.SetFunctionID();
  }

  onAfterViewInit() {
    this.codxWsService.SetLayout.subscribe((res) => {
      if (res != null) this.setToolbar(res);
    });
  }

  SetFunctionID()
  {
    var path = window.location.pathname;
    var pathArr = path.split("/");
    this.codxWsService.functionID = pathArr[4];
    
    this.getFuncList(pathArr[4]);
  }

  getFuncList(funcID:any)
  {
    var fucList = this.codxWsService.loadFuncList(this.module) as any;

    if(isObservable(fucList))
    {
      fucList.subscribe((item : any)=>{
        if(item) this.SetBreadCumb(funcID,item);
      })
    }
    else this.SetBreadCumb(funcID,fucList);
  }

  SetBreadCumb(funcID:any,data:any)
  {
    var d = data.filter(x=>x.functionID == funcID)[0];
    var parentID1 = data.filter(x=>x.functionID == d.parentID)[0];
    var parentID2 = data.filter(x=>x.functionID == parentID1.parentID)[0];
    if(parentID2.functionType != "M")
    {
      this.codxWsService.listBreadCumb.length = 0;
      this.codxWsService.listBreadCumb.push(parentID2,d);
    }
    else
    {
      this.codxWsService.funcChange.next(this.codxWsService.functionID);
    }
  }
}
