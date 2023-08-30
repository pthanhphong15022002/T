import { Component, Injector, OnInit } from '@angular/core';
import { CodxWsService } from '../codx-ws.service';
import { ActivatedRoute } from '@angular/router';
import { WSUIComponent } from '../default/wsui.component';
import { isObservable } from 'rxjs';

@Component({
  selector: 'lib-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.css']
})
export class WorkspaceComponent extends WSUIComponent{
  modules:any;
  constructor(inject: Injector) 
  {
    super(inject);
  }

  override onInit(): void {
    this.getModoule();
  }

  getModoule()
  {
    var module = this.codxWsService.loadModule("WS") as any;
    if(isObservable(module)) module.subscribe((item:any)=>{if(item && item.length>0)this.formatModule(item)})
    else if(module && module.length>0)this.formatModule(module)
  }

  formatModule(data:any)
  {
    var listChild = data.filter(x=>x.parentID == this.funcID);
    //debugger
  }
}
