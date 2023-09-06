import { Component, EventEmitter, Injector, OnInit, Output } from '@angular/core';
import { CacheService, CodxService, LayoutBaseComponent, LayoutService, PageTitleService } from 'codx-core';
import { CodxWsService } from '../../codx-ws.service';
import { isObservable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'codx-ws-header',
  templateUrl: './codx-ws-header.component.html',
  styleUrls: ['./codx-ws-header.component.css']
})
export class CodxWsHeaderComponent extends LayoutBaseComponent{
  override onAfterViewInit(): void {
    
  }

  title$:any;
  asideTheme:any;
  logo$:any;
  funcList:any;
  selectedIndex = 0;
  funcID:any;
  
  constructor(
    inject: Injector,
    private pageTitle: PageTitleService,
    override codxService: CodxService,
    private codxWsService: CodxWsService,
  ) {
    super(inject);
    this.module = 'WS';
    this.layoutModel.asideDisplay = false;
    this.layoutModel.toolbarFixed = false;
  }

  override onInit(): void {
    this.title$ = this.pageTitle.title.asObservable();
    this.asideTheme = this.layout.getProp('aside.theme') as string;
    this.logo$ = this.layout.logo.asObservable();

    this.getFuncChange();
  }
 
  
  
  getFuncChange()
  {
    this.codxWsService.funcChange.subscribe(item=>{
      if(item) this.getFuncList(item);
    })
  }

  getFuncList(funcID:any)
  {
    var fucList = this.codxWsService.loadFuncList(this.module) as any;

    if(isObservable(fucList))
    {
      fucList.subscribe((item : any)=>{
        if(item) {
          this.funcList = item.filter(x=>x.parentID == this.module && (x.functionType == "T" || x.functionType == "D" || x.functionType == "R" ));
          this.selectedIndex = this.funcList.findIndex(x=>x.functionID == funcID);
        }
      })
    }
    else {
      this.funcList = fucList.filter(x=>x.parentID == this.module && (x.functionType == "T" || x.functionType == "D" || x.functionType == "R" ));
      this.selectedIndex = this.funcList.findIndex(x=>x.functionID == funcID);
    }
  }

  selectedChange(i:any , item:any)
  {
    this.selectedIndex = i;
    if(item.functionType == "D" || item.functionType == "R") return;
    this.codxService.navigate("","/"+item.url);
  }
}
